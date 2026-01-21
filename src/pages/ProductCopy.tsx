import { useState } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { TemplatePicker, ProductTemplate } from "@/components/templates/ProductTemplates";
import { ExportButtons } from "@/components/export/ExportButtons";

interface VariationContent {
  variations: string[] | string[][];
  selectedIndex: number;
}

export default function ProductCopy() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("professional");
  
  // 🆕 New fields
  const [usps, setUsps] = useState<string[]>(["", "", ""]);
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [platform, setPlatform] = useState("website");
  const [keywords, setKeywords] = useState("");
  const [preferredCTA, setPreferredCTA] = useState("");
  const [contentLength, setContentLength] = useState("medium");
  
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([
    "title",
    "description",
    "bullets",
  ]);
  const [generatedContent, setGeneratedContent] = useState<Record<string, VariationContent>>({});
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { generate, isLoading } = useAI("product-copy");
  const { saveToHistory } = useHistory();

  const tones = [
    { value: "professional", label: t("toneProfessional") },
    { value: "friendly", label: t("toneFriendly") },
    { value: "luxury", label: t("toneLuxury") },
    { value: "aggressive", label: t("toneAggressive") },
    { value: "playful", label: t("tonePlayful") },
  ];

  const platforms = [
    { value: "website", label: isRTL ? "موقع إلكتروني" : "Website" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "google", label: "Google Ads" },
  ];

  const contentLengths = [
    { value: "short", label: isRTL ? "قصير" : "Short" },
    { value: "medium", label: isRTL ? "متوسط" : "Medium" },
    { value: "long", label: isRTL ? "طويل" : "Long" },
  ];

  const outputTypes = [
    { id: "title", label: t("outputTitle"), icon: "🏷️" },
    { id: "description", label: t("outputDescription"), icon: "📝" },
    { id: "bullets", label: t("outputBullets"), icon: "✅" },
    { id: "benefits", label: t("outputBenefits"), icon: "⭐" },
    { id: "cta", label: t("outputCTA"), icon: "🎯" },
  ];

  const toggleOutput = (id: string) => {
    setSelectedOutputs((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleTemplateSelect = (template: ProductTemplate) => {
    setProductName(isRTL ? template.productNameAr : template.productName);
    setProductDescription(isRTL ? template.productDescriptionAr : template.productDescription);
    setTargetAudience(isRTL ? template.targetAudienceAr : template.targetAudience);
    setTone(template.tone);
    toast({
      title: isRTL ? "تم تحميل القالب" : "Template loaded",
      description: isRTL ? `تم تحميل قالب ${template.nameAr}` : `Loaded ${template.name} template`,
    });
  };

  const handleUSPChange = (index: number, value: string) => {
    const newUsps = [...usps];
    newUsps[index] = value;
    setUsps(newUsps);
  };

  const handleGenerate = async () => {
    if (!productName || !productDescription) {
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
      tone,
      usps: usps.filter(u => u.trim() !== ""),
      price,
      offer,
      platform,
      keywords,
      preferredCTA,
      contentLength,
      outputTypes: selectedOutputs,
    };

    const result = await generate(input);

    if (result) {
      const content: Record<string, VariationContent> = {};
      
      selectedOutputs.forEach((key) => {
        if (result[key]?.variations) {
          content[key] = {
            variations: result[key].variations,
            selectedIndex: 0,
          };
        }
      });
      
      setGeneratedContent(content);
      await saveToHistory("product", input, result);
    }
  };

  const switchVariation = (key: string, direction: 'prev' | 'next') => {
    setGeneratedContent(prev => {
      const current = prev[key];
      if (!current) return prev;
      
      const maxIndex = current.variations.length - 1;
      let newIndex = current.selectedIndex;
      
      if (direction === 'next') {
        newIndex = newIndex >= maxIndex ? 0 : newIndex + 1;
      } else {
        newIndex = newIndex <= 0 ? maxIndex : newIndex - 1;
      }
      
      return {
        ...prev,
        [key]: { ...current, selectedIndex: newIndex }
      };
    });
  };

  const getCurrentVariation = (key: string): string | string[] => {
    const content = generatedContent[key];
    if (!content) return "";
    return content.variations[content.selectedIndex];
  };

  const copyToClipboard = (text: string | string[]) => {
    const textToCopy = Array.isArray(text) ? text.join('\n') : text;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: t("copied"),
      description: t("copiedToClipboard"),
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{t("productCopyGenerator")}</h1>
          </div>
          <p className="text-muted-foreground">
            {t("productCopyDesc")}
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
                {t("productDetails")}
              </h2>

              {/* Templates */}
              <TemplatePicker onSelect={handleTemplateSelect} />

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
                <Label htmlFor="productDescription">
                  {t("productDescription")} *
                </Label>
                <Textarea
                  id="productDescription"
                  placeholder={t("productDescPlaceholder")}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="input-field min-h-[120px]"
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

              {/* 🆕 USPs */}
              <div className="space-y-2">
                <Label>{isRTL ? "نقاط البيع الفريدة (USPs)" : "Unique Selling Points"}</Label>
                {usps.map((usp, index) => (
                  <Input
                    key={index}
                    placeholder={`${isRTL ? "نقطة" : "Point"} ${index + 1}`}
                    value={usp}
                    onChange={(e) => handleUSPChange(index, e.target.value)}
                    className="input-field"
                  />
                ))}
              </div>

              {/* 🆕 Price & Offer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{isRTL ? "السعر" : "Price"}</Label>
                  <Input
                    placeholder={isRTL ? "2,500 جنيه" : "$99"}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "العرض" : "Special Offer"}</Label>
                  <Input
                    placeholder={isRTL ? "خصم 20%" : "20% Off"}
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("toneOfVoice")}</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 🆕 Platform */}
              <div className="space-y-2">
                <Label>{isRTL ? "المنصة" : "Platform"}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 🆕 Keywords */}
              <div className="space-y-2">
                <Label>{isRTL ? "الكلمات المفتاحية" : "SEO Keywords"}</Label>
                <Input
                  placeholder={isRTL ? "ساعة ذكية، رياضية..." : "smart watch, fitness..."}
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* 🆕 Content Length */}
              <div className="space-y-2">
                <Label>{isRTL ? "طول المحتوى" : "Content Length"}</Label>
                <Select value={contentLength} onValueChange={setContentLength}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentLengths.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                  2
                </span>
                {t("outputTypes")}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {outputTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleOutput(type.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-${isRTL ? "right" : "left"} ${
                      selectedOutputs.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                      {selectedOutputs.includes(type.id) && (
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
                  {t("generateCopy")}
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t("generatedContent")}</h2>
              {Object.keys(generatedContent).length > 0 && (
                <ExportButtons content={generatedContent} filename="product-copy" />
              )}
            </div>

            {Object.keys(generatedContent).length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">{t("noContentYet")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("noContentDesc")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(generatedContent).map(([key, content]) => {
                  const outputType = outputTypes.find((t) => t.id === key);
                  const currentVariation = getCurrentVariation(key);
                  const variationCount = content.variations.length;
                  
                  return (
                    <div
                      key={key}
                      className="glass-card rounded-xl p-5 space-y-3 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{outputType?.icon}</span>
                          <h3 className="font-medium">{outputType?.label}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {variationCount > 1 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                              <button
                                onClick={() => switchVariation(key, 'prev')}
                                className="hover:text-foreground transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span>{content.selectedIndex + 1}/{variationCount}</span>
                              <button
                                onClick={() => switchVariation(key, 'next')}
                                className="hover:text-foreground transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(currentVariation)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {Array.isArray(currentVariation) 
                          ? currentVariation.map((item, i) => (
                              <div key={i} className="mb-1">• {item}</div>
                            ))
                          : currentVariation
                        }
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
