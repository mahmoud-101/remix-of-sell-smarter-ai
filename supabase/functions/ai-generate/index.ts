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
    const payload = await req.json();
    const toolType: string | undefined = payload?.toolType ?? payload?.type;
    const input = payload?.input ?? payload;
    const language = payload?.language;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing ${toolType} for user ${authData?.userId}`);

    const langInstruction = language === 'ar' 
      ? "Output in Arabic (Professional marketing Arabic)." 
      : "Output in English (Professional marketing English).";

    const segmentContext = language === 'ar'
      ? `Segment Context:\n- Audience: Shopify/DTC fashion brands in MENA (EG/KSA/UAE)\n- Primary channel: Meta Ads\n- Goal: higher CTR + CVR + AOV with premium fashion tone\n- Constraints: Arabic-first, COD-friendly, size/fit concerns, trust signals`
      : `Segment Context:\n- Audience: Shopify/DTC fashion brands in MENA (EG/KSA/UAE)\n- Primary channel: Meta Ads\n- Goal: higher CTR + CVR + AOV with premium fashion tone\n- Constraints: Arabic-first market, COD objections, size/fit concerns`;

    let systemRole = "";
    let userPrompt = "";
    let model = "google/gemini-2.5-flash";
    let temperature = 0.7;
    let maxTokens = 1800;
    let toolSchema: any | null = null;
    const toolName = "return_payload";

    switch (toolType) {
      case "shopify-studio":
        systemRole = `You are a premium Shopify product content specialist for Fashion brands.

${segmentContext}

You MUST produce PREMIUM bilingual output: Arabic (simplified Fusha) + English.
Always include COD default + prepaid option + clear returns policy cues.

Return ONLY valid JSON with EXACT structure:
{
  "shopifyTitle": {"ar": "...", "en": "..."},
  "meta": {"title": "...", "description": "..."},
  "description": {"ar": "...", "en": "..."},
  "variants": {
    "options": [
      {"name": "Size", "values": ["..."]},
      {"name": "Color", "values": ["..."]}
    ]
  },
  "altTexts": ["..."],
  "jsonLd": "{...}"
}

Rules:
- Shopify title: short, premium, product-type-first.
- Meta title: 55–70 chars. Meta description: 140–170 chars.
- Description: around ~2000 chars combined; use \\n for line breaks.
- Variants: infer sizes + colors; include modest indicators if relevant.
- Alt texts: 6–10 lines, descriptive, in English for SEO.
- jsonLd: Product schema as a SINGLE-LINE JSON string.`;

        userPrompt = `Create premium Shopify content.

Tone: ${input.tone || "luxury"}
Product URL: ${input.productUrl || ""}
Extracted product data: ${JSON.stringify(input.productData || {}, null, 0)}

Focus on: fabric, fit, sizing reassurance, modest styling notes, MENA trust signals.
Return ONLY raw JSON.`;

        temperature = 0.55;
        maxTokens = 2200;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["shopifyTitle", "meta", "description", "variants", "altTexts", "jsonLd"],
          properties: {
            shopifyTitle: {
              type: "object",
              additionalProperties: false,
              required: ["ar", "en"],
              properties: { ar: { type: "string" }, en: { type: "string" } },
            },
            meta: {
              type: "object",
              additionalProperties: false,
              required: ["title", "description"],
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
            },
            description: {
              type: "object",
              additionalProperties: false,
              required: ["ar", "en"],
              properties: { ar: { type: "string" }, en: { type: "string" } },
            },
            variants: {
              type: "object",
              additionalProperties: false,
              required: ["options"],
              properties: {
                options: {
                  type: "array",
                  minItems: 1,
                  maxItems: 3,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["name", "values"],
                    properties: {
                      name: { type: "string" },
                      values: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 12 },
                    },
                  },
                },
              },
            },
            altTexts: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 10 },
            jsonLd: { type: "string" },
          },
        };
        break;

      case "reels-script":
        systemRole = `You are a viral fashion Reels/TikTok scriptwriter for MENA fashion brands.

