import { useState } from "react";
import {
  Palette,
  Sparkles,
  RotateCcw,
  Layout,
  MousePointer,
  Image,
  Type,
  AlertTriangle,
  CheckCircle,
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

export default function DesignAdvisor() {
  const [pageUrl, setPageUrl] = useState("");
  const [pageType, setPageType] = useState("product");
  const [pageDescription, setPageDescription] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { generate, isLoading } = useAI("design");
  const { saveToHistory } = useHistory();

  const pageTypes = [
    { value: "product", label: t("productPage") },
    { value: "landing", label: t("landingPage") },
    { value: "homepage", label: t("homePage") },
    { value: "category", label: t("categoryPage") },
  ];

  const handleAnalyze = async () => {
    if (!pageDescription && !pageUrl) {
      toast({
        title: t("missingInfo"),
        description: t("pleaseFilRequired"),
        variant: "destructive",
      });
      return;
    }

    const input = {
      pageUrl,
      pageType,
      description: pageDescription,
      businessGoal,
    };

    const result = await generate(input);

    if (result) {
      setAnalysis(result);
      await saveToHistory("design", input, result);
    }
  };

  const getAnalysisAsText = () => {
    if (!analysis) return "";
    let text = `${isRTL ? "تحليل التصميم" : "Design Analysis"}\n`;
    text += `${isRTL ? "التقييم" : "Score"}: ${analysis.score || 0}/100\n\n`;
    
    if (analysis.colorRecommendations) {
      text += `${t("colorRecommendations")}:\n`;
      analysis.colorRecommendations.forEach((rec: string) => {
        text += `- ${rec}\n`;
      });
    }
    
    if (analysis.layoutRecommendations) {
      text += `\n${t("layoutRecommendations")}:\n`;
      analysis.layoutRecommendations.forEach((rec: string) => {
        text += `- ${rec}\n`;
      });
    }
    
    return text;
  };

  const categoryIcons: Record<string, any> = {
    colors: Palette,
    layout: Layout,
    cta: MousePointer,
    images: Image,
    typography: Type,
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{t("designAdvisor")}</h1>
          </div>
          <p className="text-muted-foreground">
            {t("designAdvisorDesc")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">{t("pageToAnalyze")}</h2>

              <div className="space-y-2">
                <Label htmlFor="pageUrl">{t("pageUrl")}</Label>
                <Input
                  id="pageUrl"
                  placeholder={t("pageUrlPlaceholder")}
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("pageType")}</Label>
                <Select value={pageType} onValueChange={setPageType}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageDescription">
                  {isRTL ? "صف صفحتك *" : "Describe Your Page *"}
                </Label>
                <Textarea
                  id="pageDescription"
                  placeholder={isRTL 
                    ? "صف تخطيط صفحتك، العناصر، الألوان المستخدمة..."
                    : "Describe your current page layout, elements, colors used..."
                  }
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  className="input-field min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessGoal">{t("mainGoal")}</Label>
                <Input
                  id="businessGoal"
                  placeholder={isRTL ? "مثال: زيادة معدل الإضافة للسلة" : "e.g., increase add-to-cart rate"}
                  value={businessGoal}
                  onChange={(e) => setBusinessGoal(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  {t("analyzing")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t("analyzeDesign")}
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-6">
            {!analysis ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">{t("noContentYet")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("noContentDesc")}
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Export */}
                <div className="flex justify-end">
                  <ExportButtons content={getAnalysisAsText()} filename="design-analysis" />
                </div>

                {/* Score Card */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <svg className="w-24 h-24 -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="fill-none stroke-secondary"
                          strokeWidth="8"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="fill-none stroke-primary"
                          strokeWidth="8"
                          strokeDasharray={`${((analysis.score || 75) / 100) * 251} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{analysis.score || 75}</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg mb-1">{t("overallScore")}</h2>
                      <p className="text-sm text-muted-foreground">
                        {isRTL 
                          ? "صفحتك لديها أساسيات جيدة مع مجال للتحسين"
                          : "Your page has good fundamentals with room for improvement"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {analysis.colorRecommendations && (
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{t("colorRecommendations")}</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.colorRecommendations.map((rec: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/50 flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.layoutRecommendations && (
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Layout className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{t("layoutRecommendations")}</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.layoutRecommendations.map((rec: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/50 flex items-start gap-3">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.ctaRecommendations && (
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MousePointer className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{t("ctaRecommendations")}</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.ctaRecommendations.map((rec: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.mistakesToAvoid && (
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <h3 className="font-semibold">{t("commonMistakes")}</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.mistakesToAvoid.map((mistake: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <p className="text-sm">{mistake}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
