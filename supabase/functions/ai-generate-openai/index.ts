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

  console.log(`Authenticated user: ${authData?.userId}`);

  try {
    const { toolType, input, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing ${toolType} request for user ${authData?.userId} with language: ${language}`);

    let systemRole = "";
    let userPrompt = "";

    const langInstruction = language === 'ar' 
      ? "Output language: Arabic (Professional, persuasive marketing Arabic)." 
      : "Output language: English (Native, professional marketing English).";

    switch (toolType) {
      case "product-copy":
        systemRole = `You are a world-class Copywriter & CRO Expert.
Your goal is to write product descriptions that SELL directly.
Focus on: Pain points, Benefits, and Emotional triggers.
${langInstruction}

RETURN JSON ONLY with keys: "title", "description", "bullets", "benefits", "cta".`;

        userPrompt = `Product: ${input.productName}
Description Notes: ${input.productDescription}
Target Audience: ${input.targetAudience}
Tone: ${input.tone}

Return ONLY valid JSON.`;
        break;

      case "ads-copy":
        systemRole = `You are a Meta & Google Ads Expert.
Create high-converting ad copy with strong hooks and clear CTAs.
${langInstruction}
RETURN JSON ONLY with keys: "primaryText", "headline", "description".`;

        userPrompt = `Product: ${input.productName}
Platform: ${input.platform || "Facebook/Instagram"}
Goal: ${input.goal || "Sales"}

Return ONLY valid JSON.`;
        break;
        
      default:
        throw new Error("Tool type not supported yet");
    }

    console.log(`Calling Lovable AI Gateway for ${toolType}`);

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: language === 'ar' ? 'تم تجاوز الحد المسموح، حاول لاحقاً' : 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: language === 'ar' ? 'يرجى إضافة رصيد للمتابعة' : 'Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway Error:", response.status, errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from the response
    let result;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log(`Successfully generated ${toolType} content for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});