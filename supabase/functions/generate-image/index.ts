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

    // Professional Egyptian Fashion & Beauty e-commerce ad creative styles
    // More variety for fashion niche with Egyptian Arabic text styling
    const stylePrompts: Record<string, string> = {
      lifestyle: `Egyptian Fashion E-commerce Lifestyle Ad - STYLE 1:
- Product as hero with sharp focus, lifestyle context
- Warm golden hour lighting with soft bokeh background
- Modern Egyptian woman lifestyle setting
- ARABIC TEXT: Bold modern Arabic sans-serif font (NO tashkeel/diacritics)
- Text design: Neon glow effect or gradient fill
- Price badge: "٢٩٩ ج.م" in decorative circle/ribbon
- Discount splash: "خصم ٥٠٪" in dynamic starburst shape
- Instagram-ready 4K, vibrant colors
- Egyptian market appeal, trendy fashion mood`,

      flatlay: `Egyptian Fashion Flatlay Ad - STYLE 2:
- Bird's eye view product arrangement on marble/velvet
- Fashion accessories around main product
- Scattered rose petals or gold confetti accents
- ARABIC TEXT: Chunky bold Arabic display font (NO tashkeel)
- Text design: 3D effect with drop shadow
- Price: "السعر ١٩٩ ج.م فقط" in elegant banner
- Promo text in speech bubble or tag shape
- Soft diffused lighting, Instagram aesthetic
- Pastel pinks, golds, cream, rose gold accents`,

      model: `Egyptian Fashion Model Ad - STYLE 3:
- Egyptian model showcasing fashion product
- Product clearly visible and styled
- Professional studio lighting, beauty dish
- ARABIC TEXT: Elegant Arabic calligraphy-inspired modern font (NO tashkeel)
- Text design: Brush stroke background behind text
- "اطلبي دلوقتي" CTA in bold decorative button
- Price "٣٩٩ ج.م" with strikethrough old price
- High-fashion editorial quality
- Soft pinks, neutrals, champagne, bronze tones`,

      studio: `Egyptian Fashion Catalog Ad - STYLE 4:
- Product hero shot on clean gradient backdrop
- Professional product photography lighting
- Floating elements or geometric shapes accent
- ARABIC TEXT: Bold condensed Arabic font (NO tashkeel)
- Text design: Text inside geometric shapes (circles, hexagons)
- Price "٤٩٩ ج.م" in modern price tag design
- Feature icons with Arabic labels
- "توصيل لحد البيت" delivery badge
- White, soft gray, accent color pops`,

      minimal: `Egyptian Luxury Fashion Ad - STYLE 5:
- Product with generous negative space
- Ultra-clean luxury presentation
- Subtle gradient or solid elegant backdrop
- ARABIC TEXT: Thin elegant Arabic serif (NO tashkeel)
- Text design: Minimalist with gold foil effect
- Price "٧٩٩ ج.م" in understated elegant format
- Single line Arabic tagline
- Premium brand aesthetic
- Cream, black, gold, champagne colors`,

      streetwear: `Egyptian Streetwear Fashion Ad - STYLE 6:
- Urban trendy product presentation
- Graffiti or urban texture backgrounds
- Bold dynamic angles and composition
- ARABIC TEXT: Graffiti-style Arabic font (NO tashkeel)
- Text design: Spray paint effect, dripping text
- Price "١٤٩ ج.م" in street art style tag
- "ستايل الشارع" urban vibe text
- Neon accents, bold contrasts
- Electric colors, black, white, neon pink/green`,

      vintage: `Egyptian Vintage Fashion Ad - STYLE 7:
- Retro-inspired product styling
- Vintage film grain and warm tones
- Classic elegant composition
- ARABIC TEXT: Retro Arabic display font (NO tashkeel)
- Text design: Vintage badge or stamp effect
- Price "٢٤٩ ج.م" in classic oval frame
- "كلاسيك" vintage charm elements
- Sepia, warm browns, dusty rose, gold`,

      glam: `Egyptian Glam Fashion Ad - STYLE 8:
- High-end glamorous product shot
- Sparkle and shimmer effects
- Luxury velvet or silk backgrounds
- ARABIC TEXT: Glamorous Arabic script (NO tashkeel)
- Text design: Glitter fill or diamond encrusted effect
- Price "٥٩٩ ج.م" in luxury gold frame
- "لوك فخم" glamour messaging
- Rose gold, champagne, deep purple, black`,
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

    console.log(`User ${authData?.userId} generating ${styleVariations.length} varied fashion images with Lovable AI Gateway, styles: ${selectedStyles.join(', ')}, hasProductImage: ${!!productImage}`);

    // Generate multiple images with different styles for fashion variety
    const generatedImages: Array<{ imageUrl: string; angle: string; angleAr: string }> = [];
    
    for (const variation of styleVariations) {
      // Build the image editing prompt that preserves the original product
      const editPrompt = productImage 
        ? `CRITICAL: Keep the EXACT product from the image - do NOT change the product itself.

PRODUCT PRESERVATION:
- Keep exact shape, colors, materials, branding
- Do not modify or replace the product

CREATE Egyptian Fashion Advertisement:
${variation.prompt}

ARABIC TEXT RULES (CRITICAL):
- NO tashkeel/diacritics (لا تشكيل) - clean modern Arabic only
- Use decorative, eye-catching text designs
- Price in Egyptian Pounds (ج.م)
- Egyptian dialect phrases: "اطلبي دلوقتي", "توصيل لحد البيت", "خصم"

Product context: ${prompt}

OUTPUT: Egyptian fashion e-commerce ad with ${variation.name} style, attractive Arabic text designs, Egyptian market appeal.`
        : `${variation.prompt}

Product: ${prompt}

ARABIC TEXT RULES (CRITICAL):
- NO tashkeel/diacritics (لا تشكيل) - clean modern text
- Eye-catching decorative text effects (glow, shadow, 3D, gradients)
- Prices in Egyptian Pounds: "١٩٩ ج.م", "٢٩٩ ج.م", "٣٩٩ ج.م"
- Egyptian phrases: "اطلبي دلوقتي", "توصيل مجاني", "خصم ٥٠٪"
- Bold, modern Arabic fonts - NOT calligraphy
- Text integrated as design elements (badges, banners, bubbles)

OUTPUT: 4K Egyptian fashion advertisement, Instagram-ready, vibrant colors, professional quality`;

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
        console.log(`Generating ${variation.name} style...`);
        
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
          console.error(`Lovable AI Gateway error for ${variation.name}:`, response.status, errorText);
          
          if (response.status === 401) {
            throw new Error("Invalid Lovable API key");
          }
          if (response.status === 402) {
            throw new Error("Lovable AI quota exceeded");
          }
          if (response.status === 429) {
            throw new Error("Rate limit exceeded - please try again in a moment");
          }
          // Continue to next style on other errors
          continue;
        }

        const data = await response.json();
        const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageData) {
          generatedImages.push({
            imageUrl: imageData,
            angle: variation.name,
            angleAr: variation.nameAr
          });
          console.log(`Successfully generated ${variation.name} style`);
        }
      } catch (styleError) {
        console.error(`Error generating ${variation.name} style:`, styleError);
        // If it's a critical error, throw it
        if (styleError instanceof Error && 
            (styleError.message.includes("quota") || 
             styleError.message.includes("API key") ||
             styleError.message.includes("Rate limit"))) {
          throw styleError;
        }
        // Otherwise continue to next style
      }
    }

    if (generatedImages.length === 0) {
      throw new Error("No images were generated");
    }

    console.log(`Successfully generated ${generatedImages.length} varied fashion images for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        // Keep backward compatibility
        imageUrl: generatedImages[0]?.imageUrl,
        description: `Egyptian fashion ads with ${generatedImages.length} different styles`,
        mode: productImage ? "edit" : "generate",
        styles: selectedStyles,
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
