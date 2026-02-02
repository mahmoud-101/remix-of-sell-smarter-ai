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
    // Style: Arabic marketing graphics with text overlays
    // ============================================

    const isArabic = language === 'ar';

    // Professional MENA e-commerce ad creative styles
    const stylePrompts: Record<string, string> = {
      lifestyle: `Create a PROFESSIONAL Arabic e-commerce promotional image:

COMPOSITION:
- Product as hero element (60% of frame, sharp focus)
- Lifestyle setting with warm, inviting atmosphere
- Elegant props that complement the product
- Soft bokeh background with ambient lighting

ARABIC TEXT ELEMENTS (RIGHT-TO-LEFT):
- Bold headline at top: eye-catching marketing phrase in Arabic
- Subheadline: product benefit or offer
- Price badge or discount tag (if applicable)
- Small logo/brand mark in corner

VISUAL STYLE:
- Gradient overlay (subtle purple to pink or gold to brown)
- Decorative Arabic geometric patterns as subtle accents
- Soft shadows and professional lighting
- Clean, modern design with luxury feel

COLOR PALETTE: Warm golds, deep purples, rose pinks, cream whites`,

      flatlay: `Create a PROFESSIONAL Arabic e-commerce flat lay promotional image:

COMPOSITION:
- Top-down bird's eye view arrangement
- Product as central focus with complementary items
- Organized, aesthetically pleasing layout
- Marble, textured fabric, or gradient background

ARABIC TEXT ELEMENTS (RIGHT-TO-LEFT):
- Bold promotional headline in Arabic (top or side)
- Feature callouts with checkmarks or icons
- Price or offer badge
- Brand watermark

VISUAL STYLE:
- Clean, Instagram-worthy aesthetic
- Soft, even lighting from above
- Subtle shadow for depth
- Modern Arabic typography
- Decorative elements (flowers, leaves, accessories)

COLOR PALETTE: Soft pastels, white, cream, gold accents`,

      model: `Create a PROFESSIONAL Arabic beauty/fashion advertisement:

COMPOSITION:
- Beautiful model showcasing the product
- Product clearly visible and prominent
- Professional studio lighting setup
- Clean or gradient background

ARABIC TEXT ELEMENTS (RIGHT-TO-LEFT):
- Bold Arabic headline: aspirational or benefit-focused
- Product name in elegant Arabic typography
- Feature bullets or benefits
- Call-to-action button design

VISUAL STYLE:
- High-end beauty brand aesthetic
- Soft, flattering lighting on model
- Product glow or highlight effect
- Comparison graphics if relevant (before/after, vs competitor)
- Trust badges or certifications

COLOR PALETTE: Soft pinks, neutral skin tones, white, rose gold`,

      studio: `Create a PROFESSIONAL Arabic product advertisement on studio background:

COMPOSITION:
- Product as sole hero (80% of frame)
- Clean white or gradient studio background
- Perfect product lighting with subtle shadows
- Multiple product angles if relevant

ARABIC TEXT ELEMENTS (RIGHT-TO-LEFT):
- Large Arabic product name/headline
- Key features as bullet points
- Price prominently displayed
- "اطلب الآن" (Order Now) button design
- Delivery/guarantee badges in Arabic

VISUAL STYLE:
- Commercial catalog quality
- Sharp product details
- Subtle gradient background (white to light gray/pink)
- Clean, professional layout
- Icon graphics for features

COLOR PALETTE: White, light gray, brand accent colors`,

      minimal: `Create a MINIMALIST Arabic luxury product advertisement:

COMPOSITION:
- Product centered with generous negative space
- Single elegant backdrop (solid or subtle gradient)
- Artistic, refined presentation
- Focus on product beauty and details

ARABIC TEXT ELEMENTS (RIGHT-TO-LEFT):
- Minimal, elegant Arabic headline
- Subtle product name
- Simple call-to-action
- Luxury brand aesthetic typography

VISUAL STYLE:
- Scandinavian meets Arabic luxury
- Soft shadows, perfect lighting
- Refined color palette (2-3 colors max)
- Sophisticated, understated elegance
- Subtle Arabic calligraphy elements

COLOR PALETTE: Cream, taupe, muted gold, soft black`,
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.lifestyle;

    // Common instructions for all styles
    const commonInstructions = `
CRITICAL REQUIREMENTS:
1. This is a MARKETING ADVERTISEMENT image, not just product photography
2. Include Arabic text overlays that are READABLE and BEAUTIFUL
3. Arabic text MUST be right-to-left, properly rendered
4. Use elegant Arabic fonts (Naskh, modern Arabic sans-serif)
5. Create a complete, ready-to-use social media ad
6. Professional quality suitable for Meta Ads / Instagram
7. 4K resolution, vibrant colors, eye-catching design

ARABIC TEXT GUIDELINES:
- Headline: 2-5 words maximum, bold and impactful
- Use Arabic numerals if including numbers
- Text should be integrated into the design, not floating
- Consider text boxes, banners, or gradient overlays for readability

OUTPUT: A complete, professional Arabic e-commerce advertisement ready for Meta Ads.`;

    // Check if we have a product image for image-to-image editing
    if (productImage && productImage.startsWith('data:image')) {
      const editPrompt = `TRANSFORM THIS PRODUCT INTO A PROFESSIONAL ARABIC E-COMMERCE AD:

Keep the EXACT product from the reference image unchanged.

${selectedStyle}

Product context: ${prompt}

${commonInstructions}

IMPORTANT: The product must remain IDENTICAL. Only add the background, lighting, Arabic text overlays, and marketing elements around it.`;

      console.log(`User ${authData?.userId} creating ad creative with product image, style: ${style}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            {
              role: "user",
              content: [
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
              ]
            }
          ],
          modalities: ["image", "text"]
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later.", status: 429 }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits.", status: 402 }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;
      const images = message?.images;
      
      if (!images || images.length === 0) {
        console.error("No images in response:", JSON.stringify(data));
        throw new Error("No image was generated. Please try a different prompt.");
      }

      const imageUrl = images[0]?.image_url?.url;

      console.log(`Successfully created ad creative for user ${authData?.userId}`);

      return new Response(
        JSON.stringify({ 
          imageUrl,
          description: message?.content || "",
          mode: "edit",
          style: style
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Text-to-image generation mode (no product image)
    const fullPrompt = `CREATE A PROFESSIONAL ARABIC E-COMMERCE ADVERTISEMENT:

${selectedStyle}

Product/Subject: ${prompt}

${commonInstructions}

Generate a complete, scroll-stopping Arabic e-commerce ad that would perform well on Instagram/Facebook.`;

    console.log(`User ${authData?.userId} generating ad creative, style: ${style}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later.", status: 429 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits.", status: 402 }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const images = message?.images;
    
    if (!images || images.length === 0) {
      console.error("No images in response:", JSON.stringify(data));
      throw new Error("No image was generated. Please try a different prompt.");
    }

    const imageUrl = images[0]?.image_url?.url;

    console.log(`Successfully generated ad creative for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        imageUrl,
        description: message?.content || "",
        mode: "generate",
        style: style
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
