const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  title?: string;
  brand?: string;
  price?: string;
  currency?: string;
  originalPrice?: string;
  discount?: string;
  description?: string;
  features?: string[];
  images?: string[];
  rating?: string;
  reviewCount?: string;
  availability?: string;
  sku?: string;
}

function cleanPrice(price: string | undefined): string {
  if (!price) return '';
  return price.replace(/[^\d.,]/g, '');
}

function extractProductData(markdown: string, metadata: any): ProductData {
  const lines = markdown.split('\n').filter(line => line.trim());
  
  // Extract features (bullet points)
  const features: string[] = [];
  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      const feature = line.replace(/^[-*•]\s*/, '').trim();
      if (feature.length > 10 && feature.length < 200) {
        features.push(feature);
      }
    }
  }

  // Extract from metadata
  const title = metadata?.title || metadata?.ogTitle || '';
  const description = metadata?.description || metadata?.ogDescription || '';
  
  // Try to extract price patterns from text
  const priceMatch = markdown.match(/(?:SAR|EGP|AED|USD|\$|جنيه|ريال)\s*[\d,]+\.?\d*/i) 
    || markdown.match(/[\d,]+\.?\d*\s*(?:SAR|EGP|AED|USD|جنيه|ريال)/i);
  
  // Try to extract rating
  const ratingMatch = markdown.match(/(\d+\.?\d*)\s*(?:\/\s*5|out of 5|stars?|نجوم)/i);
  
  // Try to extract review count
  const reviewMatch = markdown.match(/(\d+[,\d]*)\s*(?:reviews?|ratings?|تقييم|مراجعة)/i);

  return {
    title: title.replace(/ - .*$/, '').trim(),
    brand: metadata?.ogSiteName || '',
    price: priceMatch ? cleanPrice(priceMatch[0]) : '',
    description: description.slice(0, 500),
    features: features.slice(0, 10),
    rating: ratingMatch ? ratingMatch[1] : '',
    reviewCount: reviewMatch ? reviewMatch[1].replace(/,/g, '') : '',
    images: metadata?.ogImage ? [metadata.ogImage] : [],
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, options } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: options?.formats || ['markdown'],
        onlyMainContent: options?.onlyMainContent ?? true,
        waitFor: options?.waitFor || 3000,
        location: options?.location,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract product data from the scrape result
    const markdown = data.data?.markdown || data.markdown || '';
    const metadata = data.data?.metadata || data.metadata || {};
    
    const productData = extractProductData(markdown, metadata);

    console.log('Scrape successful, extracted product data');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...data,
          productData,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
