import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

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
    const { prompt, style, productImage, language = 'ar' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ============================================
    // IMAGE STUDIO - Professional MENA E-commerce Ad Creatives
    // Using Lovable AI Gateway with Gemini Pro Image
    // ============================================

    // Professional MENA e-commerce ad creative styles
    const stylePrompts: Record<string, string> = {
      lifestyle: `Professional Arabic e-commerce lifestyle advertisement photo:
- Product as hero element with sharp focus
- Warm lifestyle setting with elegant props
- Soft bokeh background with ambient golden lighting
- Arabic text overlay: bold marketing headline in Arabic calligraphy
- Gradient overlay with purple to pink tones
- Arabic geometric pattern accents
- Price tag or discount badge
- Professional advertising quality, 4K, Instagram-ready
- Colors: warm golds, deep purples, rose pinks, cream whites`,

      flatlay: `Professional Arabic flat lay e-commerce advertisement:
- Top-down bird's eye view product arrangement
- Marble or textured fabric background
- Product centered with complementary accessories
- Bold Arabic promotional text overlay
- Clean Instagram-worthy aesthetic
- Soft even lighting from above
- Feature callouts with Arabic text
- Brand watermark placement
- Colors: soft pastels, white, cream, gold accents`,

      model: `Professional Arabic beauty advertisement photo:
- Beautiful model showcasing the product
- Product clearly visible and prominent
- Professional studio lighting setup
- Arabic headline in elegant typography
- High-end beauty brand aesthetic
- Soft flattering lighting
- Product glow effect
- Trust badges in Arabic
- Colors: soft pinks, neutral tones, white, rose gold`,

      studio: `Professional Arabic product catalog advertisement:
- Product as sole hero on studio background
- Clean white or gradient backdrop
- Perfect product lighting with soft shadows
- Large Arabic product name headline
- Key features as Arabic bullet points
- "اطلب الآن" Order Now button design
- Delivery badges in Arabic
- Commercial catalog quality
- Colors: white, light gray, brand accents`,

      minimal: `Minimalist Arabic luxury product advertisement:
- Product centered with generous negative space
- Elegant solid or subtle gradient backdrop
- Refined artistic presentation
- Minimal elegant Arabic headline
- Luxury brand typography
- Sophisticated understated elegance
- Arabic calligraphy elements
- Colors: cream, taupe, muted gold, soft black`,
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.lifestyle;

    // Define multiple angles/perspectives for generation
    const angleVariations = [
      {
        name: "front",
        nameAr: "أمامي",
        prompt: "Front view, straight-on angle, product facing camera directly"
      },
      {
        name: "angle",
        nameAr: "زاوية جانبية",
        prompt: "45-degree angle view, showing depth and dimension, dynamic perspective"
      },
      {
        name: "close-up",
        nameAr: "مقرّب",
        prompt: "Close-up detail shot, highlighting texture and quality, macro focus on key features"
      }
    ];

    console.log(`User ${authData?.userId} generating ${angleVariations.length} images with Lovable AI Gateway, style: ${style}, hasProductImage: ${!!productImage}`);

    // Generate multiple images with different angles
    const generatedImages: Array<{ imageUrl: string; angle: string; angleAr: string }> = [];
    
    for (const angle of angleVariations) {
      // Build the image editing prompt that preserves the original product
      const editPrompt = productImage 
        ? `CRITICAL INSTRUCTION: You MUST preserve the EXACT product shown in the image. Do NOT change the product itself.

ANALYZE the product in detail:
- Identify the exact shape, colors, textures, and materials
- Note all branding, logos, text, and labels
- Observe the product proportions and dimensions
- Identify any unique features or details

NOW create a professional advertising photo with these requirements:
1. Keep the EXACT same product - do not modify, replace, or alter it
2. CAMERA ANGLE: ${angle.prompt}
3. Place the product in a professional ${style} advertising setting
4. Add professional studio lighting that enhances the product
5. ${selectedStyle}

Product context: ${prompt}

OUTPUT: A professional e-commerce advertisement featuring the IDENTICAL product from the input image, just in a ${angle.name} view with Arabic text overlays.`
        : `${selectedStyle}

Product: ${prompt}
CAMERA ANGLE: ${angle.prompt}

CRITICAL REQUIREMENTS:
- Professional MARKETING ADVERTISEMENT, not just product photo
- ${angle.prompt}
- Include beautiful Arabic text overlays (right-to-left)
- Use elegant Arabic fonts
- Complete social media ad ready for Meta Ads
- 4K resolution, vibrant colors, eye-catching design
- Arabic text integrated naturally into the design`;

      // Build the message content based on whether we have a product image
      let messageContent: any;
      
      if (productImage) {
        // Image-to-image editing mode: pass the product image for preservation
        messageContent = [
          {
            type: "text",
            text: editPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: productImage
            }
          }
        ];
      } else {
        // Text-to-image generation mode
        messageContent = editPrompt;
      }

      try {
        console.log(`Generating ${angle.name} view...`);
        
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
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
          console.error(`Lovable AI Gateway error for ${angle.name}:`, response.status, errorText);
          
          if (response.status === 401) {
            throw new Error("Invalid Lovable API key");
          }
          if (response.status === 402) {
            throw new Error("Lovable AI quota exceeded");
          }
          if (response.status === 429) {
            throw new Error("Rate limit exceeded - please try again in a moment");
          }
          // Continue to next angle on other errors
          continue;
        }

        const data = await response.json();
        const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageData) {
          generatedImages.push({
            imageUrl: imageData,
            angle: angle.name,
            angleAr: angle.nameAr
          });
          console.log(`Successfully generated ${angle.name} view`);
        }
      } catch (angleError) {
        console.error(`Error generating ${angle.name} view:`, angleError);
        // If it's a critical error, throw it
        if (angleError instanceof Error && 
            (angleError.message.includes("quota") || 
             angleError.message.includes("API key") ||
             angleError.message.includes("Rate limit"))) {
          throw angleError;
        }
        // Otherwise continue to next angle
      }
    }

    if (generatedImages.length === 0) {
      throw new Error("No images were generated");
    }

    console.log(`Successfully generated ${generatedImages.length} images for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        // Keep backward compatibility
        imageUrl: generatedImages[0]?.imageUrl,
        description: `Professional ${style} advertisement with ${generatedImages.length} angles`,
        mode: productImage ? "edit" : "generate",
        style: style,
        count: generatedImages.length
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
