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
    const { imageUrl, style, productName, duration = 5, language = 'ar' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    // ============================================
    // REELS STUDIO - AI Storyboard Generator
    // Specialized for MENA Arabic Market
    // Generates 3 scene images for Reels/TikTok
    // Using Lovable AI with Gemini Pro Image
    // ============================================

    // 🎬 Arabic Market Specialized Reels Prompts
    // Designed for Egyptian/MENA fashion & beauty e-commerce
    const stylePrompts: Record<string, { 
      scenes: string[]; 
      captionAr: string; 
      captionEn: string;
      hookAr: string;
      ctaAr: string;
      musicVibe: string;
    }> = {
      unboxing: {
        scenes: [
          `مشهد 1 - الإثارة: علبة هدية فاخرة مغلقة بربطة ساتان ذهبية، إضاءة درامية من الأعلى، خلفية بيج كريمية، يد أنثوية مانيكير فرنسي تلمس العلبة بحماس، نص عربي متحرك "افتحي معايا 📦"`,
          `مشهد 2 - الكشف: لحظة فتح العلبة، المنتج يظهر مع تأثير sparkle وإضاءة ناعمة، يد ترفع المنتج ببطء، خلفية ضبابية بوكيه، نص عربي "أخيراً وصل! 🤩"`,
          `مشهد 3 - البطل: المنتج Hero shot بزاوية 45 درجة، إضاءة استوديو احترافية، خلفية gradient وردي لذهبي، CTA عربي كبير "اطلبي دلوقتي - كود FIRST10 💕"`
        ],
        captionAr: "📦 أنبوكسينق! لما الطرد يوصل وتكوني مستنياه من زمان 😍✨\n\nالمنتج ده غيّر حياتي والله 🙈\n\n💜 اطلبيه بكود LOVE10",
        captionEn: "📦 Unboxing time! When your order finally arrives 😍✨",
        hookAr: "استني تشوفي اللي جوا! 👀",
        ctaAr: "اطلبي دلوقتي - توصيل سريع 🚚",
        musicVibe: "Upbeat Arabic pop, trendy sound"
      },
      before_after: {
        scenes: [
          `مشهد 1 - قبل: تصوير "المشكلة" - إضاءة خافتة باردة، ألوان باهتة، تعبير حزين/محبط، نص عربي كبير "قبل 😔" مع فلتر رمادي، المنتج غير ظاهر`,
          `مشهد 2 - التحول: لحظة السحر - يد تمسك المنتج، تأثير sparkle متحرك، إضاءة تتحول من باردة لدافئة، نص عربي "اللحظة السحرية ✨🪄"`,
          `مشهد 3 - بعد: النتيجة المبهرة - إضاءة ذهبية دافئة، ألوان نابضة، ابتسامة واثقة، المنتج بارز، نص عربي "بعد 🔥😍" مع CTA`
        ],
        captionAr: "🔄 التحول الحقيقي! مش هتصدقي الفرق 😱\n\nقبل كنت تعبانة... دلوقتي شوفي النتيجة 💫\n\n💜 الرابط في البايو",
        captionEn: "🔄 Real transformation! Can't believe the difference 😱",
        hookAr: "الفرق صادم! 😱",
        ctaAr: "جربي بنفسك - ضمان استرجاع 💯",
        musicVibe: "Dramatic reveal, trending audio"
      },
      testimonial: {
        scenes: [
          `مشهد 1 - المنتج البطل: المنتج بزاوية أمامية مع 5 نجوم ذهبية كبيرة، شارات ثقة بالعربي "الأكثر مبيعاً ⭐", "٢٥٠٠+ عميلة سعيدة", خلفية gradient احترافية`,
          `مشهد 2 - التفاصيل: تصوير macro للتفاصيل والجودة، يد أنثوية تعرض المنتج، نص عربي "جودة عالية 💎", "صناعة فاخرة", إضاءة ناعمة`,
          `مشهد 3 - الطلب: تصميم call-to-action احترافي، المنتج مع زر "اطلبي الآن 🛒", badge توصيل مجاني، كود خصم، ألوان جذابة`
        ],
        captionAr: "⭐ لما ألف بنت تقول إنه الأحسن... لازم تجربيه!\n\nتقييم 5 نجوم من عميلاتنا الحلوين 🥰\n\n🛒 اطلبي دلوقتي - شحن مجاني",
        captionEn: "⭐ When 1000+ girls say it's the best... you gotta try it!",
        hookAr: "شوفي ليه الكل بيحبه! 💕",
        ctaAr: "اطلبي الآن - العرض محدود ⏰",
        musicVibe: "Confident, empowering Arabic"
      },
      showcase: {
        scenes: [
          `مشهد 1 - البورتريه: المنتج بزاوية أمامية كلاسيكية، خلفية استوديو نظيفة بيضاء أو بيج، إضاءة احترافية soft box، ظلال ناعمة، جودة catalog 4K`,
          `مشهد 2 - الزاوية: المنتج بزاوية 45 درجة يظهر العمق والأبعاد، إضاءة rim light خلفية، تفاصيل واضحة، خلفية gradient ناعم`,
          `مشهد 3 - الإعلان: تصميم إعلاني كامل، المنتج مع نص عربي "متوفر الآن 🔥", شارة سعر، CTA "اطلبي الآن", خلفية جذابة gradient`
        ],
        captionAr: "✨ المنتج اللي الكل بيسأل عليه!\n\nجودة عالية • توصيل سريع • ضمان استرجاع\n\n🛒 الرابط في البايو",
        captionEn: "✨ The product everyone's asking about!",
        hookAr: "أحلى منتج هتشوفيه النهارده! ✨",
        ctaAr: "متوفر الآن - الكمية محدودة 🔥",
        musicVibe: "Elegant, premium feel"
      },
      trending: {
        scenes: [
          `مشهد 1 - الفايرال: المنتج بأسلوب TikTok ترند، ألوان نيون bold، تأثيرات حركة سريعة، نص عربي كبير "الترند بتاع الموسم! 🔥", خلفية ملونة ديناميكية`,
          `مشهد 2 - الزوم: تأثير zoom in ديناميكي على المنتج، إضاءة ملونة RGB، طاقة عالية، نص عربي "الكل بيجري عليه! 💜🔥", حركة سريعة`,
          `مشهد 3 - الـ FOMO: تصميم urgency، المنتج مع "آخر كمية! ⚠️", timer تنازلي، نص "اطلبي قبل ما يخلص 🏃‍♀️", ألوان نارية حمراء وبرتقالية`
        ],
        captionAr: "🔥 الترند اللي كسر التيك توك!\n\nلو مش عندك... أنتِ مش على الموضة 💅\n\n⚡ لينك الطلب في البايو - هيخلص!",
        captionEn: "🔥 The trend that broke TikTok!",
        hookAr: "لو مشفتيش ده قبل كده! 🤯",
        ctaAr: "احجزي قبل ما يخلص! ⚡",
        musicVibe: "Viral TikTok sound, high energy"
      }
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.showcase;
    
    console.log(`User ${authData?.userId} generating Arabic Reel storyboard, style: ${style}, scenes: ${selectedStyle.scenes.length}`);

    // Generate multiple scene images with Arabic-specialized prompts
    const sceneImages: Array<{ imageUrl: string; scene: number; description: string }> = [];
    
    for (let i = 0; i < selectedStyle.scenes.length; i++) {
      // Arabic Market Specialized Prompt
      const scenePrompt = `أنت مصمم إعلانات محترف متخصص في السوق العربي والمصري.

مهمتك: إنشاء مشهد ${i + 1} لإعلان ريلز/تيك توك احترافي.

⚠️ تعليمات حرجة:
1. حافظ على المنتج الأصلي بالضبط - لا تغيره أبداً
2. استخدم نفس الألوان والشكل والتفاصيل من الصورة المرفقة
3. المنتج هو البطل - يجب أن يكون واضحاً ومركزياً

📝 وصف المشهد:
${selectedStyle.scenes[i]}

🎯 معلومات المنتج:
الاسم: ${productName || "المنتج المميز"}

📐 المواصفات التقنية:
- Format: 9:16 (عمودي للريلز/تيك توك)
- Resolution: 4K عالي الجودة
- Style: إعلان سوشيال ميديا احترافي للسوق العربي
- النص العربي يجب أن يكون من اليمين لليسار
- استخدم خطوط عربية جميلة وواضحة
- الألوان: ذهبي، وردي، بنفسجي، كريمي (ألوان السوق العربي)

🚫 ممنوع:
- لا تغير المنتج الأصلي
- لا تستخدم نص إنجليزي
- لا تستخدم صور غير لائقة`;

      try {
        console.log(`Generating Arabic scene ${i + 1}/${selectedStyle.scenes.length}...`);
        
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: scenePrompt },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Scene ${i + 1} generation error:`, response.status, errorText);
          
          if (response.status === 402) {
            throw new Error(language === 'ar' 
              ? "رصيد الـ AI انتهى - يرجى إضافة رصيد"
              : "AI quota exceeded - please add credits");
          }
          if (response.status === 429) {
            throw new Error(language === 'ar'
              ? "الطلبات كثيرة - حاول مرة تانية بعد شوية"
              : "Rate limit exceeded - please try again in a moment");
          }
          continue; // Try next scene
        }

        const data = await response.json();
        const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (generatedImage) {
          sceneImages.push({
            imageUrl: generatedImage,
            scene: i + 1,
            description: selectedStyle.scenes[i]
          });
          console.log(`Arabic scene ${i + 1} generated successfully`);
        }
      } catch (sceneError) {
        console.error(`Error generating scene ${i + 1}:`, sceneError);
        if (sceneError instanceof Error && 
            (sceneError.message.includes("quota") || sceneError.message.includes("Rate limit") || sceneError.message.includes("رصيد"))) {
          throw sceneError;
        }
      }
    }

    if (sceneImages.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد المشاهد - حاول مرة تانية"
        : "No scenes were generated - please try again");
    }

    console.log(`Successfully generated ${sceneImages.length} Arabic scenes for user ${authData?.userId}`);

    // Generate Arabic-specialized caption and hashtags
    const caption = language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn;
    
    // Arabic hashtags optimized for MENA market
    const hashtagsAr = [
      "#تسوق_اونلاين",
      "#تسوق_مصر",
      "#موضة_مصرية",
      "#ستايل",
      "#fashion",
      "#fyp",
      "#fypシ",
      "#viral",
      "#reels",
      "#تيك_توك",
      "#انستجرام",
      style === "unboxing" ? "#انبوكسينق" : "",
      style === "unboxing" ? "#فتح_الطرد" : "",
      style === "before_after" ? "#قبل_وبعد" : "",
      style === "before_after" ? "#تحول" : "",
      style === "testimonial" ? "#تجربتي" : "",
      style === "testimonial" ? "#ريفيو" : "",
      style === "trending" ? "#ترند" : "",
      style === "trending" ? "#ترند_مصر" : "",
    ].filter(Boolean);

    const hashtagsEn = [
      "#shopping",
      "#fashion",
      "#style",
      "#trending",
      "#viral",
      "#fyp",
      "#reels",
      "#tiktok",
      "#egypt",
      "#mena",
      style === "unboxing" ? "#unboxing" : "",
      style === "before_after" ? "#beforeafter" : "",
      style === "testimonial" ? "#review" : "",
      style === "trending" ? "#trend" : "",
    ].filter(Boolean);

    return new Response(
      JSON.stringify({ 
        scenes: sceneImages,
        caption,
        hashtags: language === 'ar' ? hashtagsAr : hashtagsEn,
        duration: `${duration}s`,
        style,
        format: "Storyboard",
        totalScenes: sceneImages.length,
        // Arabic market extras
        hook: language === 'ar' ? selectedStyle.hookAr : selectedStyle.hookAr,
        cta: language === 'ar' ? selectedStyle.ctaAr : selectedStyle.ctaAr,
        musicVibe: selectedStyle.musicVibe,
        instructions: language === 'ar' 
          ? "حمّل المشاهد واستخدمها في VN أو InShot أو CapCut عشان تعمل ريل فيرال! 🔥"
          : "Download scenes and use in VN, InShot, or CapCut to create a viral Reel! 🔥"
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
