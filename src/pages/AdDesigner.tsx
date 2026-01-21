import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Sparkles, Loader2, Download, Wand2, Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AdDesigner() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [productImage, setProductImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [designMethod, setDesignMethod] = useState<"new" | "replace">("new");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPromptSuggestion, setSelectedPromptSuggestion] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [transparent, setTransparent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const productInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const promptSuggestions = [
    { ar: "منتج على خلفية بيضاء نظيفة، إضاءة استوديو احترافية، جودة عالية", en: "Product on clean white background, professional studio lighting, high quality" },
    { ar: "منتج في بيئة فاخرة مع إضاءة ذهبية دافئة، أسلوب فخم", en: "Product in luxury setting with warm golden lighting, premium style" },
    { ar: "منتج في مشهد حياة طبيعي، إضاءة طبيعية، أسلوب عصري", en: "Product in lifestyle scene, natural lighting, modern style" },
    { ar: "منتج مع تأثيرات إبداعية ملونة، خلفية حيوية وجذابة", en: "Product with creative colorful effects, vibrant eye-catching background" },
    { ar: "منتج في بيئة مينيمال أنيقة، ألوان محايدة، تصميم نظيف", en: "Product in elegant minimal environment, neutral colors, clean design" },
  ];

  const aspectRatios = [
    { value: "1:1", label: "1:1", size: "1024x1024", icon: "⬛" },
    { value: "9:16", label: "9:16", size: "1024x1792", icon: "📱" },
    { value: "16:9", label: "16:9", size: "1792x1024", icon: "🖥️" },
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "product" | "reference") => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: isRTL ? "خطأ" : "Error", description: isRTL ? "يرجى اختيار صورة صالحة" : "Please select a valid image", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: isRTL ? "خطأ" : "Error", description: isRTL ? "حجم الصورة كبير (الحد الأقصى 5MB)" : "Image too large (max 5MB)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "product") setProductImage(reader.result as string);
      else setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    toast({ title: isRTL ? "تم الرفع" : "Uploaded", description: isRTL ? "تم رفع الصورة بنجاح" : "Image uploaded successfully" });
  };

  const handleGenerate = async () => {
    if (!productImage) {
      toast({ title: isRTL ? "مطلوب" : "Required", description: isRTL ? "يرجى رفع صورة المنتج" : "Please upload product image", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedImages([]);
    try {
      const sizeMap: Record<string, string> = { "1:1": "1024x1024", "9:16": "1024x1792", "16:9": "1792x1024" };
      let fullPrompt = designMethod === "new" ? "Professional e-commerce product photography. " : "Replace the product in the reference image with the new product, maintaining the same style, lighting, and composition. ";
      if (selectedPromptSuggestion) fullPrompt += selectedPromptSuggestion + ". ";
      if (customPrompt) fullPrompt += customPrompt + ". ";
      if (transparent) fullPrompt += "Transparent background, PNG format. ";
      fullPrompt += "High quality, 8K resolution, commercial photography, perfect lighting and shadows.";
      const { data, error } = await supabase.functions.invoke("design-ad", { body: { productImageUrl: productImage, referenceImageUrl: referenceImage, prompt: fullPrompt, designMethod, size: sizeMap[aspectRatio], transparent } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images);
        toast({ title: isRTL ? "تم التصميم!" : "Design Complete!", description: isRTL ? "تم إنشاء إعلانك بنجاح" : "Ad created successfully" });
      }
    } catch (error: any) {
      toast({ title: isRTL ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{isRTL ? "مصمم الإعلانات الاحترافي" : "Professional Ad Designer"}</h1>
          <p className="text-muted-foreground">{isRTL ? "صمم إعلانات منتجاتك باستخدام الذكاء الاصطناعي" : "Design product ads with AI"}</p>
        </div>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                {isRTL ? "ارفع الصور" : "Upload Images"}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">{isRTL ? "صورة المنتج (الأساسي)" : "Product Image (Main)"}</Label>
                <input ref={productInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "product")} className="hidden" />
                {productImage ? (
                  <div className="relative border-2 border-primary rounded-lg p-2">
                    <img src={productImage} alt="Product" className="w-full h-48 object-contain rounded" />
                    <Button size="sm" variant="secondary" className="absolute top-4 right-4" onClick={() => setProductImage(null)}>{isRTL ? "تغيير" : "Change"}</Button>
                  </div>
                ) : (
                  <button onClick={() => productInputRef.current?.click()} className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors">
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{isRTL ? "اختيار ملف من الجهاز" : "Choose file from device"}</span>
                  </button>
                )}
              </div>
              <div>
                <Label className="mb-2 block">{isRTL ? "صورة مرجعية (اختياري)" : "Reference Image (Optional)"}</Label>
                <input ref={referenceInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "reference")} className="hidden" />
                {referenceImage ? (
                  <div className="relative border-2 rounded-lg p-2">
                    <img src={referenceImage} alt="Reference" className="w-full h-48 object-contain rounded" />
                    <Button size="sm" variant="secondary" className="absolute top-4 right-4" onClick={() => setReferenceImage(null)}>{isRTL ? "تغيير" : "Change"}</Button>
                  </div>
                ) : (
                  <button onClick={() => referenceInputRef.current?.click()} className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{isRTL ? "اختيار ملف (اختياري)" : "Choose file (optional)"}</span>
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                {isRTL ? "اختر طريقة التصميم" : "Choose Design Method"}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => setDesignMethod("new")} className={`p-6 rounded-xl border-2 transition-all ${designMethod === "new" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{isRTL ? "استلهام تصميم جديد" : "New Inspired Design"}</h3>
                <p className="text-sm text-muted-foreground">{isRTL ? "سيتم إنشاء تصميم جديد حسب تفضيلاتك" : "Create new design based on your preferences"}</p>
              </button>
              <button onClick={() => setDesignMethod("replace")} className={`p-6 rounded-xl border-2 transition-all ${designMethod === "replace" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <Wand2 className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{isRTL ? "تبديل المنتج في الصورة" : "Replace Product in Image"}</h3>
                <p className="text-sm text-muted-foreground">{isRTL ? "سيتم تبديل المنتج بالصورة المرجعية" : "Replace product in reference image"}</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                {isRTL ? "مساعدة الذكاء الاصطناعي" : "AI Assistance"}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button key={index} onClick={() => setSelectedPromptSuggestion(isRTL ? suggestion.ar : suggestion.en)} className={`p-3 text-sm text-right rounded-lg border transition-all ${selectedPromptSuggestion === (isRTL ? suggestion.ar : suggestion.en) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    {isRTL ? suggestion.ar : suggestion.en}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                {isRTL ? "تخصيص التصميم" : "Customize Design"}
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">{isRTL ? "تعليمات إضافية" : "Additional Instructions"}</Label>
                <Textarea placeholder={isRTL ? "اكتب أي تفاصيل إضافية هنا..." : "Write any additional details here..."} value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={3} className="resize-none" />
              </div>
              <div>
                <Label className="mb-3 block">{isRTL ? "أبعاد الصورة" : "Aspect Ratio"}</Label>
                <div className="flex gap-3">
                  {aspectRatios.map((ratio) => (
                    <button key={ratio.value} onClick={() => setAspectRatio(ratio.value)} className={`flex-1 p-4 rounded-xl border-2 transition-all ${aspectRatio === ratio.value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}>
                      <div className="text-2xl mb-1">{ratio.icon}</div>
                      <div className="font-semibold">{ratio.label}</div>
                      <div className="text-xs opacity-70">{ratio.size}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <Label className="font-semibold">{isRTL ? "الخلفية" : "Background"}</Label>
                  <p className="text-sm text-muted-foreground">{isRTL ? (transparent ? "شفافة" : "معتمة") : (transparent ? "Transparent" : "Opaque")}</p>
                </div>
                <Switch checked={transparent} onCheckedChange={setTransparent} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full h-14 text-lg" onClick={handleGenerate} disabled={isGenerating || !productImage}>
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {isRTL ? "جاري التصميم..." : "Designing..."}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              {isRTL ? "صمم الإعلان" : "Design Ad"}
            </>
          )}
        </Button>

        {generatedImages.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">{isRTL ? "النتيجة" : "Result"}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {generatedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Result ${index + 1}`} className="w-full rounded-lg border shadow-lg" />
                    <Button size="sm" className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { const link = document.createElement("a"); link.href = img; link.download = `ad-design-${index + 1}.png`; link.click(); }}>
                      <Download className="w-4 h-4 mr-2" />
                      {isRTL ? "تحميل" : "Download"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
