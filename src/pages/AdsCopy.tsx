import { useState } from "react";
import {
  Megaphone,
  Sparkles,
  Copy,
  RotateCcw,
  Facebook,
  Instagram,
  Youtube,
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAI } from "@/hooks/useAI";
import { useHistory } from "@/hooks/useHistory";
import { ExportButtons } from "@/components/export/ExportButtons";
import { ProductUrlExtractor } from "@/components/common/ProductUrlExtractor";
import { ProductData } from "@/lib/api/firecrawl";

const platforms = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-600" },
  { id: "google", label: "Google Ads", icon: Youtube, color: "from-red-500 to-red-600" },
  { id: "tiktok", label: "TikTok", icon: Megaphone, color: "from-gray-900 to-gray-800" },
];

export default function AdsCopy() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [campaignGoal, setCampaignGoal] = useState("conversions");
  const [generatedAds, setGeneratedAds] = useState<any[]>([]);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { generate, isLoading } = useAI("ads-copy");
  const { saveToHistory } = useHistory();

  const campaignGoals = [
    { value: "awareness", label: t("goalAwareness") },
    { value: "traffic", label: t("goalTraffic") },
    { value: "engagement", label: t("goalEngagement") },
    { value: "conversions", label: t("goalConversions") },
    { value: "leads", label: t("goalLeads") },
  ];

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!productName || !productDescription || selectedPlatforms.length === 0) {
      toast({
        title: t("missingInfo"),
        description: t("pleaseFilRequired"),
        variant: "destructive",
      });
      return;
    }

    const input = {
      productName,
      productDescription,
      targetAudience,
      platform: selectedPlatforms[0],
      goal: campaignGoal,
    };

    const result = await generate(input);

    if (result?.variations) {
      const ads = result.variations.map((variation: any, index: number) => ({
        id: `ad-${index + 1}`,
        platform: platforms.find(p => p.id === selectedPlatforms[0])?.label,
        platformId: selectedPlatforms[0],
        variation: `${isRTL ? "النسخة" : "Variation"} ${String.fromCharCode(65 + index)}`,
        headline: variation.headline,
        primaryText: variation.primaryText,
        cta: variation.cta,
      }));
      
      setGeneratedAds(ads);
      await saveToHistory("ads", input, result);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("copied"),
      description: t("copiedToClipboard"),
    });
  };

  const getAllAdsContent = () => {
    return generatedAds.map(ad => 
      `${ad.platform} - ${ad.variation}\n${isRTL ? "العنوان" : "Headline"}: ${ad.headline}\n${isRTL ? "النص" : "Text"}: ${ad.primaryText}\nCTA: ${ad.cta}`
    ).join("\n\n---\n\n");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{t("adsCopyGenerator")}</h1>
          </div>
          <p className="text-muted-foreground">
            {t("adsCopyDesc")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">{t("adDetails")}</h2>

              {/* Product URL Extractor */}
              <ProductUrlExtractor 
                onExtract={(data: ProductData) => {
                  if (data.title) setProductName(data.title);
                  if (data.description) setProductDescription(data.description);
                  if (data.features && data.features.length > 0) {
                    setProductDescription(prev => 
                      prev + (prev ? '\n\n' : '') + data.features!.slice(0, 5).join('\n')
                    );
                  }
                }}
              />

              <div className="space-y-2">
                <Label htmlFor="productName">{t("productName")} *</Label>
                <Input
                  id="productName"
                  placeholder={t("productNamePlaceholder")}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">{t("productDescription")} *</Label>
                <Textarea
                  id="productDescription"
                  placeholder={t("productDescPlaceholder")}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">{t("targetAudience")}</Label>
                <Input
                  id="targetAudience"
                  placeholder={t("targetAudiencePlaceholder")}
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("campaignGoal")}</Label>
                <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                  <SelectTrigger className="input-field">
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
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">{t("platform")} *</h2>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPlatforms.includes(platform.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                      >
                        <platform.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{platform.label}</span>
                      {selectedPlatforms.includes(platform.id) && (
                        <Check className={`w-4 h-4 text-primary ${isRTL ? "mr-auto" : "ml-auto"}`} />
                      )}
                    </div>
                  </button>
                ))}
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
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t("generateAds")}
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t("generatedAds")}</h2>
              {generatedAds.length > 0 && (
                <ExportButtons content={getAllAdsContent()} filename="ads-copy" />
              )}
            </div>

            {generatedAds.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">{t("noContentYet")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("noContentDesc")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {generatedAds.map((ad) => {
                  const platformData = platforms.find((p) => p.id === ad.platformId);
                  return (
                    <div
                      key={ad.id}
                      className="glass-card rounded-xl p-5 space-y-4 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platformData?.color} flex items-center justify-center`}
                          >
                            {platformData && (
                              <platformData.icon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{ad.platform}</h3>
                            <p className="text-xs text-muted-foreground">
                              {ad.variation}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              `${ad.headline}\n\n${ad.primaryText}\n\nCTA: ${ad.cta}`
                            )
                          }
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {t("headline")}
                          </p>
                          <p className="font-medium">{ad.headline}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {t("primaryText")}
                          </p>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {ad.primaryText}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {t("callToAction")}
                          </p>
                          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md">
                            {ad.cta}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
