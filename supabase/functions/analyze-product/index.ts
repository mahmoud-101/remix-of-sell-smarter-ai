import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

/**
 * Product Deep Analysis for Image Studio
 * Analyzes product to generate marketing insights before image generation
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { data: authData, error: authError } = await validateAuth(req);
  if (authError) {
    return authError;
  }

  console.log(`Authenticated user: ${authData?.userId}`);

  try {
    const { productName, productDescription, category, targetAudience, productImage, language = 'ar' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!productName) {
      throw new Error(language === 'ar' ? "اسم المنتج مطلوب" : "Product name is required");
    }

    console.log(`User ${authData?.userId} analyzing product: ${productName}`);

    // Build analysis prompt
    const analysisPrompt = `أنت خبير تسويق متخصص في سوق الأزياء والجمال في مصر والشرق الأوسط.

قم بتحليل المنتج التالي بعمق لإنشاء محتوى إعلاني فعال:

📦 معلومات المنتج:
- الاسم: ${productName}
- الوصف: ${productDescription || 'غير متوفر'}
- الفئة: ${category || 'أزياء/جمال'}
- الجمهور المستهدف: ${targetAudience || 'نساء مصر 18-45'}

أريد منك تحليل شامل يشمل:

1. 🎯 الميزة الأساسية (Core Feature):
   - ما الذي يميز هذا المنتج عن غيره؟

2. ✨ المميزات (Features):
   - اذكر 3-5 مميزات رئيسية

3. 💎 الفوائد (Benefits):
   - كيف يستفيد العميل من هذه المميزات؟

4. 😰 المشاكل التي يحلها (Problems Solved):
   - ما المشاكل التي يواجهها العميل ويحلها هذا المنتج؟

5. 🎯 أهداف العميل (Customer Goals):
   - ماذا يريد العميل تحقيقه؟

6. ❤️ المحفزات العاطفية (Emotional Triggers):
   - ما المشاعر التي تدفع للشراء؟

7. 🤔 اعتراضات العميل (Objections):
   - ما الأسباب التي قد تمنع العميل من الشراء؟

8. ❓ الأسئلة الشائعة (FAQs):
   - ما الأسئلة التي يسألها العملاء عادة؟

9. 📸 أفضل 4 زوايا تصوير للإعلانات:
   - اقترح 4 أنواع صور إعلانية مع وصف تفصيلي لكل واحدة
   - كل صورة يجب أن تركز على جانب مختلف (فائدة/مشكلة/عاطفة/CTA)

قدم الإجابة بصيغة JSON فقط بالعربية المصرية.`;

    // Call AI for analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `أنت خبير تسويق محترف متخصص في السوق المصري والعربي.
مهمتك تحليل المنتجات وإنشاء insights تسويقية قوية.
أجب دائماً بصيغة JSON صالحة باللغة العربية المصرية.`
          },
          {
            role: "user",
            content: productImage 
              ? [
                  { type: "text", text: analysisPrompt },
                  { type: "image_url", image_url: { url: productImage } }
                ]
              : analysisPrompt
          }
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI analysis error:", response.status, errorText);
      
      if (response.status === 402) {
        throw new Error(language === 'ar' 
          ? "رصيد الـ AI انتهى - يرجى إضافة رصيد"
          : "AI quota exceeded - please add credits");
      }
      if (response.status === 429) {
        throw new Error(language === 'ar'
          ? "الطلبات كثيرة - حاول مرة تانية بعد شوية"
          : "Rate limit exceeded - please try again");
      }
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    let analysisText = data.choices?.[0]?.message?.content || "";
    
    // Clean and parse JSON
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // Try to extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse analysis response");
      }
    }

    console.log(`Product analysis completed for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        productName,
        analyzedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in analyze-product function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
