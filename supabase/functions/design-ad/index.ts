const serve = (handler: (req: Request) => Promise<Response>) => {
  Deno.serve(handler);
};
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const { data: authData, error: authError } = await validateAuth(req);
  if (authError) {
    return authError;
  }

  console.log(`Authenticated user: ${authData?.userId}`);

  try {
    const { productImageUrl, referenceImageUrl, prompt, designMethod, size, transparent } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`User ${authData?.userId} generating ad design with:`, { prompt, designMethod, size, transparent });

    // Build the content array with images and text
    const content: any[] = [];

    // Build a detailed prompt based on design method
    let fullPrompt = prompt;
    
    if (designMethod === "replace" && referenceImageUrl) {
      fullPrompt = `You are a professional product photographer. Take the product from the first image and place it into the scene/background from the second (reference) image. 
      
Instructions:
- Maintain the exact same lighting, shadows, and atmosphere from the reference image
- The product should look naturally placed in the scene
- Keep the product's proportions and details accurate
- Match the color grading and style of the reference image

Additional instructions: ${prompt}`;
    } else {
      fullPrompt = `You are a professional product photographer and advertising designer. Create a stunning product advertisement image.

Instructions:
- Create a professional, high-quality product photography
- Use appropriate lighting and shadows
- Make it suitable for e-commerce and social media advertising
- Size: ${size || '1024x1024'}
${transparent ? '- Use a transparent/clean background suitable for PNG export' : ''}

Style instructions: ${prompt}`;
    }

    content.push({
      type: 'text',
      text: fullPrompt
    });

    // Add product image (required)
    if (productImageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: productImageUrl
        }
      });
    }

    // Add reference image if provided and using replace method
    if (referenceImageUrl && designMethod === "replace") {
      content.push({
        type: 'image_url',
        image_url: {
          url: referenceImageUrl
        }
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`AI response received for user ${authData?.userId}`);

    const textContent = data.choices?.[0]?.message?.content || '';
    const images = data.choices?.[0]?.message?.images || [];

    console.log(`Successfully generated ad design for user ${authData?.userId}, images count: ${images.length}`);

    return new Response(JSON.stringify({ 
      success: true,
      text: textContent,
      images: images.map((img: any) => img.image_url?.url)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating ad design:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
