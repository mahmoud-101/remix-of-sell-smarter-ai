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
    const preferredProvider = payload?.provider || "lovable"; // "lovable" or "openrouter"
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    // Check API key availability based on provider
    if (preferredProvider === "openrouter" && !OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }
    if (preferredProvider === "lovable" && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing ${toolType} for user ${authData?.userId} via ${preferredProvider}`);

    const langInstruction = language === 'ar' 
      ? "Output in Arabic (Professional marketing Arabic - Simplified Fusha)." 
      : "Output in English (Professional marketing English).";

    const segmentContext = language === 'ar'
      ? `🎯 SEGMENT CONTEXT:
- Market: Fashion & Beauty E-commerce in MENA (Egypt, Saudi Arabia, UAE)
- Platform Focus: Meta Ads (Facebook/Instagram) as primary channel
- Business Model: Shopify/Salla stores with COD + Prepaid options
- Goals: Maximize CTR, CVR, and AOV with premium fashion positioning
- Audience: Women 18-45, fashion-conscious, value quality and trust
- Cultural: Arabic-first, modest fashion friendly, size/fit reassurance critical
- Trust Signals: Easy returns, COD available, genuine products, fast shipping`
      : `🎯 SEGMENT CONTEXT:
- Market: Fashion & Beauty E-commerce in MENA (Egypt, Saudi Arabia, UAE)
- Platform Focus: Meta Ads (Facebook/Instagram) as primary channel
- Business Model: Shopify/Salla stores with COD + Prepaid options
- Goals: Maximize CTR, CVR, and AOV with premium fashion positioning
- Audience: Women 18-45, fashion-conscious, value quality and trust
- Cultural: Arabic-first market, modest fashion friendly, size concerns
- Trust Signals: Easy returns, COD available, genuine products, fast shipping`;

    let systemRole = "";
    let userPrompt = "";
    // Model selection per tool type for optimal results
    let model = "google/gemini-2.5-flash"; // Default fast model
    let openRouterModel = "google/gemini-2.5-flash-preview-05-20"; // OpenRouter equivalent
    let temperature = 0.7;
    let maxTokens = 2000;
    let toolSchema: any | null = null;
    const toolName = "return_payload";

    switch (toolType) {
      // ============================================
      // PRODUCT STUDIO - Uses Gemini 2.5 Pro for deep product analysis
      // Best for: Complex content generation, bilingual output, structured data
      // ============================================
      case "shopify-studio":
        model = "google/gemini-2.5-pro"; // Pro for comprehensive product content
        openRouterModel = "google/gemini-2.5-pro-preview-05-06"; // OpenRouter Pro equivalent
        
        systemRole = `You are an ELITE Shopify content strategist for premium Fashion & Beauty brands in the MENA market.

${segmentContext}

🎯 YOUR MISSION: Create CONVERSION-OPTIMIZED bilingual content that drives sales.

📋 OUTPUT REQUIREMENTS:
You MUST return ONLY valid JSON with this EXACT structure:
{
  "shopifyTitle": {"ar": "عنوان عربي قصير وجذاب", "en": "Short catchy English title"},
  "meta": {
    "title": "SEO title 55-70 chars with main keyword",
    "description": "Meta description 140-170 chars with value proposition and CTA"
  },
  "description": {
    "ar": "وصف عربي شامل مع\\n- تفاصيل القماش\\n- معلومات المقاسات\\n- تعليمات العناية\\n- ضمان الجودة",
    "en": "Comprehensive English description with\\n- Fabric details\\n- Sizing info\\n- Care instructions\\n- Quality guarantee"
  },
  "variants": {
    "options": [
      {"name": "Size", "values": ["S", "M", "L", "XL", "XXL"]},
      {"name": "Color", "values": ["color1", "color2"]}
    ]
  },
  "altTexts": ["6-10 descriptive alt texts for SEO", "..."],
  "jsonLd": "{\\\"@context\\\":\\\"https://schema.org\\\",\\\"@type\\\":\\\"Product\\\"...}"
}

✨ CONTENT EXCELLENCE STANDARDS:
1. SHOPIFY TITLE: Premium, product-type-first, max 70 chars
2. META: SEO-optimized with primary keywords and emotional triggers
3. DESCRIPTION: 
   - Start with compelling hook
   - Include fabric/material details
   - Size guide with Arabic measurements
   - Styling tips for modest fashion
   - Trust signals (returns, COD, authenticity)
   - Use \\n for line breaks
4. VARIANTS: Infer realistic sizes (XS-XXL for Saudi, S-XL for Egypt) and colors
5. ALT TEXTS: Descriptive, keyword-rich, accessibility-focused
6. JSON-LD: Complete Product schema as single-line valid JSON string

${langInstruction}`;

        userPrompt = `🛍️ CREATE PREMIUM SHOPIFY CONTENT FOR:

📦 PRODUCT INFORMATION:
- Name: ${input.productName || "Fashion Product"}
- Category: ${input.category || "Fashion"}
- Description: ${input.productDescription || "Premium fashion item"}
- Key Features: ${input.keyFeatures || "High quality materials"}
- Target Audience: ${input.targetAudience || "Fashion-conscious women 25-45"}
- Price Range: ${input.priceRange || "Premium"}
- Tone: ${input.tone || "luxury"}

🎯 FOCUS AREAS:
- Fabric and material quality emphasis
- Size and fit reassurance (critical for MENA)
- Modest styling compatibility
- COD trust signals
- Arabic cultural relevance

Return ONLY the JSON object. No markdown, no explanations.`;

        temperature = 0.5;
        maxTokens = 3000;
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

      // ============================================
      // ADS STUDIO - Uses GPT-5-mini for creative ad copy
      // Best for: Emotional hooks, persuasive copy, viral potential
      // ============================================
      case "ads-copy":
        model = "openai/gpt-5-mini"; // GPT for creative, emotional ad copy
        openRouterModel = "anthropic/claude-sonnet-4"; // OpenRouter creative equivalent
        
        systemRole = `You are a TOP-TIER Meta Ads copywriter specializing in Fashion & Beauty for the MENA market.

${segmentContext}

🎯 YOUR MISSION: Create SCROLL-STOPPING ads that convert browsers into buyers.

📋 OUTPUT REQUIREMENTS:
Return ONLY valid JSON with this EXACT structure:
{
  "variations": [
    {
      "headline": "🔥 Attention-grabbing hook (max 40 chars)",
      "primaryText": "Compelling ad copy with emojis, social proof, urgency, and clear value proposition. Include pain point → solution → benefit → CTA flow. 3-5 lines.",
      "cta": "Action Button Text",
      "hook_type": "curiosity/fear/desire/social_proof",
      "estimated_ctr": "high/medium"
    }
  ]
}

✨ AD EXCELLENCE STANDARDS:

🎣 HOOK FORMULAS (use different ones for each variation):
1. Curiosity Gap: "The secret behind..."
2. Social Proof: "10,000+ women already..."
3. Transformation: "From ordinary to stunning..."
4. Question: "Still struggling with...?"
5. Urgency: "Last 24 hours..."
6. Direct Benefit: "Look 5 years younger..."

📝 PRIMARY TEXT STRUCTURE:
- Line 1: Hook that addresses pain point
- Line 2-3: Solution with unique selling points
- Line 4: Social proof or urgency
- Line 5: Clear CTA with offer

🎯 CTA OPTIONS:
- "تسوقي الآن" / "Shop Now"
- "احصلي عليه" / "Get Yours"
- "اطلبي الآن" / "Order Now"
- "جربيه اليوم" / "Try It Today"

Platform: ${input.platform || "Facebook/Instagram"}
Goal: ${input.goal || "conversions"}

${langInstruction}`;

        userPrompt = `📢 CREATE 3 HIGH-CONVERTING ADS FOR:

📦 PRODUCT:
- Name: ${input.productName || "Fashion Product"}
- Description: ${input.productDescription || "Premium fashion item"}
- Key Benefits: ${input.keyBenefits || "High quality, stylish design"}
- Target Audience: ${input.targetAudience || "Fashion-conscious women"}
- Offer/Price: ${input.priceOffer || "Special offer available"}

🎯 CAMPAIGN:
- Platform: ${input.platform || "Facebook/Instagram"}
- Goal: ${input.goal || "conversions"}

⚡ REQUIREMENTS:
1. Each ad MUST use a DIFFERENT hook type
2. Variation 1: Urgency/Scarcity focus
3. Variation 2: Social Proof/Transformation focus
4. Variation 3: Direct Benefit/Solution focus
5. Include relevant emojis (but not excessive)
6. Make CTAs action-oriented and platform-appropriate

Return ONLY the JSON object.`;

        temperature = 0.75;
        maxTokens = 2000;
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
                  cta: { type: "string" },
                  hook_type: { type: "string" },
                  estimated_ctr: { type: "string" }
                }
              }
            }
          }
        };
        break;

      // ============================================
      // REELS STUDIO - Uses GPT-5 for viral creative scripts
      // Best for: Trend awareness, storytelling, visual descriptions
      // ============================================
      case "reels-script":
        model = "openai/gpt-5"; // Full GPT-5 for complex creative scripts
        openRouterModel = "anthropic/claude-sonnet-4"; // OpenRouter creative equivalent
        
        systemRole = `You are a VIRAL content strategist specializing in Fashion/Beauty Reels for the MENA market.

${segmentContext}

🎯 YOUR MISSION: Create VIRAL-WORTHY scripts optimized for Kling AI / Runway / CapCut video generation.

📋 OUTPUT REQUIREMENTS:
Return ONLY valid JSON with this EXACT structure:
{
  "scripts": [
    {
      "title": "Script concept name",
      "hook": "EXACT words/action for first 1-3 seconds that STOPS scrolling",
      "scenes": [
        {
          "scene_number": 1,
          "duration": "2s",
          "visual": "DETAILED visual description for AI video generation",
          "camera": "Camera movement (zoom in, pan left, static, etc.)",
          "text_overlay": "Text shown on screen",
          "voiceover": "Narration/VO script",
          "sound_effect": "Specific sound or music cue"
        }
      ],
      "cta": "Call to action at the end",
      "music_style": "Specific music recommendation",
      "total_duration": "15s",
      "viral_potential": "Why this will go viral",
      "trend_reference": "Current trend this taps into"
    }
  ],
  "viral_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "hashtags": ["#trending", "#fashion", "..."],
  "best_posting_times": ["Time 1 for MENA", "Time 2"]
}

✨ VIRAL SCRIPT FORMULAS:

🔥 BEFORE/AFTER: "Expectation vs Reality" or transformation reveal
📦 UNBOXING: ASMR sounds + reveal + reaction
⭐ TESTIMONIAL: Real talk format with relatable moments
🎧 ASMR: Satisfying sounds + close-ups + text overlays
🔥 TRENDY: Use current audio trends + transitions

📹 VISUAL REQUIREMENTS FOR AI VIDEO GENERATION:
- Each scene description must be SPECIFIC enough for Kling AI
- Include lighting, angles, movement, and mood
- Describe the model/hands/product positioning exactly
- Note transitions between scenes

${langInstruction}`;

        userPrompt = `🎬 CREATE 3 VIRAL REELS SCRIPTS FOR:

📦 PRODUCT:
- Name: ${input.productName || "Fashion Product"}
- Description: ${input.productDescription || "Premium fashion item"}
- Script Type: ${input.scriptType || "trendy"}
- Target Duration: ${input.duration || "15-30"} seconds

🎯 SCRIPT REQUIREMENTS:
1. Script 1: ${input.scriptType === "before_after" ? "Before/After transformation" : input.scriptType === "unboxing" ? "ASMR Unboxing experience" : input.scriptType === "testimonial" ? "Real customer testimonial style" : input.scriptType === "asmr" ? "Satisfying ASMR moments" : "Trending format with viral potential"}
2. Script 2: Different angle/format from Script 1
3. Script 3: Most creative/experimental approach

⚡ EACH SCRIPT MUST:
- Have 4-6 scenes with precise timing
- Include camera movements for dynamic visuals
- Specify text overlays in ${language === 'ar' ? 'Arabic' : 'English'}
- Be ready for Kling AI / Runway generation
- Include sound/music cues

Return ONLY the JSON object.`;

        temperature = 0.8;
        maxTokens = 4000;
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
                  title: { type: "string" },
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
                        scene_number: { type: "number" },
                        duration: { type: "string" },
                        visual: { type: "string" },
                        camera: { type: "string" },
                        text_overlay: { type: "string" },
                        voiceover: { type: "string" },
                        sound_effect: { type: "string" }
                      }
                    }
                  },
                  cta: { type: "string" },
                  music_style: { type: "string" },
                  total_duration: { type: "string" },
                  viral_potential: { type: "string" },
                  trend_reference: { type: "string" }
                }
              }
            },
            viral_tips: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
            hashtags: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 15 },
            best_posting_times: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
          }
        };
        break;

      // ============================================
      // LEGACY TOOL TYPES - Keep for backward compatibility
      // ============================================
      case "product-copy":
        model = "google/gemini-2.5-flash";
        openRouterModel = "google/gemini-2.5-flash-preview-05-20";
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

      case "video-script":
        model = "google/gemini-2.5-flash";
        openRouterModel = "google/gemini-2.5-flash-preview-05-20";
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
        model = "google/gemini-2.5-flash";
        openRouterModel = "google/gemini-2.5-flash-preview-05-20";
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
        model = "google/gemini-2.5-flash";
        openRouterModel = "google/gemini-2.5-flash-preview-05-20";
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

      // Select model and endpoint based on provider
      const useOpenRouter = preferredProvider === "openrouter";
      const selectedModel = useOpenRouter ? openRouterModel : model;
      const apiUrl = useOpenRouter 
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://ai.gateway.lovable.dev/v1/chat/completions";
      const apiKey = useOpenRouter ? OPENROUTER_API_KEY : LOVABLE_API_KEY;

      const body: any = {
        model: selectedModel,
        messages: [
          { role: "system", content: systemRole + strictSystemAddon },
          { role: "user", content: userPrompt }
        ],
        temperature: retry ? Math.min(0.25, temperature) : temperature,
        max_tokens: retry ? Math.max(4000, maxTokens) : maxTokens,
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

      console.log(`Calling ${useOpenRouter ? 'OpenRouter' : 'Lovable AI'} with model: ${selectedModel}`);

      const headers: Record<string, string> = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };

      // OpenRouter requires additional headers
      if (useOpenRouter) {
        headers["HTTP-Referer"] = "https://sellmata.lovable.app";
        headers["X-Title"] = "Sellmata AI Studio";
      }

      const resp = await fetch(apiUrl, {
        method: "POST",
        headers,
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

    console.log(`✅ Generated ${toolType} using ${model} for user ${authData?.userId}`);

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
