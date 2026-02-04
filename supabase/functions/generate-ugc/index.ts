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
      productImage, 
      productName,
      productAnalysis,
      ugcType = "lifestyle",
      model,
      language = 'ar',
      outputType = 'video' // Default to video now
    } = await req.json();
    
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    // ============================================
    // UGC STUDIO - User Generated Content Videos
    // Generates 10-second videos for social media
    // ============================================

    // UGC video scene descriptions - Arabic market focused
    const ugcScenes: Record<string, {
      scenes: Array<{
        imagePrompt: string;
        motionPrompt: string;
        arabicCaption: string;
      }>;
      nameAr: string;
      nameEn: string;
      description: string;
    }> = {
      lifestyle: {
        scenes: [
          {
            imagePrompt: `UGC lifestyle photo: Product held naturally in hands against cozy home background, warm natural lighting, authentic feel`,
            motionPrompt: "Gentle hand movement showing product, soft camera pan, natural motion",
            arabicCaption: "شوفي الجمال ده! 😍"
          },
          {
            imagePrompt: `UGC lifestyle: Product on stylish vanity table with makeup items, warm bedroom lighting, influencer aesthetic`,
            motionPrompt: "Slow zoom into product details, soft lighting changes",
            arabicCaption: "لازم يكون عندك! ✨"
          },
          {
            imagePrompt: `UGC lifestyle: Product in aesthetic flatlay arrangement, clean modern background, Instagram worthy`,
            motionPrompt: "Elegant slow rotation reveal, professional product showcase",
            arabicCaption: "اطلبيه دلوقتي! 🛒"
          }
        ],
        nameAr: "لايف ستايل",
        nameEn: "Lifestyle",
        description: "فيديوهات لايف ستايل أصلية"
      },
      review: {
        scenes: [
          {
            imagePrompt: `Product review style: Product with 5-star rating visual, clean professional background, testimonial feel`,
            motionPrompt: "Stars animation appearing, product highlight zoom",
            arabicCaption: "⭐⭐⭐⭐⭐ الكل بيحبه!"
          },
          {
            imagePrompt: `Before/after comparison layout with product in center, transformation visual, bright lighting`,
            motionPrompt: "Side to side comparison motion, reveal transition",
            arabicCaption: "الفرق واضح! 🔥"
          },
          {
            imagePrompt: `Product close-up showing quality details, professional macro shot, premium feel`,
            motionPrompt: "Detailed zoom into product features, quality showcase",
            arabicCaption: "جودة عالية جداً 💎"
          }
        ],
        nameAr: "ريفيو",
        nameEn: "Review",
        description: "فيديوهات ريفيو وتقييم"
      },
      unboxing: {
        scenes: [
          {
            imagePrompt: `Elegant gift box with product inside, luxury packaging, dramatic lighting, anticipation moment`,
            motionPrompt: "Box lid slowly opening, reveal anticipation, dramatic lighting",
            arabicCaption: "الطرد وصل! 📦😍"
          },
          {
            imagePrompt: `Product emerging from tissue paper, sparkle effects, excitement moment capture`,
            motionPrompt: "Product being lifted up, sparkle effects, excitement motion",
            arabicCaption: "شوفوا الجمال! ✨"
          },
          {
            imagePrompt: `Product hero shot after unboxing, professional display, satisfied reveal`,
            motionPrompt: "Final product showcase, slow glamour rotation",
            arabicCaption: "يستاهل كل قرش! 💜"
          }
        ],
        nameAr: "أنبوكسينق",
        nameEn: "Unboxing",
        description: "فيديوهات فتح الطرود"
      },
      selfie: {
        scenes: [
          {
            imagePrompt: `Mirror selfie style with product visible, modern bathroom/bedroom, ring light lighting`,
            motionPrompt: "Selfie angle adjustment, product highlight movement",
            arabicCaption: "سيلفي مع الحب الجديد! 📸"
          },
          {
            imagePrompt: `Front-facing selfie composition with product, casual aesthetic, natural daylight`,
            motionPrompt: "Gentle face turn showing product angle, natural movement",
            arabicCaption: "أنا وصاحبي الجديد! 💕"
          },
          {
            imagePrompt: `Aesthetic selfie with product in cute pose, clean modern background, Instagram style`,
            motionPrompt: "Cute pose transition, product focus shift",
            arabicCaption: "لازم تجربوه! 🔥"
          }
        ],
        nameAr: "سيلفي",
        nameEn: "Selfie",
        description: "فيديوهات سيلفي طبيعية"
      },
      tutorial: {
        scenes: [
          {
            imagePrompt: `Tutorial style: Hands demonstrating product step 1, clean white background, instructional`,
            motionPrompt: "Step-by-step demonstration motion, instructional pace",
            arabicCaption: "الخطوة الأولى... 1️⃣"
          },
          {
            imagePrompt: `Tutorial step 2: Product application/usage demonstration, clear visibility`,
            motionPrompt: "Continued demonstration, usage showcase",
            arabicCaption: "كده بالظبط! 2️⃣"
          },
          {
            imagePrompt: `Tutorial result: Final result showcase, success visual, satisfied completion`,
            motionPrompt: "Final reveal, success showcase, celebration",
            arabicCaption: "النتيجة النهائية! ✅"
          }
        ],
        nameAr: "توتوريال",
        nameEn: "Tutorial",
        description: "فيديوهات تعليمية"
      }
    };

    const selectedType = ugcScenes[ugcType] || ugcScenes.lifestyle;

    console.log(`User ${authData?.userId} generating UGC videos, type: ${ugcType}, scenes: ${selectedType.scenes.length}`);

    // Generate videos for each scene
    const generatedVideos: Array<{ 
      videoUrl: string; 
      thumbnailUrl?: string;
      scene: number;
      caption: string;
      type: string;
      typeAr: string;
    }> = [];

    for (let i = 0; i < selectedType.scenes.length; i++) {
      const scene = selectedType.scenes[i];
      
      try {
        console.log(`Generating UGC video scene ${i + 1}...`);

        // Step 1: Generate base image first
        const imageTaskUUID = crypto.randomUUID();
        
        const imagePrompt = productImage
          ? `PRESERVE THE EXACT PRODUCT from input image.
${scene.imagePrompt}
Product: ${productName || "Product"}
${productAnalysis?.core_feature ? `Key feature: ${productAnalysis.core_feature}` : ''}
Keep product identical, only change context/environment.
Egyptian/MENA market style, authentic UGC aesthetic.`
          : `${scene.imagePrompt}
Product: ${productName || "Fashion product"}
Egyptian/MENA market style, authentic UGC aesthetic.`;

        const imagePayload: any[] = [
          { taskType: "authentication", apiKey: RUNWARE_API_KEY },
          {
            taskType: "imageInference",
            taskUUID: imageTaskUUID,
            positivePrompt: imagePrompt,
            negativePrompt: "different product, wrong colors, cartoon, anime, artificial, text, watermark, deformed",
            width: 576,
            height: 1024,
            model: model || "civitai:43331@176425",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            steps: 25,
            scheduler: "DPMSolverMultistepScheduler"
          }
        ];

        // Add input image for image-to-image if provided
        if (productImage) {
          const imageInput = productImage.startsWith('data:') 
            ? `data:image/png;base64,${productImage.split(',')[1]}`
            : productImage;
          imagePayload[1].inputImage = imageInput;
          imagePayload[1].strength = 0.25; // Low strength to preserve product
        }

        // Generate image
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
          console.error(`No image URL in response for scene ${i + 1}`);
          continue;
        }

        console.log(`Image generated for scene ${i + 1}, converting to video...`);

        // Step 2: Convert image to 10-second video
        const videoTaskUUID = crypto.randomUUID();
        
        const videoPayload = [
          { taskType: "authentication", apiKey: RUNWARE_API_KEY },
          {
            taskType: "imageToVideo",
            taskUUID: videoTaskUUID,
            inputImage: imageResult.imageURL,
            motionPrompt: scene.motionPrompt,
            duration: 10, // 10 seconds as requested
            aspectRatio: "9:16", // Vertical for social media
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
          console.error(`Video generation failed for scene ${i + 1}:`, errorText);
          
          // If video fails, still return the image as fallback
          generatedVideos.push({
            videoUrl: imageResult.imageURL,
            thumbnailUrl: imageResult.imageURL,
            scene: i + 1,
            caption: scene.arabicCaption,
            type: selectedType.nameEn,
            typeAr: selectedType.nameAr
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
            type: selectedType.nameEn,
            typeAr: selectedType.nameAr
          });
          console.log(`Video ${i + 1} generated successfully`);
        } else {
          // Fallback to image if video conversion failed
          generatedVideos.push({
            videoUrl: imageResult.imageURL,
            thumbnailUrl: imageResult.imageURL,
            scene: i + 1,
            caption: scene.arabicCaption,
            type: selectedType.nameEn,
            typeAr: selectedType.nameAr
          });
          console.log(`Scene ${i + 1}: Using image as fallback (video conversion unavailable)`);
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

    console.log(`Successfully generated ${generatedVideos.length} UGC videos for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        videos: generatedVideos,
        ugcType,
        typeName: language === 'ar' ? selectedType.nameAr : selectedType.nameEn,
        description: selectedType.description,
        count: generatedVideos.length,
        duration: "10s",
        format: "9:16 vertical",
        provider: "runware",
        arabicContent: true,
        tips: [
          "الفيديوهات جاهزة للنشر على انستجرام وتيك توك",
          "أضف موسيقى ترند من التطبيق",
          "استخدم الكابشنز العربية المقترحة",
          "انشر في أوقات الذروة (8-10 مساءً)"
        ]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-ugc function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
