import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { data: authData, error: authError } = await validateAuth(req);
  if (authError) {
    return authError;
  }

  try {
    const { toolType, input, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing ${toolType} for user ${authData?.userId}`);

    const langInstruction = language === 'ar' 
      ? "Output in Arabic (Professional marketing Arabic)." 
      : "Output in English (Professional marketing English).";

    let systemRole = "";
    let userPrompt = "";

    switch (toolType) {
      case "product-copy":
        systemRole = `You are an expert e-commerce copywriter specialized in high-converting product content.

Generate 3 variations for EACH output type to enable A/B testing.
${langInstruction}

IMPORTANT: Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "title": {
    "variations": ["Title variation 1", "Title variation 2", "Title variation 3"]
  },
  "description": {
    "variations": ["Description 1 (2-3 paragraphs)", "Description 2", "Description 3"]
  },
  "bullets": {
    "variations": [
      ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
      ["Feature 1 alt", "Feature 2 alt", "Feature 3 alt", "Feature 4 alt"],
      ["Feature 1 v3", "Feature 2 v3", "Feature 3 v3", "Feature 4 v3"]
    ]
  },
  "benefits": {
    "variations": [
      ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
      ["Benefit 1 alt", "Benefit 2 alt", "Benefit 3 alt", "Benefit 4 alt"],
      ["Benefit 1 v3", "Benefit 2 v3", "Benefit 3 v3", "Benefit 4 v3"]
    ]
  },
  "cta": {
    "variations": ["CTA 1", "CTA 2", "CTA 3"]
  }
}

Focus on:
- Strong emotional triggers
- Pain points → Solutions
- Social proof elements
- Urgency and scarcity when appropriate
- SEO-optimized naturally`;

        userPrompt = `Generate product copy with the following details:

Product Name: ${input.productName}
Product Description: ${input.productDescription}
Target Audience: ${input.targetAudience || "General audience"}
Tone of Voice: ${input.tone || "professional"}
${input.usps?.filter(Boolean).length > 0 ? `Unique Selling Points:
${input.usps.filter(Boolean).map((u: string, i: number) => `${i+1}. ${u}`).join('\n')}` : ''}
${input.price ? `Price: ${input.price}` : ''}
${input.offer ? `Special Offer: ${input.offer}` : ''}
Platform: ${input.platform || "E-commerce website"}
${input.keywords ? `SEO Keywords to include naturally: ${input.keywords}` : ''}
${input.preferredCTA ? `Preferred CTA Style: ${input.preferredCTA}` : ''}
Content Length: ${input.contentLength || "medium"}

Generate 3 compelling variations for each output type. Return ONLY raw JSON, no markdown.`;
        break;

      case "ads-copy":
        systemRole = `You are a Meta & Google Ads expert specializing in high-CTR ad copy.
${langInstruction}

Return ONLY valid JSON (no markdown) with 3 ad variations:
{
  "variations": [
    {"headline": "Hook 1 (max 40 chars)", "primaryText": "Ad copy 1 with emoji", "cta": "Buy Now"},
    {"headline": "Hook 2", "primaryText": "Ad copy 2", "cta": "Shop Now"},
    {"headline": "Hook 3", "primaryText": "Ad copy 3", "cta": "Get Offer"}
  ]
}`;
        userPrompt = `Product: ${input.productName}
Platform: ${input.platform || "Facebook/Instagram"}
Goal: ${input.goal || "Sales"}
Target: ${input.targetAudience || "General"}

Return ONLY raw JSON, no markdown.`;
        break;

      default:
        throw new Error(`Tool type "${toolType}" not supported`);
    }

    // Use Lovable AI Gateway instead of OpenAI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemRole },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway Error:", response.status, errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from the response (handle markdown code blocks if present)
    let result;
    try {
      // Try to extract JSON from markdown code block if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log(`✅ Generated ${toolType} for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
