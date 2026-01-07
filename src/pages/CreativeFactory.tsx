import { useState } from "react";
import { Palette, Sparkles, Loader2, Download, Image as ImageIcon, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedImage {
  url: string;
  prompt: string;
  type: string;
}

export default function CreativeFactory() {
  const { isRTL } = useLanguage();
  
  // Form states
  const [product, setProduct] = useState("");
  const [usage, setUsage] = useState("ad");
  const [style, setStyle] = useState("professional");
  const [background, setBackground] = useState("studio");
  const [platform, setPlatform] = useState("instagram");

  // Loading states
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  
  // Results
  const [promptData, setPromptData] = useState<{
    main_prompt: string;
    negative_prompt: string;
    variations: string[];
    recommended_settings: {
      aspect_ratio: string;
      style_hint: string;
      platform_fit: string;
    };
  } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const usageOptions = [
    { value: "ad", label: isRTL ? "إعلان مدفوع" : "Paid Ad" },
    { value: "store", label: isRTL ? "صفحة منتج في متجر" : "Product Page" },
    { value: "social", label: isRTL ? "سوشيال ميديا" : "Social Media" },
    { value: "amazon", label: isRTL ? "أمازون / ماركت بليس" : "Amazon / Marketplace" },
  ];

  const styleOptions = [
    { value: "minimal", label: isRTL ? "مينيمال" : "Minimal" },
    { value: "luxury", label: isRTL ? "فاخر" : "Luxury" },
    { value: "playful", label: isRTL ? "مرح" : "Playful" },
    { value: "professional", label: isRTL ? "احترافي" : "Professional" },
    { value: "lifestyle", label: isRTL ? "لايف ستايل" : "Lifestyle" },
    { value: "catalog", label: isRTL ? "كتالوج" : "Catalog" },
    { value: "creative", label: isRTL ? "إبداعي" : "Creative" },
  ];

  const backgroundOptions = [
    { value: "white", label: isRTL ? "أبيض" : "White" },
    { value: "studio", label: isRTL ? "استوديو" : "Studio" },
    { value: "living_room", label: isRTL ? "غرفة معيشة" : "Living Room" },
    { value: "office", label: isRTL ? "مكتب" : "Office" },
    { value: "bathroom", label: isRTL ? "حمام" : "Bathroom" },
    { value: "outdoor", label: isRTL ? "طبيعة خارجية" : "Outdoor" },
    { value: "kitchen", label: isRTL ? "مطبخ" : "Kitchen" },
  ];

  const platformOptions = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "tiktok", label: "TikTok" },
    { value: "store", label: isRTL ? "متجر إلكتروني" : "E-commerce Store" },
    { value: "amazon", label: "Amazon" },
  ];

  const handleGeneratePrompt = async () => {
    if (!product.trim()) {
      toast.error(isRTL ? "يرجى إدخال اسم المنتج" : "Please enter product name");
      return;
    }

    setIsGeneratingPrompt(true);
    setPromptData(null);
    setGeneratedImages([]);

    try {
      const { data, error } = await supabase.functions.invoke("product-photo-prompt", {
        body: { product, usage, style, background, platform },
      });

      if (error) throw error;

      setPromptData(data);
      toast.success(isRTL ? "تم إنشاء البرومبت بنجاح!" : "Prompt generated successfully!");
      
      // Auto-generate images after getting prompts
      await generateAllImages(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error generating prompt:", error);
      toast.error(message);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateAllImages = async (data: typeof promptData) => {
    if (!data) return;
    
    setIsGeneratingImages(true);
    const allPrompts = [data.main_prompt, ...data.variations];
    const types = ["main", "lifestyle", "flat_lay", "close_up"];
    
    for (let i = 0; i < allPrompts.length; i++) {
      setGeneratingIndex(i);
      try {
        const promptText = allPrompts[i].includes(":") 
          ? allPrompts[i].split(":").slice(1).join(":").trim()
          : allPrompts[i];
          
        const { data: imageData, error } = await supabase.functions.invoke("generate-image", {
          body: { 
            prompt: promptText,
            style: style,
            background: background 
          },
        });

        if (error) {
          console.error(`Error generating image ${i}:`, error);
          continue;
        }

        if (imageData?.imageUrl) {
          setGeneratedImages(prev => [...prev, {
            url: imageData.imageUrl,
            prompt: promptText,
            type: types[i] || `variation_${i}`,
          }]);
        }
      } catch (error) {
        console.error(`Error generating image ${i}:`, error);
      }
    }
    
    setGeneratingIndex(null);
    setIsGeneratingImages(false);
    toast.success(isRTL ? "تم إنشاء الصور!" : "Images generated!");
  };

  const regenerateImage = async (index: number) => {
    if (!promptData) return;
    
    const allPrompts = [promptData.main_prompt, ...promptData.variations];
    const types = ["main", "lifestyle", "flat_lay", "close_up"];
    
    setGeneratingIndex(index);
    
    try {
      const promptText = allPrompts[index].includes(":") 
        ? allPrompts[index].split(":").slice(1).join(":").trim()
        : allPrompts[index];
        
      const { data: imageData, error } = await supabase.functions.invoke("generate-image", {
        body: { 
          prompt: promptText,
          style: style,
          background: background 
        },
      });

      if (error) throw error;

      if (imageData?.imageUrl) {
        setGeneratedImages(prev => {
          const newImages = [...prev];
          newImages[index] = {
            url: imageData.imageUrl,
            prompt: promptText,
            type: types[index] || `variation_${index}`,
          };
          return newImages;
        });
        toast.success(isRTL ? "تم تجديد الصورة!" : "Image regenerated!");
      }
    } catch (error) {
      console.error("Error regenerating image:", error);
      toast.error(isRTL ? "حدث خطأ" : "Error occurred");
    } finally {
      setGeneratingIndex(null);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success(isRTL ? "جاري التحميل..." : "Downloading...");
    } catch {
      toast.error(isRTL ? "فشل التحميل" : "Download failed");
    }
  };

  const imageTypeLabels: Record<string, { ar: string; en: string }> = {
    main: { ar: "الصورة الرئيسية", en: "Main Image" },
    lifestyle: { ar: "لايف ستايل", en: "Lifestyle" },
    flat_lay: { ar: "Flat Lay", en: "Flat Lay" },
    close_up: { ar: "تفاصيل قريبة", en: "Close-up Detail" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? "مصنع صور المنتجات" : "Product Photo Factory"}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? "ولّد صور احترافية لمنتجاتك للإعلانات والمتاجر" 
                : "Generate professional product photos for ads & stores"}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "بيانات المنتج" : "Product Details"}</CardTitle>
            <CardDescription>
              {isRTL ? "أدخل معلومات المنتج للحصول على صور احترافية" : "Enter product info to get professional photos"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? "المنتج *" : "Product *"}</Label>
              <Input 
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder={isRTL ? "مثال: عطر رجالي فاخر، سماعة بلوتوث، كريم عناية" : "e.g., Luxury men's perfume, Bluetooth earbuds, Skin cream"}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? "الاستخدام" : "Usage"}</Label>
                <Select value={usage} onValueChange={setUsage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usageOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "الستايل" : "Style"}</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "الخلفية" : "Background"}</Label>
                <Select value={background} onValueChange={setBackground}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "المنصة" : "Platform"}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGeneratePrompt} 
              disabled={isGeneratingPrompt || isGeneratingImages}
              className="w-full"
              variant="hero"
            >
              {isGeneratingPrompt || isGeneratingImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isGeneratingPrompt 
                    ? (isRTL ? "جاري إنشاء البرومبت..." : "Creating prompt...")
                    : (isRTL ? `جاري توليد الصورة ${(generatingIndex || 0) + 1}...` : `Generating image ${(generatingIndex || 0) + 1}...`)
                  }
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isRTL ? "ولّد صور المنتج" : "Generate Product Photos"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Images Grid */}
        {generatedImages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {isRTL ? "الصور المولّدة" : "Generated Images"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {generatedImages.map((img, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    {generatingIndex === index ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <img 
                        src={img.url} 
                        alt={img.type}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {imageTypeLabels[img.type]?.[isRTL ? "ar" : "en"] || img.type}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateImage(index)}
                          disabled={generatingIndex !== null}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadImage(img.url, `${product}-${img.type}`)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isGeneratingPrompt && !isGeneratingImages && generatedImages.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">
                  {isRTL ? "ابدأ بتوليد صور منتجك" : "Start generating your product photos"}
                </h3>
                <p className="text-sm">
                  {isRTL 
                    ? "أدخل اسم المنتج واختر الإعدادات ثم اضغط توليد"
                    : "Enter product name, choose settings, and click generate"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Info */}
        {promptData?.recommended_settings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isRTL ? "الإعدادات الموصى بها" : "Recommended Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{isRTL ? "نسبة العرض:" : "Aspect Ratio:"}</span>
                  <p className="font-medium">{promptData.recommended_settings.aspect_ratio}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{isRTL ? "نوع الستايل:" : "Style Hint:"}</span>
                  <p className="font-medium">{promptData.recommended_settings.style_hint}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{isRTL ? "مناسب لـ:" : "Platform Fit:"}</span>
                  <p className="font-medium">{promptData.recommended_settings.platform_fit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
