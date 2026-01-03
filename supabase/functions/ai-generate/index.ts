import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompts: Record<string, string> = {
  "product-copy": `أنت خبير في كتابة نصوص المنتجات للتجارة الإلكترونية. مهمتك إنشاء نصوص منتجات مقنعة وعالية التحويل.

عند توليد المحتوى:
- اكتب بأسلوب يناسب الجمهور المستهدف
- ركز على الفوائد وليس فقط المميزات
- استخدم كلمات عاطفية ومحفزة للشراء
- اجعل النص سهل القراءة ومنظم
- حسّن للسيو مع الحفاظ على الجودة

أرجع النتيجة بصيغة JSON بالشكل التالي:
{
  "title": "عنوان المنتج",
  "description": "الوصف الكامل",
  "bullets": "النقاط الرئيسية (كل نقطة في سطر)",
  "benefits": "الفوائد الرئيسية",
  "cta": "دعوة للعمل"
}`,

  "ads-copy": `أنت خبير في كتابة الإعلانات الرقمية. مهمتك إنشاء إعلانات جاهزة للنشر مع عدة نسخ للاختبار.

عند توليد الإعلانات:
- اكتب 3 نسخ مختلفة للاختبار A/B
- استخدم hooks قوية تجذب الانتباه
- اجعل CTA واضحة ومحفزة
- تناسب المحتوى مع المنصة المطلوبة
- راعِ الطابع المحلي للجمهور المستهدف

أرجع النتيجة بصيغة JSON بالشكل التالي:
{
  "variations": [
    {
      "headline": "العنوان",
      "primaryText": "النص الرئيسي",
      "cta": "دعوة للعمل"
    }
  ]
}`,

  "campaign": `أنت خبير في التسويق الرقمي والتخطيط الاستراتيجي. مهمتك إنشاء خطط حملات تسويقية شاملة.

عند إنشاء الخطة:
- قسم الحملة لمراحل القمع (وعي، اهتمام، تحويل)
- حدد أنواع المحتوى لكل مرحلة
- اقترح جدول نشر واقعي
- وزع الميزانية بشكل استراتيجي
- قدم أفكار محتوى إبداعية

أرجع النتيجة بصيغة JSON بالشكل التالي:
{
  "funnel": {
    "awareness": { "percentage": 30, "tactics": ["..."] },
    "consideration": { "percentage": 40, "tactics": ["..."] },
    "conversion": { "percentage": 30, "tactics": ["..."] }
  },
  "contentIdeas": ["..."],
  "schedule": { "week1": "...", "week2": "..." },
  "budgetDistribution": { "ads": 60, "content": 25, "influencers": 15 }
}`,

  "design": `أنت خبير في تصميم تجربة المستخدم وتحسين معدلات التحويل. مهمتك تحليل صفحات المنتجات وتقديم توصيات.

عند التحليل:
- قيّم الصفحة من 100 نقطة
- قدم توصيات محددة للألوان
- اقترح تحسينات التخطيط
- حلل فعالية دعوات العمل
- حدد الأخطاء الشائعة

أرجع النتيجة بصيغة JSON بالشكل التالي:
{
  "score": 75,
  "colorRecommendations": ["..."],
  "layoutRecommendations": ["..."],
  "ctaRecommendations": ["..."],
  "imageRecommendations": ["..."],
  "mistakesToAvoid": ["..."]
}`,

  "competitor": `أنت محلل تنافسي خبير. مهمتك تحليل المنافسين وتحديد الفرص.

عند التحليل:
- حدد نقاط القوة والضعف
- حلل استراتيجية التسعير
- افهم أسلوب الرسائل التسويقية
- اكتشف فرص التفوق
- قدم توصيات عملية

أرجع النتيجة بصيغة JSON بالشكل التالي:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "pricingStrategy": "...",
  "messagingStyle": "...",
  "opportunities": ["..."]
}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolType, input } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = systemPrompts[toolType];
    if (!systemPrompt) {
      throw new Error(`Unknown tool type: ${toolType}`);
    }

    const userPrompt = buildUserPrompt(toolType, input);

    console.log(`Generating ${toolType} content...`);

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", status: 429 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required", status: 402 }),
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
                       content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
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

function buildUserPrompt(toolType: string, input: Record<string, any>): string {
  switch (toolType) {
    case "product-copy":
      return `أنشئ نصوص منتج للمنتج التالي:
اسم المنتج: ${input.productName}
وصف المنتج: ${input.productDescription}
الجمهور المستهدف: ${input.targetAudience || "عام"}
أسلوب الكتابة: ${input.tone || "professional"}
أنواع المخرجات المطلوبة: ${input.outputTypes?.join(", ") || "title, description, bullets"}`;

    case "ads-copy":
      return `أنشئ إعلانات للمنتج التالي:
اسم المنتج: ${input.productName}
وصف المنتج: ${input.productDescription}
المنصة: ${input.platform || "facebook"}
هدف الحملة: ${input.goal || "conversions"}
الجمهور المستهدف: ${input.targetAudience || "عام"}
الدولة: ${input.country || "السعودية"}`;

    case "campaign":
      return `أنشئ خطة حملة تسويقية:
اسم الحملة: ${input.campaignName}
نوع النشاط: ${input.businessType}
الهدف الرئيسي: ${input.goal || "conversions"}
المدة: ${input.duration || "1 month"}
الميزانية: ${input.budget || "متوسطة"}`;

    case "design":
      return `حلل صفحة المنتج التالية:
رابط الصفحة: ${input.pageUrl || "لم يُحدد"}
نوع الصفحة: ${input.pageType || "product"}
وصف الصفحة: ${input.description || "صفحة منتج تجارة إلكترونية"}`;

    case "competitor":
      return `حلل المنافس التالي:
اسم المنافس: ${input.competitorName}
موقعه: ${input.website || "لم يُحدد"}
وصف المنافس: ${input.description || ""}`;

    default:
      return JSON.stringify(input);
  }
}
