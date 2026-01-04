import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Download,
  Trash2,
  Wand2,
  RotateCcw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdDesigner() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [productImage, setProductImage] = useState<string | null>(null);
  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const productInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { value: "modern", label: isRTL ? "عصري وأنيق" : "Modern & Elegant" },
    { value: "minimal", label: isRTL ? "بسيط ومينيمال" : "Minimal & Clean" },
    { value: "bold", label: isRTL ? "جريء وملفت" : "Bold & Eye-catching" },
    { value: "luxury", label: isRTL ? "فاخر وراقي" : "Luxury & Premium" },
    { value: "playful", label: isRTL ? "مرح وحيوي" : "Playful & Vibrant" },
    { value: "professional", label: isRTL ? "احترافي" : "Professional" },
  ];

  const aspectRatios = [
    { value: "1:1", label: isRTL ? "مربع (1:1)" : "Square (1:1)" },
    { value: "4:5", label: isRTL ? "انستغرام (4:5)" : "Instagram (4:5)" },
    { value: "9:16", label: isRTL ? "ستوري (9:16)" : "Story (9:16)" },
    { value: "16:9", label: isRTL ? "يوتيوب (16:9)" : "YouTube (16:9)" },
  ];

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "inspiration"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى اختيار صورة صالحة" : "Please select a valid image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "حجم الصورة كبير جداً (الحد الأقصى 5MB)" : "Image too large (max 5MB)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("ad-designs")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("ad-designs")
        .getPublicUrl(fileName);

      if (type === "product") {
        setProductImage(urlData.publicUrl);
      } else {
        setInspirationImage(urlData.publicUrl);
      }

      toast({
        title: isRTL ? "تم الرفع" : "Uploaded",
        description: isRTL ? "تم رفع الصورة بنجاح" : "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!productImage && !prompt) {
      toast({
        title: isRTL ? "مطلوب" : "Required",
        description: isRTL 
          ? "يرجى رفع صورة المنتج أو كتابة وصف" 
          : "Please upload a product image or write a description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const { data, error } = await supabase.functions.invoke("design-ad", {
        body: {
          productImageUrl: productImage,
          inspirationImageUrl: inspirationImage,
          prompt,
          style: styles.find(s => s.value === style)?.label,
          aspectRatio,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images);
        toast({
          title: isRTL ? "تم التصميم!" : "Design Complete!",
          description: isRTL ? "تم إنشاء تصميم الإعلان بنجاح" : "Ad design generated successfully",
        });
      } else {
        throw new Error(isRTL ? "لم يتم إنشاء صور" : "No images generated");
      }
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `ad-design-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // For base64 images
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `ad-design-${index + 1}.png`;
      link.click();
    }
  };

  const handleReset = () => {
    setProductImage(null);
    setInspirationImage(null);
    setPrompt("");
    setGeneratedImages([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-primary" />
            {isRTL ? "مصمم الإعلانات بالذكاء الاصطناعي" : "AI Ad Designer"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL 
              ? "صمم إعلانات احترافية لمنتجاتك باستخدام الذكاء الاصطناعي" 
              : "Design professional ads for your products using AI"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Product Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {isRTL ? "صورة المنتج" : "Product Image"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "ارفع صورة المنتج الذي تريد تصميم إعلان له" : "Upload the product image for your ad"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={productInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "product")}
                  className="hidden"
                />
                {productImage ? (
                  <div className="relative">
                    <img 
                      src={productImage} 
                      alt="Product" 
                      className="w-full h-48 object-contain rounded-lg border bg-muted"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setProductImage(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => productInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {isRTL ? "اضغط لرفع صورة المنتج" : "Click to upload product image"}
                    </span>
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Inspiration Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "صورة ملهمة (اختياري)" : "Inspiration Image (Optional)"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "ارفع صورة إعلان تعجبك ليحاكيها الذكاء الاصطناعي" : "Upload an ad style you like for AI to emulate"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={inspirationInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "inspiration")}
                  className="hidden"
                />
                {inspirationImage ? (
                  <div className="relative">
                    <img 
                      src={inspirationImage} 
                      alt="Inspiration" 
                      className="w-full h-40 object-contain rounded-lg border bg-muted"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setInspirationImage(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => inspirationInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isRTL ? "اضغط لرفع صورة ملهمة" : "Click to upload inspiration image"}
                    </span>
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Prompt & Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "وصف الإعلان" : "Ad Description"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "البرومبت / الوصف" : "Prompt / Description"}</Label>
                  <Textarea
                    placeholder={isRTL 
                      ? "صف الإعلان الذي تريده... مثال: إعلان لعطر فاخر مع خلفية ذهبية وإضاءة دافئة" 
                      : "Describe the ad you want... Example: Luxury perfume ad with golden background and warm lighting"}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "الستايل" : "Style"}</Label>
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

                  <div className="space-y-2">
                    <Label>{isRTL ? "الأبعاد" : "Aspect Ratio"}</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map((ar) => (
                          <SelectItem key={ar.value} value={ar.value}>
                            {ar.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="flex-1"
                    size="lg"
                  >
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
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="min-h-[500px]">
              <CardHeader>
                <CardTitle>{isRTL ? "التصميم المولد" : "Generated Design"}</CardTitle>
                <CardDescription>
                  {isRTL ? "سيظهر تصميم الإعلان هنا" : "Your ad design will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="h-80 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-primary/30 rounded-full" />
                      <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground animate-pulse">
                      {isRTL ? "جاري تصميم إعلانك الاحترافي..." : "Creating your professional ad..."}
                    </p>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    {generatedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={img} 
                          alt={`Generated ad ${index + 1}`}
                          className="w-full rounded-lg border shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(img, index)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {isRTL ? "تحميل" : "Download"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Wand2 className="w-16 h-16 opacity-30" />
                    <p className="text-center">
                      {isRTL 
                        ? "ارفع صورة المنتج واكتب الوصف ثم اضغط 'صمم الإعلان'" 
                        : "Upload a product image, write a description, then click 'Design Ad'"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {isRTL ? "نصائح للحصول على أفضل النتائج" : "Tips for Best Results"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• {isRTL ? "استخدم صورة منتج واضحة وعالية الجودة" : "Use a clear, high-quality product image"}</li>
                  <li>• {isRTL ? "كن محدداً في وصف الإعلان المطلوب" : "Be specific in your ad description"}</li>
                  <li>• {isRTL ? "أضف صورة ملهمة للحصول على نتائج أفضل" : "Add an inspiration image for better results"}</li>
                  <li>• {isRTL ? "جرب أكثر من ستايل للحصول على تنوع" : "Try different styles for variety"}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
