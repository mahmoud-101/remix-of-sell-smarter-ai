import { supabase } from '@/integrations/supabase/client';

export interface ProductData {
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

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  waitFor?: number;
  location?: { country?: string; languages?: string[] };
};

export const firecrawlApi = {
  // Scrape a single URL and extract product data
  async scrapeProduct(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse<{ productData: ProductData }>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
