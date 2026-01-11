import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. التعامل مع CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolType, input, language } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log(`Processing ${toolType} request with language: ${language}`);

    // 2. تحديد هوية الخبير بناءً على نوع الأداة
    let systemRole = "";
    let userPrompt = "";

    // التأكد من اللغة المطلوبة
    const langInstruction = language === 'ar' 
      ? "Output language: Arabic (Professional, persuasive marketing Arabic)." 
      : "Output language: English (Native, professional marketing English).";

    switch (toolType) {
      case "product-copy":
        systemRole = `
          You are a world-class Copywriter & CRO Expert.
          Your goal is to write product descriptions that SELL directly.
          Focus on: Pain points, Benefits, and Emotional triggers.
          ${langInstruction}
          
          RETURN JSON ONLY with keys: "title", "description", "bullets", "benefits", "cta".
        `;
        userPrompt = `
          Product: ${input.productName}
          Description Notes: ${input.productDescription}
          Target Audience: ${input.targetAudience}
          Tone: ${input.tone}
        `;
        break;

      case "ads-copy":
        systemRole = `
          You are a Meta & Google Ads Expert.
          Create high-converting ad copy with strong hooks and clear CTAs.
          ${langInstruction}
          RETURN JSON ONLY with keys: "primaryText", "headline", "description".
        `;
        userPrompt = `
          Product: ${input.productName}
          Platform: ${input.platform || "Facebook/Instagram"}
          Goal: ${input.goal || "Sales"}
        `;
        break;
        
      // يمكنك إضافة cases لباقي الأدوات هنا بنفس الطريقة
      
      default:
        throw new Error("Tool type not supported yet");
    }

    console.log(`Calling OpenAI with system role for ${toolType}`);

    // 3. الاتصال بـ OpenAI (GPT-4o)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemRole },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI Error:", data.error);
      throw new Error(data.error.message);
    }

    const result = JSON.parse(data.choices[0].message.content);
    console.log(`Successfully generated ${toolType} content`);

    // 4. إرجاع النتيجة للفرونت-إند
    return new Response(
      JSON.stringify({ result: result }),
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
