const serve = (handler: (req: Request) => Promise<Response>) => {
  Deno.serve(handler);
};
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
    const { prompt, style, productImage, inspirationImage, productAnalysis, language = 'ar' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ============================================
    // IMAGE STUDIO - Professional MENA E-commerce Ad Creatives
    // With optional Inspiration Image feature
    // ============================================

    // Style prompts for different ad types
    const stylePrompts: Record<string, string> = {
      lifestyle: "Warm cozy living room setting with soft golden sunlight, modern Egyptian home interior, elegant furniture in background. Professional product photography.",
      flatlay: "Clean marble surface, bird's eye flatlay composition with elegant props, scattered gold accents, professional studio lighting from above.",
      model: "Professional studio with beauty dish lighting, elegant gradient backdrop, high-fashion editorial atmosphere.",
      studio: "Clean gradient studio backdrop, professional 3-point lighting setup, floating geometric accent shapes, modern product photography.",
      minimal: "Ultra-clean white or cream backdrop with generous negative space, subtle shadows, luxury brand aesthetic.",
      streetwear: "Urban textured wall with graffiti art hints, neon color accents, street photography style.",
      vintage: "Nostalgic warm-toned setting with vintage film aesthetic, sepia undertones, classic elegant props.",
      glam: "Luxurious velvet or silk backdrop with sparkle effects, glamorous rim lighting, rose gold and champagne accents."
    };

    // Arabic style names
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

    const generatedImages: Array<{ imageUrl: string; angle: string; angleAr: string; type?: string }> = [];

    // ============================================
    // MODE 1: Inspiration Image Mode (2 images)
    // ============================================
    if (inspirationImage) {
      console.log(`User ${authData?.userId} generating with inspiration image - 2 outputs`);

      // Image 1: Capture the "vibe/spirit" of inspiration with product
      const vibePrompt = `Analyze this inspiration image and create a NEW image for this product: ${prompt || "Fashion product"}

Take the MOOD, ATMOSPHERE, COLOR PALETTE, and AESTHETIC FEELING from the inspiration image.
Create a completely new professional product photography that captures the same VIBE and SPIRIT.

Requirements:
- Professional 4K quality e-commerce advertisement
- Same mood/atmosphere as inspiration (lighting, colors, feeling)
- Egyptian/MENA market appeal
- Vertical 9:16 format for social media
- High-end luxury fashion aesthetic
- The product must be the main focus
- No text or watermarks`;

      // Image 2: Product swap - place product in inspiration scene
      const swapPrompt = `Look at this inspiration image and REPLACE the main subject/product with: ${prompt || "Fashion product"}

Keep the EXACT same:
- Background and environment
- Lighting and shadows
- Composition and framing
- Overall scene setup

But replace the main product/item with the new product while maintaining:
- Natural integration with the scene
- Proper lighting on the product
- Realistic shadows and reflections
- Professional quality result

Requirements:
- Professional 4K quality
- Seamless product integration
- Vertical 9:16 format
- No text or watermarks`;

      const inspirationPrompts = [
        { prompt: vibePrompt, type: "vibe", angle: "inspiration-vibe", angleAr: "روح الإلهام" },
        { prompt: swapPrompt, type: "swap", angle: "product-swap", angleAr: "تبديل المنتج" }
      ];

      for (const item of inspirationPrompts) {
        try {
          console.log(`Generating ${item.type} with inspiration...`);

          const response = await fetch(LOVABLE_AI_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "google/gemini-3-pro-image-preview",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: item.prompt },
                    { type: "image_url", image_url: { url: inspirationImage } },
                    ...(productImage ? [{ type: "image_url", image_url: { url: productImage } }] : [])
                  ]
                }
              ],
              modalities: ["image", "text"]
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error for ${item.type}:`, response.status, errorText);
            
            if (response.status === 429) {
              throw new Error(language === 'ar' 
                ? "تم تجاوز حد الطلبات، حاول مرة أخرى لاحقاً"
                : "Rate limit exceeded, please try again later");
            }
            if (response.status === 402) {
              throw new Error(language === 'ar'
                ? "الرصيد غير كافي، يرجى شحن الرصيد"
                : "Insufficient credits, please top up");
            }
            continue;
          }

          const data = await response.json();
          console.log(`Gemini response for ${item.type}:`, JSON.stringify(data).substring(0, 300));

          // Extract image from response
          const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (imageUrl) {
            generatedImages.push({
              imageUrl,
              angle: item.angle,
              angleAr: item.angleAr,
              type: item.type
            });
            console.log(`Successfully generated ${item.type}`);
          } else {
            // Fallback: check other response formats
            const content = data.choices?.[0]?.message?.content;
            if (typeof content === 'string' && content.includes('data:image')) {
              const extractedUrl = content.match(/data:image\/[^;]+;base64,[^"'\s]+/)?.[0];
              if (extractedUrl) {
                generatedImages.push({
                  imageUrl: extractedUrl,
                  angle: item.angle,
                  angleAr: item.angleAr,
                  type: item.type
                });
                console.log(`Successfully generated ${item.type} (fallback extraction)`);
              }
            }
          }
        } catch (itemError) {
          console.error(`Error generating ${item.type}:`, itemError);
          if (itemError instanceof Error && 
              (itemError.message.includes("Rate limit") || 
               itemError.message.includes("credits") ||
               itemError.message.includes("حد الطلبات") ||
               itemError.message.includes("الرصيد"))) {
            throw itemError;
          }
        }
      }
    } 
    // ============================================
    // MODE 2: Standard Mode (3 style variations)
    // ============================================
    else {
      // Select 3 different styles for variety
      const styleKeys = Object.keys(stylePrompts);
      const shuffledStyles = styleKeys.sort(() => Math.random() - 0.5);
      const selectedStyles = style ? [style, ...shuffledStyles.filter(s => s !== style).slice(0, 2)] : shuffledStyles.slice(0, 3);

      console.log(`User ${authData?.userId} generating ${selectedStyles.length} images with Gemini, styles: ${selectedStyles.join(', ')}`);

      for (const styleKey of selectedStyles) {
        const stylePrompt = stylePrompts[styleKey] || stylePrompts.lifestyle;
        
        // Build comprehensive prompt for Gemini image generation
        const imagePrompt = `Generate a professional e-commerce product advertisement image.

Product: ${prompt || "Fashion product"}
${productAnalysis?.core_feature ? `Key Feature: ${productAnalysis.core_feature}` : ''}
${productAnalysis?.benefits ? `Benefits: ${productAnalysis.benefits.slice(0, 2).join(', ')}` : ''}

Style: ${stylePrompt}

Requirements:
- Professional 4K quality e-commerce advertisement
- Sharp product focus with attractive background
- Egyptian/MENA market appeal
- Instagram-ready composition
- Vertical 9:16 format for social media
- High-end luxury fashion aesthetic
- No text or watermarks on the image`;

        try {
          console.log(`Generating ${styleKey} style with Gemini...`);

          const messageContent = productImage 
            ? [
                { type: "text", text: imagePrompt },
                { type: "image_url", image_url: { url: productImage } }
              ]
            : imagePrompt;

          const response = await fetch(LOVABLE_AI_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "google/gemini-3-pro-image-preview",
              messages: [
                {
                  role: "user",
                  content: messageContent
                }
              ],
              modalities: ["image", "text"]
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error for ${styleKey}:`, response.status, errorText);
            
            if (response.status === 429) {
              throw new Error(language === 'ar' 
                ? "تم تجاوز حد الطلبات، حاول مرة أخرى لاحقاً"
                : "Rate limit exceeded, please try again later");
            }
            if (response.status === 402) {
              throw new Error(language === 'ar'
                ? "الرصيد غير كافي، يرجى شحن الرصيد"
                : "Insufficient credits, please top up");
            }
            continue;
          }

          const data = await response.json();
          console.log(`Gemini response for ${styleKey}:`, JSON.stringify(data).substring(0, 300));

          // Extract image from Gemini response (new format with images array)
          const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (imageUrl) {
            generatedImages.push({
              imageUrl,
              angle: styleKey,
              angleAr: styleNamesAr[styleKey] || styleKey
            });
            console.log(`Successfully generated ${styleKey} style`);
          } else {
            // Fallback: check other response formats
            const content = data.choices?.[0]?.message?.content;
            if (typeof content === 'string' && content.includes('data:image')) {
              const extractedUrl = content.match(/data:image\/[^;]+;base64,[^"'\s]+/)?.[0];
              if (extractedUrl) {
                generatedImages.push({
                  imageUrl: extractedUrl,
                  angle: styleKey,
                  angleAr: styleNamesAr[styleKey] || styleKey
                });
                console.log(`Successfully generated ${styleKey} style (fallback extraction)`);
              }
            }
          }
        } catch (styleError) {
          console.error(`Error generating ${styleKey} style:`, styleError);
          if (styleError instanceof Error && 
              (styleError.message.includes("Rate limit") || 
               styleError.message.includes("credits") ||
               styleError.message.includes("حد الطلبات") ||
               styleError.message.includes("الرصيد"))) {
            throw styleError;
          }
        }
      }
    }

    if (generatedImages.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد الصور - حاول مرة أخرى"
        : "Failed to generate images - please try again");
    }

    console.log(`Successfully generated ${generatedImages.length} images for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        imageUrl: generatedImages[0]?.imageUrl,
        description: language === 'ar' 
          ? inspirationImage 
            ? `صورتين: روح الإلهام + تبديل المنتج`
            : `إعلانات أزياء مصرية بـ ${generatedImages.length} أنماط مختلفة`
          : inspirationImage
            ? `2 images: Inspiration vibe + Product swap`
            : `Egyptian fashion ads with ${generatedImages.length} different styles`,
        mode: inspirationImage ? "inspiration" : (productImage ? "edit" : "generate"),
        count: generatedImages.length,
        provider: "gemini"
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
