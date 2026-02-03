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
import { AIModelSelector, getRecommendedModel } from "@/components/ai/AIModelSelector";
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
  Minimize2,
  Brain,
  Target,
  Heart,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type ImageStyle = "lifestyle" | "flatlay" | "model" | "studio" | "minimal";

interface ProductAnalysis {
  coreFeature?: string;
  features?: string[];
  benefits?: string[];
  problemsSolved?: string[];
  customerGoals?: string[];
  emotionalTriggers?: string[];
  objections?: string[];
  faqs?: string[];
  imagePrompts?: Array<{ title: string; description: string; focus: string }>;
}

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
  const [productDescription, setProductDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>("lifestyle");
  const [selectedModel, setSelectedModel] = useState(getRecommendedModel("image"));
  
  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ imageUrl: string; angle: string; angleAr: string }>>([]);

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

  // Deep Analysis before generation
  const handleAnalyze = async () => {
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

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: {
          productName,
          productDescription,
          category: "أزياء/جمال",
          targetAudience: "نساء مصر 18-45",
          productImage,
          language: isRTL ? 'ar' : 'en',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.analysis) {
        // Normalize the analysis response
        const normalizedAnalysis: ProductAnalysis = {
          coreFeature: data.analysis["الميزة الأساسية"] || data.analysis.coreFeature || "",
          features: data.analysis["المميزات"] || data.analysis.features || [],
          benefits: data.analysis["الفوائد"] || data.analysis.benefits || [],
          problemsSolved: data.analysis["المشاكل التي يحلها"] || data.analysis.problemsSolved || [],
          customerGoals: data.analysis["أهداف العميل"] || data.analysis.customerGoals || [],
          emotionalTriggers: data.analysis["المحفزات العاطفية"] || data.analysis.emotionalTriggers || [],
          objections: data.analysis["اعتراضات العميل"] || data.analysis.objections || [],
          faqs: data.analysis["الأسئلة الشائعة"] || data.analysis.faqs || [],
          imagePrompts: data.analysis["أفضل 4 زوايا تصوير للإعلانات"] || data.analysis.imagePrompts || [],
        };
        setAnalysis(normalizedAnalysis);
        setAnalysisOpen(true);
        
        toast({
          title: isRTL ? "✓ تم التحليل" : "✓ Analysis Complete",
          description: isRTL ? "اضغط توليد لإنشاء الصور بناءً على التحليل" : "Click generate to create images based on analysis",
        });
      }
    } catch (e: any) {
      console.error("Analysis error:", e);
      toast({
        title: isRTL ? "خطأ في التحليل" : "Analysis Error",
        description: e?.message || (isRTL ? "فشل التحليل" : "Analysis failed"),
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
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
    
    let currentAnalysis = analysis;

    try {
      // Step 1: Run deep analysis first if we have product name
      if (productName.trim() && !currentAnalysis) {
        setAnalyzing(true);
        toast({
          title: isRTL ? "جارٍ التحليل العميق..." : "Running deep analysis...",
        });

        const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-product", {
          body: {
            productName,
            productDescription,
            category: "أزياء/جمال",
            targetAudience: "نساء مصر 18-45",
            productImage,
            language: isRTL ? 'ar' : 'en',
          },
        });

        if (!analysisError && analysisData?.analysis) {
          const normalizedAnalysis: ProductAnalysis = {
            coreFeature: analysisData.analysis["الميزة الأساسية"] || analysisData.analysis.coreFeature || "",
            features: analysisData.analysis["المميزات"] || analysisData.analysis.features || [],
            benefits: analysisData.analysis["الفوائد"] || analysisData.analysis.benefits || [],
            problemsSolved: analysisData.analysis["المشاكل التي يحلها"] || analysisData.analysis.problemsSolved || [],
            customerGoals: analysisData.analysis["أهداف العميل"] || analysisData.analysis.customerGoals || [],
            emotionalTriggers: analysisData.analysis["المحفزات العاطفية"] || analysisData.analysis.emotionalTriggers || [],
            objections: analysisData.analysis["اعتراضات العميل"] || analysisData.analysis.objections || [],
            faqs: analysisData.analysis["الأسئلة الشائعة"] || analysisData.analysis.faqs || [],
            imagePrompts: analysisData.analysis["أفضل 4 زوايا تصوير للإعلانات"] || analysisData.analysis.imagePrompts || [],
          };
          setAnalysis(normalizedAnalysis);
          setAnalysisOpen(true);
          currentAnalysis = normalizedAnalysis;
        }
        setAnalyzing(false);
      }

      // Step 2: Generate images with analysis data
      toast({
        title: isRTL ? "جارٍ توليد الصور..." : "Generating images...",
      });

      const styleInfo = imageStyles.find(s => s.value === style);
      const styleLabel = isRTL ? styleInfo?.label.ar : styleInfo?.label.en;
      
      // Build enhanced prompt using analysis insights
      let prompt = customPrompt.trim() || `${productName}, ${styleLabel} style, professional product photography`;
      
      // Enhance prompt with analysis data if available
      if (currentAnalysis) {
        const benefits = Array.isArray(currentAnalysis.benefits) ? currentAnalysis.benefits.slice(0, 2).join("، ") : "";
        const triggers = Array.isArray(currentAnalysis.emotionalTriggers) ? currentAnalysis.emotionalTriggers.slice(0, 2).join("، ") : "";
        
        if (benefits) {
          prompt += `. Key benefits: ${benefits}`;
        }
        if (triggers) {
          prompt += `. Emotional appeal: ${triggers}`;
        }
      }
      
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
          productImage,
          analysis: currentAnalysis,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const images = data?.images as Array<{ imageUrl: string; angle: string; angleAr: string }> | undefined;
      
      if (images && images.length > 0) {
        setGeneratedImages(images);
        
        await saveToHistory(
          "design",
          { productName, style, customPrompt, hasAnalysis: !!currentAnalysis },
          { title: productName || customPrompt?.substring(0, 50), imageCount: images.length, style }
        );
        
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
          description: isRTL 
            ? `تم إنشاء ${images.length} صور بناءً على التحليل العميق` 
            : `${images.length} images created based on deep analysis`,
        });
      } else if (data?.imageUrl) {
        setGeneratedImages([{ imageUrl: data.imageUrl, angle: "front", angleAr: "أمامي" }]);
        
        await saveToHistory(
          "design",
          { productName, style, customPrompt },
          { title: productName || customPrompt?.substring(0, 50), imageCount: 1, style }
        );
        
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
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
      setAnalyzing(false);
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
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast({
      title: isRTL ? "✓ تم تحميل جميع الصور" : "✓ All images downloaded",
    });
  };

  // Helper to safely convert any value to a displayable string
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(safeString).join("، ");
    if (typeof value === "object") {
      // Try to extract meaningful text from object
      const keys = Object.keys(value);
      if (keys.length === 0) return "";
      return keys.map(k => `${k}: ${safeString(value[k])}`).join(" | ");
    }
    return String(value);
  };

  // Analysis Section Component
  const AnalysisSection = ({ title, items, icon: Icon, color }: { title: string; items: any[] | undefined; icon: any; color: string }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
          <Icon className="w-4 h-4" />
          {title}
        </div>
        <ul className="space-y-1 ps-6">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-muted-foreground list-disc">
              {safeString(item)}
            </li>
          ))}
        </ul>
      </div>
    );
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
                {isRTL ? "استوديو الصور المتقدم" : "Advanced Image Studio"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "تحليل عميق + صور إعلانية احترافية بجودة 4K"
                  : "Deep Analysis + Professional 4K Ad Images"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-violet-600 border-violet-300 bg-violet-50">
              <Brain className="w-3 h-3" />
              {isRTL ? "تحليل ذكي" : "Smart Analysis"}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Wand2 className="w-3 h-3" />
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-violet-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-violet-800">
              {isRTL ? "كيف يعمل التحليل العميق؟" : "How does Deep Analysis work?"}
            </p>
            <p className="text-violet-700">
              {isRTL 
                ? "أدخل بيانات المنتج → اضغط تحليل → راجع النتائج → اضغط توليد للحصول على 4 صور مبنية على التحليل!"
                : "Enter product data → Click Analyze → Review insights → Click Generate for 4 analysis-based images!"}
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
                  <Upload className="w-5 h-5" />
                  {isRTL ? "صورة المنتج" : "Product Image"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "ارفع صورة منتجك لتحسين التحليل والنتائج"
                    : "Upload your product image for better analysis and results"}
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
                  {isRTL ? "بيانات المنتج" : "Product Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "اسم المنتج *" : "Product Name *"}</Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={isRTL ? "فستان سهرة أسود" : "Black Evening Dress"}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "وصف المنتج (يساعد في التحليل)" : "Product Description (helps analysis)"}</Label>
                  <Textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder={isRTL 
                      ? "فستان سهرة أنيق من الساتان الفاخر، مناسب للحفلات..."
                      : "Elegant satin evening dress, perfect for parties..."}
                    rows={2}
                    className="resize-none"
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
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* AI Model Selector */}
                <AIModelSelector
                  toolType="image"
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />

                {/* Generate Button - Single button that does analysis + generation */}
                <Button
                  size="lg"
                  className="h-14 text-base gap-2 w-full"
                  onClick={handleGenerate}
                  disabled={loading || analyzing || (!productName.trim() && !customPrompt.trim())}
                >
                  {analyzing ? (
                    <>
                      <Brain className="w-5 h-5 animate-pulse" />
                      {isRTL ? "جارٍ التحليل..." : "Analyzing..."}
                    </>
                  ) : loading ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      {isRTL ? "جارٍ التوليد..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {isRTL ? "تحليل وتوليد 4 صور" : "Analyze & Generate 4 Images"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
              <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
                <Collapsible open={analysisOpen} onOpenChange={setAnalysisOpen}>
                  <CardHeader className="pb-2">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <CardTitle className="flex items-center gap-2 text-violet-800">
                          <Brain className="w-5 h-5" />
                          {isRTL ? "نتائج التحليل العميق" : "Deep Analysis Results"}
                        </CardTitle>
                        {analysisOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </CollapsibleTrigger>
                    <CardDescription>
                      {isRTL ? "insights تسويقية لإنشاء صور إعلانية فعالة" : "Marketing insights for effective ad images"}
                    </CardDescription>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-2">
                      {/* Core Feature */}
                      {analysis.coreFeature && (
                        <div className="p-3 bg-violet-100 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium text-violet-800 mb-1">
                            <Target className="w-4 h-4" />
                            {isRTL ? "الميزة الأساسية" : "Core Feature"}
                          </div>
                          <p className="text-sm text-violet-700">{safeString(analysis.coreFeature)}</p>
                        </div>
                      )}

                      <div className="grid gap-4">
                        <AnalysisSection 
                          title={isRTL ? "المميزات" : "Features"} 
                          items={analysis.features} 
                          icon={CheckCircle2} 
                          color="text-green-600" 
                        />
                        <AnalysisSection 
                          title={isRTL ? "الفوائد" : "Benefits"} 
                          items={analysis.benefits} 
                          icon={Sparkles} 
                          color="text-blue-600" 
                        />
                        <AnalysisSection 
                          title={isRTL ? "المشاكل المحلولة" : "Problems Solved"} 
                          items={analysis.problemsSolved} 
                          icon={AlertTriangle} 
                          color="text-orange-600" 
                        />
                        <AnalysisSection 
                          title={isRTL ? "المحفزات العاطفية" : "Emotional Triggers"} 
                          items={analysis.emotionalTriggers} 
                          icon={Heart} 
                          color="text-pink-600" 
                        />
                        <AnalysisSection 
                          title={isRTL ? "اعتراضات العميل" : "Customer Objections"} 
                          items={analysis.objections} 
                          icon={HelpCircle} 
                          color="text-red-600" 
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
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
                    {isRTL ? "الصور ستظهر هنا" : "Images will appear here"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isRTL
                      ? "1️⃣ أدخل بيانات المنتج\n2️⃣ اضغط تحليل عميق\n3️⃣ اضغط توليد للصور"
                      : "1️⃣ Enter product data\n2️⃣ Click Deep Analyze\n3️⃣ Click Generate for images"}
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
