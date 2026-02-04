import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHistory } from "@/hooks/useHistory";
import { AIModelSelector, getRecommendedModel, AI_MODELS } from "@/components/ai/AIModelSelector";
import { 
  User, 
  Sparkles, 
  Upload, 
  X, 
  Download,
  Image as ImageIcon,
  RotateCcw,
  Camera,
  Heart,
  Star,
  Package,
  Video
} from "lucide-react";

type UGCType = "lifestyle" | "review" | "unboxing" | "selfie" | "tutorial";

const ugcTypes: Array<{
  value: UGCType;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  emoji: string;
}> = [
  { 
    value: "lifestyle", 
    label: { ar: "لايف ستايل", en: "Lifestyle" },
    description: { ar: "صور حياة يومية حقيقية", en: "Authentic daily life photos" },
    emoji: "🏠"
  },
  { 
    value: "review", 
    label: { ar: "ريفيو", en: "Review" },
    description: { ar: "محتوى مراجعة وتقييم", en: "Review and rating content" },
    emoji: "⭐"
  },
  { 
    value: "unboxing", 
    label: { ar: "أنبوكسينق", en: "Unboxing" },
    description: { ar: "لحظات فتح المنتج", en: "Product unboxing moments" },
    emoji: "📦"
  },
  { 
    value: "selfie", 
    label: { ar: "سيلفي", en: "Selfie" },
    description: { ar: "صور سيلفي طبيعية", en: "Natural selfie style" },
    emoji: "🤳"
  },
  { 
    value: "tutorial", 
    label: { ar: "توتوريال", en: "Tutorial" },
    description: { ar: "محتوى شرح وتعليم", en: "How-to tutorial content" },
    emoji: "📚"
  },
];

export default function UGCStudio() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveToHistory } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [ugcType, setUgcType] = useState<UGCType>("lifestyle");
  const [selectedModel, setSelectedModel] = useState(getRecommendedModel("ugc"));
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    images: Array<{ imageUrl: string; type: string; typeAr: string }>;
    tips: string[];
  } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: isRTL ? "ملف غير صالح" : "Invalid file",
        description: isRTL ? "يرجى رفع صورة" : "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: isRTL ? "الملف كبير جداً" : "File too large",
        description: isRTL ? "الحد الأقصى 10MB" : "Maximum size is 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProductImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProductImage(null);
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

    setLoading(true);
    setResult(null);

    try {
      const modelData = AI_MODELS.find(m => m.id === selectedModel);
      
      const { data, error } = await supabase.functions.invoke("generate-ugc", {
        body: {
          productImage,
          productName,
          ugcType,
          model: selectedModel,
          language: isRTL ? 'ar' : 'en',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.images && data.images.length > 0) {
        setResult({
          images: data.images,
          tips: data.tips || [],
        });
        
        // Save to history
        await saveToHistory(
          "ugc",
          { productName, ugcType },
          { title: productName || ugcType, imagesCount: data.images.length }
        );
        
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
          description: isRTL 
            ? `تم إنشاء ${data.images.length} صور UGC` 
            : `${data.images.length} UGC images created`,
        });
      } else {
        throw new Error(isRTL ? "لم يتم توليد الصور" : "No images generated");
      }
    } catch (e: any) {
      console.error("UGC generation error:", e);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: e?.message || (isRTL ? "فشل التوليد" : "Generation failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s+/g, "-") || "ugc"}-${ugcType}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: isRTL ? "فشل التحميل" : "Download failed",
        variant: "destructive",
      });
    }
  };

  const downloadAll = async () => {
    if (!result) return;
    for (let i = 0; i < result.images.length; i++) {
      await downloadImage(result.images[i].imageUrl, i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast({
      title: isRTL ? "✓ تم تحميل كل الصور" : "✓ All images downloaded",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isRTL ? "استوديو UGC" : "UGC Studio"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "صور حقيقية بأسلوب المؤثرين والعملاء"
                  : "Authentic influencer & customer style photos"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300 bg-orange-50">
              <Camera className="w-3 h-3" />
              {isRTL ? "واقعي" : "Realistic"}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Runware AI
            </Badge>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <Heart className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-800">
              {isRTL ? "ليه UGC مهم؟" : "Why UGC matters?"}
            </p>
            <p className="text-orange-700">
              {isRTL 
                ? "محتوى UGC بيزوّد الثقة ٣× أكتر من الصور العادية! استخدمه في الإعلانات والسوشيال ميديا."
                : "UGC content increases trust 3x more than regular photos! Use it in ads and social media."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Input */}
          <div className="space-y-6">
            {/* Product Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {isRTL ? "صورة المنتج (اختياري)" : "Product Image (optional)"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "ارفع صورة المنتج لدمجها في صور UGC"
                    : "Upload product image to integrate into UGC photos"}
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
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm mb-1">
                      {isRTL ? "اضغط لرفع صورة المنتج" : "Click to upload product image"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "اختياري - يمكن التوليد بدون صورة" : "Optional - can generate without image"}
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

            {/* UGC Type & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "إعدادات UGC" : "UGC Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "اسم المنتج" : "Product Name"}</Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={isRTL ? "سيروم فيتامين سي" : "Vitamin C Serum"}
                    className="h-11"
                  />
                </div>

                {/* UGC Type Selection */}
                <div className="space-y-2">
                  <Label>{isRTL ? "نوع المحتوى" : "Content Type"}</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {ugcTypes.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setUgcType(t.value)}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          ugcType === t.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-xl">{t.emoji}</span>
                        <div className="text-start flex-1">
                          <span className="font-medium text-sm">
                            {isRTL ? t.label.ar : t.label.en}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {isRTL ? t.description.ar : t.description.en}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Model Selector */}
                <AIModelSelector
                  toolType="ugc"
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />

                {/* Generate Button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg gap-2"
                  onClick={handleGenerate}
                  disabled={loading || !productName}
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      {isRTL ? "جارٍ التوليد..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      {isRTL ? "توليد صور UGC" : "Generate UGC Photos"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {/* Generated Images */}
            {result && (
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      {isRTL ? `صور UGC (${result.images.length})` : `UGC Photos (${result.images.length})`}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={downloadAll} className="gap-2">
                      <Download className="w-4 h-4" />
                      {isRTL ? "تحميل الكل" : "Download All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Images Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border">
                          <img 
                            src={img.imageUrl} 
                            alt={`UGC ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 start-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {isRTL ? img.typeAr : img.type}
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={() => downloadImage(img.imageUrl, index)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {result.tips.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        {isRTL ? "نصائح الاستخدام" : "Usage Tips"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {result.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!result && !loading && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-medium mb-2">
                    {isRTL ? "صور UGC واقعية" : "Realistic UGC Photos"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isRTL 
                      ? "أدخل اسم المنتج واختر نوع المحتوى لتوليد صور بأسلوب المؤثرين"
                      : "Enter product name and select content type to generate influencer-style photos"}
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
