import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

const RUNWARE_API_URL = "https://api.runware.ai/v1";

interface RunwareImageResult {
  taskType: string;
  taskUUID: string;
  imageUUID: string;
  imageURL: string;
  NSFWContent?: boolean;
  seed?: number;
  positivePrompt?: string;
}

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
    const { prompt, style, productImage, productAnalysis, language = 'ar', model } = await req.json();
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    // ============================================
    // IMAGE STUDIO - Professional MENA E-commerce Ad Creatives
    // Using Runware AI Platform for Image Generation
    // CRITICAL: Preserve original product appearance!
    // ============================================

    // Background/environment prompts ONLY - product stays exactly the same
    const environmentPrompts: Record<string, string> = {
      lifestyle: `Background setting: Warm cozy living room with soft golden sunlight, modern Egyptian home interior, elegant furniture hints in bokeh background. Professional product photography lighting.`,

      flatlay: `Background setting: Clean marble or velvet surface, bird's eye flatlay composition with elegant props, scattered gold accents, professional studio lighting from above.`,

      model: `Background setting: Professional studio with beauty dish lighting, elegant gradient backdrop, high-fashion editorial atmosphere.`,

      studio: `Background setting: Clean gradient studio backdrop, professional 3-point lighting setup, floating geometric accent shapes, modern product photography.`,

      minimal: `Background setting: Ultra-clean white or cream backdrop with generous negative space, subtle shadows, luxury brand aesthetic lighting.`,

      streetwear: `Background setting: Urban textured wall, graffiti art hints in background, neon color accents, street photography style.`,

      vintage: `Background setting: Nostalgic warm-toned setting with vintage film aesthetic, sepia undertones, classic elegant props.`,

      glam: `Background setting: Luxurious velvet or silk backdrop with sparkle effects, glamorous lighting with rim light, rose gold and champagne accents.`,
    };

    // Randomly select 3 different styles for variety
    const styleKeys = Object.keys(environmentPrompts);
    const shuffledStyles = styleKeys.sort(() => Math.random() - 0.5);
    const selectedStyles = style ? [style, ...shuffledStyles.filter(s => s !== style).slice(0, 2)] : shuffledStyles.slice(0, 3);

    // Arabic style names mapping
    const styleNamesAr: Record<string, string> = {
      lifestyle: "لايف ستايل",
      flatlay: "فلات لاي", 
      model: "موديل",
      studio: "استوديو",
      minimal: "مينيمال",
      streetwear: "ستريت وير",
      vintage: "فينتاج",
      glam: "جلام"
    };

    // Define multiple style variations for fashion variety
    const styleVariations = selectedStyles.map((styleKey) => ({
      name: styleKey,
      nameAr: styleNamesAr[styleKey] || styleKey,
      prompt: environmentPrompts[styleKey as keyof typeof environmentPrompts] || environmentPrompts.lifestyle
    }));

    console.log(`User ${authData?.userId} generating ${styleVariations.length} images with Runware, styles: ${selectedStyles.join(', ')}, hasProductImage: ${!!productImage}, hasAnalysis: ${!!productAnalysis}`);

    // Generate images using Runware API
    const generatedImages: Array<{ imageUrl: string; angle: string; angleAr: string }> = [];

    for (const variation of styleVariations) {
      // Build prompt that PRESERVES the product and only changes the environment
      const fullPrompt = productImage 
        ? `PRODUCT PRESERVATION IMAGE-TO-IMAGE GENERATION:

CRITICAL INSTRUCTION: The product in the input image MUST remain EXACTLY identical in the output:
- Same product shape, silhouette, and proportions
- Same colors, patterns, and design details  
- Same branding, logos, and text if visible
- Same material appearance and texture

DO NOT:
- Change the product design in any way
- Add new elements to the product
- Alter the product's colors or patterns
- Modify the product's shape or size

ONLY CHANGE THE BACKGROUND/ENVIRONMENT:
${variation.prompt}

Product Info: ${prompt}
${productAnalysis ? `
Marketing Context:
- Core Feature: ${productAnalysis.core_feature || ''}
- Key Benefits: ${productAnalysis.benefits?.slice(0, 2).join(', ') || ''}
` : ''}

OUTPUT REQUIREMENTS:
- Product must look EXACTLY like the input image
- Only the background/environment should change
- Professional e-commerce quality
- Sharp focus on product
- 4K resolution advertising style`
        : `Professional e-commerce product photography:

${variation.prompt}

Product: ${prompt}
${productAnalysis ? `
Marketing Focus:
- Highlight: ${productAnalysis.core_feature || ''}
- Benefits: ${productAnalysis.benefits?.slice(0, 2).join(', ') || ''}
` : ''}

REQUIREMENTS:
- Professional 4K quality e-commerce advertisement
- Sharp product focus with attractive background
- Egyptian market appeal
- Instagram-ready composition`;

      try {
        console.log(`Generating ${variation.name} style with Runware...`);

        // Build Runware API request
        const taskUUID = crypto.randomUUID();
        
        const runwarePayload: any[] = [
          {
            taskType: "authentication",
            apiKey: RUNWARE_API_KEY
          }
        ];

        if (productImage && productImage.startsWith('data:')) {
          // Image-to-image generation with uploaded product image
          // CRITICAL: Low strength to preserve product, only change background
          const imageBase64 = productImage.split(',')[1];
          
          runwarePayload.push({
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            negativePrompt: "change product, modify product, different product, altered product, wrong colors, wrong design, distorted product, deformed product, blurry product",
            width: 1024,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            scheduler: "DPMSolverMultistepScheduler",
            steps: 25,
            // VERY LOW strength to preserve original product - only change environment
            strength: 0.25,
            inputImage: `data:image/png;base64,${imageBase64}`
          });
        } else if (productImage && productImage.startsWith('http')) {
          // Image-to-image with URL
          runwarePayload.push({
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            negativePrompt: "change product, modify product, different product, altered product, wrong colors, wrong design, distorted product, deformed product, blurry product",
            width: 1024,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            scheduler: "DPMSolverMultistepScheduler",
            steps: 25,
            strength: 0.25,
            inputImage: productImage
          });
        } else {
          // Text-to-image generation
          runwarePayload.push({
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            negativePrompt: "blurry, low quality, distorted, ugly, bad composition",
            width: 1024,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            steps: 25,
            scheduler: "DPMSolverMultistepScheduler"
          });
        }

        const response = await fetch(RUNWARE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(runwarePayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Runware API error for ${variation.name}:`, response.status, errorText);
          
          if (response.status === 401) {
            throw new Error("Invalid Runware API key");
          }
          if (response.status === 402) {
            throw new Error("Runware credits exhausted - please add more credits");
          }
          if (response.status === 429) {
            throw new Error("Rate limit exceeded - please try again in a moment");
          }
          continue;
        }

        const data = await response.json();
        console.log(`Runware response for ${variation.name}:`, JSON.stringify(data).substring(0, 500));

        // Extract image from Runware response
        const imageResults = data.data?.filter((item: any) => item.taskType === "imageInference") || [];
        
        if (imageResults.length > 0 && imageResults[0].imageURL) {
          generatedImages.push({
            imageUrl: imageResults[0].imageURL,
            angle: variation.name,
            angleAr: variation.nameAr
          });
          console.log(`Successfully generated ${variation.name} style with Runware`);
        }
      } catch (styleError) {
        console.error(`Error generating ${variation.name} style:`, styleError);
        if (styleError instanceof Error && 
            (styleError.message.includes("credits") || 
             styleError.message.includes("API key") ||
             styleError.message.includes("Rate limit"))) {
          throw styleError;
        }
      }
    }

    // If no images were generated with Runware, provide helpful error
    if (generatedImages.length === 0) {
      throw new Error("Failed to generate images with Runware. Please check your API key and credits.");
    }

    console.log(`Successfully generated ${generatedImages.length} images with Runware for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        imageUrl: generatedImages[0]?.imageUrl,
        description: `Egyptian fashion ads with ${generatedImages.length} different styles`,
        mode: productImage ? "edit" : "generate",
        styles: selectedStyles,
        count: generatedImages.length,
        provider: "runware",
        productPreserved: !!productImage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-image function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
