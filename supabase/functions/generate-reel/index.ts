const serve = (handler: (req: Request) => Promise<Response>) => {
  Deno.serve(handler);
};
import { validateAuth, corsHeaders } from "../_shared/auth.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
    const { 
      imageUrl, 
      productImage,
      style, 
      productName,
      productAnalysis,
      language = 'ar', 
      model
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ============================================
    // REELS STUDIO - AI Storyboard Generator
    // Using Lovable AI Gateway with Gemini Image Generation
    // Generates 3 high-quality vertical images for Reel creation
    // Arabic content for Egyptian market
    // ============================================

    // Reel storyboard scenes with Arabic captions
    const reelStyles: Record<string, { 
      scenes: Array<{
        imagePrompt: string;
        arabicCaption: string;
        arabicHook: string;
      }>;
      captionAr: string;
      ctaAr: string;
      musicVibe: string;
      hashtags: string[];
    }> = {
      unboxing: {
        scenes: [
          {
            imagePrompt: "Luxury gift box with golden ribbon, product inside partially visible, dramatic spotlight, anticipation moment",
            arabicCaption: "الطرد وصل! 📦",
            arabicHook: "استنوا تشوفوا!"
          },
          {
            imagePrompt: "Product emerging from elegant packaging, tissue paper, sparkle effects, excitement moment",
            arabicCaption: "شوفوا الجمال! ✨",
            arabicHook: "مش هتصدقوا!"
          },
          {
            imagePrompt: "Product hero shot, professional display, satisfied reveal, premium presentation",
            arabicCaption: "اطلبوه دلوقتي! 🛒",
            arabicHook: "لينك في البايو!"
          }
        ],
        captionAr: "📦 أنبوكسينق! لما الطرد يوصل 😍✨\n\n💜 اطلبيه بكود LOVE10",
        ctaAr: "اطلبي دلوقتي - توصيل سريع 🚚",
        musicVibe: "Upbeat Arabic pop",
        hashtags: ["#انبوكسينق", "#تسوق_اونلاين", "#مصر", "#fyp"]
      },
      before_after: {
        scenes: [
          {
            imagePrompt: "Before state: dim lighting, muted colors, problem visualization, dull atmosphere",
            arabicCaption: "قبل... 😔",
            arabicHook: "كنت كده!"
          },
          {
            imagePrompt: "Transformation: product spotlight, magical glow transition, change happening",
            arabicCaption: "التحول! ✨",
            arabicHook: "وبعدين...!"
          },
          {
            imagePrompt: "After state: bright vibrant lighting, success colors, radiant result, premium feel",
            arabicCaption: "بعد! 😍🔥",
            arabicHook: "الفرق واضح!"
          }
        ],
        captionAr: "🔄 التحول الحقيقي! 😱\n\n💜 اللينك في البايو",
        ctaAr: "جربي بنفسك 💯",
        musicVibe: "Dramatic reveal",
        hashtags: ["#قبل_وبعد", "#تحول", "#مصر", "#viral"]
      },
      testimonial: {
        scenes: [
          {
            imagePrompt: "Product with floating 5-star rating visual, trust badges, testimonial style, professional",
            arabicCaption: "⭐⭐⭐⭐⭐",
            arabicHook: "ألف بنت قالت!"
          },
          {
            imagePrompt: "Product macro detail shot, quality close-up, premium materials visible",
            arabicCaption: "جودة مش عادية! 💎",
            arabicHook: "شوفي التفاصيل!"
          },
          {
            imagePrompt: "Product with Order Now visual, discount badge, urgency CTA design",
            arabicCaption: "اطلبي قبل ما يخلص! ⏰",
            arabicHook: "العرض لفترة محدودة!"
          }
        ],
        captionAr: "⭐ لما ألف بنت تقول إنه الأحسن!\n\n🛒 شحن ببلاش",
        ctaAr: "اطلبي دلوقتي ⏰",
        musicVibe: "Confident music",
        hashtags: ["#ريفيو", "#تجربتي", "#مصر", "#trending"]
      },
      showcase: {
        scenes: [
          {
            imagePrompt: "Product front view, clean white studio, professional 3-point lighting setup",
            arabicCaption: "المنتج الأكثر مبيعاً! 🔥",
            arabicHook: "الكل بيسأل عليه!"
          },
          {
            imagePrompt: "Product 45-degree angle, rim lighting, depth dimension, premium feel",
            arabicCaption: "تصميم مميز! ✨",
            arabicHook: "شوفي من كل الزوايا!"
          },
          {
            imagePrompt: "Product in full ad composition, promotional graphics, call to action",
            arabicCaption: "متوفر دلوقتي! 🛒",
            arabicHook: "اللينك في البايو!"
          }
        ],
        captionAr: "✨ المنتج اللي الكل بيسأل عليه!\n\n🛒 اللينك في البايو",
        ctaAr: "متوفر دلوقتي 🔥",
        musicVibe: "Elegant premium",
        hashtags: ["#منتج", "#تسوق", "#مصر", "#fyp"]
      },
      trending: {
        scenes: [
          {
            imagePrompt: "Product in TikTok viral style, bold neon RGB lighting, high energy aesthetic",
            arabicCaption: "🔥 الترند الجديد!",
            arabicHook: "لو مشفتيش ده!"
          },
          {
            imagePrompt: "Product with dynamic effects, RGB color shifts, motion blur energy",
            arabicCaption: "الكل بيتكلم عنه! 📣",
            arabicHook: "فيرال على تيك توك!"
          },
          {
            imagePrompt: "Product with FOMO urgency graphics, countdown visual, limited stock alert",
            arabicCaption: "⚡ هيخلص!",
            arabicHook: "احجزي دلوقتي!"
          }
        ],
        captionAr: "🔥 الترند اللي كسر التيك توك!\n\n⚡ هيخلص!",
        ctaAr: "احجزي قبل ما يخلص! ⚡",
        musicVibe: "Viral TikTok sound",
        hashtags: ["#ترند", "#تيك_توك", "#فيرال", "#مصر"]
      }
    };

    const selectedStyle = reelStyles[style] || reelStyles.showcase;
    
    console.log(`Generating Reel storyboard for style: ${style}, scenes: ${selectedStyle.scenes.length}`);

    // Generate 3 vertical images for the storyboard
    const generatedScenes: Array<{ 
      imageUrl: string; 
      scene: number;
      caption: string;
      hook: string;
    }> = [];

    for (let i = 0; i < selectedStyle.scenes.length; i++) {
      const scene = selectedStyle.scenes[i];
      
      try {
        console.log(`Generating Reel scene ${i + 1}...`);
        
        const imagePrompt = `Generate a professional vertical 9:16 social media Reel scene image.

Product: ${productName || "Fashion product"}
${productAnalysis?.core_feature ? `Feature: ${productAnalysis.core_feature}` : ''}

Scene Description: ${scene.imagePrompt}

Requirements:
- Vertical 9:16 aspect ratio (for Instagram/TikTok Reels)
- Professional advertising quality
- Egyptian/MENA market appeal
- High-end fashion aesthetic
- Dynamic and engaging composition
- No text or watermarks on the image
- Perfect for social media marketing`;

        const response = await fetch(LOVABLE_AI_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [
              {
                role: "user",
                content: imagePrompt
              }
            ]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API error for scene ${i + 1}:`, response.status, errorText);
          
          if (response.status === 429) {
            throw new Error(language === 'ar' 
              ? "تم تجاوز حد الطلبات، حاول مرة أخرى لاحقاً"
              : "Rate limit exceeded, please try again later");
          }
          if (response.status === 402) {
            throw new Error(language === 'ar'
              ? "الرصيد غير كافي، يرجى شحن الرصيد"
              : "Insufficient credits, please top up");
          }
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        let imageUrl = null;
        if (typeof content === 'string') {
          if (content.includes('data:image')) {
            imageUrl = content.match(/data:image\/[^;]+;base64,[^"'\s]+/)?.[0];
          } else if (content.includes('http')) {
            imageUrl = content.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp|gif)/i)?.[0];
          }
        } else if (content?.image_url) {
          imageUrl = content.image_url;
        } else if (data.choices?.[0]?.message?.image_url) {
          imageUrl = data.choices[0].message.image_url;
        }

        if (imageUrl) {
          generatedScenes.push({
            imageUrl,
            scene: i + 1,
            caption: scene.arabicCaption,
            hook: scene.arabicHook
          });
          console.log(`Scene ${i + 1} generated successfully`);
        } else {
          console.error(`No image URL for scene ${i + 1}`);
        }

      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
        if (sceneError instanceof Error && 
            (sceneError.message.includes("Rate limit") || 
             sceneError.message.includes("credits"))) {
          throw sceneError;
        }
      }
    }

    if (generatedScenes.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد المشاهد - حاول مرة تانية"
        : "Failed to generate scenes - please try again");
    }

    console.log(`Successfully generated ${generatedScenes.length} Reel scenes`);

    return new Response(
      JSON.stringify({ 
        scenes: generatedScenes,
        caption: selectedStyle.captionAr,
        cta: selectedStyle.ctaAr,
        hashtags: selectedStyle.hashtags,
        style,
        format: "9:16 vertical",
        totalScenes: generatedScenes.length,
        musicVibe: selectedStyle.musicVibe,
        provider: "gemini",
        arabicContent: true,
        instructions: "حمّل الصور واجمعها في CapCut أو InShot وأضف حركة وموسيقى لعمل ريل فيرال! 🔥"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-reel function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
