import { useState } from "react";
import {
  Image,
  Sparkles,
  Download,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  Wand2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";

const styles = [
  { id: "product", labelAr: "صور منتج", labelEn: "Product Shot" },
  { id: "lifestyle", labelAr: "نمط حياة", labelEn: "Lifestyle" },
  { id: "minimal", labelAr: "بسيط", labelEn: "Minimal" },
  { id: "luxury", labelAr: "فاخر", labelEn: "Luxury" },
  { id: "creative", labelAr: "إبداعي", labelEn: "Creative" },
];

const backgrounds = [
  { id: "white", labelAr: "أبيض", labelEn: "White" },
  { id: "gradient", labelAr: "تدرج", labelEn: "Gradient" },
  { id: "studio", labelAr: "استوديو", labelEn: "Studio" },
  { id: "natural", labelAr: "طبيعي", labelEn: "Natural" },
  { id: "abstract", labelAr: "مجرد", labelEn: "Abstract" },
];

const examplePrompts = {
  ar: [
    "ساعة يد فاخرة ذهبية اللون",
    "حذاء رياضي أبيض عصري",
    "عطر زجاجة أنيقة مع ورود",
    "حقيبة يد جلدية بنية",
    "سماعات لاسلكية سوداء",
  ],
  en: [
    "Luxury gold wristwatch",
    "Modern white sneakers",
    "Elegant perfume bottle with roses",
    "Brown leather handbag",
    "Black wireless headphones",
  ],
};

export default function ImageGenerator() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("product");
  const [background, setBackground] = useState("white");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال وصف للصورة" : "Please enter an image description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, style, background },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);
      setDescription(data.description || "");

      toast({
        title: isRTL ? "تم التوليد!" : "Generated!",
        description: isRTL ? "تم إنشاء صورة المنتج بنجاح" : "Product image generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل توليد الصورة" : "Failed to generate image"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `product-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: isRTL ? "تم التحميل" : "Downloaded",
      description: isRTL ? "تم تحميل الصورة بنجاح" : "Image downloaded successfully",
    });
  };

  const handleCopyImage = async () => {
    if (!generatedImage) return;

    try {
      // Fetch the image and convert to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: isRTL ? "تم النسخ!" : "Copied!",
        description: isRTL ? "تم نسخ الصورة للحافظة" : "Image copied to clipboard",
      });
    } catch (error) {
      // Fallback: copy base64 data URL
      await navigator.clipboard.writeText(generatedImage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: isRTL ? "تم النسخ!" : "Copied!",
        description: isRTL ? "تم نسخ رابط الصورة" : "Image URL copied",
      });
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              {isRTL ? "مولد صور المنتجات" : "Product Image Generator"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL
              ? "أنشئ صور منتجات احترافية بالذكاء الاصطناعي في ثوانٍ"
              : "Create professional product images with AI in seconds"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                  1
                </span>
                {isRTL ? "وصف المنتج" : "Product Description"}
              </h2>

              <div className="space-y-2">
                <Label htmlFor="prompt">{isRTL ? "وصف الصورة" : "Image Description"} *</Label>
                <Textarea
                  id="prompt"
                  placeholder={isRTL ? "صف المنتج الذي تريد إنشاء صورة له..." : "Describe the product you want to create an image for..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              {/* Example Prompts */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {isRTL ? "أمثلة سريعة:" : "Quick examples:"}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts[language].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                  2
                </span>
                {isRTL ? "إعدادات الصورة" : "Image Settings"}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "نمط التصوير" : "Photography Style"}</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {isRTL ? s.labelAr : s.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "الخلفية" : "Background"}</Label>
                  <Select value={background} onValueChange={setBackground}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backgrounds.map((bg) => (
                        <SelectItem key={bg.id} value={bg.id}>
                          {isRTL ? bg.labelAr : bg.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRTL ? "جاري التوليد..." : "Generating..."}
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  {isRTL ? "توليد الصورة" : "Generate Image"}
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{isRTL ? "الصورة المولدة" : "Generated Image"}</h2>
              {generatedImage && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyImage}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">{isRTL ? "تحميل" : "Download"}</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              {isLoading ? (
                <div className="aspect-square flex flex-col items-center justify-center gap-4 bg-secondary/30">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {isRTL ? "جاري إنشاء صورة المنتج..." : "Creating your product image..."}
                  </p>
                </div>
              ) : generatedImage ? (
                <div className="relative group">
                  <img
                    src={generatedImage}
                    alt="Generated product"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button size="sm" variant="secondary" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      {isRTL ? "تحميل" : "Download"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => { setGeneratedImage(null); setPrompt(""); }}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {isRTL ? "جديد" : "New"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center gap-4 bg-secondary/30 p-8">
                  <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
                    <Image className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium mb-1">
                      {isRTL ? "لا توجد صورة بعد" : "No image yet"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {isRTL
                        ? "أدخل وصف المنتج واختر النمط المناسب ثم اضغط على توليد الصورة"
                        : "Enter a product description, choose a style, and click generate"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {description && (
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            )}

            {/* Tips */}
            <div className="glass-card rounded-xl p-4 bg-primary/5 border-primary/20">
              <h3 className="font-medium mb-2 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {isRTL ? "نصائح للحصول على أفضل النتائج" : "Tips for best results"}
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {isRTL ? "كن محدداً في وصف المنتج (اللون، الشكل، المواد)" : "Be specific about the product (color, shape, materials)"}</li>
                <li>• {isRTL ? "حدد زاوية التصوير المطلوبة إن أمكن" : "Specify the desired camera angle if possible"}</li>
                <li>• {isRTL ? "اذكر أي تفاصيل خاصة تريدها في الصورة" : "Mention any special details you want in the image"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
