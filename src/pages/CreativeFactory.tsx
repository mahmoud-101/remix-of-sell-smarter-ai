import { useState } from "react";
import { Palette, Sparkles, Image, Type, Loader2, Download, Copy, Check } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAI } from "@/hooks/useAI";
import { toast } from "sonner";

export default function CreativeFactory() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("product-photos");
  const [copied, setCopied] = useState<string | null>(null);
  
  // Form states
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandStyle, setBrandStyle] = useState("modern");
  const [platform, setPlatform] = useState("instagram");

  const { generate: generateCreative, isLoading, result } = useAI("design");

  const handleGenerate = async () => {
    if (!productName || !productDescription) {
      toast.error(isRTL ? "يرجى ملء البيانات المطلوبة" : "Please fill required fields");
      return;
    }

    await generateCreative({
      productName,
      productDescription,
      productCategory,
      targetAudience,
      brandStyle,
      platform,
      creativeType: activeTab,
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success(isRTL ? "تم النسخ" : "Copied!");
  };

  const categories = [
    { value: "fashion", label: isRTL ? "أزياء وملابس" : "Fashion & Clothing" },
    { value: "electronics", label: isRTL ? "إلكترونيات" : "Electronics" },
    { value: "beauty", label: isRTL ? "تجميل وعناية" : "Beauty & Care" },
    { value: "home", label: isRTL ? "منزل ومطبخ" : "Home & Kitchen" },
    { value: "sports", label: isRTL ? "رياضة ولياقة" : "Sports & Fitness" },
    { value: "kids", label: isRTL ? "أطفال وألعاب" : "Kids & Toys" },
    { value: "digital", label: isRTL ? "منتجات رقمية" : "Digital Products" },
  ];

  const brandStyles = [
    { value: "modern", label: isRTL ? "عصري ومينيمال" : "Modern & Minimal" },
    { value: "luxury", label: isRTL ? "فاخر وأنيق" : "Luxury & Elegant" },
    { value: "playful", label: isRTL ? "مرح وشبابي" : "Playful & Youthful" },
    { value: "bold", label: isRTL ? "جريء ومميز" : "Bold & Striking" },
    { value: "organic", label: isRTL ? "طبيعي وعضوي" : "Natural & Organic" },
  ];

  const platforms = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "tiktok", label: "TikTok" },
    { value: "snapchat", label: "Snapchat" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? "مصنع الكريتيفات" : "Creative Factory"}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? "ولّد أفكار صور المنتجات وتصميمات الإعلانات واقتراحات الألوان" 
                : "Generate product photo ideas, ad designs & color suggestions"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "بيانات المنتج" : "Product Details"}</CardTitle>
              <CardDescription>
                {isRTL ? "أدخل معلومات المنتج للحصول على أفكار كريتيف مخصصة" : "Enter product info to get customized creative ideas"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "اسم المنتج *" : "Product Name *"}</Label>
                <Input 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={isRTL ? "مثال: سماعات بلوتوث لاسلكية" : "e.g., Wireless Bluetooth Earbuds"}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "وصف المنتج *" : "Product Description *"}</Label>
                <Textarea 
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder={isRTL ? "اكتب وصف تفصيلي للمنتج..." : "Write a detailed product description..."}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "التصنيف" : "Category"}</Label>
                  <Select value={productCategory} onValueChange={setProductCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? "اختر التصنيف" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "أسلوب البراند" : "Brand Style"}</Label>
                  <Select value={brandStyle} onValueChange={setBrandStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brandStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "الجمهور المستهدف" : "Target Audience"}</Label>
                <Input 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder={isRTL ? "مثال: شباب 18-35 سنة مهتمين بالتكنولوجيا" : "e.g., Young adults 18-35 interested in tech"}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "المنصة" : "Platform"}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full"
                variant="hero"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isRTL ? "جاري التوليد..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isRTL ? "ولّد أفكار الكريتيف" : "Generate Creative Ideas"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "الأفكار المولّدة" : "Generated Ideas"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="product-photos" className="text-xs">
                    <Image className="w-4 h-4 mr-1" />
                    {isRTL ? "صور المنتج" : "Photos"}
                  </TabsTrigger>
                  <TabsTrigger value="ad-designs" className="text-xs">
                    <Palette className="w-4 h-4 mr-1" />
                    {isRTL ? "تصميمات" : "Designs"}
                  </TabsTrigger>
                  <TabsTrigger value="colors-fonts" className="text-xs">
                    <Type className="w-4 h-4 mr-1" />
                    {isRTL ? "ألوان وخطوط" : "Colors"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="product-photos" className="mt-4 space-y-4">
                  {result?.imageRecommendations ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">{isRTL ? "أفكار صور المنتج:" : "Product Photo Ideas:"}</h4>
                      {result.imageRecommendations.map((idea: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/50 flex items-start justify-between gap-2">
                          <p className="text-sm">{idea}</p>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCopy(idea, `photo-${i}`)}
                          >
                            {copied === `photo-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{isRTL ? "أدخل بيانات المنتج واضغط توليد" : "Enter product data and click generate"}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ad-designs" className="mt-4 space-y-4">
                  {result?.layoutRecommendations ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">{isRTL ? "أفكار تصميم الإعلان:" : "Ad Design Ideas:"}</h4>
                      {result.layoutRecommendations.map((idea: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/50 flex items-start justify-between gap-2">
                          <p className="text-sm">{idea}</p>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCopy(idea, `layout-${i}`)}
                          >
                            {copied === `layout-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                      {result.ctaRecommendations && (
                        <>
                          <h4 className="font-medium mt-4">{isRTL ? "اقتراحات CTA:" : "CTA Suggestions:"}</h4>
                          {result.ctaRecommendations.map((cta: string, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-primary/10 flex items-start justify-between gap-2">
                              <p className="text-sm">{cta}</p>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleCopy(cta, `cta-${i}`)}
                              >
                                {copied === `cta-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{isRTL ? "أدخل بيانات المنتج واضغط توليد" : "Enter product data and click generate"}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="colors-fonts" className="mt-4 space-y-4">
                  {result?.colorRecommendations ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">{isRTL ? "اقتراحات الألوان:" : "Color Suggestions:"}</h4>
                      {result.colorRecommendations.map((color: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/50 flex items-start justify-between gap-2">
                          <p className="text-sm">{color}</p>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCopy(color, `color-${i}`)}
                          >
                            {copied === `color-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                      {result.score && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{isRTL ? "تقييم التصميم" : "Design Score"}</span>
                            <span className="text-2xl font-bold text-primary">{result.score}/100</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{isRTL ? "أدخل بيانات المنتج واضغط توليد" : "Enter product data and click generate"}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Mistakes to Avoid */}
        {result?.mistakesToAvoid && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">{isRTL ? "أخطاء يجب تجنبها" : "Mistakes to Avoid"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {result.mistakesToAvoid.map((mistake: string, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm">{mistake}</p>
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
