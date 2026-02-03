import { useState, useMemo } from "react";
import {
  Megaphone,
  Sparkles,
  Copy,
  RotateCcw,
  Facebook,
  Instagram,
  Check,
  Target,
  Users,
  TrendingUp,
  Zap,
  Heart,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHistory } from "@/hooks/useHistory";
import { AIModelSelector, getRecommendedModel, AI_MODELS } from "@/components/ai/AIModelSelector";

const platforms = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-pink-500 to-purple-600" },
];

type AdVariation = {
  headline: string;
  primaryText: string;
  cta: string;
};

export default function AdsCopy() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveToHistory } = useHistory();

  // Form State
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [priceOffer, setPriceOffer] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [campaignGoal, setCampaignGoal] = useState("conversions");
  const [selectedModel, setSelectedModel] = useState(getRecommendedModel("ads"));
  
  const [generatedAds, setGeneratedAds] = useState<AdVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const campaignGoals = useMemo(() => [
    { value: "conversions", label: isRTL ? "المبيعات" : "Conversions", icon: TrendingUp, description: isRTL ? "زيادة المشتريات" : "Increase purchases" },
    { value: "traffic", label: isRTL ? "الزيارات" : "Traffic", icon: Zap, description: isRTL ? "جلب زوار للمتجر" : "Drive store traffic" },
    { value: "awareness", label: isRTL ? "الوعي" : "Awareness", icon: Heart, description: isRTL ? "تعريف بالعلامة" : "Brand recognition" },
    { value: "leads", label: isRTL ? "العملاء" : "Leads", icon: Users, description: isRTL ? "جمع بيانات العملاء" : "Collect customer data" },
  ], [isRTL]);

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

    setIsLoading(true);
    setGeneratedAds([]);

    try {
      const modelData = AI_MODELS.find(m => m.id === selectedModel);
      const provider = modelData?.provider || "lovable";
      
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          toolType: "ads-copy",
          language: isRTL ? "ar" : "en",
          model: selectedModel,
          provider,
          input: {
            productName,
            productDescription,
            keyBenefits,
            targetAudience,
            priceOffer,
            platform: selectedPlatform,
            goal: campaignGoal,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data?.result;
      if (result?.variations && Array.isArray(result.variations)) {
        setGeneratedAds(result.variations);
        
        // Save to history automatically
        await saveToHistory(
          "ads",
          { productName, productDescription, keyBenefits, targetAudience, priceOffer, platform: selectedPlatform, goal: campaignGoal },
          { title: productName, headline: result.variations[0]?.headline, count: result.variations.length }
        );
        
        toast({
          title: isRTL ? "✓ تم التوليد" : "✓ Generated",
          description: isRTL ? `${result.variations.length} إعلانات جاهزة - تم الحفظ في السجل` : `${result.variations.length} ads ready - saved to history`,
        });
      } else {
        throw new Error(isRTL ? "استجابة غير صالحة" : "Invalid response format");
      }
    } catch (err: any) {
      console.error("Ads generation error:", err);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: err?.message || (isRTL ? "فشل التوليد" : "Generation failed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    toast({
      title: isRTL ? "✓ تم النسخ" : "✓ Copied",
    });
  };

  const copyAllAds = () => {
    const allText = generatedAds.map((ad, i) =>
      `━━━ ${isRTL ? "إعلان" : "Ad"} ${i + 1} ━━━\n\n📢 ${isRTL ? "العنوان" : "Headline"}:\n${ad.headline}\n\n📝 ${isRTL ? "النص" : "Text"}:\n${ad.primaryText}\n\n🔘 CTA: ${ad.cta}`
    ).join("\n\n");
    copyToClipboard(allText);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isRTL ? "استوديو الإعلانات" : "Ads Studio"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "إعلانات Meta عالية التحويل للأزياء والجمال • GPT-5 Mini"
                  : "High-converting Meta ads for Fashion & Beauty • GPT-5 Mini"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-pink-600 border-pink-300 bg-pink-50">
              ✨ Creative AI
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {isRTL ? "3 نسخ" : "3 Variations"}
            </Badge>
          </div>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {isRTL ? "بيانات الإعلان" : "Ad Details"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "أدخل معلومات منتجك لتوليد 3 نسخ إعلانية احترافية"
                : "Enter your product info to generate 3 professional ad copies"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label>{isRTL ? "المنصة" : "Platform"}</Label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedPlatform === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${p.color} flex items-center justify-center`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-start">
                      <span className="font-medium">{p.label}</span>
                      <p className="text-xs text-muted-foreground">
                        {p.id === "facebook" 
                          ? (isRTL ? "إعلانات Feed & Stories" : "Feed & Stories Ads")
                          : (isRTL ? "Reels & Stories" : "Reels & Stories")}
                      </p>
                    </div>
                    {selectedPlatform === p.id && (
                      <Check className="w-5 h-5 text-primary ms-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Goal */}
            <div className="space-y-2">
              <Label>{isRTL ? "هدف الحملة" : "Campaign Goal"}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {campaignGoals.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setCampaignGoal(goal.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      campaignGoal === goal.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <goal.icon className={`w-5 h-5 mx-auto mb-1 ${campaignGoal === goal.value ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium block">{goal.label}</span>
                    <span className="text-xs text-muted-foreground">{goal.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
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
                <Label>{isRTL ? "العرض/السعر" : "Offer/Price"}</Label>
                <Input
                  value={priceOffer}
                  onChange={(e) => setPriceOffer(e.target.value)}
                  placeholder={isRTL ? "خصم 30% + شحن مجاني" : "30% Off + Free Shipping"}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "وصف المنتج" : "Product Description"}</Label>
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={isRTL 
                  ? "فستان سهرة فاخر من الساتان الناعم، تصميم أنيق بقصة A-line..."
                  : "Luxurious satin evening dress with elegant A-line cut..."}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRTL ? "المميزات الرئيسية" : "Key Benefits"}</Label>
                <Textarea
                  value={keyBenefits}
                  onChange={(e) => setKeyBenefits(e.target.value)}
                  placeholder={isRTL 
                    ? "جودة عالية، تصميم حصري، مريح للارتداء"
                    : "Premium quality, exclusive design, comfortable fit"}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الجمهور المستهدف" : "Target Audience"}</Label>
                <Textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder={isRTL 
                    ? "نساء 25-45، محبات الموضة، السعودية والإمارات"
                    : "Women 25-45, fashion lovers, Saudi & UAE"}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* AI Model Selector */}
            <AIModelSelector
              toolType="ads"
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2"
              onClick={handleGenerate}
              disabled={isLoading || !productName.trim()}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  {isRTL ? "جارٍ التوليد..." : "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "توليد 3 إعلانات" : "Generate 3 Ads"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {generatedAds.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {isRTL ? "الإعلانات المُولّدة" : "Generated Ads"}
              </h2>
              <Button variant="outline" size="sm" onClick={copyAllAds} className="gap-1">
                <Copy className="w-4 h-4" />
                {isRTL ? "نسخ الكل" : "Copy All"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {generatedAds.map((ad, index) => (
                <Card key={index} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {isRTL ? `نسخة ${index + 1}` : `Version ${index + 1}`}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(`${ad.headline}\n\n${ad.primaryText}\n\nCTA: ${ad.cta}`, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        📢 {isRTL ? "العنوان" : "Headline"}
                      </p>
                      <p className="font-semibold text-lg leading-tight">{ad.headline}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        📝 {isRTL ? "النص الأساسي" : "Primary Text"}
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {ad.primaryText}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        🔘 CTA Button
                      </p>
                      <span className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">
                        {ad.cta}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedAds.length === 0 && !isLoading && (
          <Card className="text-center py-16 border-dashed">
            <CardContent>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "ابدأ بإدخال بيانات منتجك" : "Start by entering your product details"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isRTL
                  ? "سيتم توليد 3 نسخ إعلانية احترافية مع عناوين جذابة و CTAs فعالة"
                  : "Will generate 3 professional ad copies with catchy headlines and effective CTAs"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
