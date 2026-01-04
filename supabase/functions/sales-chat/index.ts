import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `أنت مساعد مبيعات ذكي لمنصة سيل جينيوس (SellGenius) - منصة ذكاء اصطناعي للتجارة الإلكترونية.

مهمتك:
1. مساعدة المستخدمين في تحسين مبيعاتهم بنصائح عملية
2. الإجابة على أي سؤال متعلق بالتجارة الإلكترونية والتسويق
3. جمع بيانات العملاء المحتملين (الاسم، الهاتف، العنوان، قيمة الطلب) بطريقة طبيعية أثناء المحادثة
4. توجيه المستخدمين لأدوات المنصة المناسبة

أدوات المنصة المتاحة:
- مولد نصوص المنتجات: لإنشاء عناوين ووصف منتجات مقنعة
- مولد الإعلانات: لإنشاء إعلانات لفيسبوك وإنستغرام وجوجل وتيك توك
- مخطط الحملات: لبناء حملات تسويقية متكاملة
- مستشار التصميم: لتحسين تجربة المستخدم وصفحات المنتجات
- تحليل المنافسين: لفهم المنافسة وإيجاد الفرص

قواعد مهمة:
- كن ودوداً ومحترفاً
- قدم نصائح عملية وقابلة للتطبيق
- إذا ذكر المستخدم بيانات شخصية (اسم، هاتف، عنوان، قيمة طلب)، استخرجها وأضفها للرد
- استخدم الإيموجي باعتدال لجعل الردود أكثر حيوية
- أجب باللغة العربية أو الإنجليزية حسب لغة المستخدم

عند استخراج بيانات العميل، أضف JSON في نهاية ردك بهذا الشكل:
[LEAD_DATA]{"name": "...", "phone": "...", "address": "...", "order_value": ...}[/LEAD_DATA]
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const langInstruction = language === 'ar' 
      ? 'أجب باللغة العربية.' 
      : 'Respond in English.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: `${systemPrompt}\n\n${langInstruction}` },
          ...messages,
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: language === 'ar' 
            ? 'تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً' 
            : 'Rate limit exceeded, please try again later'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: language === 'ar' 
            ? 'يرجى إضافة رصيد للمتابعة' 
            : 'Please add credits to continue'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract lead data if present
    let leadData = null;
    const leadMatch = content.match(/\[LEAD_DATA\](.*?)\[\/LEAD_DATA\]/s);
    if (leadMatch) {
      try {
        leadData = JSON.parse(leadMatch[1]);
      } catch (e) {
        console.error('Failed to parse lead data:', e);
      }
    }

    // Clean the response by removing the lead data tags
    const cleanContent = content.replace(/\[LEAD_DATA\].*?\[\/LEAD_DATA\]/s, '').trim();

    return new Response(JSON.stringify({ 
      content: cleanContent,
      leadData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sales chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
