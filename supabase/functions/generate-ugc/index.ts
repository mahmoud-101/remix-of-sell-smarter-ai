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
    // UGC STUDIO - User Generated Content Style
    // CRITICAL: Product must remain EXACTLY the same!
    // Only add context/environment around it
    // ============================================

    // UGC context descriptions - focus on environment AROUND the product
    const ugcContexts: Record<string, {
      contexts: string[];
      nameAr: string;
      nameEn: string;
      description: string;
    }> = {
      lifestyle: {
        contexts: [
          `Scene context: Young woman's hands holding the product in a cozy modern living room. Warm natural window light, home decor visible in soft bokeh. iPhone camera quality, authentic UGC feel.`,
          `Scene context: Product placed on a stylish vanity table with makeup items around it. Warm bedroom lighting, mirror reflection. Influencer content style.`,
          `Scene context: Product being held up against a clean, aesthetic background. Natural lighting, minimal setting. Instagram story quality.`
        ],
        nameAr: "لايف ستايل",
        nameEn: "Lifestyle",
        description: "Authentic home lifestyle photos"
      },
      review: {
        contexts: [
          `Scene context: Product displayed next to 5-star rating graphic. Clean desk setup with laptop visible. Review content style, professional yet authentic.`,
          `Scene context: Before/after comparison layout with product in center. Bright lighting, clean background. Testimonial style content.`,
          `Scene context: Product on bathroom counter with skincare items. Mirror selfie style framing. Natural lighting, authentic review feel.`
        ],
        nameAr: "ريفيو",
        nameEn: "Review",
        description: "Authentic review style content"
      },
      unboxing: {
        contexts: [
          `Scene context: Product partially emerging from elegant packaging box. Tissue paper and ribbon visible. Excitement moment, hands reaching in.`,
          `Scene context: Flatlay of product with its box and packaging materials arranged aesthetically. Top-down view, clean background.`,
          `Scene context: Product just taken out of box, packaging visible. Natural home lighting, desk or bed surface.`
        ],
        nameAr: "أنبوكسينق",
        nameEn: "Unboxing",
        description: "Authentic unboxing moments"
      },
      selfie: {
        contexts: [
          `Scene context: Product held up in a mirror selfie frame. Modern bathroom or bedroom mirror visible. Ring light reflection. Casual setting.`,
          `Scene context: Product shown at arm's length in selfie style. Blurred lifestyle background. Natural daylight.`,
          `Scene context: Cute aesthetic selfie composition with product visible. Clean modern room background. Instagram worthy.`
        ],
        nameAr: "سيلفي",
        nameEn: "Selfie",
        description: "Natural selfie style photos"
      },
      tutorial: {
        contexts: [
          `Scene context: Product with step-by-step instruction graphics around it. Clean white background. Educational content style.`,
          `Scene context: Product on a clean surface with numbered steps indicated. Bright professional lighting. Tutorial aesthetic.`,
          `Scene context: Close-up of product with usage demonstration setup. Clear visibility, instructional feel.`
        ],
        nameAr: "توتوريال",
        nameEn: "Tutorial",
        description: "How-to tutorial style"
      }
    };

    const selectedContext = ugcContexts[ugcType] || ugcContexts.lifestyle;

    console.log(`User ${authData?.userId} generating UGC content with Runware, type: ${ugcType}, hasProductImage: ${!!productImage}, hasAnalysis: ${!!productAnalysis}`);

    // Generate multiple UGC images
    const generatedImages: Array<{ imageUrl: string; type: string; typeAr: string }> = [];

    for (let i = 0; i < selectedContext.contexts.length; i++) {
      const contextDescription = selectedContext.contexts[i];
      
      // Build prompt that PRESERVES the product completely
      const fullPrompt = productImage
        ? `PRODUCT PRESERVATION - UGC STYLE IMAGE:

CRITICAL: The product from the input image MUST remain EXACTLY identical:
- Keep exact same product shape and proportions
- Keep exact same colors, patterns, design
- Keep exact same branding and text if visible
- DO NOT modify the product in any way

ONLY ADD CONTEXT AROUND THE PRODUCT:
${contextDescription}

Product Name: ${productName || "Product"}
${productAnalysis ? `
Key Selling Points:
- ${productAnalysis.core_feature || ''}
- ${productAnalysis.benefits?.[0] || ''}
` : ''}

REQUIREMENTS:
- Product must look EXACTLY like the input image
- Only add environmental context around it
- Photorealistic quality
- Natural lighting
- UGC/influencer style authenticity
- MENA market appropriate`
        : `UGC Style Product Photography:

${contextDescription}

Product: ${productName || "Fashion or beauty product"}
${productAnalysis ? `
Focus on: ${productAnalysis.core_feature || ''}
` : ''}

REQUIREMENTS:
- Photorealistic quality
- Natural authentic UGC feel
- Egyptian/MENA market aesthetic
- Instagram/TikTok content style`;

      try {
        console.log(`Generating UGC image ${i + 1}...`);

        const taskUUID = crypto.randomUUID();
        
        const runwarePayload: any[] = [
          {
            taskType: "authentication",
            apiKey: RUNWARE_API_KEY
          },
          {
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            negativePrompt: "different product, changed product, modified product, wrong colors, wrong design, cartoon, anime, illustration, artificial, heavy editing, inappropriate, text, watermark, deformed",
            width: 1024,
            height: 1024,
            model: model || "civitai:43331@176425", // Majic Mix Realistic
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            steps: 25,
            scheduler: "DPMSolverMultistepScheduler"
          }
        ];

        // If product image is provided, use image-to-image with VERY LOW strength
        if (productImage) {
          if (productImage.startsWith('data:')) {
            const base64Data = productImage.split(',')[1];
            runwarePayload[1].inputImage = `data:image/png;base64,${base64Data}`;
            // VERY LOW strength to keep product exactly the same
            runwarePayload[1].strength = 0.20;
          } else if (productImage.startsWith('http')) {
            runwarePayload[1].inputImage = productImage;
            runwarePayload[1].strength = 0.20;
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
            type: selectedContext.nameEn,
            typeAr: selectedContext.nameAr
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
        typeName: language === 'ar' ? selectedContext.nameAr : selectedContext.nameEn,
        description: selectedContext.description,
        count: generatedImages.length,
        provider: "runware",
        productPreserved: !!productImage,
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
