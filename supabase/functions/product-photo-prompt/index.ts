import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `أنت خبير عالمي في تصوير المنتجات وكتابة برومبتات لتوليد صور احترافية للإعلانات والمتاجر الإلكترونية.

المهمة:
اكتب برومبت تفصيلي لتوليد صورة منتج واحدة أو عدة لقطات للمنتج، بجودة تناسب الإعلانات والمتاجر (photorealistic, ultra‑detailed).

المخرجات يجب أن تكون بصيغة JSON صالحة فقط بدون أي نص خارج JSON.
لو أي مدخل ناقص، افترض قيم منطقية مناسبة ولا تذكر أنك افترضتها.

قواعد كتابة البرومبت:
1. ركّز على تصوير المنتج نفسه كـ **Subject** واضح في الكادر، مع ذكر:
   - الشكل العام، المواد، الألوان، أي تفاصيل مميزة للمنتج.
2. حدد:
   - نوع اللقطة: close-up, medium shot, flat lay, lifestyle shot.
   - زاوية الكاميرا: eye level, top-down, low angle, 3/4 view.
   - نوع العدسة (اختياري): 35mm / 50mm / wide-angle / macro.
3. حدد الإضاءة بدقة:
   - natural light / soft studio light / dramatic cinematic light / golden hour
   - اتجاه الإضاءة (من الأمام، من الجانب، backlight) + وجود ظلال ناعمة أو حادة.
4. صف الخلفية (Background / Environment):
   - إن كانت صورة catalog: خلفية بسيطة نظيفة، minimal, studio, seamless.
   - إن كانت lifestyle: مشهد حقيقي (مطبخ، حمّام، مكتب، صالة منزل، شارع، إلخ) مع التركيز على بقاء المنتج هو العنصر الأوضح.
5. صف الـ Mood & Style:
   - مشاعر وأجواء الصورة: luxury, clean, cozy, energetic, playful, elegant, premium.
   - استخدم مفاهيم مثل: cinematic, editorial photography, commercial product photography.
6. صف التفاصيل (Textures & Details):
   - انعكاسات، لمعان، خامة السطح (matte/glossy), قطرات ماء، بخار، إلخ، لو مناسب للمنتج.
7. أضف كلمات مفاتيح تقنية مناسبة لجودة عالية:
   - photorealistic, hyperrealistic, ultra‑detailed, 8k resolution, sharp focus, high detail, studio lighting, DSLR photo.
8. لا تستخدم:
   - أي أسماء براندات حقيقية أو شعارات / Logos
   - وجوه أشخاص حقيقيين أو مشاهير
   - نصوص مكتوبة داخل الصورة (slogans, نص عربي، إلخ)
9. إذا كان الاستخدام = متجر أو أمازون:
   - ركّز أكثر على صورة catalog نظيفة بخلفية بسيطة أو بيضاء.
10. إذا كان الاستخدام = إعلان / سوشيال ميديا:
    - يمكن إضافة نسخة lifestyle أو creative مع مشهد واقعي أو فكرة قوية.

الخرج (JSON فقط):
{
  "main_prompt": "وصف كامل مفصل للصورة الرئيسية باللغة الإنجليزية، يبدأ بالمحتوى الأساسي (subject) ثم الكاميرا واللقطة والإضاءة والخلفية والمزاج، مع كلمات photorealistic, ultra-detailed, 8k, sharp focus, professional product photography.",
  "negative_prompt": "blurry, low quality, low resolution, watermark, logo, text, distorted, extra limbs, deformed, overexposed, underexposed, noisy, cartoonish, illustration",
  "variations": [
    "lifestyle shot: وصف لقطة لايف ستايل للمنتج في استخدام واقعي مناسب للجمهور المستهدف",
    "flat lay: وصف لقطة flat lay من أعلى مع ترتيب بسيط للإكسسوارات أو العناصر المحيطة بالمنتج",
    "close-up detail: وصف لقطة close-up تركز على تفاصيل خامة المنتج أو أهم جزء فيه"
  ],
  "recommended_settings": {
    "aspect_ratio": "1:1 للمتجر، 4:5 لفيسبوك/انستقرام، 9:16 للستوري والتيكتوك",
    "style_hint": "catalog clean / lifestyle realistic / creative conceptual",
    "platform_fit": "optimized for usage on platform"
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product, usage, style, background, platform } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `المدخلات:
- المنتج: ${product}
- الاستخدام: ${usage}
- الستايل البصري: ${style}
- الخلفية: ${background}
- المنصة المستهدفة: ${platform || "غير محدد"}

اكتب البرومبت الآن بصيغة JSON فقط.`;

    console.log("Generating prompt for product:", product);

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

    console.log("Successfully generated prompt data");

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
