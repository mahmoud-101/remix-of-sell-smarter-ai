const serve = (handler: (req: Request) => Promise<Response>) => {
  Deno.serve(handler);
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: string;
  variants: Array<{
    price: string;
    compare_at_price: string | null;
    inventory_quantity: number;
  }>;
  images: Array<{ src: string }>;
  handle: string;
}

interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  status: string;
  images: Array<{ src: string }>;
  permalink: string;
}

async function fetchShopifyProducts(storeUrl: string, accessToken: string): Promise<any[]> {
  // Clean up store URL
  let cleanUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cleanUrl.includes('.myshopify.com')) {
    cleanUrl = `${cleanUrl}.myshopify.com`;
  }

  const response = await fetch(`https://${cleanUrl}/admin/api/2024-01/products.json?limit=50`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify API error:', response.status, errorText);
    throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.products || [];
}

async function fetchWooCommerceProducts(storeUrl: string, consumerKey: string, consumerSecret: string): Promise<any[]> {
  // Clean up store URL
  let cleanUrl = storeUrl.replace(/\/$/, '');
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch(`${cleanUrl}/wp-json/wc/v3/products?per_page=50`, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('WooCommerce API error:', response.status, errorText);
    throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Get decrypted credentials securely using the RPC function
async function getDecryptedCredentials(supabase: any, connectionId: string): Promise<{ api_key: string; api_secret: string | null }> {
  const { data, error } = await supabase
    .rpc('get_store_credentials', { connection_uuid: connectionId });
  
  if (error) {
    console.error('Error getting credentials:', error);
    throw new Error('Failed to retrieve store credentials');
  }
  
  if (!data || data.length === 0) {
    throw new Error('Credentials not found');
  }
  
  return {
    api_key: data[0].api_key,
    api_secret: data[0].api_secret
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, connectionId, platform, storeUrl, storeName, apiKey, apiSecret } = await req.json();

    console.log(`Store sync action: ${action} for user: ${user.id}`);

    switch (action) {
      case 'connect': {
        // Validate connection by fetching products
        let productCount = 0;
        
        if (platform === 'shopify') {
          const products = await fetchShopifyProducts(storeUrl, apiKey);
          productCount = products.length;
        } else if (platform === 'woocommerce') {
          const products = await fetchWooCommerceProducts(storeUrl, apiKey, apiSecret);
          productCount = products.length;
        }

        // Save connection - credentials will be encrypted by the database trigger
        const { data: connection, error: insertError } = await supabase
          .from('store_connections')
          .upsert({
            user_id: user.id,
            platform,
            store_name: storeName,
            store_url: storeUrl,
            api_key: apiKey, // Will be encrypted by trigger
            api_secret: apiSecret || null, // Will be encrypted by trigger
            is_active: true,
            products_count: productCount,
            last_sync_at: new Date().toISOString()
          }, { onConflict: 'user_id,platform' })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(insertError.message);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            connection: {
              ...connection,
              api_key: undefined, // Never return credentials
              api_secret: undefined,
              api_key_encrypted: undefined,
              api_secret_encrypted: undefined
            },
            message: `تم الاتصال بنجاح! وجدنا ${productCount} منتج`,
            productsCount: productCount
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync': {
        // Get connection details (without credentials)
        const { data: connection, error: connError } = await supabase
          .from('store_connections')
          .select('id, user_id, platform, store_url, store_name')
          .eq('id', connectionId)
          .eq('user_id', user.id)
          .single();

        if (connError || !connection) {
          throw new Error('Connection not found');
        }

        // Get decrypted credentials securely
        const credentials = await getDecryptedCredentials(supabase, connectionId);

        let products: any[] = [];
        
        if (connection.platform === 'shopify') {
          const shopifyProducts = await fetchShopifyProducts(
            connection.store_url, 
            credentials.api_key
          ) as ShopifyProduct[];
          
          products = shopifyProducts.map(p => ({
            user_id: user.id,
            store_connection_id: connectionId,
            external_product_id: String(p.id),
            title: p.title,
            description: p.body_html?.replace(/<[^>]*>/g, '') || '',
            price: parseFloat(p.variants[0]?.price || '0'),
            compare_at_price: p.variants[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null,
            image_url: p.images[0]?.src || null,
            product_url: `https://${connection.store_url}/products/${p.handle}`,
            inventory_quantity: p.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0),
            status: p.status,
            last_synced_at: new Date().toISOString()
          }));
        } else if (connection.platform === 'woocommerce') {
          const wooProducts = await fetchWooCommerceProducts(
            connection.store_url,
            credentials.api_key,
            credentials.api_secret || ''
          ) as WooCommerceProduct[];
          
          products = wooProducts.map(p => ({
            user_id: user.id,
            store_connection_id: connectionId,
            external_product_id: String(p.id),
            title: p.name,
            description: p.description?.replace(/<[^>]*>/g, '') || '',
            price: parseFloat(p.price || '0'),
            compare_at_price: p.regular_price && p.sale_price ? parseFloat(p.regular_price) : null,
            image_url: p.images[0]?.src || null,
            product_url: p.permalink,
            inventory_quantity: p.stock_quantity || 0,
            status: p.status,
            last_synced_at: new Date().toISOString()
          }));
        }

        // Upsert products
        if (products.length > 0) {
          const { error: upsertError } = await supabase
            .from('synced_products')
            .upsert(products, { 
              onConflict: 'store_connection_id,external_product_id' 
            });

          if (upsertError) {
            console.error('Upsert error:', upsertError);
            throw new Error(upsertError.message);
          }
        }

        // Update connection last sync
        await supabase
          .from('store_connections')
          .update({ 
            last_sync_at: new Date().toISOString(),
            products_count: products.length
          })
          .eq('id', connectionId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `تم مزامنة ${products.length} منتج بنجاح`,
            productsCount: products.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disconnect': {
        const { error: deleteError } = await supabase
          .from('store_connections')
          .delete()
          .eq('id', connectionId)
          .eq('user_id', user.id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'تم فصل الاتصال بنجاح' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Store sync error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
