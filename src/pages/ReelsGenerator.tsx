import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Video, Copy, Sparkles, Clock, Music, Film } from "lucide-react";

type ReelsScene = {
  duration: string;
  visual: string;
  text_overlay: string;
  voiceover: string;
};

type ReelsScript = {
  hook: string;
  scenes: ReelsScene[];
  cta: string;
  music_style: string;
  total_duration: string;
};

type ReelsResult = {
  scripts: ReelsScript[];
  viral_tips: string[];
  hashtags: string[];
};

export default function ReelsGenerator() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [style, setStyle] = useState<"trendy" | "elegant" | "viral" | "minimal">("trendy");
  const [duration, setDuration] = useState<"15" | "30" | "60">("15");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReelsResult | null>(null);
  const [selectedScript, setSelectedScript] = useState(0);

  const styles = [
    { value: "trendy", label: isRTL ? "ترند" : "Trendy" },
    { value: "elegant", label: isRTL ? "أنيق" : "Elegant" },
    { value: "viral", label: isRTL ? "فيرال" : "Viral" },
    { value: "minimal", label: isRTL ? "بسيط" : "Minimal" },
  ];

  const durations = [
    { value: "15", label: "15s" },
    { value: "30", label: "30s" },
    { value: "60", label: "60s" },
  ];

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: isRTL ? "تم النسخ" : "Copied",
      description: isRTL ? "تم نسخ السكريبت" : "Script copied",
    });
  };

  const copyFullScript = async (script: ReelsScript) => {
    const fullText = [
      `🎬 HOOK: ${script.hook}`,
      "",
      "📹 SCENES:",
      ...script.scenes.map((s, i) => 
        `${i + 1}. [${s.duration}] ${s.visual}\n   📝 Text: ${s.text_overlay}\n   🎤 VO: ${s.voiceover}`
      ),
      "",
      `📣 CTA: ${script.cta}`,
      `🎵 Music: ${script.music_style}`,
      `⏱️ Duration: ${script.total_duration}`,
    ].join("\n");
    await copy(fullText);
  };

  const handleGenerate = async () => {
    if (!user) return;
    if (!productName.trim()) {
      toast({
        title: isRTL ? "أدخل اسم المنتج" : "Enter product name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          toolType: "reels-script",
          language: isRTL ? "ar" : "en",
          input: {
            productName,
            productDescription,
            style,
            duration,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const res = data?.result as ReelsResult | undefined;
      if (!res?.scripts?.length) {
        throw new Error(isRTL ? "استجابة غير صالحة" : "Invalid response");
      }
      setResult(res);
      setSelectedScript(0);
    } catch (e: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: e?.message || (isRTL ? "فشل التوليد" : "Generation failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentScript = result?.scripts?.[selectedScript];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? "مولد سكريبت الريلز" : "Reels Script Generator"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "سكريبتات جاهزة لـ Kling AI / Runway / CapCut"
                : "Scripts ready for Kling AI / Runway / CapCut"}
            </p>
          </div>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {isRTL ? "بيانات المنتج" : "Product Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRTL ? "اسم المنتج" : "Product Name"}</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={isRTL ? "فستان سهرة أنيق" : "Elegant Evening Dress"}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الأسلوب" : "Style"}</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as any)}>
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
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "وصف المنتج (اختياري)" : "Product Description (optional)"}</Label>
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={isRTL ? "فستان من الساتان الفاخر..." : "Luxurious satin dress..."}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "مدة الفيديو" : "Video Duration"}</Label>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <Button
                    key={d.value}
                    variant={duration === d.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDuration(d.value as any)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              <Film className="h-5 w-5" />
              {loading
                ? isRTL
                  ? "جارٍ التوليد..."
                  : "Generating..."
                : isRTL
                ? "توليد 3 سكريبتات ريلز"
                : "Generate 3 Reels Scripts"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <>
            {/* Script Selector */}
            <div className="flex gap-2 justify-center">
              {result.scripts.map((_, i) => (
                <Button
                  key={i}
                  variant={selectedScript === i ? "default" : "outline"}
                  onClick={() => setSelectedScript(i)}
                >
                  {isRTL ? `سكريبت ${i + 1}` : `Script ${i + 1}`}
                </Button>
              ))}
            </div>

            {/* Current Script */}
            {currentScript && (
              <Card className="border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    {isRTL ? `سكريبت ${selectedScript + 1}` : `Script ${selectedScript + 1}`}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyFullScript(currentScript)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {isRTL ? "نسخ الكل" : "Copy All"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hook */}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                      <Sparkles className="h-4 w-4" />
                      {isRTL ? "الـ Hook (أول 3 ثواني)" : "Hook (First 3 seconds)"}
                    </div>
                    <p className="text-lg font-semibold">{currentScript.hook}</p>
                  </div>

                  {/* Scenes */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Film className="h-4 w-4" />
                      {isRTL ? "المشاهد" : "Scenes"}
                    </div>
                    {currentScript.scenes.map((scene, i) => (
                      <div
                        key={i}
                        className="p-4 border rounded-lg space-y-2 bg-muted/30"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {scene.duration}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {isRTL ? `مشهد ${i + 1}` : `Scene ${i + 1}`}
                          </span>
                        </div>
                        <div className="grid gap-2 text-sm">
                          <div>
                            <span className="font-medium">📹 {isRTL ? "المشهد:" : "Visual:"}</span>{" "}
                            {scene.visual}
                          </div>
                          <div>
                            <span className="font-medium">📝 {isRTL ? "النص:" : "Text:"}</span>{" "}
                            {scene.text_overlay}
                          </div>
                          <div>
                            <span className="font-medium">🎤 {isRTL ? "الصوت:" : "VO:"}</span>{" "}
                            {scene.voiceover}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA & Music */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">
                        {isRTL ? "الـ CTA" : "CTA"}
                      </div>
                      <p className="font-medium">{currentScript.cta}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {isRTL ? "الموسيقى" : "Music"}
                      </div>
                      <p className="font-medium">{currentScript.music_style}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isRTL ? "المدة" : "Duration"}
                      </div>
                      <p className="font-medium">{currentScript.total_duration}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Viral Tips & Hashtags */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isRTL ? "💡 نصائح للفيرال" : "💡 Viral Tips"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.viral_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    {isRTL ? "#️⃣ هاشتاقات" : "#️⃣ Hashtags"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(result.hashtags.join(" "))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
