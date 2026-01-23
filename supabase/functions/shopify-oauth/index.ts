import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_CLIENT_ID = Deno.env.get('SHOPIFY_CLIENT_ID')!;
const SHOPIFY_CLIENT_SECRET = Deno.env.get('SHOPIFY_CLIENT_SECRET')!;
const SCOPES = 'read_products,write_products,read_inventory';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, shop, code, redirectUri } = await req.json();
    
    console.log(`Shopify OAuth action: ${action}, shop: ${shop}`);

    switch (action) {
      case 'get_auth_url': {
        // Generate OAuth URL for Shopify
        if (!shop) {
          return new Response(
            JSON.stringify({ error: 'Shop URL is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Clean shop URL
        let cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
        if (!cleanShop.includes('.myshopify.com')) {
          cleanShop = `${cleanShop}.myshopify.com`;
        }

        const state = crypto.randomUUID(); // For CSRF protection
        
        const authUrl = `https://${cleanShop}/admin/oauth/authorize?` + 
          `client_id=${SHOPIFY_CLIENT_ID}&` +
          `scope=${SCOPES}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `state=${state}`;

        return new Response(
          JSON.stringify({ 
            success: true, 
            authUrl,
            state,
            shop: cleanShop 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'exchange_token': {
        // Exchange authorization code for access token
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

        if (!code || !shop) {
          return new Response(
            JSON.stringify({ error: 'Code and shop are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Clean shop URL
        let cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
        if (!cleanShop.includes('.myshopify.com')) {
          cleanShop = `${cleanShop}.myshopify.com`;
        }

        // Exchange code for token
        const tokenResponse = await fetch(`https://${cleanShop}/admin/oauth/access_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: SHOPIFY_CLIENT_ID,
            client_secret: SHOPIFY_CLIENT_SECRET,
            code
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to exchange token', details: errorText }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        const scope = tokenData.scope;

        // Get shop info
        const shopResponse = await fetch(`https://${cleanShop}/admin/api/2024-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        });

        let shopName = cleanShop;
        if (shopResponse.ok) {
          const shopData = await shopResponse.json();
          shopName = shopData.shop?.name || cleanShop;
        }

        // Save connection with encrypted token
        const { data: connection, error: insertError } = await supabase
          .from('shopify_connections')
          .upsert({
            user_id: user.id,
            shop_url: cleanShop,
            shop_name: shopName,
            access_token_encrypted: accessToken, // Will be encrypted by trigger
            scopes: scope,
            connected_at: new Date().toISOString(),
            is_active: true
          }, { onConflict: 'user_id' })
          .select('id, shop_url, shop_name, connected_at, is_active')
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to save connection' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            connection,
            message: `✅ تم ربط ${shopName} بنجاح!`
          }),
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
    console.error('Shopify OAuth error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});