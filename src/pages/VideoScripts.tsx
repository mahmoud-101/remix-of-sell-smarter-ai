import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Sparkles, Loader2, Copy, Check, Clock, Flame } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAI } from "@/hooks/useAI";
import { useToast } from "@/hooks/use-toast";

const VideoScripts = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { toast } = useToast();
  
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [duration, setDuration] = useState("30");
  const [style, setStyle] = useState("viral");
  const [result, setResult] = useState<{
    scripts?: Array<{ hook: string; body: string; cta: string }>;
    viral_elements?: string[];
    best_posting_times?: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { generate, isLoading } = useAI("video-script");

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "من فضلك أدخل اسم المنتج" : "Please enter product name",
        variant: "destructive",
      });
      return;
    }

    const response = await generate({
      productName,
      productDescription,
      platform,
      duration,
      style,
    });
    
    if (response) {
      try {
        const parsed = typeof response === 'string' ? JSON.parse(response) : response;
        setResult(parsed);
      } catch {
        // If parsing fails, create a simple structure
        setResult({ scripts: [{ hook: "", body: response, cta: "" }] });
      }
    }
  };

  const getFormattedResult = () => {
    if (!result) return "";
    if (result.scripts) {
      return result.scripts.map((script, i) => 
        `${isRTL ? "سكريبت" : "Script"} ${i + 1}:\n${isRTL ? "الهوك" : "Hook"}: ${script.hook}\n${isRTL ? "المحتوى" : "Body"}: ${script.body}\n${isRTL ? "الدعوة للإجراء" : "CTA"}: ${script.cta}`
      ).join("\n\n");
    }
    return JSON.stringify(result, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedResult());
    setCopied(true);
    toast({
      title: isRTL ? "تم النسخ!" : "Copied!",
      description: isRTL ? "تم نسخ السكريبت" : "Script copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { value: "tiktok", label: "TikTok" },
    { value: "instagram-reels", label: "Instagram Reels" },
    { value: "youtube-shorts", label: "YouTube Shorts" },
    { value: "facebook-reels", label: "Facebook Reels" },
  ];

  const durations = [
    { value: "15", label: isRTL ? "15 ثانية" : "15 seconds" },
    { value: "30", label: isRTL ? "30 ثانية" : "30 seconds" },
    { value: "60", label: isRTL ? "60 ثانية" : "60 seconds" },
    { value: "90", label: isRTL ? "90 ثانية" : "90 seconds" },
  ];

  const styles = [
    { value: "viral", label: isRTL ? "فيرال (Viral)" : "Viral Hook" },
    { value: "educational", label: isRTL ? "تعليمي" : "Educational" },
    { value: "storytelling", label: isRTL ? "قصة" : "Storytelling" },
    { value: "unboxing", label: isRTL ? "أنبوكسنج" : "Unboxing" },
    { value: "before-after", label: isRTL ? "قبل وبعد" : "Before & After" },
    { value: "review", label: isRTL ? "مراجعة" : "Review" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <Video className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isRTL ? "صانع سكريبتات الفيديو" : "Video Script Maker"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? "اكتب سكريبتات ريلز وتيك توك فيرال لمنتجاتك" : "Create viral TikTok & Reels scripts for your products"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {isRTL ? "بيانات الفيديو" : "Video Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "اسم المنتج *" : "Product Name *"}</Label>
                <Input
                  placeholder={isRTL ? "مثال: سماعات بلوتوث لاسلكية" : "e.g., Wireless Bluetooth Earbuds"}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "وصف المنتج (اختياري)" : "Product Description (optional)"}</Label>
                <Textarea
                  placeholder={isRTL ? "اكتب مميزات المنتج..." : "Describe product features..."}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "المنصة" : "Platform"}</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "المدة" : "Duration"}</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          <span className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {d.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "أسلوب الفيديو" : "Video Style"}</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !productName.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isRTL ? "جاري الكتابة..." : "Writing Script..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRTL ? "اكتب السكريبت 🚀" : "Generate Script 🚀"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  {isRTL ? "السكريبت الجاهز" : "Generated Script"}
                </span>
                {result && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {result.scripts?.map((script, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="font-bold text-primary">
                        {isRTL ? `سكريبت ${index + 1}` : `Script ${index + 1}`}
                      </div>
                      <div>
                        <span className="font-semibold text-orange-500">{isRTL ? "🎯 الهوك: " : "🎯 Hook: "}</span>
                        <span>{script.hook}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-500">{isRTL ? "📝 المحتوى: " : "📝 Body: "}</span>
                        <span>{script.body}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-green-500">{isRTL ? "🚀 الدعوة للإجراء: " : "🚀 CTA: "}</span>
                        <span>{script.cta}</span>
                      </div>
                    </div>
                  ))}
                  
                  {result.viral_elements && result.viral_elements.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
                      <div className="font-bold mb-2">🔥 {isRTL ? "عناصر فيرال" : "Viral Elements"}</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {result.viral_elements.map((element, i) => (
                          <li key={i}>{element}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.best_posting_times && result.best_posting_times.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                      <div className="font-bold mb-2">⏰ {isRTL ? "أفضل أوقات النشر" : "Best Posting Times"}</div>
                      <div className="flex flex-wrap gap-2">
                        {result.best_posting_times.map((time, i) => (
                          <span key={i} className="bg-background px-2 py-1 rounded text-sm">{time}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                  <Video className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    {isRTL 
                      ? "السكريبت هيظهر هنا بعد ما تضغط على الزرار" 
                      : "Your script will appear here after generation"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              {isRTL ? "نصائح لفيديو فيرال 🔥" : "Viral Video Tips 🔥"}
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-background/50 rounded-lg p-3">
                <strong>{isRTL ? "الثانية الأولى" : "First Second"}</strong>
                <p className="text-muted-foreground mt-1">
                  {isRTL ? "اجذب الانتباه فوراً - أول 3 ثواني تحدد نجاح الفيديو" : "Hook attention immediately - first 3 seconds determine success"}
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <strong>{isRTL ? "CTA واضح" : "Clear CTA"}</strong>
                <p className="text-muted-foreground mt-1">
                  {isRTL ? "اطلب من المشاهد إجراء محدد في النهاية" : "Ask viewers for a specific action at the end"}
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <strong>{isRTL ? "المشاعر أولاً" : "Emotions First"}</strong>
                <p className="text-muted-foreground mt-1">
                  {isRTL ? "الناس تشتري بالعاطفة وتبرر بالمنطق" : "People buy with emotion and justify with logic"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VideoScripts;
