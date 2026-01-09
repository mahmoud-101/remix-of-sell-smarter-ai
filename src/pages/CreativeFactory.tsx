import { useState, useRef } from "react";
import { Palette, Sparkles, Loader2, Download, Image as ImageIcon, RefreshCw, Upload, X, Lightbulb } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [productText, setProductText] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [usage, setUsage] = useState("ad");
  const [style, setStyle] = useState("professional");
  const [background, setBackground] = useState("studio");
  const [platform, setPlatform] = useState("instagram");
  const [userIdeas, setUserIdeas] = useState("");

  // Loading states
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  
  // Results
  const [promptData, setPromptData] = useState<{
    main_prompt: string;
    negative_prompt: string;
    use_reference_image: boolean;
    reference_image_url?: string;
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
    { value: "custom", label: isRTL ? "مخصص (اكتب في الأفكار)" : "Custom (write in ideas)" },
  ];

  const platformOptions = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "tiktok", label: "TikTok" },
    { value: "store", label: isRTL ? "متجر إلكتروني" : "E-commerce Store" },
    { value: "amazon", label: "Amazon" },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(isRTL ? "حجم الصورة يجب أن يكون أقل من 5MB" : "Image size must be less than 5MB");
        return;
      }
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setProductImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGeneratePrompt = async () => {
    if (!productText.trim()) {
      toast.error(isRTL ? "يرجى إدخال اسم/وصف المنتج" : "Please enter product name/description");
      return;
    }

    setIsGeneratingPrompt(true);
    setPromptData(null);
    setGeneratedImages([]);

    try {
      // If there's an image, upload it first
      let uploadedImageUrl: string | undefined;
      if (productImage && productImagePreview) {
        // For now, we'll use the base64 preview as URL reference
        // In production, you'd upload to Supabase Storage
        uploadedImageUrl = productImagePreview;
      }

      const { data, error } = await supabase.functions.invoke("product-photo-prompt", {
        body: { 
          product_text: productText,
          product_image_provided: !!productImage,
          product_image_url: uploadedImageUrl,
          usage, 
          style, 
          background, 
          platform,
          user_ideas: userIdeas.trim() || undefined
        },
      });

      if (error) throw error;

      setPromptData(data);
      toast.success(isRTL ? "تم إنشاء البرومبت بنجاح!" : "Prompt generated successfully!");
      
      // Auto-generate images after getting prompts
      await generateAllImages(data, uploadedImageUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error generating prompt:", error);
      toast.error(message);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateAllImages = async (data: typeof promptData, referenceImageUrl?: string) => {
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
        
        // If using reference image and it's available, use edit endpoint
        const functionName = data.use_reference_image && referenceImageUrl 
          ? "generate-image" 
          : "generate-image";
          
        const { data: imageData, error } = await supabase.functions.invoke(functionName, {
          body: { 
            prompt: promptText,
            style: style,
            background: background,
            // Pass reference image for image-to-image generation
            ...(data.use_reference_image && referenceImageUrl ? { 
              reference_image: referenceImageUrl 
            } : {})
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

  const ideaExamples = [
    isRTL ? "بخار طالع من الكوب" : "Steam rising from the cup",
    isRTL ? "جو رمضاني" : "Ramadan atmosphere",
    isRTL ? "إضاءة نيون بنفسجي" : "Purple neon lighting",
    isRTL ? "خلفية رخام فاخر" : "Luxury marble background",
  ];

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
              {isRTL ? "أدخل معلومات المنتج أو ارفع صورته للحصول على صور احترافية" : "Enter product info or upload image to get professional photos"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Text */}
            <div className="space-y-2">
              <Label>{isRTL ? "اسم/وصف المنتج *" : "Product Name/Description *"}</Label>
              <Input 
                value={productText}
                onChange={(e) => setProductText(e.target.value)}
                placeholder={isRTL ? "مثال: عطر رجالي فاخر بزجاجة سوداء، سماعة بلوتوث بيضاء" : "e.g., Luxury men's perfume with black bottle, White bluetooth earbuds"}
              />
            </div>

            {/* Product Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {isRTL ? "صورة المنتج (اختياري)" : "Product Image (Optional)"}
                <span className="text-xs text-muted-foreground">
                  {isRTL ? "- ستُستخدم كمرجع للشكل والألوان" : "- Will be used as shape & color reference"}
                </span>
              </Label>
              
              {productImagePreview ? (
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                  <img 
                    src={productImagePreview} 
                    alt="Product preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 w-6 h-6"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "اضغط لرفع صورة المنتج" : "Click to upload product image"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? "PNG, JPG حتى 5MB" : "PNG, JPG up to 5MB"}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {/* Settings Grid */}
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

            {/* User Ideas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                {isRTL ? "أفكار إضافية (اختياري)" : "Additional Ideas (Optional)"}
              </Label>
              <Textarea 
                value={userIdeas}
                onChange={(e) => setUserIdeas(e.target.value)}
                placeholder={isRTL 
                  ? "مثال: أبغى بخار طالع من الكوب، جو رمضاني، إضاءة نيون بنفسجي..." 
                  : "e.g., Steam rising from cup, Ramadan atmosphere, Purple neon lighting..."}
                rows={2}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {ideaExamples.map((idea, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setUserIdeas(prev => prev ? `${prev}, ${idea}` : idea)}
                  >
                    + {idea}
                  </Button>
                ))}
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

        {/* Reference Image Indicator */}
        {promptData?.use_reference_image && productImagePreview && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3 flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span className="text-sm">
                {isRTL 
                  ? "يتم استخدام صورة المنتج كمرجع للشكل والألوان في جميع الصور المولّدة"
                  : "Product image is being used as shape & color reference for all generated images"}
              </span>
            </CardContent>
          </Card>
        )}

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
                          onClick={() => downloadImage(img.url, `${productText}-${img.type}`)}
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
                    ? "أدخل اسم المنتج أو ارفع صورته، اختر الإعدادات، واضغط توليد"
                    : "Enter product name or upload image, choose settings, and click generate"}
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
