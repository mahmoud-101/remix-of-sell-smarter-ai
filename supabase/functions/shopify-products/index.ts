import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
  handle: string;
  variants: Array<{
    price: string;
    compare_at_price: string | null;
    inventory_quantity: number;
  }>;
  images: Array<{ src: string }>;
}

// Get decrypted Shopify token
async function getShopifyToken(supabase: any, connectionId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_shopify_token', { connection_uuid: connectionId });
  
  if (error || !data) {
    console.error('Error getting token:', error);
    throw new Error('Failed to retrieve Shopify token');
  }
  
  return data;
}

// Extract product handle from URL
function extractProductHandle(url: string): string | null {
  const match = url.match(/\/products\/([^\/\?#]+)/);
  return match ? match[1] : null;
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

    const { action, searchTerm, productUrl, productId } = await req.json();
    
    console.log(`Shopify products action: ${action} for user: ${user.id}`);

    // Get user's Shopify connection
    const { data: connection, error: connError } = await supabase
      .from('shopify_connections')
      .select('id, shop_url, shop_name, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ 
          error: 'no_connection',
          message: 'يجب ربط متجر Shopify أولاً' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get decrypted token
    const accessToken = await getShopifyToken(supabase, connection.id);
    const shopUrl = connection.shop_url;

    switch (action) {
      case 'search': {
        // Search products by title
        const url = searchTerm 
          ? `https://${shopUrl}/admin/api/2024-01/products.json?title=${encodeURIComponent(searchTerm)}&limit=10`
          : `https://${shopUrl}/admin/api/2024-01/products.json?limit=10`;

        const response = await fetch(url, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }

        const data = await response.json();
        const products = (data.products || []).map((p: ShopifyProduct) => ({
          id: String(p.id),
          title: p.title,
          handle: p.handle,
          price: p.variants[0]?.price || '0',
          image: p.images[0]?.src || null,
          description: p.body_html?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
          url: `https://${shopUrl}/products/${p.handle}`
        }));

        return new Response(
          JSON.stringify({ success: true, products }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch_by_url': {
        // Fetch product by URL
        const handle = extractProductHandle(productUrl);
        if (!handle) {
          return new Response(
            JSON.stringify({ error: 'رابط غير صحيح، تأكد من الرابط' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch(
          `https://${shopUrl}/admin/api/2024-01/products.json?handle=${handle}`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('تعذر الوصول للمنتج، تحقق من الصلاحيات');
        }

        const data = await response.json();
        if (!data.products || data.products.length === 0) {
          return new Response(
            JSON.stringify({ error: 'المنتج غير موجود' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const p = data.products[0] as ShopifyProduct;
        const product = {
          id: String(p.id),
          title: p.title,
          handle: p.handle,
          price: p.variants[0]?.price || '0',
          compareAtPrice: p.variants[0]?.compare_at_price || null,
          image: p.images[0]?.src || null,
          description: p.body_html || '',
          descriptionText: p.body_html?.replace(/<[^>]*>/g, '') || '',
          vendor: p.vendor,
          productType: p.product_type,
          url: `https://${shopUrl}/products/${p.handle}`,
          inventoryQuantity: p.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0)
        };

        return new Response(
          JSON.stringify({ success: true, product }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch_by_id': {
        // Fetch product by ID
        const response = await fetch(
          `https://${shopUrl}/admin/api/2024-01/products/${productId}.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('تعذر الوصول للمنتج');
        }

        const data = await response.json();
        const p = data.product as ShopifyProduct;
        const product = {
          id: String(p.id),
          title: p.title,
          handle: p.handle,
          price: p.variants[0]?.price || '0',
          compareAtPrice: p.variants[0]?.compare_at_price || null,
          image: p.images[0]?.src || null,
          description: p.body_html || '',
          descriptionText: p.body_html?.replace(/<[^>]*>/g, '') || '',
          vendor: p.vendor,
          productType: p.product_type,
          url: `https://${shopUrl}/products/${p.handle}`,
          inventoryQuantity: p.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0)
        };

        return new Response(
          JSON.stringify({ success: true, product }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_description': {
        // Update product description in Shopify
        const { newDescription } = await req.json();
        
        const response = await fetch(
          `https://${shopUrl}/admin/api/2024-01/products/${productId}.json`,
          {
            method: 'PUT',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              product: {
                id: productId,
                body_html: newDescription
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error('فشل تحديث المنتج في Shopify');
        }

        // Update last_used_at
        await supabase
          .from('shopify_connections')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', connection.id);

        return new Response(
          JSON.stringify({ success: true, message: 'تم تحديث المنتج في Shopify بنجاح' }),
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
    console.error('Shopify products error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});