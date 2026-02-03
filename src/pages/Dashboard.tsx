import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useHistory } from "@/hooks/useHistory";
import { AIModelSelector, getRecommendedModel, AI_MODELS } from "@/components/ai/AIModelSelector";
import { 
  Sparkles, 
  Copy, 
  Save, 
  ExternalLink, 
  RotateCcw,
  Package,
  Type,
  FileText,
  Palette,
  Image as ImageIcon,
  Code,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StudioResult = {
  shopifyTitle: { ar: string; en: string };
  meta: { title: string; description: string };
  description: { ar: string; en: string };
  variants: {
    options: Array<{ name: string; values: string[] }>;
  };
  altTexts: string[];
  jsonLd: string;
};

export default function Dashboard() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveToHistory } = useHistory();

  // Form State
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [tone, setTone] = useState<"luxury" | "professional" | "modest" | "elegant">("luxury");
  const [selectedModel, setSelectedModel] = useState(getRecommendedModel("product"));
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudioResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const tones = useMemo(
    () => [
      { value: "luxury", label: isRTL ? "فاخر" : "Luxury", emoji: "💎" },
      { value: "professional", label: isRTL ? "احترافي" : "Professional", emoji: "💼" },
      { value: "modest", label: isRTL ? "محتشم" : "Modest", emoji: "🌸" },
      { value: "elegant", label: isRTL ? "أنيق" : "Elegant", emoji: "✨" },
    ],
    [isRTL]
  );

  const categories = useMemo(
    () => [
      { value: "dresses", label: isRTL ? "فساتين" : "Dresses" },
      { value: "abayas", label: isRTL ? "عبايات" : "Abayas" },
      { value: "hijabs", label: isRTL ? "حجابات" : "Hijabs" },
      { value: "bags", label: isRTL ? "حقائب" : "Bags" },
      { value: "shoes", label: isRTL ? "أحذية" : "Shoes" },
      { value: "jewelry", label: isRTL ? "مجوهرات" : "Jewelry" },
      { value: "skincare", label: isRTL ? "عناية بالبشرة" : "Skincare" },
      { value: "makeup", label: isRTL ? "مكياج" : "Makeup" },
      { value: "perfumes", label: isRTL ? "عطور" : "Perfumes" },
      { value: "other", label: isRTL ? "أخرى" : "Other" },
    ],
    [isRTL]
  );

  const copy = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: isRTL ? "✓ تم النسخ" : "✓ Copied",
    });
  };

  const copyAll = async () => {
    if (!result) return;
    const payload = [
      `📝 Shopify Title (AR): ${result.shopifyTitle.ar}`,
      `📝 Shopify Title (EN): ${result.shopifyTitle.en}`,
      "",
      `🔍 Meta Title: ${result.meta.title}`,
      `🔍 Meta Description: ${result.meta.description}`,
      "",
      "📄 Description (AR):",
      result.description.ar,
      "",
      "📄 Description (EN):",
      result.description.en,
      "",
      "🎨 Variants:",
      ...result.variants.options.map((o) => `${o.name}: ${o.values.join(", ")}`),
      "",
      "🖼️ Alt Texts:",
      ...result.altTexts,
      "",
      "💻 Schema JSON-LD:",
      result.jsonLd,
    ].join("\n");
    await copy(payload, "all");
  };

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
    setResult(null);
    
    try {
      const modelData = AI_MODELS.find(m => m.id === selectedModel);
      const provider = modelData?.provider || "lovable";
      
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          toolType: "shopify-studio",
          language: "ar",
          model: selectedModel,
          provider,
          input: {
            productName,
            productDescription,
            category,
            targetAudience,
            keyFeatures,
            priceRange,
            tone,
          },
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const res = data?.result as StudioResult | undefined;
      if (!res?.shopifyTitle?.ar || !res?.description?.ar) {
        throw new Error(isRTL ? "استجابة غير صالحة" : "Invalid response");
      }
      setResult(res);
      
      // Save to history automatically
      await saveToHistory(
        "product",
        { productName, productDescription, category, targetAudience, keyFeatures, priceRange, tone },
        { title: res.shopifyTitle.ar, description: res.description.ar?.substring(0, 200) }
      );
      
      toast({
        title: isRTL ? "✓ تم التوليد بنجاح" : "✓ Generated successfully",
        description: isRTL ? "6 أنواع محتوى جاهزة للنسخ - تم الحفظ في السجل" : "6 content types ready - saved to history",
      });
    } catch (e: any) {
      console.error("Generation error:", e);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: e?.message || (isRTL ? "فشل التوليد" : "Generation failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!user || !result) return;
    try {
      const { error } = await supabase.from("generated_content").insert([
        {
          user_id: user.id,
          content_type: "shopify_studio",
          input_data: { productName, productDescription, category, targetAudience, keyFeatures, priceRange, tone } as any,
          output_data: result as any,
          product_title: productName,
          tone,
        } as any,
      ]);
      if (error) throw error;
      toast({
        title: isRTL ? "✓ تم الحفظ" : "✓ Saved",
        description: isRTL ? "تم حفظ المحتوى في المكتبة" : "Saved to library",
      });
    } catch (e: any) {
      toast({
        title: isRTL ? "فشل الحفظ" : "Save failed",
        description: e?.message || (isRTL ? "تعذر الحفظ" : "Could not save"),
        variant: "destructive",
      });
    }
  };

  const handleCreateInShopify = async () => {
    if (!result) return;
    try {
      const { data, error } = await supabase.functions.invoke("shopify-create-product", {
        body: { studioResult: result },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: isRTL ? "تم إنشاء المنتج" : "Product created",
        description: isRTL ? "تم إنشاء المنتج في Shopify" : "Created in Shopify",
      });

      const url = data?.productAdminUrl as string | undefined;
      if (url) window.open(url, "_blank");
    } catch (e: any) {
      toast({
        title: isRTL ? "تعذر الإنشاء" : "Create failed",
        description: e?.message || (isRTL ? "تأكد من ربط Shopify أولاً" : "Please connect Shopify first"),
        variant: "destructive",
      });
    }
  };

  const ResultCard = ({ 
    title, 
    icon: Icon, 
    content, 
    fieldName,
    rows = 4 
  }: { 
    title: string; 
    icon: any; 
    content: string; 
    fieldName: string;
    rows?: number;
  }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(content, fieldName)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedField === fieldName ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea 
          readOnly 
          value={content} 
          rows={rows} 
          className="resize-none bg-muted/50 border-0 text-sm"
        />
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isRTL ? "استوديو المنتجات" : "Product Studio"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? "محتوى AI متقدم ثنائي اللغة للأزياء والجمال • Gemini 2.5 Pro"
                    : "Advanced bilingual AI content for Fashion & Beauty • Gemini 2.5 Pro"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300 bg-emerald-50">
              🧠 Pro Model
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {isRTL ? "6 مخرجات" : "6 Outputs"}
            </Badge>
          </div>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {isRTL ? "بيانات المنتج" : "Product Details"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "أدخل معلومات منتجك لتوليد محتوى احترافي جاهز لـ Shopify/Salla"
                : "Enter your product info to generate professional content for Shopify/Salla"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: Name & Category */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  {isRTL ? "اسم المنتج" : "Product Name"}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={isRTL ? "فستان سهرة ساتان أسود" : "Black Satin Evening Dress"}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الفئة" : "Category"}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={isRTL ? "اختر الفئة" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="space-y-2">
              <Label>{isRTL ? "وصف المنتج" : "Product Description"}</Label>
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={isRTL 
                  ? "فستان سهرة فاخر من الساتان الناعم، تصميم أنيق بقصة A-line، مناسب للحفلات والمناسبات الخاصة..."
                  : "Luxurious satin evening dress with elegant A-line cut, perfect for parties and special occasions..."}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Row 3: Features & Target */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRTL ? "المميزات الرئيسية" : "Key Features"}</Label>
                <Textarea
                  value={keyFeatures}
                  onChange={(e) => setKeyFeatures(e.target.value)}
                  placeholder={isRTL 
                    ? "ساتان فاخر، قصة A-line، سحاب خلفي، بطانة كاملة"
                    : "Premium satin, A-line cut, back zipper, fully lined"}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الجمهور المستهدف" : "Target Audience"}</Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder={isRTL ? "نساء 25-45، محبات الأناقة" : "Women 25-45, elegance lovers"}
                  className="h-11"
                />
              </div>
            </div>

            {/* Row 4: Price & Tone */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRTL ? "نطاق السعر" : "Price Range"}</Label>
                <Input
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder={isRTL ? "500-800 ريال" : "$150-250"}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "نبرة المحتوى" : "Content Tone"}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value as any)}
                      className={`p-2.5 rounded-lg border-2 transition-all text-center ${
                        tone === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-lg mb-0.5">{t.emoji}</div>
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Model Selector */}
            <AIModelSelector
              toolType="product"
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2"
              onClick={handleGenerate}
              disabled={loading || !productName.trim()}
            >
              {loading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  {isRTL ? "جارٍ التوليد..." : "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "توليد 6 أنواع محتوى" : "Generate 6 Content Types"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {result && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {isRTL ? "المحتوى المُولّد" : "Generated Content"}
              </h2>
              <Button variant="outline" size="sm" onClick={copyAll} className="gap-1">
                <Copy className="w-4 h-4" />
                {isRTL ? "نسخ الكل" : "Copy All"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ResultCard
                title={isRTL ? "عنوان Shopify" : "Shopify Title"}
                icon={Type}
                content={`${result.shopifyTitle.ar}\n\n${result.shopifyTitle.en}`}
                fieldName="title"
                rows={3}
              />
              <ResultCard
                title="Meta SEO"
                icon={FileText}
                content={`${result.meta.title}\n\n${result.meta.description}`}
                fieldName="meta"
                rows={3}
              />
              <ResultCard
                title={isRTL ? "الوصف الكامل" : "Full Description"}
                icon={FileText}
                content={`${result.description.ar}\n\n---\n\n${result.description.en}`}
                fieldName="description"
                rows={6}
              />
              <ResultCard
                title={isRTL ? "المقاسات والألوان" : "Size/Color Variants"}
                icon={Palette}
                content={result.variants.options.map((o) => `${o.name}: ${o.values.join(", ")}`).join("\n")}
                fieldName="variants"
                rows={3}
              />
              <ResultCard
                title={isRTL ? "نص بديل للصور" : "Image Alt Text"}
                icon={ImageIcon}
                content={result.altTexts.join("\n")}
                fieldName="altTexts"
                rows={3}
              />
              <ResultCard
                title="Schema JSON-LD"
                icon={Code}
                content={result.jsonLd}
                fieldName="jsonLd"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Button size="lg" onClick={handleCreateInShopify} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                {isRTL ? "إنشاء في Shopify" : "Create in Shopify"}
              </Button>
              <Button size="lg" variant="outline" onClick={handleSaveToLibrary} className="gap-2">
                <Save className="w-4 h-4" />
                {isRTL ? "حفظ في المكتبة" : "Save to Library"}
              </Button>
              <Button size="lg" variant="outline" onClick={copyAll} className="gap-2">
                <Copy className="w-4 h-4" />
                {isRTL ? "نسخ كل المحتوى" : "Copy All Content"}
              </Button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <Card className="text-center py-16 border-dashed">
            <CardContent>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "ابدأ بإدخال بيانات منتجك" : "Start by entering your product details"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isRTL
                  ? "سيتم توليد 6 أنواع من المحتوى الاحترافي: عنوان، SEO، وصف، مقاسات، Alt Text، و Schema"
                  : "Will generate 6 professional content types: Title, SEO, Description, Variants, Alt Text, and Schema"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
