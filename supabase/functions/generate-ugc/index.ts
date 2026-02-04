const serve = (handler: (req: Request) => Promise<Response>) => {
  Deno.serve(handler);
};
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
      language = 'ar'
    } = await req.json();
    
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    // ============================================
    // UGC STUDIO - User Generated Content Images
    // Generates 3 high-quality UGC-style images
    // Arabic content for Egyptian market
    // ============================================

    // UGC scene descriptions - Arabic market focused
    const ugcScenes: Record<string, {
      scenes: Array<{
        imagePrompt: string;
        arabicCaption: string;
      }>;
      nameAr: string;
      nameEn: string;
      description: string;
    }> = {
      lifestyle: {
        scenes: [
          {
            imagePrompt: `UGC lifestyle photo: Product held naturally in hands against cozy home background, warm natural lighting, authentic feel, vertical 9:16 format`,
            arabicCaption: "شوفي الجمال ده! 😍"
          },
          {
            imagePrompt: `UGC lifestyle: Product on stylish vanity table with makeup items, warm bedroom lighting, influencer aesthetic, vertical 9:16 format`,
            arabicCaption: "لازم يكون عندك! ✨"
          },
          {
            imagePrompt: `UGC lifestyle: Product in aesthetic flatlay arrangement, clean modern background, Instagram worthy, vertical 9:16 format`,
            arabicCaption: "اطلبيه دلوقتي! 🛒"
          }
        ],
        nameAr: "لايف ستايل",
        nameEn: "Lifestyle",
        description: "صور لايف ستايل أصلية"
      },
      review: {
        scenes: [
          {
            imagePrompt: `Product review style: Product with 5-star rating visual, clean professional background, testimonial feel, vertical 9:16 format`,
            arabicCaption: "⭐⭐⭐⭐⭐ الكل بيحبه!"
          },
          {
            imagePrompt: `Before/after comparison layout with product in center, transformation visual, bright lighting, vertical 9:16 format`,
            arabicCaption: "الفرق واضح! 🔥"
          },
          {
            imagePrompt: `Product close-up showing quality details, professional macro shot, premium feel, vertical 9:16 format`,
            arabicCaption: "جودة عالية جداً 💎"
          }
        ],
        nameAr: "ريفيو",
        nameEn: "Review",
        description: "صور ريفيو وتقييم"
      },
      unboxing: {
        scenes: [
          {
            imagePrompt: `Elegant gift box with product inside, luxury packaging, dramatic lighting, anticipation moment, vertical 9:16 format`,
            arabicCaption: "الطرد وصل! 📦😍"
          },
          {
            imagePrompt: `Product emerging from tissue paper, sparkle effects, excitement moment capture, vertical 9:16 format`,
            arabicCaption: "شوفوا الجمال! ✨"
          },
          {
            imagePrompt: `Product hero shot after unboxing, professional display, satisfied reveal, vertical 9:16 format`,
            arabicCaption: "يستاهل كل قرش! 💜"
          }
        ],
        nameAr: "أنبوكسينق",
        nameEn: "Unboxing",
        description: "صور فتح الطرود"
      },
      selfie: {
        scenes: [
          {
            imagePrompt: `Mirror selfie style with product visible, modern bathroom/bedroom, ring light lighting, vertical 9:16 format`,
            arabicCaption: "سيلفي مع الحب الجديد! 📸"
          },
          {
            imagePrompt: `Front-facing selfie composition with product, casual aesthetic, natural daylight, vertical 9:16 format`,
            arabicCaption: "أنا وصاحبي الجديد! 💕"
          },
          {
            imagePrompt: `Aesthetic selfie with product in cute pose, clean modern background, Instagram style, vertical 9:16 format`,
            arabicCaption: "لازم تجربوه! 🔥"
          }
        ],
        nameAr: "سيلفي",
        nameEn: "Selfie",
        description: "صور سيلفي طبيعية"
      },
      tutorial: {
        scenes: [
          {
            imagePrompt: `Tutorial style: Hands demonstrating product step 1, clean white background, instructional, vertical 9:16 format`,
            arabicCaption: "الخطوة الأولى... 1️⃣"
          },
          {
            imagePrompt: `Tutorial step 2: Product application/usage demonstration, clear visibility, vertical 9:16 format`,
            arabicCaption: "كده بالظبط! 2️⃣"
          },
          {
            imagePrompt: `Tutorial result: Final result showcase, success visual, satisfied completion, vertical 9:16 format`,
            arabicCaption: "النتيجة النهائية! ✅"
          }
        ],
        nameAr: "توتوريال",
        nameEn: "Tutorial",
        description: "صور تعليمية"
      }
    };

    const selectedType = ugcScenes[ugcType] || ugcScenes.lifestyle;

    console.log(`User ${authData?.userId} generating UGC images, type: ${ugcType}, scenes: ${selectedType.scenes.length}`);

    // Generate images for each scene
    const generatedImages: Array<{ 
      imageUrl: string; 
      scene: number;
      caption: string;
      type: string;
      typeAr: string;
    }> = [];

    for (let i = 0; i < selectedType.scenes.length; i++) {
      const scene = selectedType.scenes[i];
      
      try {
        console.log(`Generating UGC image scene ${i + 1}...`);

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
            model: model || "runware:100@1",
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
          imagePayload[1].strength = 0.30;
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

        // Check for errors
        if (imageData.errors && imageData.errors.length > 0) {
          console.error(`Runware error for scene ${i + 1}:`, JSON.stringify(imageData.errors));
          continue;
        }

        const imageResult = imageData.data?.find((item: any) => item.taskType === "imageInference" && item.imageURL);
        
        if (imageResult?.imageURL) {
          generatedImages.push({
            imageUrl: imageResult.imageURL,
            scene: i + 1,
            caption: scene.arabicCaption,
            type: selectedType.nameEn,
            typeAr: selectedType.nameAr
          });
          console.log(`UGC image ${i + 1} generated successfully`);
        } else {
          console.error(`No image URL in response for scene ${i + 1}`);
        }

      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
      }
    }

    if (generatedImages.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد الصور - حاول مرة تانية"
        : "Failed to generate images - please try again");
    }

    console.log(`Successfully generated ${generatedImages.length} UGC images for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        ugcType,
        typeName: language === 'ar' ? selectedType.nameAr : selectedType.nameEn,
        description: selectedType.description,
        count: generatedImages.length,
        format: "9:16 vertical",
        provider: "runware",
        arabicContent: true,
        tips: [
          "الصور جاهزة للنشر على انستجرام وتيك توك",
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
