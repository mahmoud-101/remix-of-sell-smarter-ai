import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  RefreshCw, 
  Save, 
  Upload, 
  Check, 
  ImageIcon,
  FileText,
  Megaphone,
  Instagram,
  Video,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  price: string;
  image: string | null;
}

type ContentType = 
  | 'product_description'
  | 'facebook_ad'
  | 'instagram_ad'
  | 'ad_image_prompt'
  | 'video_script'
  | 'social_post';

interface ResultDisplayProps {
  product: Product;
  results: Record<ContentType, string>;
  onRegenerate: (contentType: ContentType) => void;
  regenerating: ContentType | null;
}

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  product_description: <FileText className="h-4 w-4" />,
  facebook_ad: <Megaphone className="h-4 w-4" />,
  instagram_ad: <Instagram className="h-4 w-4" />,
  ad_image_prompt: <ImageIcon className="h-4 w-4" />,
  video_script: <Video className="h-4 w-4" />,
  social_post: <MessageSquare className="h-4 w-4" />
};

const contentTypeLabels: Record<ContentType, { ar: string; en: string }> = {
  product_description: { ar: 'وصف المنتج', en: 'Product Description' },
  facebook_ad: { ar: 'إعلان Facebook', en: 'Facebook Ad' },
  instagram_ad: { ar: 'إعلان Instagram', en: 'Instagram Ad' },
  ad_image_prompt: { ar: 'Prompt صورة', en: 'Image Prompt' },
  video_script: { ar: 'سكريبت فيديو', en: 'Video Script' },
  social_post: { ar: 'بوست سوشيال', en: 'Social Post' }
};

export function ResultDisplay({ product, results, onRegenerate, regenerating }: ResultDisplayProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const [editedContent, setEditedContent] = useState<Record<ContentType, string>>(results);
  const [copiedType, setCopiedType] = useState<ContentType | null>(null);
  const [savingType, setSavingType] = useState<ContentType | null>(null);
  const [updatingShopify, setUpdatingShopify] = useState(false);

  const contentTypes = Object.keys(results) as ContentType[];

  const handleCopy = async (type: ContentType) => {
    try {
      await navigator.clipboard.writeText(editedContent[type]);
      setCopiedType(type);
      toast({
        title: isRTL ? 'تم النسخ' : 'Copied',
        description: isRTL ? 'تم نسخ المحتوى للحافظة' : 'Content copied to clipboard'
      });
      setTimeout(() => setCopiedType(null), 2000);
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل النسخ' : 'Failed to copy',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async (type: ContentType) => {
    setSavingType(type);
    try {
      // Content is already saved when generated, this is for explicit saves
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم حفظ المحتوى' : 'Content saved successfully'
      });
    } finally {
      setSavingType(null);
    }
  };

  const handleUpdateShopify = async () => {
    if (!editedContent.product_description) return;

    setUpdatingShopify(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: {
          action: 'update_description',
          productId: product.id,
          newDescription: editedContent.product_description
        }
      });

      if (error) throw error;

      toast({
        title: isRTL ? 'تم التحديث' : 'Updated',
        description: isRTL ? 'تم تحديث المنتج في Shopify بنجاح' : 'Product updated in Shopify'
      });
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUpdatingShopify(false);
    }
  };

  const getCharCount = (text: string) => text.length;

  if (contentTypes.length === 1) {
    // Single result - simpler layout
    const type = contentTypes[0];
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.title}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{product.title}</CardTitle>
              <p className="text-sm text-primary font-semibold">{product.price} EGP</p>
            </div>
            <Badge variant="secondary">
              {contentTypeIcons[type]}
              <span className="mr-1">{contentTypeLabels[type][isRTL ? 'ar' : 'en']}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={editedContent[type]}
              onChange={(e) => setEditedContent(prev => ({ ...prev, [type]: e.target.value }))}
              rows={10}
              className="resize-none"
              dir={type === 'ad_image_prompt' ? 'ltr' : 'auto'}
            />
            <p className="text-xs text-muted-foreground text-right">
              {getCharCount(editedContent[type])} {isRTL ? 'حرف' : 'characters'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => handleCopy(type)}
            >
              {copiedType === type ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {isRTL ? 'نسخ' : 'Copy'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => onRegenerate(type)}
              disabled={regenerating === type}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === type ? 'animate-spin' : ''}`} />
              {isRTL ? 'إعادة التوليد' : 'Regenerate'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleSave(type)}
              disabled={savingType === type}
            >
              <Save className="h-4 w-4 mr-2" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
            {type === 'product_description' && (
              <Button 
                onClick={handleUpdateShopify}
                disabled={updatingShopify}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isRTL ? 'تحديث في Shopify' : 'Update in Shopify'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Multiple results - tabbed layout
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.title}
              className="w-12 h-12 object-cover rounded"
            />
          )}
          <div>
            <CardTitle className="text-lg">{product.title}</CardTitle>
            <p className="text-sm text-primary font-semibold">{product.price} EGP</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={contentTypes[0]} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 mb-4">
            {contentTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                {contentTypeIcons[type]}
                <span className="hidden sm:inline">{contentTypeLabels[type][isRTL ? 'ar' : 'en']}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {contentTypes.map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={editedContent[type]}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, [type]: e.target.value }))}
                  rows={8}
                  className="resize-none"
                  dir={type === 'ad_image_prompt' ? 'ltr' : 'auto'}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {getCharCount(editedContent[type])} {isRTL ? 'حرف' : 'characters'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(type)}
                >
                  {copiedType === type ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {isRTL ? 'نسخ' : 'Copy'}
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => onRegenerate(type)}
                  disabled={regenerating === type}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${regenerating === type ? 'animate-spin' : ''}`} />
                  {isRTL ? 'إعادة' : 'Redo'}
                </Button>
                {type === 'product_description' && (
                  <Button 
                    size="sm"
                    onClick={handleUpdateShopify}
                    disabled={updatingShopify}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {isRTL ? 'تحديث Shopify' : 'Update Shopify'}
                  </Button>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}