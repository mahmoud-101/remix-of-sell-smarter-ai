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
      productImage, 
      productName,
      productAnalysis,
      ugcType = "lifestyle",
      model,
      language = 'ar'
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ============================================
    // UGC STUDIO - User Generated Content Images
    // Using Lovable AI Gateway with Gemini Image Generation
    // Generates 3 high-quality UGC-style images
    // Arabic content for Egyptian market
    // ============================================

    // UGC scene descriptions - Arabic market focused
    const ugcScenes: Record<string, {
      scenes: Array<{
        imagePrompt: string;
        arabicCaption: string;
      }>;
      nameAr: string;
      nameEn: string;
      description: string;
    }> = {
      lifestyle: {
        scenes: [
          {
            imagePrompt: "UGC lifestyle photo: Product held naturally in hands against cozy home background, warm natural lighting, authentic influencer feel",
            arabicCaption: "شوفي الجمال ده! 😍"
          },
          {
            imagePrompt: "UGC lifestyle: Product on stylish vanity table with makeup items, warm bedroom lighting, influencer aesthetic",
            arabicCaption: "لازم يكون عندك! ✨"
          },
          {
            imagePrompt: "UGC lifestyle: Product in aesthetic flatlay arrangement, clean modern background, Instagram worthy",
            arabicCaption: "اطلبيه دلوقتي! 🛒"
          }
        ],
        nameAr: "لايف ستايل",
        nameEn: "Lifestyle",
        description: "صور لايف ستايل أصلية"
      },
      review: {
        scenes: [
          {
            imagePrompt: "Product review style: Product with 5-star rating visual, clean professional background, testimonial feel",
            arabicCaption: "⭐⭐⭐⭐⭐ الكل بيحبه!"
          },
          {
            imagePrompt: "Before/after comparison layout with product in center, transformation visual, bright lighting",
            arabicCaption: "الفرق واضح! 🔥"
          },
          {
            imagePrompt: "Product close-up showing quality details, professional macro shot, premium feel",
            arabicCaption: "جودة عالية جداً 💎"
          }
        ],
        nameAr: "ريفيو",
        nameEn: "Review",
        description: "صور ريفيو وتقييم"
      },
      unboxing: {
        scenes: [
          {
            imagePrompt: "Elegant gift box with product inside, luxury packaging, dramatic lighting, anticipation moment",
            arabicCaption: "الطرد وصل! 📦😍"
          },
          {
            imagePrompt: "Product emerging from tissue paper, sparkle effects, excitement moment capture",
            arabicCaption: "شوفوا الجمال! ✨"
          },
          {
            imagePrompt: "Product hero shot after unboxing, professional display, satisfied reveal",
            arabicCaption: "يستاهل كل قرش! 💜"
          }
        ],
        nameAr: "أنبوكسينق",
        nameEn: "Unboxing",
        description: "صور فتح الطرود"
      },
      selfie: {
        scenes: [
          {
            imagePrompt: "Mirror selfie style with product visible, modern bathroom/bedroom, ring light lighting",
            arabicCaption: "سيلفي مع الحب الجديد! 📸"
          },
          {
            imagePrompt: "Front-facing selfie composition with product, casual aesthetic, natural daylight",
            arabicCaption: "أنا وصاحبي الجديد! 💕"
          },
          {
            imagePrompt: "Aesthetic selfie with product in cute pose, clean modern background, Instagram style",
            arabicCaption: "لازم تجربوه! 🔥"
          }
        ],
        nameAr: "سيلفي",
        nameEn: "Selfie",
        description: "صور سيلفي طبيعية"
      },
      tutorial: {
        scenes: [
          {
            imagePrompt: "Tutorial style: Hands demonstrating product step 1, clean white background, instructional",
            arabicCaption: "الخطوة الأولى... 1️⃣"
          },
          {
            imagePrompt: "Tutorial step 2: Product application/usage demonstration, clear visibility",
            arabicCaption: "كده بالظبط! 2️⃣"
          },
          {
            imagePrompt: "Tutorial result: Final result showcase, success visual, satisfied completion",
            arabicCaption: "النتيجة النهائية! ✅"
          }
        ],
        nameAr: "توتوريال",
        nameEn: "Tutorial",
        description: "صور تعليمية"
      }
    };

    const selectedType = ugcScenes[ugcType] || ugcScenes.lifestyle;

    console.log(`User ${authData?.userId} generating UGC images, type: ${ugcType}, scenes: ${selectedType.scenes.length}`);

    // Generate images for each scene
    const generatedImages: Array<{ 
      imageUrl: string; 
      scene: number;
      caption: string;
      type: string;
      typeAr: string;
    }> = [];

    for (let i = 0; i < selectedType.scenes.length; i++) {
      const scene = selectedType.scenes[i];
      
      try {
        console.log(`Generating UGC image scene ${i + 1}...`);
        
        const imagePrompt = `Generate a professional UGC (User Generated Content) style image for social media marketing.

Product: ${productName || "Fashion product"}
${productAnalysis?.core_feature ? `Key feature: ${productAnalysis.core_feature}` : ''}

Scene: ${scene.imagePrompt}

Requirements:
- Authentic UGC/influencer aesthetic (not too polished)
- Vertical 9:16 format for Instagram/TikTok
- Egyptian/MENA market appeal
- Natural lighting and real-life setting
- Relatable and shareable content
- No text or watermarks
- High quality but authentic feel`;

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
          generatedImages.push({
            imageUrl,
            scene: i + 1,
            caption: scene.arabicCaption,
            type: selectedType.nameEn,
            typeAr: selectedType.nameAr
          });
          console.log(`UGC image ${i + 1} generated successfully`);
        } else {
          console.error(`No image URL in response for scene ${i + 1}`);
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

    if (generatedImages.length === 0) {
      throw new Error(language === 'ar' 
        ? "فشل توليد الصور - حاول مرة تانية"
        : "Failed to generate images - please try again");
    }

    console.log(`Successfully generated ${generatedImages.length} UGC images for user ${authData?.userId}`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        ugcType,
        typeName: language === 'ar' ? selectedType.nameAr : selectedType.nameEn,
        description: selectedType.description,
        count: generatedImages.length,
        format: "9:16 vertical",
        provider: "gemini",
        arabicContent: true,
        tips: [
          "الصور جاهزة للنشر على انستجرام وتيك توك",
          "أضف موسيقى ترند من التطبيق",
          "استخدم الكابشنز العربية المقترحة",
          "انشر في أوقات الذروة (8-10 مساءً)"
        ]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-ugc function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
