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
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");

    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    // ============================================
    // IMAGE STUDIO - Professional MENA E-commerce Ad Creatives
    // Using Replicate FLUX for high-quality image generation
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

    // Build the complete prompt
    const fullPrompt = `${selectedStyle}

Product: ${prompt}

CRITICAL REQUIREMENTS:
- Professional MARKETING ADVERTISEMENT, not just product photo
- Include beautiful Arabic text overlays (right-to-left)
- Use elegant Arabic fonts
- Complete social media ad ready for Meta Ads
- 4K resolution, vibrant colors, eye-catching design
- Arabic text integrated naturally into the design`;

    console.log(`User ${authData?.userId} generating with Replicate FLUX, style: ${style}`);

    // Use FLUX Schnell for fast high-quality generation
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
        input: {
          prompt: fullPrompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90,
          num_inference_steps: 4
        }
      })
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error("Replicate API error:", replicateResponse.status, errorText);
      
      if (replicateResponse.status === 401) {
        throw new Error("Invalid Replicate API token");
      }
      if (replicateResponse.status === 402) {
        throw new Error("Replicate payment required - add credits to your account");
      }
      throw new Error(`Replicate API error: ${replicateResponse.status}`);
    }

    let prediction = await replicateResponse.json();
    console.log("Initial prediction:", prediction.status);

    // If prediction is not completed, poll for result
    if (prediction.status !== "succeeded" && prediction.status !== "failed") {
      const maxAttempts = 60;
      let attempts = 0;
      
      while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(prediction.urls.get, {
          headers: {
            "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
          }
        });
        
        if (!pollResponse.ok) {
          throw new Error(`Failed to poll prediction: ${pollResponse.status}`);
        }
        
        prediction = await pollResponse.json();
        attempts++;
        console.log(`Poll attempt ${attempts}: ${prediction.status}`);
      }
    }

    if (prediction.status === "failed") {
      console.error("Prediction failed:", prediction.error);
      throw new Error(prediction.error || "Image generation failed");
    }

    if (prediction.status !== "succeeded") {
      throw new Error("Image generation timed out");
    }

    const imageUrl = prediction.output?.[0];
    
    if (!imageUrl) {
      throw new Error("No image was generated");
    }

    console.log(`Successfully generated image for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        imageUrl,
        description: `Professional ${style} advertisement generated with FLUX`,
        mode: productImage ? "edit" : "generate",
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
