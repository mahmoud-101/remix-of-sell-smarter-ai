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
    // Backward compatible parsing:
    // - New callers send: { toolType, input, language }
    // - Some older callers send: { type, ...inputFields }
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

    let systemRole = "";
    let userPrompt = "";
    let model = "google/gemini-2.5-flash";
    let temperature = 0.8;
    let maxTokens = 2200;
    let toolSchema: any | null = null;
    const toolName = "return_payload";

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
        temperature = 0.75;
        maxTokens = 2600;
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
        userPrompt = `Create 3 high-performing ad variations.

Product: ${input.productName || ""}
Product Description: ${input.productDescription || ""}
Platform: ${input.platform || "Facebook/Instagram"}
Goal: ${input.goal || "Sales"}
Target Audience: ${input.targetAudience || "General"}

Return ONLY raw JSON, no markdown.`;
        temperature = 0.85;
        maxTokens = 1600;
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
        // IMPORTANT: The frontend expects { scripts, viral_elements, best_posting_times }
        systemRole = `You are a viral short-form video scriptwriter for TikTok/Reels.
${langInstruction}

Write 3 distinct scripts. Each script MUST have:
- hook (first 1–3 seconds)
- body (beats / scenes / what to say + what to show)
- cta (single clear action)

Return ONLY valid JSON (no markdown) with EXACT structure:
{
  "scripts": [
    {"hook": "...", "body": "...", "cta": "..."}
  ],
  "viral_elements": ["..."],
  "best_posting_times": ["..."]
}`;
        userPrompt = `Create 3 viral scripts.

Product Name: ${input.productName || ""}
Product Description: ${input.productDescription || ""}
Platform: ${input.platform || "tiktok"}
Duration (seconds): ${input.duration || "30"}
Style: ${input.style || "viral"}

Rules:
- Write in ${language === 'ar' ? 'Arabic' : 'English'}.
- Make it punchy, specific, and sales-driven.
- Include concrete filming directions inside the body (e.g., [Show close-up], [Text on screen]).

Return ONLY raw JSON, no markdown.`;
        model = "google/gemini-2.5-pro";
        temperature = 0.7;
        maxTokens = 2400;
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
        // Matches src/pages/SEOAnalyzer.tsx expectations: { title, description, keywords }
        systemRole = `You are an e-commerce SEO specialist.
${langInstruction}

Return ONLY valid JSON (no markdown) with EXACT structure:
{
  "title": "SEO product title (55–70 chars)",
  "description": "SEO meta-like product description (140–170 chars)",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
}

Rules:
- Title must include primary keyword early.
- Description must include benefit + trust cue + CTA.
- Keywords should be buyer-intent phrases (Arabic if language=ar).`;
        userPrompt = `Optimize SEO for this product:

Current Title: ${input.productTitle || ""}
Current Description: ${input.productDescription || ""}
Category: ${input.category || ""}
Target Keywords (optional): ${input.targetKeywords || ""}

Return ONLY raw JSON, no markdown.`;
        model = "google/gemini-2.5-pro";
        temperature = 0.55;
        maxTokens = 900;
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

      case "competitor":
        // Matches src/pages/CompetitorAnalysis.tsx expectations
        systemRole = `You are a competitive intelligence analyst for e-commerce.
${langInstruction}

Return ONLY valid JSON (no markdown) with EXACT structure:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "opportunities": ["..."],
  "pricingStrategy": "...",
  "messagingStyle": "..."
}

Rules:
- Be practical and actionable.
- Keep strengths/weaknesses/opportunities as 4–6 bullets each.
- If info is missing, infer cautiously and say so indirectly (no apologies).`;
        userPrompt = `Analyze this competitor:

Competitor Name: ${input.competitorName || ""}
Website: ${input.website || ""}
Description: ${input.description || ""}

My Business (optional): ${input.yourBusiness || ""}

Return ONLY raw JSON, no markdown.`;
        model = "google/gemini-2.5-pro";
        temperature = 0.35;
        maxTokens = 1800;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["strengths", "weaknesses", "opportunities", "pricingStrategy", "messagingStyle"],
          properties: {
            strengths: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
            weaknesses: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
            opportunities: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
            pricingStrategy: { type: "string" },
            messagingStyle: { type: "string" }
          }
        };
        break;

      // Backward compatibility for SyncedProducts.tsx
      case "product":
        systemRole = `You are an expert e-commerce copywriter.
${langInstruction}

Return ONLY valid JSON (no markdown) with this structure:
{
  "variations": [
    {"title": "...", "description": "...", "bullets": ["...", "...", "...", "..."]}
  ]
}`;
        userPrompt = `Generate 3 improved product title + description variations for:

Product Name: ${input.productName || ""}
Product Description: ${input.productDescription || ""}
Target Audience: ${input.targetAudience || "General"}
Tone: ${input.tone || "professional"}

Return ONLY raw JSON, no markdown.`;
        temperature = 0.75;
        maxTokens = 1800;
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

      case "seo-content":
        systemRole = `You are an SEO expert specializing in e-commerce optimization.
${langInstruction}

Return ONLY valid JSON (no markdown) with SEO-optimized content:
{
  "metaTitle": "SEO optimized title (50-60 chars)",
  "metaDescription": "SEO meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "headings": {
    "h1": "Main heading",
    "h2": ["Subheading 1", "Subheading 2"]
  },
  "altTexts": ["Image alt text 1", "Image alt text 2"],
  "urlSlug": "seo-friendly-url"
}`;
        userPrompt = `Generate SEO content for:

Product/Page: ${input.productName || input.pageName}
Description: ${input.productDescription || input.description}
Target Keywords: ${input.keywords || "auto-generate"}
Industry: ${input.industry || "E-commerce"}

Return ONLY raw JSON, no markdown.`;
        maxTokens = 2000;
        toolSchema = {
          type: "object",
          additionalProperties: false,
          required: ["metaTitle", "metaDescription", "keywords", "headings", "altTexts", "urlSlug"],
          properties: {
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            keywords: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 },
            headings: {
              type: "object",
              additionalProperties: false,
              required: ["h1", "h2"],
              properties: {
                h1: { type: "string" },
                h2: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 }
              }
            },
            altTexts: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 10 },
            urlSlug: { type: "string" }
          }
        };
        break;

      default:
        throw new Error(`Tool type "${toolType}" not supported`);
    }

    const parseJsonLike = (raw: string) => {
      let jsonStr = raw.trim();

      // Strip markdown code fences if present (```json...``` or ```...```)
      const fenceMatch = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)```$/);
      if (fenceMatch) jsonStr = fenceMatch[1].trim();

      // Some models wrap in leading/trailing backticks only
      jsonStr = jsonStr.replace(/^`+|`+$/g, '').trim();

      // Repair common "almost JSON" issues:
      // 1) Unescaped newlines inside strings (invalid JSON) -> convert to \n
      // 2) Trailing commas before } or ]
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

    // Use Lovable AI Gateway instead of OpenAI
    const callGateway = async (opts?: { retry?: boolean }) => {
      const retry = !!opts?.retry;

      const strictSystemAddon = retry
        ? "\n\nCRITICAL: Return COMPLETE JSON only. Keep each string single-line; if you need line breaks use \\n. Keep bullets short."
        : "\n\nCRITICAL: Return JSON only. Keep each string single-line; if you need line breaks use \\n. Do not add any extra keys.";

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
        // Fallback for any tool types without schemas
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

    // Attempt 1 + retry once if JSON is malformed / truncated
    let response: Response | null = null;
    let data: any = null;
    let result: any = null;
    let lastContentPreview = "";
    let finishReason: string | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      response = await callGateway({ retry: attempt === 1 });
      // If callGateway returned an early Response (429/402), return it directly.
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
