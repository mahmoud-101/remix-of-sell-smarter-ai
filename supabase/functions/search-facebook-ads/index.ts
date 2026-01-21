import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, adType } = await req.json();
    
    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching Facebook ads for: ${query}`);

    // Demo data for Facebook Ads
    // In production, you could use Facebook Graph API or web scraping
    const adTemplates = [
      `🔥 عرض حصري! احصل على ${query} بأفضل سعر. شحن مجاني لفترة محدودة. اطلب الآن واستمتع بجودة عالية وضمان سنة كاملة! 💯`,
      `⚡ لا تفوت الفرصة! ${query} الأصلي متوفر الآن بخصم 50%. الكمية محدودة - اطلب قبل نفاد المخزون!`,
      `✨ جديد في المتجر! ${query} بتصميم عصري وجودة استثنائية. توصيل سريع لجميع المدن. اطلب الآن!`,
      `🎁 هدية مجانية مع كل طلب! ${query} + ملحقات إضافية. عرض ينتهي قريباً - لا تتردد!`,
      `💪 أفضل ${query} في السوق! تقييم 5 نجوم من آلاف العملاء. جرب الفرق بنفسك!`,
      `🚀 وصل حديثاً! ${query} بمواصفات خيالية وسعر لا يُصدق. احصل عليه الآن مع ضمان الاسترجاع!`,
      `💎 جودة بريميوم! ${query} المفضل لدى المؤثرين. انضم لآلاف العملاء السعداء!`,
      `🏆 الأكثر مبيعاً! ${query} حقق أعلى مبيعات هذا الشهر. اكتشف السبب بنفسك!`
    ];

    const callToActions = ['Shop Now', 'Learn More', 'Sign Up', 'Get Offer', 'Order Now', 'Buy Now'];

    const demoAds = Array.from({ length: 8 }, (_, i) => {
      const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      return {
        id: `fb_ad_${i}_${Date.now()}`,
        pageUrl: `https://www.facebook.com/ads/library/?id=${crypto.randomUUID().slice(0, 8)}`,
        adText: adTemplates[i % adTemplates.length],
        imageUrl: `https://picsum.photos/seed/fbad${query}${i}/600/400`,
        callToAction: callToActions[Math.floor(Math.random() * callToActions.length)],
        startDate: startDate.toLocaleDateString('ar-EG')
      };
    });

    return new Response(
      JSON.stringify({ ads: demoAds }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in search-facebook-ads:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
