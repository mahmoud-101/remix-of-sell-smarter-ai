import { useState, useCallback } from 'react';
import { Link2, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { firecrawlApi, ProductData } from '@/lib/api/firecrawl';

interface ProductUrlExtractorProps {
  onExtract: (data: ProductData) => void;
  className?: string;
}

export function ProductUrlExtractor({ onExtract, className = '' }: ProductUrlExtractorProps) {
  const [productUrl, setProductUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleExtract = async () => {
    setError(null);
    
    if (!productUrl.trim()) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال رابط المنتج' : 'Please enter a product URL',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidUrl(productUrl)) {
      toast({
        title: isRTL ? 'رابط غير صالح' : 'Invalid URL',
        description: isRTL ? 'يرجى إدخال رابط صحيح يبدأ بـ https://' : 'Please enter a valid URL starting with https://',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);
    setExtractedData(null);

    try {
      const result = await firecrawlApi.scrapeProduct(productUrl, {
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to extract product data');
      }

      const productData = result.data?.productData;
      
      if (productData) {
        setExtractedData(productData);
        onExtract(productData);
        
        toast({
          title: isRTL ? '✅ تم استخراج البيانات!' : '✅ Data Extracted!',
          description: productData.title 
            ? (isRTL ? `تم استخراج: ${productData.title.slice(0, 50)}...` : `Extracted: ${productData.title.slice(0, 50)}...`)
            : (isRTL ? 'تم استخراج بيانات المنتج' : 'Product data extracted'),
        });
      } else {
        throw new Error(isRTL ? 'لم يتم العثور على بيانات المنتج' : 'No product data found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      toast({
        title: isRTL ? 'فشل الاستخراج' : 'Extraction Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          {isRTL ? 'رابط المنتج (اختياري)' : 'Product URL (Optional)'}
          {extractedData && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        </Label>
        
        <div className="flex gap-2">
          <Input
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder={isRTL ? 'https://noon.com/egypt/...' : 'https://amazon.com/dp/...'}
            className="flex-1"
            dir="ltr"
          />
          <Button
            onClick={handleExtract}
            disabled={isExtracting || !productUrl.trim()}
            variant="secondary"
            className="min-w-[130px]"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isRTL ? 'جاري...' : 'Loading...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {isRTL ? 'استخراج ذكي' : 'AI Extract'}
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {isRTL 
            ? '💡 أدخل رابط من Noon، Amazon، AliExpress لاستخراج البيانات تلقائياً'
            : '💡 Enter URL from Noon, Amazon, AliExpress to auto-extract data'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{isRTL ? 'خطأ' : 'Error'}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Preview */}
      {extractedData && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-300">
            {isRTL ? '✅ تم استخراج البيانات' : '✅ Data Extracted'}
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              {extractedData.brand && (
                <span className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                  {isRTL ? 'العلامة:' : 'Brand:'} {extractedData.brand}
                </span>
              )}
              {extractedData.price && (
                <span className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                  {isRTL ? 'السعر:' : 'Price:'} {extractedData.price}
                </span>
              )}
              {extractedData.rating && (
                <span className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                  ⭐ {extractedData.rating}
                </span>
              )}
              {extractedData.features && extractedData.features.length > 0 && (
                <span className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                  {isRTL ? 'المميزات:' : 'Features:'} {extractedData.features.length}
                </span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
