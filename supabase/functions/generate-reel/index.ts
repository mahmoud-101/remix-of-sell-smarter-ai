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
    // REELS STUDIO - Image to Video
    // Generates actual video clips from product images
    // Using Lovable AI Video Generation
    // ============================================

    // Define video styles with motion prompts for actual video generation
    const stylePrompts: Record<string, { 
      videoPrompt: string; 
      captionAr: string; 
      captionEn: string;
      cameraFixed: boolean;
    }> = {
      unboxing: {
        videoPrompt: `Smooth camera push-in revealing this product from inside a luxury gift box. Dramatic studio lighting with soft shadows. The product slowly rotates while sparkle particles float around. Premium e-commerce reveal aesthetic. Cinematic and elegant.`,
        captionAr: "📦 أنبوكسينق حصري! شوفوا الجمال ده 😍✨",
        captionEn: "📦 Exclusive unboxing! Check out this beauty 😍✨",
        cameraFixed: false
      },
      before_after: {
        videoPrompt: `Dynamic transition video showing transformation. Start with muted desaturated look, then a magical sparkle transition sweeps across, revealing the product in vibrant, saturated colors. Energy particles and light streaks add dramatic effect. Professional advertising style.`,
        captionAr: "🔄 قبل وبعد - الفرق واضح! 💫",
        captionEn: "🔄 Before & After - See the difference! 💫",
        cameraFixed: true
      },
      testimonial: {
        videoPrompt: `Elegant 360-degree slow rotation of this product on a clean white backdrop. Soft studio lighting highlights every detail. Camera smoothly orbits around the product. Premium quality showcase with subtle light reflections. Professional product photography aesthetic.`,
        captionAr: "⭐ تجربة حقيقية - 5 نجوم! اطلبيه الآن 🛒",
        captionEn: "⭐ Real review - 5 stars! Order now 🛒",
        cameraFixed: true
      },
      showcase: {
        videoPrompt: `Cinematic hero shot of this product with slow dolly movement. Luxurious golden hour lighting with soft bokeh background. Camera gently moves from left to right while product catches light beautifully. High-end fashion brand commercial aesthetic. Elegant and sophisticated.`,
        captionAr: "✨ منتج فاخر بجودة عالية - متوفر الآن! 🔥",
        captionEn: "✨ Premium quality product - Available now! 🔥",
        cameraFixed: false
      },
      trending: {
        videoPrompt: `Fast-paced TikTok viral style video. Quick zoom in on product with punchy energy. Vibrant neon color accents and dynamic camera shake. Bold and trendy aesthetic with high energy. Social media viral video style. Fast cuts and dynamic movement.`,
        captionAr: "🔥 ترند الموسم! الكل بيسأل عنه 💜",
        captionEn: "🔥 Trending now! Everyone's asking about it 💜",
        cameraFixed: false
      }
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.showcase;
    
    console.log(`User ${authData?.userId} generating video Reel, style: ${style}`);

    // Generate actual video using Lovable AI video generation
    const videoPrompt = productName 
      ? `${selectedStyle.videoPrompt} Product: ${productName}.`
      : selectedStyle.videoPrompt;

    console.log(`Calling video generation API...`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/video/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kling-video/v2.0/master/image-to-video",
        image: imageUrl,
        prompt: videoPrompt,
        aspect_ratio: "9:16", // Vertical for Reels/TikTok
        duration: duration === 10 ? 10 : 5, // 5 or 10 seconds
        camera_fixed: selectedStyle.cameraFixed
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Video generation error:`, response.status, errorText);
      
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
      throw new Error(`Video generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Video generation response:`, JSON.stringify(data).substring(0, 500));
    
    // Extract video URL from response
    const videoUrl = data.data?.[0]?.url || data.video_url || data.url;
    
    if (!videoUrl) {
      console.error(`No video URL in response:`, JSON.stringify(data));
      throw new Error(language === 'ar' 
        ? "فشل توليد الفيديو - حاول مرة تانية"
        : "Video generation failed - please try again");
    }

    console.log(`Successfully generated video for user ${authData?.userId}`);

    // Generate caption and hashtags
    const caption = language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn;
    
    const hashtagsAr = [
      "#تسوق_اونلاين",
      "#موضة",
      "#ستايل",
      "#fashion",
      "#trending",
      "#viral",
      "#fyp",
      "#reels",
      style === "unboxing" ? "#انبوكسينق" : "",
      style === "before_after" ? "#قبل_وبعد" : "",
      style === "testimonial" ? "#تجربتي" : "",
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
      style === "unboxing" ? "#unboxing" : "",
      style === "before_after" ? "#beforeafter" : "",
      style === "testimonial" ? "#review" : "",
    ].filter(Boolean);

    return new Response(
      JSON.stringify({ 
        videoUrl,
        caption,
        hashtags: language === 'ar' ? hashtagsAr : hashtagsEn,
        duration: `${duration}s`,
        style,
        format: "Video",
        instructions: language === 'ar' 
          ? "حمّل الفيديو وانشره مباشرة على TikTok أو Instagram Reels"
          : "Download the video and post it directly on TikTok or Instagram Reels"
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
