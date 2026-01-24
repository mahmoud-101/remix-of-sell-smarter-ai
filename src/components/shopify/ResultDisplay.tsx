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
  Check, 
  ImageIcon,
  FileText,
  Megaphone,
  Instagram,
  Video,
  MessageSquare,
  FileDown,
  FileType,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const isRTL = language === 'ar';

  const [editedContent, setEditedContent] = useState<Record<ContentType, string>>(results);
  const [copiedType, setCopiedType] = useState<ContentType | null>(null);
  const [savingType, setSavingType] = useState<ContentType | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

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
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم حفظ المحتوى' : 'Content saved successfully'
      });
    } finally {
      setSavingType(null);
    }
  };

  const getCharCount = (text: string) => text.length;

  const logExport = async (content: string, format: string) => {
    if (!user) return;
    try {
      await supabase.from('content_exports').insert({
        user_id: user.id,
        content_text: content.substring(0, 5000),
        export_format: format
      });
    } catch (error) {
      console.error('Failed to log export:', error);
    }
  };

  const handleExport = async (type: ContentType, format: 'txt' | 'docx' | 'pdf') => {
    setExporting(`${type}-${format}`);
    const content = editedContent[type];
    const label = contentTypeLabels[type][isRTL ? 'ar' : 'en'];
    
    try {
      await logExport(content, format);
      
      if (format === 'txt') {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, `${product.title}-${label}.txt`);
      } else if (format === 'docx') {
        const htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset="UTF-8"><title>${label}</title></head>
<body style="font-family: ${isRTL ? 'Tajawal, ' : ''}Calibri, sans-serif; direction: ${isRTL ? 'rtl' : 'ltr'};">
<h1 style="color: #6366f1;">${product.title}</h1>
<h2>${label}</h2>
<p style="line-height: 1.8; white-space: pre-wrap;">${content}</p>
</body></html>`;
        const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        downloadBlob(blob, `${product.title}-${label}.doc`);
      } else if (format === 'pdf') {
        const htmlContent = `<!DOCTYPE html>
<html lang="${isRTL ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head><meta charset="UTF-8"><title>${label}</title>
<style>body { font-family: ${isRTL ? 'Tajawal, ' : ''}system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
h1 { color: #6366f1; } p { line-height: 1.8; white-space: pre-wrap; }</style>
</head>
<body><h1>${product.title}</h1><h2>${label}</h2><p>${content}</p></body></html>`;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
      }
      
      toast({
        title: isRTL ? 'تم التصدير!' : 'Exported!',
        description: isRTL ? `تم تصدير ${label} بنجاح` : `${label} exported successfully`
      });
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل التصدير' : 'Export failed',
        variant: 'destructive'
      });
    } finally {
      setExporting(null);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ExportButtons = ({ type }: { type: ContentType }) => (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
      <span className="text-xs text-muted-foreground self-center">
        {isRTL ? 'تصدير:' : 'Export:'}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleExport(type, 'txt')}
        disabled={exporting === `${type}-txt`}
        className="h-7 px-2 text-xs"
      >
        {exporting === `${type}-txt` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
        <span className="hidden sm:inline ms-1">Text</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleExport(type, 'docx')}
        disabled={exporting === `${type}-docx`}
        className="h-7 px-2 text-xs"
      >
        {exporting === `${type}-docx` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileType className="h-3 w-3" />}
        <span className="hidden sm:inline ms-1">Word</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleExport(type, 'pdf')}
        disabled={exporting === `${type}-pdf`}
        className="h-7 px-2 text-xs"
      >
        {exporting === `${type}-pdf` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileDown className="h-3 w-3" />}
        <span className="hidden sm:inline ms-1">PDF</span>
      </Button>
    </div>
  );

  if (contentTypes.length === 1) {
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
              {copiedType === type ? <Check className="h-4 w-4 me-2" /> : <Copy className="h-4 w-4 me-2" />}
              {isRTL ? 'نسخ' : 'Copy'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => onRegenerate(type)}
              disabled={regenerating === type}
            >
              <RefreshCw className={`h-4 w-4 me-2 ${regenerating === type ? 'animate-spin' : ''}`} />
              {isRTL ? 'إعادة التوليد' : 'Regenerate'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleSave(type)}
              disabled={savingType === type}
            >
              <Save className="h-4 w-4 me-2" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </div>
          
          <ExportButtons type={type} />
        </CardContent>
      </Card>
    );
  }

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
                  {copiedType === type ? <Check className="h-4 w-4 me-1" /> : <Copy className="h-4 w-4 me-1" />}
                  {isRTL ? 'نسخ' : 'Copy'}
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => onRegenerate(type)}
                  disabled={regenerating === type}
                >
                  <RefreshCw className={`h-4 w-4 me-1 ${regenerating === type ? 'animate-spin' : ''}`} />
                  {isRTL ? 'إعادة' : 'Redo'}
                </Button>
              </div>
              
              <ExportButtons type={type} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
