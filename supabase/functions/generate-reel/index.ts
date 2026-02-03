import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

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
    const { imageUrl, style, productName, duration = 5, language = 'ar' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    // ============================================
    // REELS STUDIO - AI Storyboard Generator
    // Generates 3 scene images for Reels/TikTok
    // Using Lovable AI with Gemini Pro Image
    // ============================================

    // Define video styles with scene prompts
    const stylePrompts: Record<string, { scenes: string[]; captionAr: string; captionEn: string }> = {
      unboxing: {
        scenes: [
          "Closed elegant gift box with the product inside, dramatic studio lighting, anticipation moment, luxury packaging",
          "Hands opening the box revealing the product, excitement moment, soft sparkle effects, premium feel",
          "Product revealed in full glory, hero shot with professional lighting, elegant presentation"
        ],
        captionAr: "📦 أنبوكسينق حصري! شوفوا الجمال ده 😍✨",
        captionEn: "📦 Exclusive unboxing! Check out this beauty 😍✨"
      },
      before_after: {
        scenes: [
          "Before state - plain, dull presentation, muted colors, problem situation",
          "Transition moment - transformation happening, dynamic energy, sparkles effect",
          "After state - product solving the problem, vibrant colors, success moment, premium quality"
        ],
        captionAr: "🔄 قبل وبعد - الفرق واضح! 💫",
        captionEn: "🔄 Before & After - See the difference! 💫"
      },
      testimonial: {
        scenes: [
          "Product displayed with 5-star rating overlay, trust badges, professional photography",
          "Close-up detail shot showing quality and craftsmanship, premium feel",
          "Product with satisfied customer vibe, order now call-to-action design"
        ],
        captionAr: "⭐ تجربة حقيقية - 5 نجوم! اطلبيه الآن 🛒",
        captionEn: "⭐ Real review - 5 stars! Order now 🛒"
      },
      showcase: {
        scenes: [
          "Product front view, professional studio lighting, elegant presentation, hero shot",
          "Product 45-degree angle view, showing depth and dimension, premium quality feel",
          "Product with lifestyle context, promotional design, call-to-action aesthetic"
        ],
        captionAr: "✨ منتج فاخر بجودة عالية - متوفر الآن! 🔥",
        captionEn: "✨ Premium quality product - Available now! 🔥"
      },
      trending: {
        scenes: [
          "Product with viral TikTok aesthetic, bold colors, trendy vibes, energetic mood",
          "Dynamic zoom effect on product details, energetic style, social media ready",
          "Product with fire emoji effects, viral energy, everyone's asking about it vibe"
        ],
        captionAr: "🔥 ترند الموسم! الكل بيسأل عنه 💜",
        captionEn: "🔥 Trending now! Everyone's asking about it 💜"
      }
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.showcase;
    
    console.log(`User ${authData?.userId} generating Reel storyboard, style: ${style}, scenes: ${selectedStyle.scenes.length}`);

    // Generate multiple scene images
    const sceneImages: Array<{ imageUrl: string; scene: number; description: string }> = [];
    
    for (let i = 0; i < selectedStyle.scenes.length; i++) {
      const scenePrompt = `CRITICAL: Keep the EXACT same product from the reference image. Do NOT change the product.

Create scene ${i + 1} for a TikTok/Instagram Reel advertisement:

Scene description: ${selectedStyle.scenes[i]}
Product: ${productName || "Featured product"}

Requirements:
- Preserve the IDENTICAL product from the input image
- Professional advertising photography quality
- 9:16 vertical format suitable for Reels/TikTok
- Eye-catching, scroll-stopping visual
- High-end e-commerce aesthetic
- Clean, modern design without text overlays`;

      try {
        console.log(`Generating scene ${i + 1}/${selectedStyle.scenes.length}...`);
        
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: scenePrompt },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Scene ${i + 1} generation error:`, response.status, errorText);
          
          if (response.status === 402) {
            throw new Error(language === 'ar' 
              ? "رصيد الـ AI انتهى - يرجى إضافة رصيد"
              : "AI quota exceeded - please add credits");
          }
          if (response.status === 429) {
            throw new Error(language === 'ar'
              ? "الطلبات كثيرة - حاول مرة تانية بعد شوية"
              : "Rate limit exceeded - please try again in a moment");
          }
          continue; // Try next scene
        }

        const data = await response.json();
        const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (generatedImage) {
          sceneImages.push({
            imageUrl: generatedImage,
            scene: i + 1,
            description: selectedStyle.scenes[i]
          });
          console.log(`Scene ${i + 1} generated successfully`);
        }
      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
        if (sceneError instanceof Error && 
            (sceneError.message.includes("quota") || sceneError.message.includes("Rate limit") || sceneError.message.includes("رصيد"))) {
          throw sceneError;
        }
      }
    }

    if (sceneImages.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد المشاهد - حاول مرة تانية"
        : "No scenes were generated - please try again");
    }

    console.log(`Successfully generated ${sceneImages.length} scenes for user ${authData?.userId}`);

    // Generate caption and hashtags
    const caption = language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn;
    
    const hashtagsAr = [
      "#تسوق_اونلاين",
      "#موضة",
      "#ستايل",
      "#fashion",
      "#trending",
      "#viral",
      "#fyp",
      "#reels",
      style === "unboxing" ? "#انبوكسينق" : "",
      style === "before_after" ? "#قبل_وبعد" : "",
      style === "testimonial" ? "#تجربتي" : "",
    ].filter(Boolean);

    const hashtagsEn = [
      "#shopping",
      "#fashion",
      "#style",
      "#trending",
      "#viral",
      "#fyp",
      "#reels",
      "#tiktok",
      style === "unboxing" ? "#unboxing" : "",
      style === "before_after" ? "#beforeafter" : "",
      style === "testimonial" ? "#review" : "",
    ].filter(Boolean);

    return new Response(
      JSON.stringify({ 
        scenes: sceneImages,
        caption,
        hashtags: language === 'ar' ? hashtagsAr : hashtagsEn,
        duration: `${duration}s`,
        style,
        format: "Storyboard",
        totalScenes: sceneImages.length,
        instructions: language === 'ar' 
          ? "استخدم الصور دي في أي تطبيق مونتاج لعمل ريل احترافي - VN أو InShot أو أي تطبيق تفضله"
          : "Use these images in any editing app to create a professional Reel - VN, InShot, or your favorite app"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-reel function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
