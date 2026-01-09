import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, background, reference_image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhanced prompt based on style with Arabic support
    let enhancedPrompt = prompt;
    
    const stylePrompts: Record<string, string> = {
      product: "Professional e-commerce product photo on clean white background, studio lighting, high resolution, commercial photography style",
      lifestyle: "Lifestyle product photography showing the product in real-world use, natural lighting, aesthetic composition",
      minimal: "Minimalist product shot with soft shadows, neutral background, elegant and simple presentation",
      luxury: "Luxury premium product photography, dramatic lighting, rich textures, high-end commercial style",
      creative: "Creative and artistic product visualization, unique angles, bold colors, eye-catching design",
      professional: "Professional commercial product photography, perfect lighting, sharp details",
      playful: "Playful and fun product presentation, vibrant colors, energetic mood",
      catalog: "Clean catalog-style product photo, white or neutral background, clear visibility",
    };

    const backgroundStyles: Record<string, string> = {
      white: "pure white background",
      gradient: "soft gradient background",
      studio: "professional studio backdrop with soft lighting",
      natural: "natural environment setting",
      abstract: "abstract artistic background",
      living_room: "cozy living room setting",
      office: "modern office environment",
      bathroom: "clean bathroom setting",
      outdoor: "outdoor natural environment",
      kitchen: "kitchen environment",
      custom: "",
    };

    // Check if we have a reference image for image-to-image editing
    if (reference_image) {
      // Image editing mode - keep the product, change the scene
      const editPrompt = `IMPORTANT: Keep this EXACT product unchanged - same shape, same colors, same design, same details. 
Only change the background, lighting, and scene setting.
New scene: ${stylePrompts[style] || stylePrompts.professional}. ${backgroundStyles[background] || ""}. ${prompt}.
The product must remain IDENTICAL to the original image. Do not modify the product in any way.
Ultra high quality, 4K resolution, photorealistic.`;

      console.log("Editing image with reference, prompt:", editPrompt);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
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
                    url: reference_image
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
      console.log("AI response received for image editing");

      const message = data.choices?.[0]?.message;
      const images = message?.images;
      
      if (!images || images.length === 0) {
        console.error("No images in response:", JSON.stringify(data));
        throw new Error("No image was generated. Please try a different prompt.");
      }

      const imageUrl = images[0]?.image_url?.url;
      const textContent = message?.content || "";

      console.log("Successfully edited image with reference");

      return new Response(
        JSON.stringify({ 
          imageUrl,
          description: textContent,
          mode: "edit"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Text-to-image generation mode (no reference image)
    const arabicTextInstructions = "IMPORTANT: If the prompt contains Arabic text, render it correctly with proper right-to-left direction. Arabic typography must be clear, readable, and beautifully styled. Use elegant Arabic fonts.";
    
    enhancedPrompt = `${arabicTextInstructions}. ${stylePrompts[style] || stylePrompts.product}. ${prompt}. ${backgroundStyles[background] || backgroundStyles.white}. Ultra high quality, 4K resolution.`;

    console.log("Generating image with prompt:", enhancedPrompt);

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
            content: enhancedPrompt,
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
    console.log("AI response received");

    // Extract image from response
    const message = data.choices?.[0]?.message;
    const images = message?.images;
    
    if (!images || images.length === 0) {
      console.error("No images in response:", JSON.stringify(data));
      throw new Error("No image was generated. Please try a different prompt.");
    }

    const imageUrl = images[0]?.image_url?.url;
    const textContent = message?.content || "";

    console.log("Successfully generated image");

    return new Response(
      JSON.stringify({ 
        imageUrl,
        description: textContent,
        mode: "generate"
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
