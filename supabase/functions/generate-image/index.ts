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
    const { prompt, style, productImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ============================================
    // IMAGE STUDIO - Uses Gemini 3 Pro Image for best quality
    // Best for: Product photography, ad creatives, professional images
    // ============================================

    // Style-specific professional photography prompts
    const stylePrompts: Record<string, string> = {
      lifestyle: `Professional lifestyle product photography. Natural daylight streaming through windows, 
        warm and inviting atmosphere, product placed in elegant real-world setting, 
        shallow depth of field, lifestyle magazine quality, aspirational mood, 
        soft shadows, warm color palette, 4K commercial photography`,
      
      flatlay: `Professional flat lay product photography. Top-down bird's eye view, 
        carefully curated arrangement on marble or textured surface, 
        complementary props and accessories, balanced composition, 
        soft diffused lighting, Instagram-worthy aesthetic, 
        clean negative space, high-end editorial style`,
      
      model: `High-fashion editorial product photography. Elegant model wearing/holding the product, 
        professional studio lighting with soft key light and fill, 
        fashion magazine cover quality, confident pose, 
        neutral or gradient background, luxury brand aesthetic, 
        sharp focus on product, beautiful bokeh, 4K resolution`,
      
      studio: `Clean professional studio product photography. Pure white seamless background, 
        perfect three-point lighting setup, commercial catalog quality, 
        sharp product details, no shadows or minimal soft shadows, 
        e-commerce ready, color accurate, packshot style, 
        high key lighting, 4K product photography`,
      
      minimal: `Minimalist luxury product photography. Simple elegant composition, 
        single product focus, subtle soft shadows, 
        neutral beige or soft gray background, 
        Scandinavian design aesthetic, breathing room, 
        refined and sophisticated, premium brand quality, 
        soft gradient lighting, artistic negative space`
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.lifestyle;

    // Check if we have a product image for image-to-image editing
    if (productImage && productImage.startsWith('data:image')) {
      // Image editing mode - enhance the product with selected style
      const editPrompt = `CRITICAL INSTRUCTIONS FOR IMAGE EDITING:
1. Keep the EXACT product from the reference image - same shape, colors, design, details
2. Only change the BACKGROUND and LIGHTING to match this style:

${selectedStyle}

Product context from user: ${prompt}

Requirements:
- The product MUST remain IDENTICAL to the original
- Create a professional advertising-quality background
- Add appropriate lighting and shadows for the new scene
- Maintain product proportions and colors exactly
- Result should look like a professional product photoshoot
- Ultra high quality, 4K resolution, commercial photography standard`;

      console.log(`User ${authData?.userId} editing product image with style: ${style}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview", // Best for image editing
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
            JSON.stringify({ error: "Payment required. Please add credits to your workspace.", status: 402 }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`AI response received for image editing for user ${authData?.userId}`);

      const message = data.choices?.[0]?.message;
      const images = message?.images;
      
      if (!images || images.length === 0) {
        console.error("No images in response:", JSON.stringify(data));
        throw new Error("No image was generated. Please try a different prompt.");
      }

      const imageUrl = images[0]?.image_url?.url;
      const textContent = message?.content || "";

      console.log(`Successfully edited image with style ${style} for user ${authData?.userId}`);

      return new Response(
        JSON.stringify({ 
          imageUrl,
          description: textContent,
          mode: "edit",
          style: style
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Text-to-image generation mode (no product image)
    const arabicTextInstructions = `IMPORTANT INSTRUCTIONS:
- If the prompt contains Arabic text, render it correctly with proper right-to-left direction
- Arabic typography must be clear, readable, and beautifully styled
- Use elegant Arabic calligraphy or modern Arabic fonts as appropriate`;
    
    const fullPrompt = `${arabicTextInstructions}

CREATE A PROFESSIONAL PRODUCT ADVERTISEMENT IMAGE:

Style: ${selectedStyle}

Product: ${prompt}

Additional Requirements:
- Commercial advertising quality
- Perfect for Meta Ads / Instagram
- Eye-catching and scroll-stopping
- Professional color grading
- Sharp focus and high detail
- 4K resolution output`;

    console.log(`User ${authData?.userId} generating image with style: ${style}, prompt: ${prompt}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview", // Best for image generation
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
          JSON.stringify({ error: "Payment required. Please add credits to your workspace.", status: 402 }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`AI response received for user ${authData?.userId}`);

    // Extract image from response
    const message = data.choices?.[0]?.message;
    const images = message?.images;
    
    if (!images || images.length === 0) {
      console.error("No images in response:", JSON.stringify(data));
      throw new Error("No image was generated. Please try a different prompt.");
    }

    const imageUrl = images[0]?.image_url?.url;
    const textContent = message?.content || "";

    console.log(`Successfully generated image with style ${style} for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        imageUrl,
        description: textContent,
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
