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
    const { 
      imageUrl, 
      productImage,
      style, 
      productName,
      productAnalysis,
      duration = 5, 
      language = 'ar', 
      model, 
      generateVideo = false 
    } = await req.json();
    
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    // Use productImage if provided, otherwise fall back to imageUrl
    const sourceImage = productImage || imageUrl;

    if (!sourceImage) {
      throw new Error(language === 'ar' ? "صورة المنتج مطلوبة" : "Product image is required");
    }

    // ============================================
    // REELS STUDIO - Video Storyboard Generation
    // CRITICAL: Product must remain EXACTLY the same across all scenes!
    // ============================================

    // Scene contexts for different reel types - only describe environment changes
    const styleContexts: Record<string, { 
      sceneContexts: string[]; 
      captionAr: string; 
      captionEn: string;
      hookAr: string;
      ctaAr: string;
      musicVibe: string;
    }> = {
      unboxing: {
        sceneContexts: [
          "Scene 1 Context: Product inside an elegant gift box with golden ribbon, dramatic spotlight lighting, luxury unboxing moment",
          "Scene 2 Context: Product being revealed from tissue paper, sparkle effects around, warm lighting, excitement moment",
          "Scene 3 Context: Product hero shot on gradient background, professional studio lighting, final reveal"
        ],
        captionAr: "📦 أنبوكسينق! لما الطرد يوصل 😍✨\n\n💜 اطلبيه بكود LOVE10",
        captionEn: "📦 Unboxing time! 😍✨",
        hookAr: "استني تشوفي اللي جوا! 👀",
        ctaAr: "اطلبي دلوقتي - توصيل سريع 🚚",
        musicVibe: "Upbeat Arabic pop"
      },
      before_after: {
        sceneContexts: [
          "Scene 1 Context: Product in dim, neutral 'before' setting, muted colors, problem visualization backdrop",
          "Scene 2 Context: Product in spotlight during transformation, magical glow effect, transition moment",
          "Scene 3 Context: Product in bright, vibrant 'after' setting, success visualization, radiant lighting"
        ],
        captionAr: "🔄 التحول الحقيقي! 😱\n\n💜 اللينك في البايو",
        captionEn: "🔄 Real transformation! 😱",
        hookAr: "الفرق صادم! 😱",
        ctaAr: "جربي بنفسك 💯",
        musicVibe: "Dramatic reveal"
      },
      testimonial: {
        sceneContexts: [
          "Scene 1 Context: Product with floating 5-star rating graphics, trust badges around, professional gradient",
          "Scene 2 Context: Macro close-up focus on product, quality details highlighted, soft lighting",
          "Scene 3 Context: Product with 'Order Now' button graphic, discount badge, call-to-action design"
        ],
        captionAr: "⭐ لما ألف بنت تقول إنه الأحسن!\n\n🛒 شحن ببلاش",
        captionEn: "⭐ 1000+ happy customers!",
        hookAr: "شوفي ليه الكل بيحبه! 💕",
        ctaAr: "اطلبي دلوقتي ⏰",
        musicVibe: "Confident music"
      },
      showcase: {
        sceneContexts: [
          "Scene 1 Context: Product front view on clean white studio backdrop, professional 3-point lighting",
          "Scene 2 Context: Product at 45-degree angle with rim lighting, depth and dimension emphasized",
          "Scene 3 Context: Product in full advertising composition with promotional graphics around"
        ],
        captionAr: "✨ المنتج اللي الكل بيسأل عليه!\n\n🛒 اللينك في البايو",
        captionEn: "✨ The product everyone wants!",
        hookAr: "أحلى منتج هتشوفيه! ✨",
        ctaAr: "متوفر دلوقتي 🔥",
        musicVibe: "Elegant, premium"
      },
      trending: {
        sceneContexts: [
          "Scene 1 Context: Product in viral TikTok style setting, bold neon RGB lighting, dynamic energy",
          "Scene 2 Context: Product with zoom effect background, high energy colorful lights, motion blur",
          "Scene 3 Context: Product with FOMO urgency graphics, countdown timer, limited stock alert design"
        ],
        captionAr: "🔥 الترند اللي كسر التيك توك!\n\n⚡ هيخلص!",
        captionEn: "🔥 TikTok viral trend!",
        hookAr: "لو مشفتيش ده! 🤯",
        ctaAr: "احجزي قبل ما يخلص! ⚡",
        musicVibe: "Viral TikTok sound"
      }
    };

    const selectedStyle = styleContexts[style] || styleContexts.showcase;
    
    console.log(`Generating Reel scenes for style: ${style}, hasProductImage: ${!!sourceImage}, hasAnalysis: ${!!productAnalysis}`);

    // Generate scene images using Runware - PRESERVING the product
    const sceneImages: Array<{ imageUrl: string; scene: number; description: string }> = [];

    for (let i = 0; i < selectedStyle.sceneContexts.length; i++) {
      const sceneContext = selectedStyle.sceneContexts[i];
      
      // Build prompt that PRESERVES the product
      const scenePrompt = `PRODUCT PRESERVATION - REEL SCENE GENERATION:

CRITICAL: The product from the input image MUST remain EXACTLY identical:
- Keep exact same product shape, design, and proportions
- Keep exact same colors, patterns, and branding
- DO NOT modify the product in any way

ONLY CHANGE THE SCENE CONTEXT:
${sceneContext}

Product: ${productName || "Fashion product"}
${productAnalysis ? `
Marketing Hook: ${productAnalysis.core_feature || ''}
` : ''}

REQUIREMENTS:
- Product must look EXACTLY like the input image
- Only the background/scene context should change
- Vertical 9:16 format for social media
- Professional lighting
- Egyptian market appeal`;

      try {
        console.log(`Generating scene ${i + 1}...`);

        const taskUUID = crypto.randomUUID();
        
        const runwarePayload: any[] = [
          {
            taskType: "authentication",
            apiKey: RUNWARE_API_KEY
          }
        ];

        // Prepare the image input
        let imageInput = sourceImage;
        if (sourceImage.startsWith('data:')) {
          const base64Data = sourceImage.split(',')[1];
          imageInput = `data:image/png;base64,${base64Data}`;
        }

        // Image-to-image with VERY LOW strength to preserve product
        runwarePayload.push({
          taskType: "imageInference",
          taskUUID,
          positivePrompt: scenePrompt,
          negativePrompt: "different product, changed product, modified product, wrong colors, wrong design, blurry, distorted, deformed",
          width: 576,
          height: 1024,
          model: model || "runware:100@1",
          numberResults: 1,
          outputFormat: "WEBP",
          CFGScale: 7,
          steps: 25,
          scheduler: "DPMSolverMultistepScheduler",
          // VERY LOW strength to preserve product
          strength: 0.25,
          inputImage: imageInput
        });

        console.log(`Calling Runware API for scene ${i + 1}...`);

        const response = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(runwarePayload)
        });

        const responseText = await response.text();
        console.log(`Runware response status: ${response.status}`);

        if (!response.ok) {
          console.error(`Runware API error: ${response.status} - ${responseText.substring(0, 200)}`);
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
              description: sceneContext
            });
            console.log(`Scene ${i + 1} generated successfully`);
          }
        }
      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
      }
    }

    // If Runware failed, fallback to instructions
    if (sceneImages.length === 0) {
      console.log("Scene generation failed, returning manual instructions");
      
      return new Response(
        JSON.stringify({ 
          scenes: selectedStyle.sceneContexts.map((desc, i) => ({
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
            ? "تعذر توليد المشاهد. استخدم الأوصاف لإنشائها يدوياً."
            : "Scene generation unavailable. Use descriptions to create manually."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully generated ${sceneImages.length} scenes`);

    return new Response(
      JSON.stringify({ 
        scenes: sceneImages,
        caption: language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn,
        hashtags: ["#تسوق_اونلاين", "#تسوق_مصر", "#fyp", "#viral", "#reels"],
        duration: `${duration}s`,
        style,
        format: "Storyboard",
        totalScenes: sceneImages.length,
        hook: selectedStyle.hookAr,
        cta: selectedStyle.ctaAr,
        musicVibe: selectedStyle.musicVibe,
        provider: "runware",
        productPreserved: true,
        instructions: language === 'ar' 
          ? "حمّل المشاهد واستخدمها في CapCut أو InShot لعمل ريل فيرال! 🔥"
          : "Download scenes and use in CapCut or InShot to create a viral Reel! 🔥"
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
