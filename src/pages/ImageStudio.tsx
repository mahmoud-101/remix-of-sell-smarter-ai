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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Sparkles, Download, RotateCcw, Wand2 } from "lucide-react";

type ImageStyle = "lifestyle" | "flatlay" | "model" | "studio" | "minimal";

export default function ImageStudio() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [style, setStyle] = useState<ImageStyle>("lifestyle");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const styles = [
    { value: "lifestyle", label: isRTL ? "لايف ستايل" : "Lifestyle", description: isRTL ? "منتج في بيئة واقعية" : "Product in real environment" },
    { value: "flatlay", label: isRTL ? "فلات لاي" : "Flat Lay", description: isRTL ? "تصوير من الأعلى" : "Top-down photography" },
    { value: "model", label: isRTL ? "موديل" : "Model", description: isRTL ? "على موديل حقيقي" : "On real model" },
    { value: "studio", label: isRTL ? "استوديو" : "Studio", description: isRTL ? "خلفية بيضاء احترافية" : "Professional white background" },
    { value: "minimal", label: isRTL ? "مينيمال" : "Minimal", description: isRTL ? "بسيط وأنيق" : "Simple and elegant" },
  ];

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: isRTL ? "يرجى تسجيل الدخول" : "Please login",
        variant: "destructive",
      });
      return;
    }

    if (!productName.trim()) {
      toast({
        title: isRTL ? "أدخل اسم المنتج" : "Enter product name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedImages([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: `${productName}${productDescription ? `. ${productDescription}` : ""}`,
          style,
          background: "white",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const imageUrl = data?.imageUrl as string | undefined;
      if (imageUrl) {
        setGeneratedImages([imageUrl]);
        toast({
          title: isRTL ? "تم التوليد" : "Generated",
          description: isRTL ? "تم إنشاء الصورة بنجاح" : "Image created successfully",
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

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s+/g, "-")}-${index + 1}.png`;
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

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? "استوديو الصور" : "Image Studio"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "توليد صور إعلانية احترافية بالذكاء الاصطناعي"
                : "Generate professional ad images with AI"}
            </p>
          </div>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              {isRTL ? "بيانات المنتج" : "Product Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRTL ? "اسم المنتج *" : "Product Name *"}</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={isRTL ? "فستان سهرة أنيق" : "Elegant Evening Dress"}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "أسلوب الصورة" : "Image Style"}</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as ImageStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex flex-col">
                          <span>{s.label}</span>
                          <span className="text-xs text-muted-foreground">{s.description}</span>
                        </div>
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
                placeholder={isRTL ? "فستان من الساتان الفاخر بلون أسود..." : "Luxurious black satin dress..."}
                rows={3}
              />
            </div>

            {/* Style Preview */}
            <div className="grid grid-cols-5 gap-2">
              {styles.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value as ImageStyle)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    style === s.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {s.value === "lifestyle" && "🏠"}
                    {s.value === "flatlay" && "📸"}
                    {s.value === "model" && "👗"}
                    {s.value === "studio" && "⬜"}
                    {s.value === "minimal" && "✨"}
                  </div>
                  <span className="text-xs font-medium">{s.label}</span>
                </button>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RotateCcw className="h-5 w-5 animate-spin" />
                  {isRTL ? "جارٍ التوليد..." : "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {isRTL ? "توليد صورة إعلانية" : "Generate Ad Image"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {isRTL ? "الصور المُولّدة" : "Generated Images"}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {generatedImages.map((img, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square relative group">
                    <img
                      src={img}
                      alt={`${productName} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => downloadImage(img, index)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {isRTL ? "تحميل" : "Download"}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm text-center text-muted-foreground">
                      {isRTL ? `صورة ${index + 1}` : `Image ${index + 1}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">
                {isRTL ? "لا يوجد صور بعد" : "No images yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "أدخل بيانات المنتج واختر الأسلوب لتوليد صور إعلانية"
                  : "Enter product details and choose a style to generate ad images"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
