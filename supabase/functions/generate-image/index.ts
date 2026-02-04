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
    const { prompt, style, productImage, productAnalysis, language = 'ar', model } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ============================================
    // IMAGE STUDIO - Professional MENA E-commerce Ad Creatives
    // Using Lovable AI Gateway with Gemini Image Generation
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

    // Select 3 different styles for variety
    const styleKeys = Object.keys(stylePrompts);
    const shuffledStyles = styleKeys.sort(() => Math.random() - 0.5);
    const selectedStyles = style ? [style, ...shuffledStyles.filter(s => s !== style).slice(0, 2)] : shuffledStyles.slice(0, 3);

    console.log(`User ${authData?.userId} generating ${selectedStyles.length} images with Gemini, styles: ${selectedStyles.join(', ')}`);

    const generatedImages: Array<{ imageUrl: string; angle: string; angleAr: string }> = [];

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
                content: imagePrompt
              }
            ]
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
        console.log(`Gemini response for ${styleKey}:`, JSON.stringify(data).substring(0, 500));

        // Extract image from Gemini response
        // Gemini image generation returns base64 or URL in the response
        const content = data.choices?.[0]?.message?.content;
        
        if (content) {
          // Check if response contains image data
          let imageUrl = null;
          
          // Handle different response formats
          if (typeof content === 'string') {
            // Check for base64 image data
            if (content.includes('data:image')) {
              imageUrl = content.match(/data:image\/[^;]+;base64,[^"'\s]+/)?.[0];
            }
            // Check for URL
            else if (content.includes('http')) {
              imageUrl = content.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp|gif)/i)?.[0];
            }
          } else if (content.image_url) {
            imageUrl = content.image_url;
          } else if (data.choices?.[0]?.message?.image_url) {
            imageUrl = data.choices[0].message.image_url;
          }

          if (imageUrl) {
            generatedImages.push({
              imageUrl,
              angle: styleKey,
              angleAr: styleNamesAr[styleKey] || styleKey
            });
            console.log(`Successfully generated ${styleKey} style`);
          } else {
            console.log(`No image URL found in response for ${styleKey}, content preview:`, 
              typeof content === 'string' ? content.substring(0, 200) : JSON.stringify(content).substring(0, 200));
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
          ? `إعلانات أزياء مصرية بـ ${generatedImages.length} أنماط مختلفة`
          : `Egyptian fashion ads with ${generatedImages.length} different styles`,
        mode: productImage ? "edit" : "generate",
        styles: selectedStyles,
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