${segmentContext}
${langInstruction}

Create 3 viral short-form video scripts optimized for fashion products.
Each script MUST be ready for AI video generation tools like Kling AI.

Return ONLY valid JSON with EXACT structure:
{
  "scripts": [
    {
      "hook": "First 1-3 seconds attention grabber (Arabic/English based on language)",
      "scenes": [
        {"duration": "2s", "visual": "Description of what to show", "text_overlay": "Text on screen", "voiceover": "What to say"},
        {"duration": "3s", "visual": "...", "text_overlay": "...", "voiceover": "..."}
      ],
      "cta": "Clear call to action",
      "music_style": "Trending/Arabic pop/Aesthetic/etc",
      "total_duration": "15s"
    }
  ],
  "viral_tips": ["tip1", "tip2", "tip3"],
  "hashtags": ["#fashion", "#ootd", "..."]
}

Rules:
- Hook must stop scrolling in 1-3 seconds
- Each scene has: duration, visual description, text overlay, voiceover
- Total duration: 15-30 seconds
- Include trending hooks for fashion (transformation, reveal, GRWM)
- Add Arabic hashtags for MENA reach`;

        userPrompt = `Create 3 viral Reels scripts for this fashion product:

Product Name: ${input.productName || "Fashion item"}
Product Description: ${input.productDescription || ""}
Style/Vibe: ${input.style || "trendy"}
Target Duration: ${input.duration || "15-30"} seconds

Make it perfect for Kling AI / Runway video generation.
Return ONLY raw JSON.`;

        temperature = 0.75;
        maxTokens = 2000;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["scripts", "viral_tips", "hashtags"],
          properties: {
            scripts: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["hook", "scenes", "cta", "music_style", "total_duration"],
                properties: {
                  hook: { type: "string" },
                  scenes: {
                    type: "array",
                    minItems: 3,
                    maxItems: 8,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["duration", "visual", "text_overlay", "voiceover"],
                      properties: {
                        duration: { type: "string" },
                        visual: { type: "string" },
                        text_overlay: { type: "string" },
                        voiceover: { type: "string" }
                      }
                    }
                  },
                  cta: { type: "string" },
                  music_style: { type: "string" },
                  total_duration: { type: "string" }
                }
              }
            },
            viral_tips: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
            hashtags: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 15 }
          }
        };
        break;

      case "product-copy":
        systemRole = `You are an expert e-commerce copywriter for high-converting product content.

${segmentContext}

Generate 3 variations for EACH output type.
${langInstruction}

Return ONLY valid JSON:
{
  "title": {"variations": ["Title 1", "Title 2", "Title 3"]},
  "description": {"variations": ["Desc 1", "Desc 2", "Desc 3"]},
  "bullets": {"variations": [["F1","F2","F3","F4"], ["F1","F2","F3","F4"], ["F1","F2","F3","F4"]]},
  "benefits": {"variations": [["B1","B2","B3","B4"], ["B1","B2","B3","B4"], ["B1","B2","B3","B4"]]},
  "cta": {"variations": ["CTA1", "CTA2", "CTA3"]}
}`;

        userPrompt = `Generate product copy:

Product Name: ${input.productName}
Product Description: ${input.productDescription}
Target Audience: ${input.targetAudience || "General audience"}
Tone: ${input.tone || "professional"}
${input.usps?.filter(Boolean).length > 0 ? `USPs: ${input.usps.filter(Boolean).join(', ')}` : ''}
${input.price ? `Price: ${input.price}` : ''}

