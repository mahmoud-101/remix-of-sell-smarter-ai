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
    // REELS STUDIO - Image to Video Generator
    // Using Lovable AI Video with starting frame
    // ============================================

    // Define video styles with motion prompts
    const stylePrompts: Record<string, { motion: string; captionAr: string; captionEn: string }> = {
      unboxing: {
        motion: "Slow zoom out revealing the full product, gentle floating motion, sparkle effects appearing around the product, soft camera shake as if just opened, dramatic reveal lighting",
        captionAr: "📦 أنبوكسينق حصري! شوفوا الجمال ده 😍✨",
        captionEn: "📦 Exclusive unboxing! Check out this beauty 😍✨"
      },
      before_after: {
        motion: "Split screen effect transitioning from left to right, dramatic before/after reveal, smooth wipe transition, product glowing and transforming",
        captionAr: "🔄 قبل وبعد - الفرق واضح! 💫",
        captionEn: "🔄 Before & After - See the difference! 💫"
      },
      testimonial: {
        motion: "Product rotating slowly 360 degrees, zoom into details, gentle bounce animation, trust badges appearing, 5-star rating animation",
        captionAr: "⭐ تجربة حقيقية - 5 نجوم! اطلبيه الآن 🛒",
        captionEn: "⭐ Real review - 5 stars! Order now 🛒"
      },
      showcase: {
        motion: "Dynamic product showcase with slow rotation, camera orbiting around product, professional studio lighting shifts, elegant shadow play",
        captionAr: "✨ منتج فاخر بجودة عالية - متوفر الآن! 🔥",
        captionEn: "✨ Premium quality product - Available now! 🔥"
      },
      trending: {
        motion: "Fast zoom in and out pulses, trendy shake effects, text popping animations, viral TikTok style transitions, energetic movement",
        captionAr: "🔥 ترند الموسم! الكل بيسأل عنه 💜",
        captionEn: "🔥 Trending now! Everyone's asking about it 💜"
      }
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.showcase;
    
    // Build video generation prompt
    const videoPrompt = `Professional e-commerce product video advertisement:
${selectedStyle.motion}

Product: ${productName || "Featured product"}
Style: ${style} video for TikTok/Instagram Reels
Duration: ${duration} seconds

Key animations:
- Product as hero element with smooth motion
- Professional lighting transitions
- Eye-catching movement that stops the scroll
- Arabic text overlay appearing with animation
- Price tag or discount badge animating in
- Call-to-action button pulsing at the end

Mood: Viral, engaging, professional, luxury feel
Camera: Smooth movements, professional quality`;

    console.log(`User ${authData?.userId} generating Reel video, style: ${style}, duration: ${duration}s`);

    // Generate video using Lovable AI Video with starting frame
    const response = await fetch("https://ai.gateway.lovable.dev/v1/videos/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "veo-2.0-generate-001",
        prompt: videoPrompt,
        image: imageUrl, // Starting frame from the ad image
        length: duration <= 5 ? "short" : "long",
        aspect_ratio: "9:16", // TikTok/Reels format
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Video error:", response.status, errorText);
      
      if (response.status === 401) {
        throw new Error("Invalid Lovable API key");
      }
      if (response.status === 402) {
        throw new Error("Lovable AI quota exceeded - please add credits");
      }
      if (response.status === 429) {
        throw new Error("Rate limit exceeded - please try again in a moment");
      }
      throw new Error(`Video generation error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Lovable AI Video response received");

    // Extract the generated video URL
    const videoUrl = data.data?.[0]?.url;
    
    if (!videoUrl) {
      console.error("No video in response:", JSON.stringify(data));
      throw new Error("No video was generated");
    }

    console.log(`Successfully generated Reel video for user ${authData?.userId}`);

    // Generate TikTok caption
    const caption = language === 'ar' ? selectedStyle.captionAr : selectedStyle.captionEn;
    
    // Generate hashtags based on style
    const hashtagsAr = [
      "#تسوق_اونلاين",
      "#موضة",
      "#ستايل",
      "#fashion",
      "#trending",
      "#viral",
      "#fyp",
      "#tiktok",
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
      "#tiktok",
      "#reels",
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
        format: "MP4",
        aspectRatio: "9:16"
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
