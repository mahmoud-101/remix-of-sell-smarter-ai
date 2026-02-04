import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

const RUNWARE_API_URL = "https://api.runware.ai/v1";

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
    const { 
      imageUrl, 
      productImage,
      style, 
      productName,
      productAnalysis,
      duration = 10,
      language = 'ar', 
      model
    } = await req.json();
    
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    const sourceImage = productImage || imageUrl;

    if (!sourceImage) {
      throw new Error(language === 'ar' ? "صورة المنتج مطلوبة" : "Product image is required");
    }

    // ============================================
    // REELS STUDIO - 10-Second Video Generation
    // Arabic content for Egyptian market
    // ============================================

    // Reel video scenes with Arabic captions and motion
    const reelStyles: Record<string, { 
      scenes: Array<{
        imagePrompt: string;
        motionPrompt: string;
        arabicCaption: string;
        arabicHook: string;
      }>;
      captionAr: string;
      ctaAr: string;
      musicVibe: string;
      hashtags: string[];
    }> = {
      unboxing: {
        scenes: [
          {
            imagePrompt: "Luxury gift box with golden ribbon, product inside partially visible, dramatic spotlight, anticipation moment",
            motionPrompt: "Box lid slowly opening with reveal lighting, anticipation build-up",
            arabicCaption: "الطرد وصل! 📦",
            arabicHook: "استنوا تشوفوا!"
          },
          {
            imagePrompt: "Product emerging from elegant packaging, tissue paper, sparkle effects, excitement moment",
            motionPrompt: "Product being lifted up dramatically, sparkle particle effects",
            arabicCaption: "شوفوا الجمال! ✨",
            arabicHook: "مش هتصدقوا!"
          },
          {
            imagePrompt: "Product hero shot, professional display, satisfied reveal, premium presentation",
            motionPrompt: "Glamour product rotation, final showcase spin",
            arabicCaption: "اطلبوه دلوقتي! 🛒",
            arabicHook: "لينك في البايو!"
          }
        ],
        captionAr: "📦 أنبوكسينق! لما الطرد يوصل 😍✨\n\n💜 اطلبيه بكود LOVE10",
        ctaAr: "اطلبي دلوقتي - توصيل سريع 🚚",
        musicVibe: "Upbeat Arabic pop",
        hashtags: ["#انبوكسينق", "#تسوق_اونلاين", "#مصر", "#fyp"]
      },
      before_after: {
        scenes: [
          {
            imagePrompt: "Before state: dim lighting, muted colors, problem visualization, dull atmosphere",
            motionPrompt: "Slow fade showing problem state, building anticipation",
            arabicCaption: "قبل... 😔",
            arabicHook: "كنت كده!"
          },
          {
            imagePrompt: "Transformation: product spotlight, magical glow transition, change happening",
            motionPrompt: "Dramatic transformation effect, magical transition lighting",
            arabicCaption: "التحول! ✨",
            arabicHook: "وبعدين...!"
          },
          {
            imagePrompt: "After state: bright vibrant lighting, success colors, radiant result, premium feel",
            motionPrompt: "Reveal final result, celebration lighting, success showcase",
            arabicCaption: "بعد! 😍🔥",
            arabicHook: "الفرق واضح!"
          }
        ],
        captionAr: "🔄 التحول الحقيقي! 😱\n\n💜 اللينك في البايو",
        ctaAr: "جربي بنفسك 💯",
        musicVibe: "Dramatic reveal",
        hashtags: ["#قبل_وبعد", "#تحول", "#مصر", "#viral"]
      },
      testimonial: {
        scenes: [
          {
            imagePrompt: "Product with floating 5-star rating, trust badges, testimonial style, professional",
            motionPrompt: "Stars appearing one by one animation, trust building",
            arabicCaption: "⭐⭐⭐⭐⭐",
            arabicHook: "ألف بنت قالت!"
          },
          {
            imagePrompt: "Product macro detail shot, quality close-up, premium materials visible",
            motionPrompt: "Detailed zoom into quality features, texture showcase",
            arabicCaption: "جودة مش عادية! 💎",
            arabicHook: "شوفي التفاصيل!"
          },
          {
            imagePrompt: "Product with Order Now button, discount badge, urgency CTA design",
            motionPrompt: "CTA button pulse animation, urgency motion",
            arabicCaption: "اطلبي قبل ما يخلص! ⏰",
            arabicHook: "العرض لفترة محدودة!"
          }
        ],
        captionAr: "⭐ لما ألف بنت تقول إنه الأحسن!\n\n🛒 شحن ببلاش",
        ctaAr: "اطلبي دلوقتي ⏰",
        musicVibe: "Confident music",
        hashtags: ["#ريفيو", "#تجربتي", "#مصر", "#trending"]
      },
      showcase: {
        scenes: [
          {
            imagePrompt: "Product front view, clean white studio, professional 3-point lighting setup",
            motionPrompt: "Elegant product introduction, smooth reveal",
            arabicCaption: "المنتج الأكثر مبيعاً! 🔥",
            arabicHook: "الكل بيسأل عليه!"
          },
          {
            imagePrompt: "Product 45-degree angle, rim lighting, depth dimension, premium feel",
            motionPrompt: "Slow elegant rotation showing all angles",
            arabicCaption: "تصميم مميز! ✨",
            arabicHook: "شوفي من كل الزوايا!"
          },
          {
            imagePrompt: "Product in full ad composition, promotional graphics, call to action",
            motionPrompt: "Final glamour shot with promotional elements appearing",
            arabicCaption: "متوفر دلوقتي! 🛒",
            arabicHook: "اللينك في البايو!"
          }
        ],
        captionAr: "✨ المنتج اللي الكل بيسأل عليه!\n\n🛒 اللينك في البايو",
        ctaAr: "متوفر دلوقتي 🔥",
        musicVibe: "Elegant premium",
        hashtags: ["#منتج", "#تسوق", "#مصر", "#fyp"]
      },
      trending: {
        scenes: [
          {
            imagePrompt: "Product in TikTok viral style, bold neon RGB lighting, high energy aesthetic",
            motionPrompt: "Fast dynamic zoom, TikTok style energy, quick cuts feel",
            arabicCaption: "🔥 الترند الجديد!",
            arabicHook: "لو مشفتيش ده!"
          },
          {
            imagePrompt: "Product with dynamic effects, RGB color shifts, motion blur energy",
            motionPrompt: "High energy camera movement, dynamic lighting changes",
            arabicCaption: "الكل بيتكلم عنه! 📣",
            arabicHook: "فيرال على تيك توك!"
          },
          {
            imagePrompt: "Product with FOMO urgency graphics, countdown visual, limited stock alert",
            motionPrompt: "Urgency countdown motion, FOMO inducing animation",
            arabicCaption: "⚡ هيخلص!",
            arabicHook: "احجزي دلوقتي!"
          }
        ],
        captionAr: "🔥 الترند اللي كسر التيك توك!\n\n⚡ هيخلص!",
        ctaAr: "احجزي قبل ما يخلص! ⚡",
        musicVibe: "Viral TikTok sound",
        hashtags: ["#ترند", "#تيك_توك", "#فيرال", "#مصر"]
      }
    };

    const selectedStyle = reelStyles[style] || reelStyles.showcase;
    
    console.log(`Generating Reel videos for style: ${style}, scenes: ${selectedStyle.scenes.length}`);

    // Generate 10-second videos for each scene
    const generatedVideos: Array<{ 
      videoUrl: string; 
      thumbnailUrl?: string;
      scene: number;
      caption: string;
      hook: string;
    }> = [];

    for (let i = 0; i < selectedStyle.scenes.length; i++) {
      const scene = selectedStyle.scenes[i];
      
      try {
        console.log(`Generating Reel video scene ${i + 1}...`);

        // Step 1: Generate base image with product preservation
        const imageTaskUUID = crypto.randomUUID();
        
        // Prepare image input
        let imageInput = sourceImage;
        if (sourceImage.startsWith('data:')) {
          imageInput = `data:image/png;base64,${sourceImage.split(',')[1]}`;
        }
        
        const imagePrompt = `PRESERVE THE EXACT PRODUCT from input image.
${scene.imagePrompt}
Product: ${productName || "Product"}
${productAnalysis?.core_feature ? `Feature: ${productAnalysis.core_feature}` : ''}
Keep product identical, only change scene/environment.
Vertical 9:16 format, Egyptian market style.`;

        const imagePayload = [
          { taskType: "authentication", apiKey: RUNWARE_API_KEY },
          {
            taskType: "imageInference",
            taskUUID: imageTaskUUID,
            positivePrompt: imagePrompt,
            negativePrompt: "different product, wrong colors, wrong design, blurry, distorted, deformed",
            width: 576,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            steps: 25,
            scheduler: "DPMSolverMultistepScheduler",
            strength: 0.25, // Low strength to preserve product
            inputImage: imageInput
          }
        ];

        const imageResponse = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imagePayload)
        });

        if (!imageResponse.ok) {
          console.error(`Image generation failed for scene ${i + 1}`);
          continue;
        }

        const imageData = await imageResponse.json();
        const imageResult = imageData.data?.find((item: any) => item.taskType === "imageInference" && item.imageURL);
        
        if (!imageResult?.imageURL) {
          console.error(`No image URL for scene ${i + 1}`);
          continue;
        }

        console.log(`Scene ${i + 1} image generated, converting to 10s video...`);

        // Step 2: Convert image to 10-second video
        const videoTaskUUID = crypto.randomUUID();
        
        const videoPayload = [
          { taskType: "authentication", apiKey: RUNWARE_API_KEY },
          {
            taskType: "imageToVideo",
            taskUUID: videoTaskUUID,
            inputImage: imageResult.imageURL,
            motionPrompt: scene.motionPrompt,
            duration: 10, // 10 seconds
            aspectRatio: "9:16",
            CFGScale: 7
          }
        ];

        const videoResponse = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(videoPayload)
        });

        if (!videoResponse.ok) {
          const errorText = await videoResponse.text();
          console.error(`Video conversion failed for scene ${i + 1}:`, errorText.substring(0, 200));
          
          // Fallback to image
          generatedVideos.push({
            videoUrl: imageResult.imageURL,
            thumbnailUrl: imageResult.imageURL,
            scene: i + 1,
            caption: scene.arabicCaption,
            hook: scene.arabicHook
          });
          continue;
        }

        const videoData = await videoResponse.json();
        const videoResult = videoData.data?.find((item: any) => 
          item.taskType === "imageToVideo" && (item.videoURL || item.outputVideo)
        );

        if (videoResult?.videoURL || videoResult?.outputVideo) {
          generatedVideos.push({
            videoUrl: videoResult.videoURL || videoResult.outputVideo,
            thumbnailUrl: imageResult.imageURL,
            scene: i + 1,
            caption: scene.arabicCaption,
            hook: scene.arabicHook
          });
          console.log(`Scene ${i + 1} video generated successfully`);
        } else {
          // Fallback to image
          generatedVideos.push({
            videoUrl: imageResult.imageURL,
            thumbnailUrl: imageResult.imageURL,
            scene: i + 1,
            caption: scene.arabicCaption,
            hook: scene.arabicHook
          });
          console.log(`Scene ${i + 1}: Using image as fallback`);
        }

      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
      }
    }

    if (generatedVideos.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد الفيديوهات - حاول مرة تانية"
        : "Failed to generate videos - please try again");
    }

    console.log(`Successfully generated ${generatedVideos.length} Reel videos`);

    return new Response(
      JSON.stringify({ 
        videos: generatedVideos,
        caption: selectedStyle.captionAr,
        cta: selectedStyle.ctaAr,
        hashtags: selectedStyle.hashtags,
        duration: "10s",
        style,
        format: "9:16 vertical",
        totalScenes: generatedVideos.length,
        musicVibe: selectedStyle.musicVibe,
        provider: "runware",
        arabicContent: true,
        instructions: "حمّل الفيديوهات واجمعها في CapCut أو InShot لعمل ريل فيرال 30 ثانية! 🔥"
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
