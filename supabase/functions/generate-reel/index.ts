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

    // ============================================
    // REELS STUDIO - Image-to-Video & Storyboard Generator
    // Using Runware AI for MENA Arabic Market
    // ============================================

    const langInstruction = language === 'ar'
      ? `استخدم اللهجة المصرية العامية (مش فصحى ولا خليجي). أمثلة: "دلوقتي" مش "الآن"، "عشان" مش "لأن".`
      : "Use English for all outputs.";

    // Style prompts for different reel types
    const stylePrompts: Record<string, { 
      scenes: string[]; 
      captionAr: string; 
      captionEn: string;
      hookAr: string;
      ctaAr: string;
      musicVibe: string;
      motionPrompt: string;
    }> = {
      unboxing: {
        scenes: [
          `Scene 1 - Excitement: Luxury gift box with golden satin ribbon, dramatic top lighting, creamy beige background, feminine hand with French manicure touching box excitedly, animated Arabic text "افتحي معايا 📦"`,
          `Scene 2 - Reveal: Box opening moment, product appearing with sparkle effect and soft lighting, hand slowly lifting product, bokeh background blur, Arabic text "أخيراً وصل! 🤩"`,
          `Scene 3 - Hero: Product hero shot at 45 degree angle, professional studio lighting, pink to gold gradient background, large Arabic CTA "اطلبي دلوقتي - كود FIRST10 💕"`
        ],
        captionAr: "📦 أنبوكسينق! لما الطرد يوصل وتكوني مستنياه من زمان 😍✨\n\nالمنتج ده غيّر حياتي والله 🙈\n\n💜 اطلبيه بكود LOVE10",
        captionEn: "📦 Unboxing time! When your order finally arrives 😍✨",
        hookAr: "استني تشوفي اللي جوا! 👀",
        ctaAr: "اطلبي دلوقتي - توصيل سريع 🚚",
        musicVibe: "Upbeat Arabic pop, trendy sound",
        motionPrompt: "Slow zoom in, gentle product rotation, sparkle particles floating, smooth camera movement revealing details"
      },
      before_after: {
        scenes: [
          `Scene 1 - Before: Problem state - dim cold lighting, faded colors, sad/frustrated look, large Arabic text "قبل 😔" with gray filter, product not visible`,
          `Scene 2 - Transformation: Magic moment - hand holding product, animated sparkle effect, lighting transitioning from cold to warm, Arabic text "اللحظة السحرية ✨🪄"`,
          `Scene 3 - After: Amazing result - warm golden lighting, vibrant colors, confident smile, product prominent, Arabic text "بعد 🔥😍" with CTA`
        ],
        captionAr: "🔄 التحول الحقيقي! مش هتصدقي الفرق 😱\n\nقبل كنت تعبانة... دلوقتي شوفي النتيجة 💫\n\n💜 اللينك في البايو",
        captionEn: "🔄 Real transformation! Can't believe the difference 😱",
        hookAr: "الفرق صادم! 😱",
        ctaAr: "جربي بنفسك - ضمان استرجاع 💯",
        musicVibe: "Dramatic reveal, trending audio",
        motionPrompt: "Split screen transition, dramatic lighting change, before fading to after, product emerging with glow effect"
      },
      testimonial: {
        scenes: [
          `Scene 1 - Product Hero: Product front angle with 5 large golden stars, Arabic trust badges "الأكتر مبيعاً ⭐", "٢٥٠٠+ بنت سعيدة", professional gradient background`,
          `Scene 2 - Details: Macro detail shot showing quality, feminine hand presenting product, Arabic text "جودة عالية 💎", "صناعة فاخرة", soft lighting`,
          `Scene 3 - Order: Professional call-to-action design, product with "اطلبي دلوقتي 🛒" button, free shipping badge, discount code, attractive colors`
        ],
        captionAr: "⭐ لما ألف بنت تقول إنه الأحسن... لازم تجربيه!\n\nتقييم 5 نجوم من عميلاتنا الحلوين 🥰\n\n🛒 اطلبي دلوقتي - شحن ببلاش",
        captionEn: "⭐ When 1000+ girls say it's the best... you gotta try it!",
        hookAr: "شوفي ليه الكل بيحبه! 💕",
        ctaAr: "اطلبي دلوقتي - العرض محدود ⏰",
        musicVibe: "Confident, empowering Arabic",
        motionPrompt: "Rotating product showcase, stars appearing one by one, zoom on details, confident product presentation"
      },
      showcase: {
        scenes: [
          `Scene 1 - Portrait: Product classic front angle, clean white/beige studio background, professional soft box lighting, subtle shadows, 4K catalog quality`,
          `Scene 2 - Angle: Product at 45 degree angle showing depth and dimensions, rim light behind, clear details, soft gradient background`,
          `Scene 3 - Ad: Full advertising design, product with Arabic text "متوفر دلوقتي 🔥", price badge, CTA "اطلبي دلوقتي", attractive gradient background`
        ],
        captionAr: "✨ المنتج اللي الكل بيسأل عليه!\n\nجودة عالية • توصيل سريع • ضمان استرجاع\n\n🛒 اللينك في البايو",
        captionEn: "✨ The product everyone's asking about!",
        hookAr: "أحلى منتج هتشوفيه النهارده! ✨",
        ctaAr: "متوفر دلوقتي - الكمية محدودة 🔥",
        musicVibe: "Elegant, premium feel",
        motionPrompt: "Smooth 360 rotation, gentle lighting sweep, professional product photography motion, elegant transitions"
      },
      trending: {
        scenes: [
          `Scene 1 - Viral: Product in TikTok trend style, bold neon colors, fast motion effects, large Arabic text "الترند بتاع الموسم! 🔥", dynamic colorful background`,
          `Scene 2 - Zoom: Dynamic zoom in effect on product, RGB colored lighting, high energy, Arabic text "الكل بيجري عليه! 💜🔥", fast movement`,
          `Scene 3 - FOMO: Urgency design, product with "آخر كمية! ⚠️", countdown timer, text "اطلبي قبل ما يخلص 🏃‍♀️", fiery red and orange colors`
        ],
        captionAr: "🔥 الترند اللي كسر التيك توك!\n\nلو مش عندك... إنتِ مش على الموضة 💅\n\n⚡ لينك الطلب في البايو - هيخلص!",
        captionEn: "🔥 The trend that broke TikTok!",
        hookAr: "لو مشفتيش ده قبل كده! 🤯",
        ctaAr: "احجزي قبل ما يخلص! ⚡",
        musicVibe: "Viral TikTok sound, high energy",
        motionPrompt: "Fast zoom pulses, shake effects, neon glow animations, high energy rapid transitions, TikTok style edits"
      }
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.showcase;
    
    console.log(`User ${authData?.userId} generating Reel with Runware, style: ${style}, generateVideo: ${generateVideo}`);

    // Generate scene images using Runware
    const sceneImages: Array<{ imageUrl: string; scene: number; description: string }> = [];

    for (let i = 0; i < selectedStyle.scenes.length; i++) {
      const sceneDescription = selectedStyle.scenes[i];
      
      // Build prompt for scene generation
      const scenePrompt = `Professional e-commerce social media reel scene.

PRODUCT IMAGE: Use the provided product image as reference. Keep product design exactly as shown.

SCENE ${i + 1} DESCRIPTION:
${sceneDescription}

REQUIREMENTS:
- Vertical format 9:16 for Reels/TikTok
- Professional advertising quality
- Arabic text overlays (modern fonts, no diacritics)
- Egyptian market appeal
- Product must be clearly visible and prominent
- ${productName ? `Product: ${productName}` : 'Fashion/Beauty product'}
- High engagement social media style`;

      try {
        console.log(`Generating scene ${i + 1} with Runware...`);

        const taskUUID = crypto.randomUUID();
        
        const runwarePayload: any[] = [
          {
            taskType: "authentication",
            apiKey: RUNWARE_API_KEY
          },
          {
            taskType: "imageInference",
            taskUUID,
            positivePrompt: scenePrompt,
            width: 576,  // 9:16 aspect ratio
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 1,
            steps: 4,
            scheduler: "FlowMatchEulerDiscreteScheduler",
            // If product image is provided, use it as input
            ...(imageUrl && !imageUrl.startsWith('data:') && { inputImage: imageUrl, strength: 0.7 }),
          }
        ];

        // Handle base64 image
        if (imageUrl && imageUrl.startsWith('data:')) {
          const base64Data = imageUrl.split(',')[1];
          runwarePayload[1].inputImage = `data:image/png;base64,${base64Data}`;
          runwarePayload[1].strength = 0.7;
        }

        const response = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(runwarePayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Scene ${i + 1} generation error:`, response.status, errorText);
          continue;
        }

        const data = await response.json();
        const imageResults = data.data?.filter((item: any) => item.taskType === "imageInference") || [];
        
        if (imageResults.length > 0 && imageResults[0].imageURL) {
          sceneImages.push({
            imageUrl: imageResults[0].imageURL,
            scene: i + 1,
            description: sceneDescription
          });
          console.log(`Scene ${i + 1} generated successfully`);
        }
      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
      }
    }

    if (sceneImages.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد المشاهد - حاول مرة تانية"
        : "No scenes were generated - please try again");
    }

    // Generate video from first scene if requested
    let videoUrl = null;
    if (generateVideo && sceneImages.length > 0) {
      try {
        console.log("Generating video from first scene...");
        
        const videoTaskUUID = crypto.randomUUID();
        const videoPayload = [
          {
            taskType: "authentication",
            apiKey: RUNWARE_API_KEY
          },
          {
            taskType: "imageToVideo",
            taskUUID: videoTaskUUID,
            inputImage: sceneImages[0].imageUrl,
            motionPrompt: selectedStyle.motionPrompt,
            duration: duration,
            aspectRatio: "9:16"
          }
        ];

        const videoResponse = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(videoPayload)
        });

        if (videoResponse.ok) {
          const videoData = await videoResponse.json();
          const videoResult = videoData.data?.find((item: any) => item.taskType === "imageToVideo");
          if (videoResult?.videoURL) {
            videoUrl = videoResult.videoURL;
            console.log("Video generated successfully");
          }
        }
      } catch (videoError) {
        console.error("Video generation error:", videoError);
        // Don't throw - video is optional
      }
    }

    console.log(`Successfully generated ${sceneImages.length} scenes for user ${authData?.userId}`);

    // Arabic hashtags optimized for MENA market
    const hashtagsAr = [
      "#تسوق_اونلاين",
      "#تسوق_مصر",
      "#موضة_مصرية",
      "#ستايل",
      "#fashion",
      "#fyp",
      "#viral",
      "#reels",
      style === "unboxing" ? "#انبوكسينق" : "",
      style === "before_after" ? "#قبل_وبعد" : "",
      style === "testimonial" ? "#ريفيو" : "",
      style === "trending" ? "#ترند" : "",
    ].filter(Boolean);

    const hashtagsEn = [
      "#shopping", "#fashion", "#style", "#trending", "#viral", "#fyp", "#reels",
      style === "unboxing" ? "#unboxing" : "",
      style === "before_after" ? "#beforeafter" : "",
      style === "testimonial" ? "#review" : "",
      style === "trending" ? "#trend" : "",
    ].filter(Boolean);

    return new Response(
      JSON.stringify({ 
        scenes: sceneImages,
        caption: language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn,
        hashtags: language === 'ar' ? hashtagsAr : hashtagsEn,
        duration: `${duration}s`,
        style,
        format: "Storyboard",
        totalScenes: sceneImages.length,
        hook: selectedStyle.hookAr,
        cta: selectedStyle.ctaAr,
        musicVibe: selectedStyle.musicVibe,
        videoUrl,
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
