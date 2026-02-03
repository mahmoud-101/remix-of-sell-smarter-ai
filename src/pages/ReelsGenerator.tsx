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
import { 
  Video, 
  Copy, 
  Sparkles, 
  Upload, 
  X, 
  Download,
  Image as ImageIcon,
  Film,
  Hash,
  RotateCcw,
  Layers,
  Smartphone
} from "lucide-react";

type VideoStyle = "unboxing" | "before_after" | "testimonial" | "showcase" | "trending";

const videoStyles: Array<{
  value: VideoStyle;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  emoji: string;
}> = [
  { 
    value: "unboxing", 
    label: { ar: "أنبوكسينق", en: "Unboxing" },
    description: { ar: "فتح المنتج مع إضاءة درامية", en: "Product reveal with dramatic lighting" },
    emoji: "📦"
  },
  { 
    value: "before_after", 
    label: { ar: "قبل وبعد", en: "Before/After" },
    description: { ar: "تحول درامي يوقف السكرول", en: "Dramatic transformation that stops scroll" },
    emoji: "🔄"
  },
  { 
    value: "testimonial", 
    label: { ar: "مراجعة 360°", en: "360° Review" },
    description: { ar: "عرض 360° مع تقييم 5 نجوم", en: "360° showcase with 5-star rating" },
    emoji: "⭐"
  },
  { 
    value: "showcase", 
    label: { ar: "عرض فاخر", en: "Showcase" },
    description: { ar: "دوران احترافي مع إضاءة استوديو", en: "Pro rotation with studio lighting" },
    emoji: "✨"
  },
  { 
    value: "trending", 
    label: { ar: "ترند", en: "Trending" },
    description: { ar: "أسلوب TikTok فيرال سريع", en: "Fast TikTok viral style" },
    emoji: "🔥"
  },
];

