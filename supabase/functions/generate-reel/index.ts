import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

const RUNWARE_API_URL = "https://api.runware.ai/v1";

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
    const { imageUrl, style, productName, duration = 5, language = 'ar', model, generateVideo = false } = await req.json();
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    // Style prompts for different reel types
    const stylePrompts: Record<string, { 
      scenes: string[]; 
      captionAr: string; 
      captionEn: string;
      hookAr: string;
      ctaAr: string;
      musicVibe: string;
    }> = {
      unboxing: {
        scenes: [
          "Luxury gift box with golden ribbon, dramatic lighting, elegant presentation, product reveal moment",
          "Hand opening box, sparkle effects, soft warm lighting, product emerging beautifully",
          "Product hero shot, professional studio lighting, gradient background, premium feel"
        ],
        captionAr: "📦 أنبوكسينق! لما الطرد يوصل 😍✨\n\n💜 اطلبيه بكود LOVE10",
        captionEn: "📦 Unboxing time! 😍✨",
        hookAr: "استني تشوفي اللي جوا! 👀",
        ctaAr: "اطلبي دلوقتي - توصيل سريع 🚚",
        musicVibe: "Upbeat Arabic pop"
      },
      before_after: {
        scenes: [
          "Before state - dim lighting, neutral colors, problem visualization",
          "Transformation moment - product in spotlight, magical transition effect",
          "After state - bright warm lighting, vibrant colors, success visualization"
        ],
        captionAr: "🔄 التحول الحقيقي! 😱\n\n💜 اللينك في البايو",
        captionEn: "🔄 Real transformation! 😱",
        hookAr: "الفرق صادم! 😱",
        ctaAr: "جربي بنفسك 💯",
        musicVibe: "Dramatic reveal"
      },
      testimonial: {
        scenes: [
          "Product with 5 golden stars, trust badges, professional gradient background",
          "Macro detail shot of product quality, soft lighting, premium feel",
          "Call-to-action design, product with order button, discount badge"
        ],
        captionAr: "⭐ لما ألف بنت تقول إنه الأحسن!\n\n🛒 شحن ببلاش",
        captionEn: "⭐ 1000+ happy customers!",
        hookAr: "شوفي ليه الكل بيحبه! 💕",
        ctaAr: "اطلبي دلوقتي ⏰",
        musicVibe: "Confident music"
      },
      showcase: {
        scenes: [
          "Product front angle, clean white studio background, professional lighting",
          "Product at 45 degree angle, rim lighting, depth and dimension",
          "Full advertising design, product with promotional elements"
        ],
        captionAr: "✨ المنتج اللي الكل بيسأل عليه!\n\n🛒 اللينك في البايو",
        captionEn: "✨ The product everyone wants!",
        hookAr: "أحلى منتج هتشوفيه! ✨",
        ctaAr: "متوفر دلوقتي 🔥",
        musicVibe: "Elegant, premium"
      },
      trending: {
        scenes: [
          "Product in viral TikTok style, bold neon colors, dynamic energy",
          "Dynamic zoom effect, RGB lighting, high energy motion",
          "FOMO urgency design, countdown timer, limited stock alert"
        ],
        captionAr: "🔥 الترند اللي كسر التيك توك!\n\n⚡ هيخلص!",
        captionEn: "🔥 TikTok viral trend!",
        hookAr: "لو مشفتيش ده! 🤯",
        ctaAr: "احجزي قبل ما يخلص! ⚡",
        musicVibe: "Viral TikTok sound"
      }
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.showcase;
    
    console.log(`Generating Reel scenes for style: ${style}`);

    // Generate scene images using Runware
    const sceneImages: Array<{ imageUrl: string; scene: number; description: string }> = [];

    for (let i = 0; i < selectedStyle.scenes.length; i++) {
      const sceneDescription = selectedStyle.scenes[i];
      
      // Build prompt for scene generation
      const scenePrompt = `Professional e-commerce social media advertisement photo.
${sceneDescription}
Product: ${productName || "Fashion product"}
Style: Modern, Instagram-ready, high quality, 9:16 vertical format
Egyptian market appeal, Arabic design elements`;

      try {
        console.log(`Generating scene ${i + 1}...`);

        const taskUUID = crypto.randomUUID();
        
        // Runware API call - text to image (simpler approach)
        const runwarePayload = [
          {
            taskType: "authentication",
            apiKey: RUNWARE_API_KEY
          },
          {
            taskType: "imageInference",
            taskUUID,
            positivePrompt: scenePrompt,
            negativePrompt: "blurry, low quality, distorted, ugly, bad anatomy",
            width: 576,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            steps: 20,
            scheduler: "DPMSolverMultistepScheduler"
          }
        ];

        console.log(`Calling Runware API for scene ${i + 1}...`);

        const response = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(runwarePayload)
        });

        const responseText = await response.text();
        console.log(`Runware response status: ${response.status}`);
        console.log(`Runware response for scene ${i + 1}: ${responseText.substring(0, 500)}`);

        if (!response.ok) {
          console.error(`Runware API error: ${response.status} - ${responseText}`);
          continue;
        }

        const data = JSON.parse(responseText);
        
        // Extract image from response
        if (data.data && Array.isArray(data.data)) {
          const imageResult = data.data.find((item: any) => item.taskType === "imageInference" && item.imageURL);
          if (imageResult?.imageURL) {
            sceneImages.push({
              imageUrl: imageResult.imageURL,
              scene: i + 1,
              description: sceneDescription
            });
            console.log(`Scene ${i + 1} generated successfully: ${imageResult.imageURL.substring(0, 50)}...`);
          } else {
            console.log(`No image found in response for scene ${i + 1}. Data keys: ${Object.keys(data.data[0] || {}).join(', ')}`);
          }
        } else {
          console.log(`Unexpected response format for scene ${i + 1}. Keys: ${Object.keys(data).join(', ')}`);
        }
      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
      }
    }

    // If Runware failed, fallback to a simple placeholder response
    if (sceneImages.length === 0) {
      console.log("Runware generation failed, returning instructions for manual creation");
      
      // Return helpful response instead of error
      return new Response(
        JSON.stringify({ 
          scenes: selectedStyle.scenes.map((desc, i) => ({
            scene: i + 1,
            description: desc,
            instruction: `مشهد ${i + 1}: ${desc}`
          })),
          caption: language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn,
          hashtags: ["#تسوق_اونلاين", "#تسوق_مصر", "#fyp", "#viral"],
          duration: `${duration}s`,
          style,
          format: "Instructions",
          totalScenes: 3,
          hook: selectedStyle.hookAr,
          cta: selectedStyle.ctaAr,
          musicVibe: selectedStyle.musicVibe,
          provider: "instructions",
          message: language === 'ar' 
            ? "تعذر توليد الصور تلقائياً. استخدم الوصف أعلاه لإنشاء المشاهد يدوياً."
            : "Auto-generation unavailable. Use descriptions above to create scenes manually.",
          instructions: language === 'ar' 
            ? "حمّل صورة المنتج واستخدم الأوصاف لإنشاء المشاهد في CapCut أو InShot"
            : "Upload product image and use descriptions to create scenes in CapCut or InShot"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully generated ${sceneImages.length} scenes`);

    // Arabic hashtags
    const hashtagsAr = [
      "#تسوق_اونلاين", "#تسوق_مصر", "#موضة_مصرية", "#ستايل",
      "#fyp", "#viral", "#reels"
    ];

    return new Response(
      JSON.stringify({ 
        scenes: sceneImages,
        caption: language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn,
        hashtags: hashtagsAr,
        duration: `${duration}s`,
        style,
        format: "Storyboard",
        totalScenes: sceneImages.length,
        hook: selectedStyle.hookAr,
        cta: selectedStyle.ctaAr,
        musicVibe: selectedStyle.musicVibe,
        provider: "runware",
        instructions: language === 'ar' 
          ? "حمّل المشاهد واستخدمها في VN أو InShot أو CapCut عشان تعمل ريل فيرال! 🔥"
          : "Download scenes and use in VN, InShot, or CapCut to create a viral Reel! 🔥"
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
