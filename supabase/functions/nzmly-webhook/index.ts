import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('Nzmly webhook received:', JSON.stringify(body));

    // Extract payment data from Nzmly webhook
    const {
      order_id,
      email,
      status,
      amount,
      product_name,
      customer_name,
      payment_method,
    } = body;

    if (!email || !order_id) {
      console.error('Missing required fields: email or order_id');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine plan type based on amount or product name
    let planType = 'start';
    if (amount >= 20 || product_name?.toLowerCase().includes('business')) {
      planType = 'business';
    } else if (amount >= 10 || product_name?.toLowerCase().includes('pro')) {
      planType = 'pro';
    } else if (amount >= 5 || product_name?.toLowerCase().includes('start')) {
      planType = 'start';
    }

    console.log(`Processing payment: email=${email}, plan=${planType}, amount=${amount}`);

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    let userId = null;
    if (userData?.users) {
      const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      console.log('User not found, storing pending subscription for:', email);
      
      // Store pending subscription for when user signs up
      const { error: pendingError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          plan: planType,
          status: 'pending',
          stripe_customer_id: email, // Store email temporarily
          stripe_subscription_id: order_id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

      if (pendingError) {
        console.error('Error storing pending subscription:', pendingError);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Pending subscription stored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Update or create subscription
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: planType,
        status: 'active',
        stripe_subscription_id: order_id,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (subError) {
      console.error('Error updating subscription:', subError);
      throw subError;
    }

    // Also update user profile plan
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan: planType, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Reset usage for the new billing period
    const monthYear = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    await supabase
      .from('usage')
      .upsert({
        user_id: userId,
        month_year: monthYear,
        generations_count: 0,
        plan: planType,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,month_year' });

    console.log(`Subscription activated: user=${userId}, plan=${planType}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription activated',
        plan: planType,
        expires_at: expiresAt
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
