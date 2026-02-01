import { useState } from "react";
import {
  Megaphone,
  Sparkles,
  Copy,
  RotateCcw,
  Facebook,
  Instagram,
  Check,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductUrlExtractor } from "@/components/common/ProductUrlExtractor";
import type { ProductData } from "@/lib/api/firecrawl";

const platforms = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-600" },
];

type AdVariation = {
  headline: string;
  primaryText: string;
  cta: string;
};

export default function AdsCopy() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [campaignGoal, setCampaignGoal] = useState("conversions");
  const [generatedAds, setGeneratedAds] = useState<AdVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const campaignGoals = [
    { value: "awareness", label: isRTL ? "الوعي بالعلامة" : "Brand Awareness" },
    { value: "traffic", label: isRTL ? "زيادة الزيارات" : "Traffic" },
    { value: "conversions", label: isRTL ? "المبيعات" : "Conversions" },
    { value: "leads", label: isRTL ? "جمع العملاء" : "Lead Generation" },
  ];

  const handleExtractProduct = (data: ProductData) => {
    if (data.title) setProductName(data.title);
    if (data.description) setProductDescription(data.description);
    if (data.features && data.features.length > 0) {
      setProductDescription(prev =>
        prev + (prev ? '\n\n' : '') + data.features!.slice(0, 5).join('\n')
      );
    }
    toast({
      title: isRTL ? "تم الاستخراج" : "Extracted",
      description: isRTL ? "تم سحب بيانات المنتج" : "Product data extracted",
    });
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: isRTL ? "يرجى تسجيل الدخول" : "Please login",
        variant: "destructive",
      });
      return;
    }

    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: isRTL ? "بيانات ناقصة" : "Missing Info",
        description: isRTL ? "أدخل اسم ووصف المنتج" : "Enter product name and description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedAds([]);

    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          toolType: "ads-copy",
          language: isRTL ? "ar" : "en",
          input: {
            productName,
            productDescription,
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
        toast({
          title: isRTL ? "تم التوليد" : "Generated",
          description: isRTL ? `تم إنشاء ${result.variations.length} إعلانات` : `Created ${result.variations.length} ads`,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: isRTL ? "تم النسخ" : "Copied",
      description: isRTL ? "تم نسخ النص" : "Text copied",
    });
  };

  const copyAllAds = () => {
    const allText = generatedAds.map((ad, i) =>
      `${isRTL ? "إعلان" : "Ad"} ${i + 1}:\n${isRTL ? "العنوان" : "Headline"}: ${ad.headline}\n${isRTL ? "النص" : "Text"}: ${ad.primaryText}\nCTA: ${ad.cta}`
    ).join("\n\n---\n\n");
    copyToClipboard(allText);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              {isRTL ? "استوديو الإعلانات" : "Ads Studio"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL
              ? "إنشاء إعلانات Meta عالية التحويل للأزياء—Facebook & Instagram"
              : "Create high-converting Meta ads for Fashion—Facebook & Instagram"}
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "بيانات المنتج" : "Product Info"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL Extractor */}
            <ProductUrlExtractor onExtract={handleExtractProduct} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRTL ? "اسم المنتج *" : "Product Name *"}</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={isRTL ? "فستان سهرة أنيق" : "Elegant Evening Dress"}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "المنصة" : "Platform"}</Label>
                <div className="flex gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        selectedPlatform === p.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-6 h-6 rounded bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                          <p.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{p.label}</span>
                        {selectedPlatform === p.id && <Check className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "وصف المنتج *" : "Product Description *"}</Label>
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={isRTL ? "وصف تفصيلي للمنتج..." : "Detailed product description..."}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "هدف الحملة" : "Campaign Goal"}</Label>
              <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignGoals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  {isRTL ? "جارٍ التوليد..." : "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "توليد إعلانات Meta" : "Generate Meta Ads"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {generatedAds.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isRTL ? "الإعلانات المُولّدة" : "Generated Ads"}
              </h2>
              <Button variant="outline" size="sm" onClick={copyAllAds}>
                <Copy className="w-4 h-4" />
                {isRTL ? "نسخ الكل" : "Copy All"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {generatedAds.map((ad, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {isRTL ? `إعلان ${index + 1}` : `Ad ${index + 1}`}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(`${ad.headline}\n\n${ad.primaryText}\n\nCTA: ${ad.cta}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {isRTL ? "العنوان" : "Headline"}
                      </p>
                      <p className="font-semibold">{ad.headline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {isRTL ? "النص الأساسي" : "Primary Text"}
                      </p>
                      <p className="text-muted-foreground whitespace-pre-line">{ad.primaryText}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CTA</p>
                      <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md">
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
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">
                {isRTL ? "لا يوجد إعلانات بعد" : "No ads yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "أدخل بيانات المنتج واضغط توليد"
                  : "Enter product details and click generate"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
