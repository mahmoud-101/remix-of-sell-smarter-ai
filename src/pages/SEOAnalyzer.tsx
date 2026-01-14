import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Loader2, Copy, Check, TrendingUp, Target, FileText } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAI } from "@/hooks/useAI";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SEOAnalyzer = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { toast } = useToast();
  
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [category, setCategory] = useState("fashion");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  
  const { generate, isLoading } = useAI("seo-optimizer");

  const handleGenerate = async () => {
    if (!productTitle.trim()) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "من فضلك أدخل عنوان المنتج" : "Please enter product title",
        variant: "destructive",
      });
      return;
    }

    const response = await generate({
      productTitle,
      productDescription,
      category,
      targetKeywords,
    });
    
    if (response) {
      setResult(response);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast({
      title: isRTL ? "تم النسخ!" : "Copied!",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = [
    { value: "fashion", label: isRTL ? "أزياء وملابس" : "Fashion & Clothing" },
    { value: "electronics", label: isRTL ? "إلكترونيات" : "Electronics" },
    { value: "beauty", label: isRTL ? "جمال وعناية" : "Beauty & Care" },
    { value: "home", label: isRTL ? "المنزل والحديقة" : "Home & Garden" },
    { value: "sports", label: isRTL ? "رياضة" : "Sports & Fitness" },
    { value: "food", label: isRTL ? "طعام ومشروبات" : "Food & Beverages" },
    { value: "kids", label: isRTL ? "أطفال" : "Kids & Babies" },
    { value: "accessories", label: isRTL ? "إكسسوارات" : "Accessories" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <Search className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isRTL ? "خبير سيو المتاجر" : "E-commerce SEO Expert"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? "حسّن منتجاتك للظهور في الصفحة الأولى من جوجل" : "Optimize your products to rank #1 on Google"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                {isRTL ? "بيانات المنتج" : "Product Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "عنوان المنتج الحالي *" : "Current Product Title *"}</Label>
                <Input
                  placeholder={isRTL ? "مثال: فستان صيفي أنيق" : "e.g., Summer Elegant Dress"}
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "وصف المنتج الحالي" : "Current Product Description"}</Label>
                <Textarea
                  placeholder={isRTL ? "انسخ الوصف الحالي للمنتج هنا..." : "Paste your current product description..."}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "فئة المنتج" : "Product Category"}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "كلمات مفتاحية مستهدفة (اختياري)" : "Target Keywords (optional)"}</Label>
                <Input
                  placeholder={isRTL ? "مثال: فستان سهرة، فستان زفاف" : "e.g., evening dress, wedding gown"}
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !productTitle.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isRTL ? "جاري التحليل..." : "Analyzing SEO..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRTL ? "حسّن السيو 🚀" : "Optimize SEO 🚀"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {isRTL ? "النتائج المحسّنة" : "Optimized Results"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <Tabs defaultValue="title" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="title">{isRTL ? "العنوان" : "Title"}</TabsTrigger>
                    <TabsTrigger value="description">{isRTL ? "الوصف" : "Description"}</TabsTrigger>
                    <TabsTrigger value="keywords">{isRTL ? "الكلمات" : "Keywords"}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="title" className="space-y-3 mt-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Label className="text-xs text-muted-foreground">
                          {isRTL ? "العنوان المحسّن للسيو" : "SEO Optimized Title"}
                        </Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopy(result.title || result, 'title')}
                        >
                          {copied === 'title' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <p className="font-medium">{result.title || result}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="description" className="space-y-3 mt-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Label className="text-xs text-muted-foreground">
                          {isRTL ? "الوصف المحسّن" : "Optimized Description"}
                        </Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopy(result.description || '', 'desc')}
                        >
                          {copied === 'desc' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">{result.description || ''}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="keywords" className="space-y-3 mt-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <Label className="text-xs text-muted-foreground mb-3 block">
                        {isRTL ? "الكلمات المفتاحية المقترحة" : "Suggested Keywords"}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(result.keywords || []).map((keyword: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm cursor-pointer hover:bg-green-200 transition-colors"
                            onClick={() => handleCopy(keyword, `kw-${index}`)}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    {isRTL 
                      ? "نتائج التحسين هتظهر هنا" 
                      : "Optimization results will appear here"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SEO Tips */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {isRTL ? "نصائح SEO للمتاجر الإلكترونية 📈" : "E-commerce SEO Tips 📈"}
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-background/50 rounded-lg p-3">
                <strong>{isRTL ? "العنوان المثالي" : "Perfect Title"}</strong>
                <p className="text-muted-foreground mt-1">
                  {isRTL ? "60-70 حرف، الكلمة المفتاحية في البداية" : "60-70 chars, keyword at the beginning"}
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <strong>{isRTL ? "وصف ميتا" : "Meta Description"}</strong>
                <p className="text-muted-foreground mt-1">
                  {isRTL ? "150-160 حرف، فائدة + CTA" : "150-160 chars, benefit + CTA"}
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <strong>{isRTL ? "الصور" : "Images"}</strong>
                <p className="text-muted-foreground mt-1">
                  {isRTL ? "أسماء ملفات وصفية + Alt text" : "Descriptive filenames + Alt text"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SEOAnalyzer;
