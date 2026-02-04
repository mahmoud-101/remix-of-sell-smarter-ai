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
      productImage, 
      productName, 
      ugcType = "lifestyle",
      model,
      language = 'ar' 
    } = await req.json();
    
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    // ============================================
    // UGC STUDIO - User Generated Content Style
    // Realistic lifestyle photos for Egyptian market
    // Using Runware with realistic models
    // ============================================

    // UGC style types - realistic "influencer" style content
    const ugcStyles: Record<string, {
      prompts: string[];
      nameAr: string;
      nameEn: string;
      description: string;
    }> = {
      lifestyle: {
        prompts: [
          `UGC lifestyle photo: Young Egyptian woman (20-30 years old) naturally posing with the product in a modern Cairo apartment. Casual home setting, natural window lighting, iPhone quality photo aesthetic. She's wearing casual modest clothing. Product clearly visible in her hand. Candid selfie style, authentic feel. Arabic social media influencer vibes.`,
          `UGC lifestyle photo: Egyptian woman sitting on a cozy sofa, holding and showing the product to the camera. Warm living room lighting, home decor visible in background. Natural makeup, casual outfit. Instagram story quality, authentic UGC style. Real person feel, not overly polished.`,
          `UGC lifestyle photo: Middle Eastern woman unboxing the product on her bed, excited expression. Soft bedroom lighting, cozy aesthetic. Phone camera quality, authentic influencer style. Product packaging visible. Cairo apartment vibes, relatable content.`
        ],
        nameAr: "لايف ستايل",
        nameEn: "Lifestyle",
        description: "Authentic home lifestyle photos"
      },
      review: {
        prompts: [
          `UGC product review photo: Egyptian woman showing the product close to camera, comparing before/after on her face or skin. Bathroom mirror selfie style, natural lighting. Real person, no heavy editing. Product clearly visible, review style content.`,
          `UGC review photo: Young Arab woman holding the product next to her face, genuine smile. Vanity or dresser setup visible, warm lamp lighting. Authentic testimonial style, Instagram-worthy but real.`,
          `UGC review photo: Egyptian influencer style shot, woman pointing at the product with excitement. Text overlay space for Arabic review quotes. Bright natural lighting, clean background.`
        ],
        nameAr: "ريفيو",
        nameEn: "Review",
        description: "Authentic review style content"
      },
      unboxing: {
        prompts: [
          `UGC unboxing photo: Hands of Egyptian woman opening a package, product partially visible. Excitement moment captured. Home desk or bed setting. iPhone camera quality):, overhead angle. Arabic packaging visible if applicable.`,
          `UGC unboxing photo: Young Arab woman with surprised happy expression, holding up the product from its box. Natural home lighting, genuine reaction. Instagram story moment capture.`,
          `UGC unboxing photo: First impression shot - Egyptian girl looking at product for the first time. Package and tissue paper visible. Candid genuine moment, not posed.`
        ],
        nameAr: "أنبوكسينق",
        nameEn: "Unboxing",
        description: "Authentic unboxing moments"
      },
      selfie: {
        prompts: [
          `UGC selfie photo: Beautiful Egyptian woman taking a mirror selfie while holding/wearing the product. Modern bathroom or bedroom mirror. Casual outfit, natural makeup. Phone in hand, authentic selfie pose. Product prominently visible.`,
          `UGC selfie photo: Young Arab woman front-facing camera selfie, product visible in shot):. Good natural lighting, casual home background. Instagram selfie quality, genuine smile.`,
          `UGC selfie photo: Egyptian influencer style - woman showing off the product in a cute selfie pose. Ring light lighting, bedroom setup. Modern modest fashion, authentic social media content.`
        ],
        nameAr: "سيلفي",
        nameEn: "Selfie",
        description: "Natural selfie style photos"
      },
      tutorial: {
        prompts: [
          `UGC tutorial photo: Egyptian woman demonstrating how to use the product, step-by-step pose. Close-up of hands and product. Clean white or neutral background. Tutorial content style, educational feel.`,
          `UGC how-to photo: Arab woman showing the product application or usage. Mirror or vanity setup. Natural lighting, instructional content style. Before/during/after sequence potential.`,
          `UGC tutorial photo: Young Egyptian woman explaining the product, pointing or gesturing. Speaking to camera feel. Home setup with good lighting. Social media tutorial aesthetic.`
        ],
        nameAr: "توتوريال",
        nameEn: "Tutorial",
        description: "How-to tutorial style"
      }
    };

    const selectedStyle = ugcStyles[ugcType] || ugcStyles.lifestyle;

    console.log(`User ${authData?.userId} generating UGC content with Runware, type: ${ugcType}`);

    // Generate multiple UGC images with different prompts
    const generatedImages: Array<{ imageUrl: string; type: string; typeAr: string }> = [];

    for (let i = 0; i < selectedStyle.prompts.length; i++) {
      const basePrompt = selectedStyle.prompts[i];
      
      // Build the full prompt
      const fullPrompt = productImage
        ? `${basePrompt}

CRITICAL: Use the product from the provided image. Keep product design, colors, and branding exactly as shown.

Product Name: ${productName || "Fashion/Beauty Product"}

REQUIREMENTS:
- Photorealistic quality, like a real iPhone photo
- Egyptian/Middle Eastern woman model
- Modest, appropriate styling for MENA market
- Natural lighting, authentic UGC feel
- NOT overly edited or artificial
- Product must be clearly visible
- Instagram/TikTok content style`
        : `${basePrompt}

Product: ${productName || "Fashion or beauty product"}

REQUIREMENTS:
- Photorealistic quality, like a real phone photo
- Egyptian/Middle Eastern woman model
- Modest, appropriate styling for MENA market
- Natural lighting, authentic UGC feel
- Instagram/TikTok content quality`;

      try {
        console.log(`Generating UGC image ${i + 1}...`);

        const taskUUID = crypto.randomUUID();
        
        // Use realistic model for UGC content
        const selectedModel = model || "civitai:43331@176425"; // Majic Mix Realistic
        
        const runwarePayload: any[] = [
          {
            taskType: "authentication",
            apiKey: RUNWARE_API_KEY
          },
          {
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            negativePrompt: "cartoon, anime, illustration, painting, artificial, overly edited, heavy makeup, revealing clothing, inappropriate content, text, watermark, logo, ugly, deformed",
            width: 1024,
            height: 1024,
            model: selectedModel,
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            steps: 25,
            scheduler: "DPMSolverMultistepScheduler"
          }
        ];

        // If product image is provided, use image-to-image
        if (productImage) {
          if (productImage.startsWith('data:')) {
            const base64Data = productImage.split(',')[1];
            runwarePayload[1].inputImage = `data:image/png;base64,${base64Data}`;
            runwarePayload[1].strength = 0.65;
          } else if (productImage.startsWith('http')) {
            runwarePayload[1].inputImage = productImage;
            runwarePayload[1].strength = 0.65;
          }
        }

        const response = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(runwarePayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`UGC image ${i + 1} error:`, response.status, errorText);
          
          if (response.status === 402) {
            throw new Error("Runware credits exhausted");
          }
          continue;
        }

        const data = await response.json();
        const imageResults = data.data?.filter((item: any) => item.taskType === "imageInference") || [];
        
        if (imageResults.length > 0 && imageResults[0].imageURL) {
          generatedImages.push({
            imageUrl: imageResults[0].imageURL,
            type: selectedStyle.nameEn,
            typeAr: selectedStyle.nameAr
          });
          console.log(`UGC image ${i + 1} generated successfully`);
        }
      } catch (imageError) {
        console.error(`Error generating UGC image ${i + 1}:`, imageError);
        if (imageError instanceof Error && imageError.message.includes("credits")) {
          throw imageError;
        }
      }
    }

    if (generatedImages.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد صور UGC - حاول مرة تانية"
        : "Failed to generate UGC images - please try again");
    }

    console.log(`Successfully generated ${generatedImages.length} UGC images for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        ugcType,
        typeName: language === 'ar' ? selectedStyle.nameAr : selectedStyle.nameEn,
        description: selectedStyle.description,
        count: generatedImages.length,
        provider: "runware",
        tips: language === 'ar' 
          ? [
              "استخدم الصور في إعلانات الفيسبوك والانستجرام",
              "أضف نص عربي بخط جميل",
              "انشرها كمحتوى حقيقي من عميلة",
              "استخدمها في الستوريز والريلز"
            ]
          : [
              "Use in Facebook & Instagram ads",
              "Add Arabic text overlays",
              "Post as authentic customer content",
              "Perfect for stories and reels"
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
