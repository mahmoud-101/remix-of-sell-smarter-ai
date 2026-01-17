import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

const systemPrompt = `أنت خبير عالمي في تصوير المنتجات وكتابة برومبتات لتوليد صور احترافية للإعلانات والمتاجر الإلكترونية.

المهمة:
اكتب برومبت تفصيلي لتوليد صورة منتج واحدة أو عدة لقطات للمنتج، بجودة تناسب الإعلانات والمتاجر (photorealistic, ultra-detailed).

المخرجات يجب أن تكون بصيغة JSON صالحة فقط بدون أي نص خارج JSON.
لو أي مدخل ناقص، افترض قيم منطقية مناسبة ولا تذكر أنك افترضتها.

منطق الصورة المرجعية:
1. لو product_image_provided = true:
   - استخدم صورة المنتج كمرجع أساسي للشكل والألوان.
   - حافظ على شكل المنتج ولونه، وغيّر الخلفية والإضاءة والمشهد فقط.
   - استخدم صياغة مثل:
     "Use the provided product image as the main subject reference. Keep the product shape, colors and label consistent, and only change background, lighting and scene."

2. لو product_image_provided = false:
   - اعتمد على product_text في وصف شكل المنتج وخصائصه.

استخدام أفكار المستخدم:
- اعتبر user_ideas قائمة تفضيلات إضافية.
- دمج هذه التفضيلات في البرومبت إن كانت منطقية (مثلاً جو رمضاني، أجواء فاخرة، ألوان معينة، نوع إضاءة، عناصر في الخلفية).
- لا تكرر نص user_ideas حرفيًا، بل حوّله لوصف بصري احترافي.

قواعد البرومبت (في كل الحالات):
1. حدّد الـ Subject بوضوح (المنتج، مادته، ألوانه).
2. حدّد نوع اللقطة (close-up / flat lay / lifestyle) وزاوية الكاميرا ونوع العدسة.
3. صف الإضاءة بدقة (نوعها + اتجاهها + الظلال).
4. صف الخلفية والبيئة بما يناسب usage و platform.
5. عرّف الـ Mood/Style (luxury, clean, cozy, techy…).
6. أضف تفاصيل للخامة والانعكاسات عند الحاجة.
7. استخدم كلمات جودة: photorealistic, hyperrealistic, ultra-detailed, 8k resolution, sharp focus, studio lighting, DSLR photo.
8. ممنوع: أسماء براندات حقيقية، شعارات، نصوص داخل الصورة، وجوه مشاهير.

الخرج (JSON فقط):
{
  "main_prompt": "برومبت كامل باللغة الإنجليزية يدمج: وصف المنتج، حالة الصورة المرجعية، تفضيلات الاستخدام والستايل والخلفية، مع دمج ذكي لأفكار المستخدم user_ideas في شكل وصف بصري احترافي.",
  "negative_prompt": "blurry, low quality, low resolution, watermark, logo, text, distorted, extra limbs, deformed, overexposed, underexposed, noisy, cartoonish, illustration",
  "use_reference_image": true/false,
  "variations": [
    "lifestyle shot: ...",
    "flat lay: ...",
    "close-up detail: ..."
  ],
  "recommended_settings": {
    "aspect_ratio": "1:1 للمتجر وInstagram feed، 4:5 لإعلانات فيسبوك/انستقرام، 9:16 للستوري والتيكتوك",
    "style_hint": "catalog clean / lifestyle realistic / creative conceptual حسب style و usage و user_ideas",
    "platform_fit": "optimized for usage on platform"
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const { data: authData, error: authError } = await validateAuth(req);
  if (authError) {
    return authError;
  }

  console.log(`Authenticated user: ${authData?.userId}`);

  try {
    const { 
      product_text, 
      product_image_provided = false,
      product_image_url,
      usage, 
      style, 
      background, 
      platform,
      user_ideas
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `المدخلات:
- اسم/وصف المنتج النصي: ${product_text}
- صورة المنتج (موجودة): ${product_image_provided}
${product_image_provided && product_image_url ? `- رابط صورة المنتج: ${product_image_url}` : ''}
- الاستخدام: ${usage}
- الستايل البصري: ${style}
- الخلفية: ${background}
- المنصة المستهدفة: ${platform || "غير محدد"}
- أفكار إضافية من المستخدم: ${user_ideas || "لا توجد"}

اكتب البرومبت الآن بصيغة JSON فقط.`;

    console.log(`User ${authData?.userId} generating prompt for product:`, product_text, "with image:", product_image_provided);

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
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let promptData;
    try {
      // Try to parse directly
      promptData = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        promptData = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find JSON object in the text
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          promptData = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    // Add reference image info to response
    promptData.use_reference_image = product_image_provided;
    if (product_image_provided && product_image_url) {
      promptData.reference_image_url = product_image_url;
    }

    console.log(`Successfully generated prompt data for user ${authData?.userId} with reference:`, product_image_provided);

    return new Response(
      JSON.stringify(promptData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in product-photo-prompt function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
