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
import { 
  Video, 
  Copy, 
  Sparkles, 
  Upload, 
  X, 
  Download,
  Play,
  Image as ImageIcon,
  Film,
  Clock,
  Hash,
  RotateCcw
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
    label: { ar: "مراجعة", en: "Review" },
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

const durations = [
  { value: 5, label: "5s", description: { ar: "سريع", en: "Quick" } },
  { value: 10, label: "10s", description: { ar: "متوسط", en: "Medium" } },
];

export default function ReelsGenerator() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [adImage, setAdImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [style, setStyle] = useState<VideoStyle>("showcase");
  const [duration, setDuration] = useState<5 | 10>(5);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    videoUrl: string;
    caption: string;
    hashtags: string[];
    duration: string;
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
        title: isRTL ? "ارفع صورة الإعلان أولاً" : "Upload ad image first",
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
          duration,
          language: isRTL ? 'ar' : 'en',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.videoUrl) {
        setResult({
          videoUrl: data.videoUrl,
          caption: data.caption,
          hashtags: data.hashtags,
          duration: data.duration,
        });
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
          description: isRTL ? "تم إنشاء الريل بنجاح" : "Reel created successfully",
        });
      } else {
        throw new Error(isRTL ? "لم يتم توليد الفيديو" : "No video generated");
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

  const downloadVideo = async () => {
    if (!result?.videoUrl) return;
    try {
      const response = await fetch(result.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s+/g, "-") || "reel"}-${style}.mp4`;
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
                  ? "حوّل صورة الإعلان إلى ريل فيرال جاهز • Lovable AI Video"
                  : "Turn ad image into viral-ready Reel • Lovable AI Video"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-pink-600 border-pink-300 bg-pink-50">
              🎬 Image → Video
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Input */}
          <div className="space-y-6">
            {/* Ad Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {isRTL ? "صورة الإعلان" : "Ad Image"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "ارفع صورة الإعلان الجاهزة من استوديو الصور"
                    : "Upload your ready ad image from Image Studio"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adImage ? (
                  <div className="relative group">
                    <img 
                      src={adImage} 
                      alt="Ad" 
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
                    <div className="absolute bottom-2 start-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {isRTL ? "جاهز للتحويل" : "Ready to convert"}
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">
                      {isRTL ? "اضغط لرفع صورة الإعلان" : "Click to upload ad image"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "الصورة من استوديو الصور أو أي صورة إعلانية" : "From Image Studio or any ad image"}
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

            {/* Product Name */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "تفاصيل المنتج" : "Product Details"}
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

                {/* Duration Selection */}
                <div className="space-y-2">
                  <Label>{isRTL ? "مدة الفيديو" : "Video Duration"}</Label>
                  <div className="flex gap-3">
                    {durations.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value as 5 | 10)}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          duration === d.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold">{d.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isRTL ? d.description.ar : d.description.en}
                        </span>
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
                      {isRTL ? "توليد ريل فيرال" : "Generate Viral Reel"}
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
                  <Video className="w-5 h-5" />
                  {isRTL ? "اختر الستايل" : "Choose Style"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {videoStyles.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        style === s.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 text-2xl">
                        {s.emoji}
                      </div>
                      <div className="text-start flex-1">
                        <span className="font-medium block">
                          {isRTL ? s.label.ar : s.label.en}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {isRTL ? s.description.ar : s.description.en}
                        </span>
                      </div>
                      {style === s.value && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generated Video Result */}
            {result && (
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      {isRTL ? "الريل الجاهز" : "Ready Reel"}
                    </CardTitle>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 me-1" />
                      {result.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Player */}
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-h-[400px] mx-auto">
                    <video 
                      src={result.videoUrl} 
                      controls 
                      autoPlay 
                      loop
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Download Button */}
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={downloadVideo}
                  >
                    <Download className="w-5 h-5" />
                    {isRTL ? "تحميل MP4" : "Download MP4"}
                  </Button>

                  {/* Caption */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        {isRTL ? "الكابشن" : "Caption"}
                      </Label>
                      <Button variant="ghost" size="sm" onClick={copyCaption}>
                        <Copy className="w-4 h-4 me-1" />
                        {isRTL ? "نسخ الكل" : "Copy All"}
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">{result.caption}</p>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      {isRTL ? "الهاشتاقات" : "Hashtags"}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!result && !loading && (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center mx-auto mb-6">
                    <Video className="w-10 h-10 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? "الريل سيظهر هنا" : "Reel will appear here"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isRTL
                      ? "ارفع صورة إعلانية واختر الستايل ثم اضغط على توليد"
                      : "Upload an ad image, choose a style, and click generate"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center mx-auto mb-6">
                    <RotateCcw className="w-10 h-10 text-pink-500 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? "جارٍ إنشاء الريل..." : "Creating your Reel..."}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isRTL
                      ? "يتم تحليل الصورة وإنشاء الحركات والتأثيرات"
                      : "Analyzing image and creating motion effects"}
                  </p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
