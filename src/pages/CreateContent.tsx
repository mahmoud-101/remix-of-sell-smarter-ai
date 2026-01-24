import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ResultDisplay } from '@/components/shopify/ResultDisplay';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Sparkles, 
  FileText, 
  Megaphone, 
  Instagram, 
  ImageIcon, 
  Video, 
  MessageSquare,
  Loader2,
  Rocket,
  Package
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

  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
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
    if (!productTitle.trim()) {
      toast({
        title: isRTL ? 'أدخل اسم المنتج' : 'Enter Product Name',
        description: isRTL ? 'يرجى إدخال اسم المنتج أولاً' : 'Please enter a product name first',
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

    const product: Product = {
      id: Date.now().toString(),
      title: productTitle,
      handle: productTitle.toLowerCase().replace(/\s+/g, '-'),
      price: productPrice || '0',
      image: null,
      description: productDescription,
      url: ''
    };

    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          product,
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
    if (!productTitle.trim()) return;

    const product: Product = {
      id: Date.now().toString(),
      title: productTitle,
      handle: productTitle.toLowerCase().replace(/\s+/g, '-'),
      price: productPrice || '0',
      image: null,
      description: productDescription,
      url: ''
    };

    setRegenerating(contentType);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          product,
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

  const selectedProduct: Product | null = productTitle.trim() ? {
    id: Date.now().toString(),
    title: productTitle,
    handle: productTitle.toLowerCase().replace(/\s+/g, '-'),
    price: productPrice || '0',
    image: null,
    description: productDescription,
    url: ''
  } : null;

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
              ? 'أدخل بيانات المنتج وحدد نوع المحتوى المطلوب'
              : 'Enter product details and choose the content type'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Product Input & Settings */}
          <div className="space-y-6">
            {/* Product Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {isRTL ? '1. أدخل بيانات المنتج' : '1. Enter Product Details'}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? 'أدخل اسم المنتج ووصفه وسعره'
                    : 'Enter product name, description, and price'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'اسم المنتج *' : 'Product Name *'}</Label>
                  <Input
                    placeholder={isRTL ? 'مثال: ساعة ذكية سبورت' : 'e.g., Smart Sport Watch'}
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'وصف المنتج (اختياري)' : 'Product Description (optional)'}</Label>
                  <Textarea
                    placeholder={isRTL ? 'أضف وصفاً للمنتج لنتائج أفضل...' : 'Add a description for better results...'}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'السعر (اختياري)' : 'Price (optional)'}</Label>
                  <Input
                    type="number"
                    placeholder={isRTL ? '299' : '299'}
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </div>
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
              disabled={generating || !productTitle.trim() || selectedContentTypes.length === 0}
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
                      ? 'أدخل بيانات المنتج ونوع المحتوى ثم اضغط "توليد"'
                      : 'Enter product details and content type, then click "Generate"'}
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