Return ONLY raw JSON.`;
        temperature = 0.7;
        maxTokens = 2000;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["title", "description", "bullets", "benefits", "cta"],
          properties: {
            title: {
              type: "object",
              additionalProperties: false,
              required: ["variations"],
              properties: { variations: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 } }
            },
            description: {
              type: "object",
              additionalProperties: false,
              required: ["variations"],
              properties: { variations: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 } }
            },
            bullets: {
              type: "object",
              additionalProperties: false,
              required: ["variations"],
              properties: {
                variations: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } }
                }
              }
            },
            benefits: {
              type: "object",
              additionalProperties: false,
              required: ["variations"],
              properties: {
                variations: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } }
                }
              }
            },
            cta: {
              type: "object",
              additionalProperties: false,
              required: ["variations"],
              properties: { variations: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 } }
            }
          }
        };
        break;

      case "ads-copy":
        systemRole = `You are a Meta Ads expert for high-CTR fashion ad copy.
${segmentContext}
${langInstruction}

Return ONLY valid JSON with 3 ad variations:
{
  "variations": [
    {"headline": "Hook (max 40 chars)", "primaryText": "Ad copy with emoji", "cta": "Buy Now"},
    {"headline": "Hook 2", "primaryText": "Ad copy 2", "cta": "Shop Now"},
    {"headline": "Hook 3", "primaryText": "Ad copy 3", "cta": "Get Offer"}
  ]
}`;
        userPrompt = `Create 3 high-performing ad variations.

Product: ${input.productName || ""}
Description: ${input.productDescription || ""}
Platform: ${input.platform || "Facebook/Instagram"}
Goal: ${input.goal || "Sales"}

Return ONLY raw JSON.`;
        temperature = 0.75;
        maxTokens = 1200;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["variations"],
          properties: {
            variations: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["headline", "primaryText", "cta"],
                properties: {
                  headline: { type: "string" },
                  primaryText: { type: "string" },
                  cta: { type: "string" }
                }
              }
            }
          }
        };
        break;

      case "video-script":
        systemRole = `You are a viral short-form video scriptwriter for TikTok/Reels.
${segmentContext}
${langInstruction}

Write 3 distinct scripts. Each script MUST have:
- hook (first 1–3 seconds)
- body (beats/scenes)
- cta (single clear action)

Return ONLY valid JSON:
{
  "scripts": [{"hook": "...", "body": "...", "cta": "..."}],
  "viral_elements": ["..."],
  "best_posting_times": ["..."]
}`;
        userPrompt = `Create 3 viral scripts.

Product Name: ${input.productName || ""}
Description: ${input.productDescription || ""}
Platform: ${input.platform || "tiktok"}
Duration: ${input.duration || "30"}s

Return ONLY raw JSON.`;
        temperature = 0.65;
        maxTokens = 1800;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["scripts", "viral_elements", "best_posting_times"],
          properties: {
            scripts: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["hook", "body", "cta"],
                properties: {
                  hook: { type: "string" },
                  body: { type: "string" },
                  cta: { type: "string" }
                }
              }
            },
            viral_elements: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
            best_posting_times: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 }
          }
        };
        break;

      case "seo-optimizer":
        systemRole = `You are an e-commerce SEO specialist.
${segmentContext}
${langInstruction}

Return ONLY valid JSON:
{
  "title": "SEO title (55–70 chars)",
  "description": "Meta description (140–170 chars)",
  "keywords": ["keyword1", "keyword2", "..."]
}`;
        userPrompt = `Optimize SEO for:

Title: ${input.productTitle || ""}
Description: ${input.productDescription || ""}
Category: ${input.category || ""}

Return ONLY raw JSON.`;
        temperature = 0.5;
        maxTokens = 700;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["title", "description", "keywords"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            keywords: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 }
          }
        };
        break;

      case "product":
        systemRole = `You are an expert e-commerce copywriter.
${segmentContext}
${langInstruction}

Return ONLY valid JSON:
{
  "variations": [
    {"title": "...", "description": "...", "bullets": ["...", "...", "...", "..."]}
  ]
}`;
        userPrompt = `Generate 3 improved product variations for:

Product Name: ${input.productName || ""}
Description: ${input.productDescription || ""}
Tone: ${input.tone || "professional"}

