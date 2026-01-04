import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle webhook verification from Meta
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body));

    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ status: 'no messages' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = messages[0];
    const from = message.from;
    const messageText = message.text?.body || '';
    const messageId = message.id;
    const timestamp = message.timestamp;

    // Get WhatsApp credentials
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
      throw new Error('WhatsApp credentials not configured');
    }

    // Generate AI response
    let aiResponse = 'مرحباً! كيف يمكنني مساعدتك اليوم؟';
    
    if (LOVABLE_API_KEY) {
      const aiResult = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `أنت مساعد مبيعات ودود لمتجر إلكتروني. قدم إجابات مختصرة ومفيدة.
              - أجب بالعربية
              - كن ودودًا ومحترفًا
              - ساعد العملاء في استفساراتهم
              - إذا طلب العميل معلومات محددة عن منتج، اطلب منه المزيد من التفاصيل`
            },
            { role: 'user', content: messageText }
          ],
        }),
      });

      if (aiResult.ok) {
        const aiData = await aiResult.json();
        aiResponse = aiData.choices?.[0]?.message?.content || aiResponse;
      }
    }

    // Send response via WhatsApp API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: aiResponse },
        }),
      }
    );

    const whatsappResult = await whatsappResponse.json();
    console.log('WhatsApp response sent:', whatsappResult);

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to find or create lead
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', from)
      .single();

    if (!existingLead) {
      await supabase.from('leads').insert({
        phone: from,
        source: 'whatsapp',
        notes: `First message: ${messageText}`,
        status: 'new',
      });
    }

    return new Response(JSON.stringify({ 
      status: 'success',
      messageId,
      response: aiResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
