import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getSystemPrompt = (toolType: string, language: string = 'ar'): string => {
  const isArabic = language === 'ar';
  
  const prompts: Record<string, { ar: string; en: string }> = {
    "product-copy": {
      ar: `أنت خبير في كتابة نصوص المنتجات للتجارة الإلكترونية. مهمتك إنشاء نصوص منتجات مقنعة وعالية التحويل.

عند توليد المحتوى:
- اكتب بأسلوب يناسب الجمهور المستهدف
- ركز على الفوائد وليس فقط المميزات
- استخدم كلمات عاطفية ومحفزة للشراء
- اجعل النص سهل القراءة ومنظم
- حسّن للسيو مع الحفاظ على الجودة
- اكتب باللغة العربية

أرجع النتيجة بصيغة JSON فقط بدون أي نص إضافي:
{
  "title": "عنوان المنتج الجذاب",
  "description": "الوصف الكامل والمقنع",
  "bullets": "• النقطة الأولى\\n• النقطة الثانية\\n• النقطة الثالثة",
  "benefits": "الفوائد الرئيسية للعميل",
  "cta": "دعوة للعمل محفزة"
}`,
      en: `You are an expert e-commerce product copywriter. Your task is to create compelling, high-converting product copy.

When generating content:
- Write in a style that suits the target audience
- Focus on benefits, not just features
- Use emotional and persuasive language
- Make the text easy to read and organized
- Optimize for SEO while maintaining quality

Return the result in JSON format only without any additional text:
{
  "title": "Attractive product title",
  "description": "Complete and convincing description",
  "bullets": "• First point\\n• Second point\\n• Third point",
  "benefits": "Key customer benefits",
  "cta": "Motivating call to action"
}`
    },

    "ads-copy": {
      ar: `أنت خبير في كتابة الإعلانات الرقمية. مهمتك إنشاء إعلانات جاهزة للنشر مع عدة نسخ للاختبار.

عند توليد الإعلانات:
- اكتب 3 نسخ مختلفة للاختبار A/B
- استخدم hooks قوية تجذب الانتباه فوراً
- اجعل CTA واضحة ومحفزة
- تناسب المحتوى مع المنصة المطلوبة
- راعِ الطابع المحلي للجمهور العربي
- استخدم إيموجي مناسبة

أرجع النتيجة بصيغة JSON فقط:
{
  "variations": [
    {
      "headline": "العنوان الجذاب",
      "primaryText": "النص الرئيسي المقنع مع إيموجي",
      "cta": "اشترِ الآن"
    },
    {
      "headline": "عنوان بديل",
      "primaryText": "نص بديل مختلف",
      "cta": "تسوق الآن"
    },
    {
      "headline": "عنوان ثالث",
      "primaryText": "نص ثالث مميز",
      "cta": "احصل عليه الآن"
    }
  ]
}`,
      en: `You are an expert digital advertising copywriter. Create ready-to-publish ads with multiple variations for testing.

When generating ads:
- Write 3 different variations for A/B testing
- Use strong hooks that grab attention immediately
- Make CTA clear and motivating
- Match content to the required platform
- Use appropriate emojis

Return the result in JSON format only:
{
  "variations": [
    {
      "headline": "Attractive headline",
      "primaryText": "Convincing main text with emojis",
      "cta": "Buy Now"
    },
    {
      "headline": "Alternative headline",
      "primaryText": "Different alternative text",
      "cta": "Shop Now"
    },
    {
      "headline": "Third headline",
      "primaryText": "Unique third text",
      "cta": "Get It Now"
    }
  ]
}`
    },

    "campaign": {
      ar: `أنت خبير في التسويق الرقمي والتخطيط الاستراتيجي. مهمتك إنشاء خطط حملات تسويقية شاملة ومفصلة.

عند إنشاء الخطة:
- قسم الحملة لمراحل القمع (وعي، اهتمام، تحويل)
- حدد أنواع المحتوى لكل مرحلة
- اقترح جدول نشر واقعي
- وزع الميزانية بشكل استراتيجي
- قدم أفكار محتوى إبداعية ومحددة

أرجع النتيجة بصيغة JSON فقط:
{
  "funnel": {
    "awareness": { "percentage": 30, "tactics": ["إعلانات فيديو قصيرة", "محتوى توعوي على السوشيال ميديا", "تعاون مع مؤثرين"] },
    "consideration": { "percentage": 40, "tactics": ["إعلانات إعادة استهداف", "محتوى تعليمي", "مراجعات وشهادات"] },
    "conversion": { "percentage": 30, "tactics": ["عروض خاصة", "إعلانات كاروسيل", "رسائل واتساب"] }
  },
  "contentIdeas": ["فكرة 1 مفصلة", "فكرة 2 مفصلة", "فكرة 3 مفصلة", "فكرة 4 مفصلة", "فكرة 5 مفصلة"],
  "schedule": {
    "week1": "إطلاق الوعي بالعلامة",
    "week2": "تعزيز التفاعل",
    "week3": "بناء الثقة",
    "week4": "دفع التحويلات"
  },
  "budgetDistribution": { "ads": 60, "content": 25, "influencers": 15 },
  "kpis": ["معدل النقر CTR", "تكلفة الاكتساب CPA", "معدل التحويل", "العائد على الإنفاق ROAS"]
}`,
      en: `You are a digital marketing and strategic planning expert. Create comprehensive and detailed marketing campaign plans.

When creating the plan:
- Divide campaign into funnel stages (awareness, consideration, conversion)
- Specify content types for each stage
- Suggest realistic posting schedule
- Distribute budget strategically
- Provide specific creative content ideas

Return the result in JSON format only:
{
  "funnel": {
    "awareness": { "percentage": 30, "tactics": ["Short video ads", "Social media awareness content", "Influencer collaborations"] },
    "consideration": { "percentage": 40, "tactics": ["Retargeting ads", "Educational content", "Reviews and testimonials"] },
    "conversion": { "percentage": 30, "tactics": ["Special offers", "Carousel ads", "WhatsApp messages"] }
  },
  "contentIdeas": ["Detailed idea 1", "Detailed idea 2", "Detailed idea 3", "Detailed idea 4", "Detailed idea 5"],
  "schedule": {
    "week1": "Brand awareness launch",
    "week2": "Boost engagement",
    "week3": "Build trust",
    "week4": "Drive conversions"
  },
  "budgetDistribution": { "ads": 60, "content": 25, "influencers": 15 },
  "kpis": ["Click-through rate CTR", "Cost per acquisition CPA", "Conversion rate", "Return on ad spend ROAS"]
}`
    },

    "design": {
      ar: `أنت خبير في تصميم تجربة المستخدم وتحسين معدلات التحويل (CRO). مهمتك تحليل صفحات المنتجات وتقديم توصيات عملية.

عند التحليل:
- قيّم الصفحة من 100 نقطة بشكل واقعي
- قدم توصيات محددة للألوان مع أكواد الألوان
- اقترح تحسينات التخطيط بالتفصيل
- حلل فعالية دعوات العمل
- حدد الأخطاء الشائعة التي تؤثر على التحويل

أرجع النتيجة بصيغة JSON فقط:
{
  "score": 75,
  "colorRecommendations": [
    "استخدم اللون الأخضر #22C55E لزر الشراء لزيادة التحويل",
    "أضف تباين أعلى بين النص والخلفية",
    "استخدم ألوان دافئة للعروض الخاصة"
  ],
  "layoutRecommendations": [
    "ضع زر الشراء فوق الطية (above the fold)",
    "أضف صور منتج متعددة الزوايا",
    "قلل المسافات البيضاء الزائدة"
  ],
  "ctaRecommendations": [
    "اجعل زر الشراء أكبر وأوضح",
    "أضف عبارة طوارئ مثل 'الكمية محدودة'",
    "استخدم نص محفز بدلاً من 'اشتر الآن'"
  ],
  "imageRecommendations": [
    "استخدم صور عالية الجودة بدقة 1200x1200 على الأقل",
    "أضف صور lifestyle للمنتج",
    "أضف زوم للصور عند التمرير"
  ],
  "mistakesToAvoid": [
    "تجنب النوافذ المنبثقة المزعجة",
    "لا تخفي السعر أو تكاليف الشحن",
    "تجنب أوقات التحميل البطيئة"
  ]
}`,
      en: `You are an expert in user experience design and conversion rate optimization (CRO). Your task is to analyze product pages and provide practical recommendations.

When analyzing:
- Rate the page out of 100 realistically
- Provide specific color recommendations with color codes
- Suggest detailed layout improvements
- Analyze call-to-action effectiveness
- Identify common mistakes affecting conversion

Return the result in JSON format only:
{
  "score": 75,
  "colorRecommendations": [
    "Use green #22C55E for the buy button to increase conversion",
    "Add higher contrast between text and background",
    "Use warm colors for special offers"
  ],
  "layoutRecommendations": [
    "Place the buy button above the fold",
    "Add multi-angle product images",
    "Reduce excessive white space"
  ],
  "ctaRecommendations": [
    "Make the buy button larger and clearer",
    "Add urgency phrase like 'Limited quantity'",
    "Use motivating text instead of 'Buy Now'"
  ],
  "imageRecommendations": [
    "Use high-quality images at least 1200x1200",
    "Add lifestyle product images",
    "Add zoom on hover for images"
  ],
  "mistakesToAvoid": [
    "Avoid annoying pop-ups",
    "Don't hide price or shipping costs",
    "Avoid slow loading times"
  ]
}`
    },

    "competitor": {
      ar: `أنت محلل تنافسي خبير في التجارة الإلكترونية. مهمتك تحليل المنافسين بعمق وتحديد الفرص.

عند التحليل:
- حدد نقاط القوة والضعف بدقة
- حلل استراتيجية التسعير والعروض
- افهم أسلوب الرسائل التسويقية
- اكتشف فرص التفوق والتميز
- قدم توصيات عملية للتغلب عليهم

أرجع النتيجة بصيغة JSON فقط:
{
  "strengths": [
    "علامة تجارية قوية ومعروفة",
    "شحن سريع ومجاني",
    "خدمة عملاء ممتازة 24/7"
  ],
  "weaknesses": [
    "أسعار مرتفعة مقارنة بالسوق",
    "تشكيلة منتجات محدودة",
    "موقع غير متجاوب مع الجوال"
  ],
  "pricingStrategy": "يستخدمون استراتيجية التسعير المميز مع خصومات موسمية. متوسط السعر أعلى 20% من السوق مع التركيز على الجودة.",
  "messagingStyle": "يركزون على الفخامة والجودة الأوروبية. لغة رسمية مع التأكيد على الضمان والأصالة.",
  "opportunities": [
    "استهداف الشريحة السعرية المتوسطة غير المخدومة",
    "تقديم خدمة تخصيص المنتجات",
    "التركيز على التسويق عبر المؤثرين",
    "تحسين تجربة الجوال"
  ],
  "actionPlan": [
    "أطلق حملة تسعير تنافسي",
    "اعمل على برنامج ولاء قوي",
    "ركز على المحتوى التعليمي"
  ]
}`,
      en: `You are an expert competitive analyst in e-commerce. Your task is to deeply analyze competitors and identify opportunities.

When analyzing:
- Accurately identify strengths and weaknesses
- Analyze pricing strategy and offers
- Understand marketing messaging style
- Discover opportunities for differentiation
- Provide actionable recommendations to beat them

Return the result in JSON format only:
{
  "strengths": [
    "Strong and well-known brand",
    "Fast and free shipping",
    "Excellent 24/7 customer service"
  ],
  "weaknesses": [
    "High prices compared to market",
    "Limited product selection",
    "Non-responsive mobile website"
  ],
  "pricingStrategy": "They use premium pricing strategy with seasonal discounts. Average price is 20% higher than market with focus on quality.",
  "messagingStyle": "They focus on luxury and European quality. Formal language emphasizing warranty and authenticity.",
  "opportunities": [
    "Target underserved mid-price segment",
    "Offer product customization service",
    "Focus on influencer marketing",
    "Improve mobile experience"
  ],
  "actionPlan": [
    "Launch competitive pricing campaign",
    "Build strong loyalty program",
    "Focus on educational content"
  ]
}`
    }
  };

  return prompts[toolType]?.[isArabic ? 'ar' : 'en'] || prompts[toolType]?.ar || '';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolType, input, language = 'ar' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getSystemPrompt(toolType, language);
    if (!systemPrompt) {
      throw new Error(`Unknown tool type: ${toolType}`);
    }

    const userPrompt = buildUserPrompt(toolType, input, language);

    console.log(`Generating ${toolType} content in ${language}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later.", status: 429 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits.", status: 402 }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/) ||
                       content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Create structured response from raw text
      result = { raw: content };
    }

    console.log(`Successfully generated ${toolType} content`);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ai-generate function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildUserPrompt(toolType: string, input: Record<string, any>, language: string): string {
  const isArabic = language === 'ar';
  
  switch (toolType) {
    case "product-copy":
      return isArabic 
        ? `أنشئ نصوص منتج احترافية للمنتج التالي:
اسم المنتج: ${input.productName}
وصف المنتج: ${input.productDescription}
الجمهور المستهدف: ${input.targetAudience || "جمهور عام"}
أسلوب الكتابة: ${input.tone || "professional"}
أنواع المخرجات المطلوبة: ${input.outputTypes?.join(", ") || "title, description, bullets, benefits, cta"}

أرجع JSON فقط بدون أي نص إضافي.`
        : `Create professional product copy for:
Product Name: ${input.productName}
Description: ${input.productDescription}
Target Audience: ${input.targetAudience || "General audience"}
Tone: ${input.tone || "professional"}
Required outputs: ${input.outputTypes?.join(", ") || "title, description, bullets, benefits, cta"}

Return JSON only without any additional text.`;

    case "ads-copy":
      return isArabic
        ? `أنشئ 3 إعلانات مختلفة للمنتج التالي:
اسم المنتج: ${input.productName}
وصف المنتج: ${input.productDescription}
المنصة: ${input.platform || "facebook"}
هدف الحملة: ${input.goal || "conversions"}
الجمهور المستهدف: ${input.targetAudience || "جمهور عام"}

اجعل كل نسخة مختلفة بأسلوب مميز. أرجع JSON فقط.`
        : `Create 3 different ads for:
Product Name: ${input.productName}
Description: ${input.productDescription}
Platform: ${input.platform || "facebook"}
Campaign Goal: ${input.goal || "conversions"}
Target Audience: ${input.targetAudience || "General audience"}

Make each variation unique in style. Return JSON only.`;

    case "campaign":
      return isArabic
        ? `أنشئ خطة حملة تسويقية شاملة ومفصلة:
اسم الحملة: ${input.campaignName}
نوع النشاط: ${input.businessType}
الهدف الرئيسي: ${input.goal || "زيادة المبيعات"}
المدة: ${input.duration || "شهر واحد"}
الميزانية: ${input.budget || "متوسطة"}

قدم خطة عملية وقابلة للتنفيذ. أرجع JSON فقط.`
        : `Create a comprehensive marketing campaign plan:
Campaign Name: ${input.campaignName}
Business Type: ${input.businessType}
Main Goal: ${input.goal || "Increase sales"}
Duration: ${input.duration || "One month"}
Budget: ${input.budget || "Medium"}

Provide a practical and actionable plan. Return JSON only.`;

    case "design":
      return isArabic
        ? `حلل صفحة المنتج التالية وقدم توصيات مفصلة:
رابط الصفحة: ${input.pageUrl || "لم يُحدد"}
نوع الصفحة: ${input.pageType || "product"}
وصف الصفحة الحالي: ${input.description || "صفحة منتج تجارة إلكترونية"}
الهدف: ${input.businessGoal || "زيادة معدل التحويل"}

قدم تحليل شامل مع توصيات عملية محددة. أرجع JSON فقط.`
        : `Analyze the following product page and provide detailed recommendations:
Page URL: ${input.pageUrl || "Not specified"}
Page Type: ${input.pageType || "product"}
Current Page Description: ${input.description || "E-commerce product page"}
Goal: ${input.businessGoal || "Increase conversion rate"}

Provide comprehensive analysis with specific practical recommendations. Return JSON only.`;

    case "competitor":
      return isArabic
        ? `حلل المنافس التالي بعمق:
اسم المنافس: ${input.competitorName}
موقعه: ${input.website || "لم يُحدد"}
وصف المنافس: ${input.description || "منافس في نفس المجال"}
نشاطك التجاري: ${input.yourBusiness || "تجارة إلكترونية"}

قدم تحليل شامل مع استراتيجيات للتفوق عليهم. أرجع JSON فقط.`
        : `Deeply analyze the following competitor:
Competitor Name: ${input.competitorName}
Website: ${input.website || "Not specified"}
Competitor Description: ${input.description || "Competitor in the same field"}
Your Business: ${input.yourBusiness || "E-commerce"}

Provide comprehensive analysis with strategies to outperform them. Return JSON only.`;

    default:
      return JSON.stringify(input);
  }
}
