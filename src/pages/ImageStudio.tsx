import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHistory } from "@/hooks/useHistory";
import { 
  ImageIcon, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Upload,
  X,
  Wand2,
  Camera,
  Shirt,
  Sun,
  Layers,
  Minimize2
} from "lucide-react";

type ImageStyle = "lifestyle" | "flatlay" | "model" | "studio" | "minimal";

const imageStyles: Array<{
  value: ImageStyle;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: any;
  gradient: string;
  example: string;
}> = [
  { 
    value: "lifestyle", 
    label: { ar: "لايف ستايل", en: "Lifestyle" },
    description: { ar: "إعلان مع خلفية واقعية ونص عربي", en: "Ad with lifestyle background & Arabic text" },
    icon: Sun,
    gradient: "from-orange-500 to-amber-500",
    example: "ريحتك بتسبقك ✨"
  },
  { 
    value: "flatlay", 
    label: { ar: "فلات لاي", en: "Flat Lay" },
    description: { ar: "تصوير من الأعلى مع عناصر جذابة", en: "Top-down with attractive elements" },
    icon: Camera,
    gradient: "from-blue-500 to-cyan-500",
    example: "أحلى هدية للأم 🎁"
  },
  { 
    value: "model", 
    label: { ar: "بيوتي", en: "Beauty" },
    description: { ar: "إعلان جمال مع موديل ومقارنات", en: "Beauty ad with model & comparisons" },
    icon: Shirt,
    gradient: "from-pink-500 to-rose-500",
    example: "بلمسة واحدة بس! 💫"
  },
  { 
    value: "studio", 
    label: { ar: "كتالوج", en: "Catalog" },
    description: { ar: "إعلان منتج احترافي مع مميزات", en: "Professional product ad with features" },
    icon: Layers,
    gradient: "from-gray-500 to-slate-500",
    example: "اطلبي الآن - توصيل مجاني 🚚"
  },
  { 
    value: "minimal", 
    label: { ar: "فاخر", en: "Luxury" },
    description: { ar: "إعلان فاخر بتصميم راقي", en: "Luxury ad with elegant design" },
    icon: Minimize2,
    gradient: "from-purple-500 to-violet-500",
    example: "تركيبة شرقية فاخرة 💎"
  },
];

