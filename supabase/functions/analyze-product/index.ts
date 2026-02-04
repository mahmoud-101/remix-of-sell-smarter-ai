const serve = (handler: (req: Request) => Promise<Response>) => {
  Deno.serve(handler);
};
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

    // Build analysis prompt - EGYPTIAN DIALECT ONLY
    const analysisPrompt = `أنت خبير تسويق متخصص في سوق الأزياء والجمال في مصر.

⚠️ مهم جداً: استخدم اللهجة المصرية العامية فقط في كل الردود!
- استخدم "دلوقتي" مش "الآن"
- استخدم "عشان" مش "لأن"  
- استخدم "كده" مش "هكذا"
- استخدم "إيه" مش "ماذا"
- استخدم "ازاي" مش "كيف"
- استخدم "ببلاش" مش "مجاناً"
- استخدم "حاجة" مش "شيء"

قم بتحليل المنتج ده بعمق عشان نعمل محتوى إعلاني يبيع:

📦 معلومات المنتج:
- الاسم: ${productName}
- الوصف: ${productDescription || 'مش متوفر'}
- الفئة: ${category || 'أزياء/جمال'}
- الجمهور المستهدف: ${targetAudience || 'بنات مصر 18-45'}

عايز منك تحليل شامل يشمل:

1. 🎯 الميزة الأساسية (Core Feature):
   - إيه اللي بيميز المنتج ده عن غيره؟

2. ✨ المميزات (Features):
   - اذكر 3-5 مميزات رئيسية

3. 💎 الفوائد (Benefits):
   - العميلة هتستفيد إيه من المميزات دي؟

4. 😰 المشاكل التي يحلها (Problems Solved):
   - إيه المشاكل اللي بتواجه العميلة والمنتج ده بيحلها؟

5. 🎯 أهداف العميل (Customer Goals):
   - العميلة عايزة تحقق إيه؟

6. ❤️ المحفزات العاطفية (Emotional Triggers):
   - إيه المشاعر اللي بتدفع للشرا؟

7. 🤔 اعتراضات العميل (Objections):
   - إيه الأسباب اللي ممكن تمنع العميلة من الشرا؟

8. ❓ الأسئلة الشائعة (FAQs):
   - إيه الأسئلة اللي العملاء بيسألوها عادة؟

9. 📸 أفضل 4 زوايا تصوير للإعلانات:
   - اقترح 4 أنواع صور إعلانية مع وصف تفصيلي لكل واحدة
   - كل صورة لازم تركز على جانب مختلف (فايدة/مشكلة/عاطفة/CTA)

قدم الإجابة بصيغة JSON فقط باللهجة المصرية.`;

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
            content: `أنت خبير تسويق محترف متخصص في السوق المصري.
⚠️ لازم تستخدم اللهجة المصرية العامية في كل الردود!
أمثلة: "دلوقتي" مش "الآن"، "عشان" مش "لأن"، "كده" مش "هكذا"، "إيه" مش "ماذا"، "ازاي" مش "كيف"، "ببلاش" مش "مجاناً".
مهمتك تحليل المنتجات وإنشاء insights تسويقية قوية.
أجب دايماً بصيغة JSON صالحة باللهجة المصرية.`
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
