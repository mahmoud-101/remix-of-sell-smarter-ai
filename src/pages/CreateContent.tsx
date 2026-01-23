import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProductSelector } from '@/components/shopify/ProductSelector';
import { ResultDisplay } from '@/components/shopify/ResultDisplay';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  FileText, 
  Megaphone, 
  Instagram, 
  ImageIcon, 
  Video, 
  MessageSquare,
  Loader2,
  Rocket
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  image: string | null;
  description: string;
  descriptionText?: string;
  url: string;
  vendor?: string;
  productType?: string;
  compareAtPrice?: string | null;
  inventoryQuantity?: number;
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

const contentTypeOptions: { id: ContentType; icon: React.ReactNode; labelAr: string; labelEn: string }[] = [
  { id: 'product_description', icon: <FileText className="h-5 w-5" />, labelAr: 'وصف المنتج', labelEn: 'Product Description' },
  { id: 'facebook_ad', icon: <Megaphone className="h-5 w-5" />, labelAr: 'إعلان Facebook', labelEn: 'Facebook Ad' },
  { id: 'instagram_ad', icon: <Instagram className="h-5 w-5" />, labelAr: 'إعلان Instagram', labelEn: 'Instagram Ad' },
  { id: 'ad_image_prompt', icon: <ImageIcon className="h-5 w-5" />, labelAr: 'صورة إعلانية', labelEn: 'Ad Image Prompt' },
  { id: 'video_script', icon: <Video className="h-5 w-5" />, labelAr: 'سكريبت فيديو', labelEn: 'Video Script' },
  { id: 'social_post', icon: <MessageSquare className="h-5 w-5" />, labelAr: 'بوست سوشيال', labelEn: 'Social Post' }
];

const toneOptions: { value: Tone; labelAr: string; labelEn: string }[] = [
  { value: 'formal', labelAr: 'رسمي', labelEn: 'Formal' },
  { value: 'casual', labelAr: 'شبابي', labelEn: 'Casual' },
  { value: 'luxury', labelAr: 'فاخر', labelEn: 'Luxury' },
  { value: 'friendly', labelAr: 'ودود', labelEn: 'Friendly' }
];

const lengthLabels = {
  short: { ar: 'قصير', en: 'Short' },
  medium: { ar: 'متوسط', en: 'Medium' },
  long: { ar: 'طويل', en: 'Long' }
};

export default function CreateContent() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(['product_description']);
  const [tone, setTone] = useState<Tone>('friendly');
  const [length, setLength] = useState<ContentLength>('medium');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Record<ContentType, string> | null>(null);
  const [regenerating, setRegenerating] = useState<ContentType | null>(null);

  const lengthValue = length === 'short' ? 0 : length === 'medium' ? 50 : 100;

  const handleContentTypeToggle = (type: ContentType) => {
    setSelectedContentTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleLengthChange = (value: number[]) => {
    const v = value[0];
    if (v <= 25) setLength('short');
    else if (v <= 75) setLength('medium');
    else setLength('long');
  };

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast({
        title: isRTL ? 'اختر منتج' : 'Select Product',
        description: isRTL ? 'يرجى اختيار منتج أولاً' : 'Please select a product first',
        variant: 'destructive'
      });
      return;
    }

    if (selectedContentTypes.length === 0) {
      toast({
        title: isRTL ? 'اختر نوع المحتوى' : 'Select Content Type',
        description: isRTL ? 'يرجى اختيار نوع محتوى واحد على الأقل' : 'Please select at least one content type',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          product: selectedProduct,
          contentTypes: selectedContentTypes,
          tone,
          length
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results);
      toast({
        title: isRTL ? 'تم التوليد بنجاح!' : 'Content Generated!',
        description: data.message
      });
    } catch (error: any) {
      console.error('Generate error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل توليد المحتوى' : 'Failed to generate content'),
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (contentType: ContentType) => {
    if (!selectedProduct) return;

    setRegenerating(contentType);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          product: selectedProduct,
          contentTypes: [contentType],
          tone,
          length
        }
      });

      if (error) throw error;

      setResults(prev => ({
        ...prev,
        [contentType]: data.results[contentType]
      }));

      toast({
        title: isRTL ? 'تم إعادة التوليد' : 'Regenerated',
        description: isRTL ? 'تم توليد محتوى جديد' : 'New content generated'
      });
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            {isRTL ? 'إنشاء محتوى المنتج' : 'Create Product Content'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'اختر منتج من متجرك وحدد نوع المحتوى المطلوب'
              : 'Select a product from your store and choose the content type'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Product Selection & Settings */}
          <div className="space-y-6">
            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isRTL ? '1. اختر المنتج' : '1. Select Product'}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? 'الصق رابط المنتج أو ابحث في متجرك'
                    : 'Paste product URL or search your store'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductSelector 
                  onProductSelect={setSelectedProduct}
                  selectedProduct={selectedProduct}
                />
              </CardContent>
            </Card>

            {/* Content Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isRTL ? '2. اختر نوع المحتوى' : '2. Choose Content Type'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {contentTypeOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedContentTypes.includes(option.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedContentTypes.includes(option.id)}
                        onCheckedChange={() => handleContentTypeToggle(option.id)}
                      />
                      {option.icon}
                      <span className="text-sm font-medium">
                        {isRTL ? option.labelAr : option.labelEn}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isRTL ? '3. إعدادات إضافية' : '3. Additional Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tone */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'نبرة الكتابة' : 'Writing Tone'}</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {isRTL ? opt.labelAr : opt.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Length */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>{isRTL ? 'طول المحتوى' : 'Content Length'}</Label>
                    <span className="text-sm font-medium text-primary">
                      {lengthLabels[length][isRTL ? 'ar' : 'en']}
                    </span>
                  </div>
                  <Slider
                    value={[lengthValue]}
                    onValueChange={handleLengthChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{isRTL ? 'قصير' : 'Short'}</span>
                    <span>{isRTL ? 'متوسط' : 'Medium'}</span>
                    <span>{isRTL ? 'طويل' : 'Long'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button 
              size="lg" 
              className="w-full h-14 text-lg"
              onClick={handleGenerate}
              disabled={generating || !selectedProduct || selectedContentTypes.length === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isRTL ? 'جارٍ التوليد...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 mr-2" />
                  {isRTL ? '🚀 توليد المحتوى الآن' : '🚀 Generate Content Now'}
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div>
            {results && selectedProduct ? (
              <ResultDisplay 
                product={selectedProduct}
                results={results}
                onRegenerate={handleRegenerate}
                regenerating={regenerating}
              />
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
                <CardContent className="text-center py-12">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2 text-muted-foreground">
                    {isRTL ? 'المحتوى المُولّد سيظهر هنا' : 'Generated content will appear here'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'اختر منتج ونوع المحتوى ثم اضغط "توليد"'
                      : 'Select a product and content type, then click "Generate"'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}