export default function ImageStudio() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveToHistory } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>("lifestyle");
  
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ imageUrl: string; angle: string; angleAr: string }>>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: isRTL ? "ملف غير صالح" : "Invalid file",
        description: isRTL ? "يرجى رفع صورة" : "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: isRTL ? "الملف كبير جداً" : "File too large",
        description: isRTL ? "الحد الأقصى 10MB" : "Maximum size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setProductImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProductImage(null);
    setProductImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: isRTL ? "يرجى تسجيل الدخول" : "Please login",
        variant: "destructive",
      });
      return;
    }

    if (!productName.trim() && !customPrompt.trim()) {
      toast({
        title: isRTL ? "أدخل اسم المنتج أو برومبت" : "Enter product name or prompt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedImages([]);

    try {
      // Build the prompt
      const styleInfo = imageStyles.find(s => s.value === style);
      const styleLabel = isRTL ? styleInfo?.label.ar : styleInfo?.label.en;
      
      let prompt = customPrompt.trim() || `${productName}, ${styleLabel} style, professional product photography`;
      
      // Add style-specific enhancements
      switch (style) {
        case "lifestyle":
          prompt += ", natural lighting, warm atmosphere, lifestyle setting";
          break;
        case "flatlay":
          prompt += ", top-down view, organized layout, clean background";
          break;
        case "model":
          prompt += ", fashion model wearing the product, editorial style";
          break;
        case "studio":
          prompt += ", white background, professional studio lighting, clean";
          break;
        case "minimal":
          prompt += ", minimalist composition, soft shadows, elegant";
          break;
      }

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt,
          style,
          productImage: productImage, // Base64 image if uploaded
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Handle multiple images response
      const images = data?.images as Array<{ imageUrl: string; angle: string; angleAr: string }> | undefined;
      const imageCount = data?.count || 1;
      
      if (images && images.length > 0) {
        setGeneratedImages(images);
        
        // Save to history automatically
        await saveToHistory(
          "design",
          { productName, style, customPrompt },
          { title: productName || customPrompt?.substring(0, 50), imageCount: images.length, style }
        );
        
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
          description: isRTL 
            ? `تم إنشاء ${images.length} صور - تم الحفظ في السجل` 
            : `${images.length} images created - saved to history`,
        });
      } else if (data?.imageUrl) {
        // Backward compatibility
        setGeneratedImages([{ imageUrl: data.imageUrl, angle: "front", angleAr: "أمامي" }]);
        
        // Save to history
        await saveToHistory(
          "design",
          { productName, style, customPrompt },
          { title: productName || customPrompt?.substring(0, 50), imageCount: 1, style }
        );
        
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
          description: isRTL ? "تم إنشاء الصورة - تم الحفظ في السجل" : "Image created - saved to history",
        });
      } else {
        throw new Error(isRTL ? "لم يتم توليد الصورة" : "No image generated");
      }
    } catch (e: any) {
      console.error("Image generation error:", e);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: e?.message || (isRTL ? "فشل التوليد" : "Generation failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, angleName: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s+/g, "-") || "product"}-${style}-${angleName}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: isRTL ? "✓ تم التحميل" : "✓ Downloaded",
      });
    } catch {
      toast({
        title: isRTL ? "فشل التحميل" : "Download failed",
        variant: "destructive",
      });
    }
  };

  const downloadAllImages = async () => {
    for (let i = 0; i < generatedImages.length; i++) {
      await downloadImage(generatedImages[i].imageUrl, generatedImages[i].angle, i);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast({
      title: isRTL ? "✓ تم تحميل جميع الصور" : "✓ All images downloaded",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isRTL ? "استوديو الصور" : "Image Studio"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "صور إعلانية احترافية بجودة 4K • Gemini 3 Pro Image"
                  : "Professional 4K ad images • Gemini 3 Pro Image"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 bg-amber-50">
              📸 Pro Image
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Wand2 className="w-3 h-3" />
              AI Powered
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Input */}
          <div className="space-y-6">
            {/* Product Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {isRTL ? "صورة المنتج" : "Product Image"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "ارفع صورة منتجك لتحسين النتائج (اختياري)"
                    : "Upload your product image for better results (optional)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productImage ? (
                  <div className="relative group">
                    <img 
                      src={productImage} 
                      alt="Product" 
                      className="w-full h-48 object-contain rounded-lg border bg-muted/50"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">
                      {isRTL ? "اضغط لرفع صورة" : "Click to upload image"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "PNG, JPG حتى 10MB" : "PNG, JPG up to 10MB"}
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "تفاصيل التوليد" : "Generation Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "اسم المنتج" : "Product Name"}</Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={isRTL ? "فستان سهرة أسود" : "Black Evening Dress"}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "برومبت مخصص (اختياري)" : "Custom Prompt (optional)"}</Label>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={isRTL 
                      ? "اكتب وصفاً تفصيلياً للصورة التي تريدها..."
                      : "Write a detailed description of the image you want..."}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? "💡 اترك فارغاً لاستخدام الاسم والستايل تلقائياً"
                      : "💡 Leave empty to auto-generate from name and style"}
                  </p>
                </div>

                {/* Generate Button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg gap-2"
                  onClick={handleGenerate}
                  disabled={loading || (!productName.trim() && !customPrompt.trim())}
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      {isRTL ? "جارٍ التوليد..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {isRTL ? "توليد صورة إعلانية" : "Generate Ad Image"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Style Selection & Results */}
          <div className="space-y-6">
            {/* Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  {isRTL ? "اختر الستايل" : "Choose Style"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {imageStyles.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                          style === s.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="text-start flex-1">
                          <span className="font-medium block">
                            {isRTL ? s.label.ar : s.label.en}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {isRTL ? s.description.ar : s.description.en}
                          </span>
                          <span className="text-xs text-primary mt-0.5 block">
                            {s.example}
                          </span>
                        </div>
                        {style === s.value && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Generated Images */}
            {generatedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {isRTL ? `الصور المُولّدة (${generatedImages.length})` : `Generated Images (${generatedImages.length})`}
                    </CardTitle>
                    {generatedImages.length > 1 && (
                      <Button variant="outline" size="sm" onClick={downloadAllImages} className="gap-2">
                        <Download className="w-4 h-4" />
                        {isRTL ? "تحميل الكل" : "Download All"}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedImages.map((img, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="gap-1">
                          <Camera className="w-3 h-3" />
                          {isRTL ? img.angleAr : img.angle}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {index + 1}/{generatedImages.length}
                        </span>
                      </div>
                      <div className="relative group">
                        <img
                          src={img.imageUrl}
                          alt={`${productName} - ${isRTL ? img.angleAr : img.angle}`}
                          className="w-full rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => downloadImage(img.imageUrl, img.angle, index)}
                            className="gap-2"
                          >
                            <Download className="w-5 h-5" />
                            {isRTL ? "تحميل" : "Download"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {generatedImages.length === 0 && !loading && (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? "الصورة ستظهر هنا" : "Image will appear here"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isRTL
                      ? "اختر ستايل وأدخل بيانات المنتج لتوليد صورة إعلانية"
                      : "Choose a style and enter product details to generate an ad image"}
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