export default function ReelsGenerator() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveToHistory } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [adImage, setAdImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [style, setStyle] = useState<VideoStyle>("showcase");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    scenes: Array<{ imageUrl: string; scene: number; description: string }>;
    caption: string;
    hashtags: string[];
    instructions: string;
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
      setAdImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setAdImage(null);
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

    if (!adImage) {
      toast({
        title: isRTL ? "ارفع صورة المنتج أولاً" : "Upload product image first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-reel", {
        body: {
          imageUrl: adImage,
          productName,
          style,
          duration: 5,
          language: isRTL ? 'ar' : 'en',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.scenes && data.scenes.length > 0) {
        setResult({
          scenes: data.scenes,
          caption: data.caption,
          hashtags: data.hashtags,
          instructions: data.instructions,
        });
        
        // Save to history automatically
        await saveToHistory(
          "reels",
          { productName, style },
          { title: productName || style, scenesCount: data.scenes.length, caption: data.caption }
        );
        
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
          description: isRTL 
            ? `تم إنشاء ${data.scenes.length} مشاهد - تم الحفظ في السجل` 
            : `${data.scenes.length} scenes created - saved to history`,
        });
      } else {
        throw new Error(isRTL ? "لم يتم توليد المشاهد" : "No scenes generated");
      }
    } catch (e: any) {
      console.error("Reel generation error:", e);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: e?.message || (isRTL ? "فشل التوليد" : "Generation failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = async () => {
    if (!result) return;
    const fullCaption = `${result.caption}\n\n${result.hashtags.join(" ")}`;
    await navigator.clipboard.writeText(fullCaption);
    toast({
      title: isRTL ? "✓ تم النسخ" : "✓ Copied",
      description: isRTL ? "تم نسخ الكابشن والهاشتاقات" : "Caption and hashtags copied",
    });
  };

  const downloadScene = async (imageUrl: string, sceneNumber: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s+/g, "-") || "reel"}-scene-${sceneNumber}.png`;
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

  const downloadAllScenes = async () => {
    if (!result) return;
    for (let i = 0; i < result.scenes.length; i++) {
      await downloadScene(result.scenes[i].imageUrl, result.scenes[i].scene);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast({
      title: isRTL ? "✓ تم تحميل كل المشاهد" : "✓ All scenes downloaded",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isRTL ? "استوديو الريلز" : "Reels Studio"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "حوّل صورة المنتج لـ 3 مشاهد جاهزة للمونتاج"
                  : "Turn product image into 3 scenes ready for editing"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-pink-600 border-pink-300 bg-pink-50">
              <Layers className="w-3 h-3" />
              {isRTL ? "3 مشاهد" : "3 Scenes"}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-pink-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-pink-800">
              {isRTL ? "كيف تستخدم المشاهد؟" : "How to use the scenes?"}
            </p>
            <p className="text-pink-700">
              {isRTL 
                ? "حمّل المشاهد واستخدمها في VN أو InShot أو أي تطبيق مونتاج على موبايلك عشان تعمل ريل فيرال!"
                : "Download the scenes and use them in VN, InShot, or any editing app on your phone to create a viral Reel!"}
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
                  {isRTL ? "صورة المنتج" : "Product Image"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "ارفع صورة المنتج أو من استوديو الصور"
                    : "Upload your product image or from Image Studio"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adImage ? (
                  <div className="relative group">
                    <img 
                      src={adImage} 
                      alt="Product" 
                      className="w-full h-64 object-contain rounded-lg border bg-muted/50"
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
                      {isRTL ? "اضغط لرفع صورة المنتج" : "Click to upload product image"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "من استوديو الصور أو أي صورة منتج" : "From Image Studio or any product image"}
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

            {/* Product Name & Style */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "تفاصيل الريل" : "Reel Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "اسم المنتج (اختياري)" : "Product Name (optional)"}</Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={isRTL ? "فستان سهرة أنيق" : "Elegant Evening Dress"}
                    className="h-11"
                  />
                </div>

                {/* Style Selection */}
                <div className="space-y-2">
                  <Label>{isRTL ? "نوع الريل" : "Reel Type"}</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {videoStyles.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value)}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          style === s.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-xl">{s.emoji}</span>
                        <div className="text-start flex-1">
                          <span className="font-medium text-sm">
                            {isRTL ? s.label.ar : s.label.en}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {isRTL ? s.description.ar : s.description.en}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg gap-2"
                  onClick={handleGenerate}
                  disabled={loading || !adImage}
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      {isRTL ? "جارٍ التوليد..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5" />
                      {isRTL ? "توليد مشاهد الريل" : "Generate Reel Scenes"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {/* Generated Scenes */}
            {result && (
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      {isRTL ? `مشاهد الريل (${result.scenes.length})` : `Reel Scenes (${result.scenes.length})`}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={downloadAllScenes} className="gap-2">
                      <Download className="w-4 h-4" />
                      {isRTL ? "تحميل الكل" : "Download All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scenes Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {result.scenes.map((scene, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-[9/16] rounded-lg overflow-hidden border">
                          <img 
                            src={scene.imageUrl} 
                            alt={`Scene ${scene.scene}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 start-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {isRTL ? `مشهد ${scene.scene}` : `Scene ${scene.scene}`}
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={() => downloadScene(scene.imageUrl, scene.scene)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="font-medium mb-1">
                      {isRTL ? "💡 الخطوة التالية:" : "💡 Next step:"}
                    </p>
                    <p className="text-muted-foreground">{result.instructions}</p>
                  </div>

                  {/* Caption */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        {isRTL ? "الكابشن" : "Caption"}
                      </Label>
                      <Button variant="ghost" size="sm" onClick={copyCaption}>
                        <Copy className="w-4 h-4 me-2" />
                        {isRTL ? "نسخ الكل" : "Copy All"}
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <p className="whitespace-pre-wrap mb-3">{result.caption}</p>
                      <div className="flex flex-wrap gap-1">
                        {result.hashtags.map((tag, i) => (
                          <span key={i} className="text-primary font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!result && !loading && (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Layers className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">
                    {isRTL ? "المشاهد هتظهر هنا" : "Scenes will appear here"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? "ارفع صورة المنتج واختار النوع عشان نعملك 3 مشاهد"
                      : "Upload product image and select type to create 3 scenes"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <Card className="border-primary/30">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <RotateCcw className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="font-medium mb-2">
                    {isRTL ? "جارٍ إنشاء المشاهد..." : "Creating your scenes..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? "الـ AI بيحوّل صورتك لـ 3 مشاهد احترافية"
                      : "AI is turning your image into 3 professional scenes"}
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
