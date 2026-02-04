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
    const { prompt, style, productImage, language = 'ar', model } = await req.json();
    const RUNWARE_API_KEY = Deno.env.get("RUNWARE_API_KEY");

    if (!RUNWARE_API_KEY) {
      throw new Error("RUNWARE_API_KEY is not configured");
    }

    // ============================================
    // IMAGE STUDIO - Professional MENA E-commerce Ad Creatives
    // Using Runware AI Platform for Image Generation
    // ============================================

    // Professional Egyptian Fashion & Beauty e-commerce ad creative styles
    const stylePrompts: Record<string, string> = {
      lifestyle: `Professional Egyptian Fashion E-commerce Lifestyle Ad:
- Product as hero with sharp focus, lifestyle context
- Warm golden hour lighting with soft bokeh background  
- Modern Egyptian woman lifestyle setting
- Bold modern Arabic text overlay with neon glow effect
- Price badge showing Egyptian Pounds (ج.م) in decorative circle
- Discount splash with dynamic starburst shape
- Instagram-ready 4K resolution, vibrant colors
- Egyptian market appeal, trendy fashion mood`,

      flatlay: `Egyptian Fashion Flatlay Advertisement:
- Bird's eye view product arrangement on marble or velvet surface
- Fashion accessories arranged around main product
- Scattered rose petals or gold confetti accents
- Chunky bold Arabic display text with 3D drop shadow effect
- Price display in elegant banner style
- Promotional text in speech bubble or tag shape
- Soft diffused lighting, Instagram aesthetic
- Pastel pinks, golds, cream, rose gold color accents`,

      model: `Egyptian Fashion Model Advertisement:
- Egyptian model showcasing fashion product
- Product clearly visible and professionally styled
- Professional studio lighting with beauty dish
- Elegant Arabic text with brush stroke background
- Bold decorative CTA button design
- Price with strikethrough old price comparison
- High-fashion editorial quality photography
- Soft pinks, neutrals, champagne, bronze tones`,

      studio: `Egyptian Fashion Catalog Studio Ad:
- Product hero shot on clean gradient backdrop
- Professional product photography lighting setup
- Floating elements or geometric shapes accent
- Bold condensed Arabic text inside geometric shapes
- Modern price tag design element
- Feature icons with Arabic labels
- Delivery badge with Egyptian messaging
- White, soft gray, with accent color pops`,

      minimal: `Egyptian Luxury Fashion Minimal Ad:
- Product with generous negative space
- Ultra-clean luxury brand presentation
- Subtle gradient or solid elegant backdrop
- Thin elegant Arabic serif text with gold foil effect
- Understated elegant price format
- Single line Arabic tagline
- Premium high-end brand aesthetic
- Cream, black, gold, champagne color palette`,

      streetwear: `Egyptian Streetwear Urban Fashion Ad:
- Urban trendy product presentation
- Graffiti or urban texture backgrounds
- Bold dynamic angles and composition
- Graffiti-style Arabic text with spray paint effect
- Street art style price tag
- Urban vibe Egyptian messaging
- Neon accents with bold contrasts
- Electric colors, black, white, neon pink and green`,

      vintage: `Egyptian Vintage Fashion Retro Ad:
- Retro-inspired product styling
- Vintage film grain and warm nostalgic tones
- Classic elegant composition
- Retro Arabic display text with vintage badge effect
- Price in classic oval frame design
- Vintage charm decorative elements
- Sepia, warm browns, dusty rose, gold tones`,

      glam: `Egyptian Glam Fashion Luxury Ad:
- High-end glamorous product shot
- Sparkle and shimmer visual effects
- Luxury velvet or silk backgrounds
- Glamorous Arabic script with glitter fill effect
- Price in luxury gold frame design
- Glamour messaging with Egyptian flair
- Rose gold, champagne, deep purple, black palette`,
    };

    // Randomly select 3 different styles for variety
    const styleKeys = Object.keys(stylePrompts);
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
      prompt: stylePrompts[styleKey as keyof typeof stylePrompts] || stylePrompts.lifestyle
    }));

    console.log(`User ${authData?.userId} generating ${styleVariations.length} images with Runware, styles: ${selectedStyles.join(', ')}, hasProductImage: ${!!productImage}`);

    // Generate images using Runware API
    const generatedImages: Array<{ imageUrl: string; angle: string; angleAr: string }> = [];

    for (const variation of styleVariations) {
      const fullPrompt = productImage 
        ? `Professional e-commerce advertisement photo. ${variation.prompt}

Product description: ${prompt}

IMPORTANT REQUIREMENTS:
- Keep the original product design exactly as shown
- Create professional advertising composition
- Add attractive Arabic text overlays (no diacritics)
- Include Egyptian Pound pricing (ج.م)
- Make it Instagram-ready and eye-catching
- Egyptian market appeal with local dialect phrases`
        : `${variation.prompt}

Product: ${prompt}

REQUIREMENTS:
- Professional 4K quality e-commerce advertisement
- Eye-catching Arabic text overlays (modern, no diacritics)
- Egyptian Pound pricing display (ج.م)
- Egyptian dialect phrases like "اطلبي دلوقتي", "توصيل مجاني"
- Instagram-ready vibrant colors
- Professional product photography style`;

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
          const imageBase64 = productImage.split(',')[1];
          
          runwarePayload.push({
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            width: 1024,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 1,
            scheduler: "FlowMatchEulerDiscreteScheduler",
            strength: 0.75,
            inputImage: `data:image/png;base64,${imageBase64}`
          });
        } else if (productImage && productImage.startsWith('http')) {
          // Image-to-image with URL
          runwarePayload.push({
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            width: 1024,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 1,
            scheduler: "FlowMatchEulerDiscreteScheduler",
            strength: 0.75,
            inputImage: productImage
          });
        } else {
          // Text-to-image generation
          runwarePayload.push({
            taskType: "imageInference",
            taskUUID,
            positivePrompt: fullPrompt,
            width: 1024,
            height: 1024,
            model: model || "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 1,
            steps: 4,
            scheduler: "FlowMatchEulerDiscreteScheduler"
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
        provider: "runware"
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