Return ONLY raw JSON.`;
        temperature = 0.65;
        maxTokens = 1400;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["variations"],
          properties: {
            variations: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "description", "bullets"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  bullets: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 }
                }
              }
            }
          }
        };
        break;

      default:
        console.error(`❌ Error: Tool type "${toolType}" not supported`);
        throw new Error(`Tool type "${toolType}" not supported`);
    }

    const parseJsonLike = (raw: string) => {
      let jsonStr = raw.trim();
      const fenceMatch = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)```$/);
      if (fenceMatch) jsonStr = fenceMatch[1].trim();
      jsonStr = jsonStr.replace(/^`+|`+$/g, '').trim();

      const escapeNewlinesInsideStrings = (text: string) => {
        let out = '';
        let inString = false;
        let escaped = false;

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (!inString) {
            if (ch === '"') inString = true;
            out += ch;
            continue;
          }
          if (escaped) {
            out += ch;
            escaped = false;
            continue;
          }
          if (ch === '\\') {
            out += ch;
            escaped = true;
            continue;
          }
          if (ch === '"') {
            out += ch;
            inString = false;
            continue;
          }
          if (ch === '\n') {
            out += '\\n';
            continue;
          }
          if (ch === '\r') {
            continue;
          }
          out += ch;
        }
        return out;
      };

      jsonStr = escapeNewlinesInsideStrings(jsonStr);
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(jsonStr);
    };

    const callGateway = async (opts?: { retry?: boolean }) => {
      const retry = !!opts?.retry;

      const strictSystemAddon = retry
        ? "\n\nCRITICAL: Return COMPLETE JSON only. Keep each string single-line; use \\n for line breaks."
        : "\n\nCRITICAL: Return JSON only. Keep each string single-line; use \\n for line breaks.";

      const body: any = {
        model,
        messages: [
          { role: "system", content: systemRole + strictSystemAddon },
          { role: "user", content: userPrompt }
        ],
        temperature: retry ? Math.min(0.25, temperature) : temperature,
        max_tokens: retry ? Math.max(3500, maxTokens) : maxTokens,
      };

      if (toolSchema) {
        body.tools = [
          {
            type: "function",
            function: {
              name: toolName,
              description: "Return the structured result as JSON arguments.",
              parameters: toolSchema,
            },
          },
        ];
        body.tool_choice = { type: "function", function: { name: toolName } };
      } else {
        body.response_format = { type: "json_object" };
      }

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          console.error("Rate limit exceeded");
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (resp.status === 402) {
          console.error("Payment required");
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const errorText = await resp.text();
        console.error("AI Gateway Error:", resp.status, errorText);
        throw new Error(`AI Gateway failed: ${resp.status}`);
      }

      return resp;
    };

    let response: Response | null = null;
    let data: any = null;
    let result: any = null;
    let lastContentPreview = "";
    let finishReason: string | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      response = await callGateway({ retry: attempt === 1 });
      if (response instanceof Response && (response.status === 429 || response.status === 402)) {
        return response;
      }

      data = await (response as Response).json();
      const message = data?.choices?.[0]?.message;
      finishReason = data?.choices?.[0]?.finish_reason;

      const toolArgs: string | undefined = message?.tool_calls?.[0]?.function?.arguments;
      const content: string | undefined = typeof message?.content === 'string' ? message.content : undefined;
      const raw = toolArgs ?? content;
      lastContentPreview = (raw ?? "").slice(0, 500);

      if (!raw) {
        if (attempt === 0) continue;
        throw new Error("AI returned empty response");
      }

      try {
        result = parseJsonLike(raw);
        break;
      } catch (e) {
        console.error("JSON parse error:", e, "finish_reason:", finishReason, "Content:", lastContentPreview);
        if (attempt === 0) continue;
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    if (result === null || result === undefined) {
      console.error("❌ Error: result is empty", "finish_reason:", finishReason, "Content:", lastContentPreview);
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
