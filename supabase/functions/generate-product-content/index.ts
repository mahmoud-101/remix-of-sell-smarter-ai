import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ProductData {
  id: string;
  title: string;
  price: string;
  description: string;
  descriptionText: string;
  image: string | null;
  vendor: string;
  productType: string;
}

type ContentType = 
  | 'product_description'
  | 'facebook_ad'
  | 'instagram_ad'
  | 'ad_image_prompt'
  | 'video_script'
  | 'social_post';

type Tone = 'formal' | 'casual' | 'luxury' | 'friendly';
type ContentLength = 'short' | 'medium' | 'long';

const contentTypeNames: Record<ContentType, string> = {
  product_description: 'وصف منتج احترافي',
  facebook_ad: 'إعلان Facebook',
  instagram_ad: 'إعلان Instagram',
  ad_image_prompt: 'Prompt لصورة إعلانية',
  video_script: 'سكريبت فيديو Reels/TikTok',
  social_post: 'بوست سوشيال ميديا'
};

const toneNames: Record<Tone, string> = {
  formal: 'رسمي',
  casual: 'شبابي',
  luxury: 'فاخر',
  friendly: 'ودود'
};

const lengthGuides: Record<ContentLength, string> = {
  short: '50-100 كلمة',
  medium: '100-200 كلمة',
  long: '200-400 كلمة'
};

function buildPrompt(
  product: ProductData, 
  contentType: ContentType, 
  tone: Tone, 
  length: ContentLength
): string {
  const basePrompt = `أنت خبير في كتابة المحتوى التسويقي للتجارة الإلكترونية في السوق العربي.

المنتج:
- الاسم: ${product.title}
- السعر: ${product.price} جنيه
- الوصف الحالي: ${product.descriptionText || 'غير متوفر'}
- النوع: ${product.productType || 'منتج'}
- العلامة التجارية: ${product.vendor || 'غير محدد'}

المطلوب:
اكتب ${contentTypeNames[contentType]} بأسلوب ${toneNames[tone]}

المتطلبات:
- جذاب ويحفز على الشراء
- يبرز فوائد المنتج
- يتضمن call-to-action قوي
- مناسب للسوق المصري/العربي
- طول النص: ${lengthGuides[length]}`;

  // Add specific instructions per content type
  switch (contentType) {
    case 'product_description':
      return basePrompt + `

اكتب وصف منتج احترافي يشمل:
- مقدمة جذابة
- المميزات الرئيسية
- فوائد للعميل
- دعوة للشراء

اكتب المحتوى مباشرة بدون مقدمات:`;

    case 'facebook_ad':
      return basePrompt + `

اكتب إعلان Facebook يشمل:
- Hook قوي في أول سطر
- نص إعلاني مقنع
- Emoji مناسبة
- CTA واضح

اكتب المحتوى مباشرة بدون مقدمات:`;

    case 'instagram_ad':
      return basePrompt + `

اكتب إعلان Instagram يشمل:
- Caption جذاب
- Hashtags مناسبة (5-10)
- Emoji بشكل متناسق
- CTA في النهاية

اكتب المحتوى مباشرة بدون مقدمات:`;

    case 'ad_image_prompt':
      return `أنت مصمم إعلانات محترف. اكتب prompt بالإنجليزية لإنشاء صورة إعلانية جذابة للمنتج التالي:

المنتج: ${product.title}
السعر: ${product.price}
النوع: ${product.productType || 'product'}

المطلوب:
- Prompt بالإنجليزية لـ AI image generation
- يجب أن يكون الـ style ${tone === 'luxury' ? 'premium and elegant' : tone === 'casual' ? 'young and vibrant' : 'clean and professional'}
- مناسب لإعلانات السوشيال ميديا

اكتب الـ prompt مباشرة:`;

    case 'video_script':
      return basePrompt + `

اكتب سكريبت فيديو قصير (15-60 ثانية) لـ Reels/TikTok يشمل:
- Hook في أول 3 ثواني
- عرض المنتج
- فوائد سريعة
- CTA قوي

Format:
[المشهد] - الوصف/الكلام

اكتب السكريبت مباشرة:`;

    case 'social_post':
      return basePrompt + `

اكتب بوست سوشيال ميديا يشمل:
- نص جذاب ومختصر
- Emoji مناسبة
- سؤال أو تفاعل
- CTA

اكتب المحتوى مباشرة:`;

    default:
      return basePrompt + '\n\nاكتب المحتوى مباشرة:';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { product, contentTypes, tone, length } = await req.json() as {
      product: ProductData;
      contentTypes: ContentType[];
      tone: Tone;
      length: ContentLength;
    };

    if (!product || !contentTypes?.length) {
      return new Response(
        JSON.stringify({ error: 'Product and content types are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating content for product: ${product.title}, types: ${contentTypes.join(', ')}`);

    const results: Record<ContentType, string> = {} as any;

    // Generate content for each type
    for (const contentType of contentTypes) {
      const prompt = buildPrompt(product, contentType, tone || 'friendly', length || 'medium');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'أنت خبير في كتابة المحتوى التسويقي باللغة العربية.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI error:', errorData);
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      results[contentType] = data.choices[0]?.message?.content || '';
    }

    // Save to generated_content table
    const { error: saveError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        content_type: contentTypes.join(','),
        product_id: product.id,
        product_title: product.title,
        product_image: product.image,
        tone: tone,
        input_data: { product, contentTypes, tone, length },
        output_data: results,
        credits_used: contentTypes.length
      });

    if (saveError) {
      console.error('Save error:', saveError);
      // Don't fail the request, just log
    }

    // Log usage
    await supabase
      .from('usage_logs')
      .insert({
        user_id: user.id,
        action: 'generate_product_content',
        credits: contentTypes.length,
        metadata: { 
          product_id: product.id,
          content_types: contentTypes 
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `تم توليد ${contentTypes.length} نوع محتوى بنجاح`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate content error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});