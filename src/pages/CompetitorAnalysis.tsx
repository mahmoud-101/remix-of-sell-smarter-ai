import { useState } from "react";
import {
  Target,
  Sparkles,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAI } from "@/hooks/useAI";
import { useHistory } from "@/hooks/useHistory";
import { ExportButtons } from "@/components/export/ExportButtons";

export default function CompetitorAnalysis() {
  const [competitorName, setCompetitorName] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorDescription, setCompetitorDescription] = useState("");
  const [yourBusiness, setYourBusiness] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { generate, isLoading } = useAI("competitor");
  const { saveToHistory } = useHistory();

  const handleAnalyze = async () => {
    if (!competitorName && !competitorUrl && !competitorDescription) {
      toast({
        title: t("missingInfo"),
        description: t("pleaseFilRequired"),
        variant: "destructive",
      });
      return;
    }

    const input = {
      competitorName,
      website: competitorUrl,
      description: competitorDescription,
      yourBusiness,
    };

    const result = await generate(input);

    if (result) {
      setAnalysis({
        ...result,
        competitor: competitorName || isRTL ? "المنافس" : "Competitor",
      });
      await saveToHistory("competitor", input, result);
    }
  };

  const getAnalysisAsText = () => {
    if (!analysis) return "";
    let text = `${isRTL ? "تحليل المنافس" : "Competitor Analysis"}: ${analysis.competitor}\n\n`;
    
    if (analysis.strengths) {
      text += `${t("strengths")}:\n`;
      analysis.strengths.forEach((s: string) => {
        text += `- ${s}\n`;
      });
    }
    
    if (analysis.weaknesses) {
      text += `\n${t("weaknesses")}:\n`;
      analysis.weaknesses.forEach((w: string) => {
        text += `- ${w}\n`;
      });
    }
    
    if (analysis.opportunities) {
      text += `\n${t("opportunities")}:\n`;
      analysis.opportunities.forEach((o: string) => {
        text += `- ${o}\n`;
      });
    }
    
    return text;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{t("competitorAnalysis")}</h1>
          </div>
          <p className="text-muted-foreground">
            {t("competitorAnalysisDesc")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">{t("competitorInfo")}</h2>

              <div className="space-y-2">
                <Label htmlFor="competitorName">{t("competitorName")}</Label>
                <Input
                  id="competitorName"
                  placeholder={t("competitorNamePlaceholder")}
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitorUrl">{t("competitorWebsite")}</Label>
                <Input
                  id="competitorUrl"
                  placeholder={t("competitorWebsitePlaceholder")}
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitorDescription">
                  {t("competitorDescription")}
                </Label>
                <Textarea
                  id="competitorDescription"
                  placeholder={t("competitorDescPlaceholder")}
                  value={competitorDescription}
                  onChange={(e) => setCompetitorDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yourBusiness">
                  {isRTL ? "نشاطك التجاري (اختياري)" : "Your Business (optional)"}
                </Label>
                <Textarea
                  id="yourBusiness"
                  placeholder={isRTL 
                    ? "صف نشاطك التجاري للحصول على مقارنات أفضل..."
                    : "Describe your business for better comparisons..."
                  }
                  value={yourBusiness}
                  onChange={(e) => setYourBusiness(e.target.value)}
                  className="input-field min-h-[80px]"
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
                  {t("generating")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t("analyzeCompetitor")}
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-6">
            {!analysis ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
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
                  <ExportButtons content={getAnalysisAsText()} filename="competitor-analysis" />
                </div>

                {/* Overview */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-semibold text-lg mb-2">
                    {t("competitorReport")}: {analysis.competitor}
                  </h2>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">{t("strengths")}</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.strengths?.map((item: string, index: number) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                        >
                          <p className="text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold">{t("weaknesses")}</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.weaknesses?.map((item: string, index: number) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                        >
                          <p className="text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & Messaging */}
                <div className="grid md:grid-cols-2 gap-6">
                  {analysis.pricingStrategy && (
                    <div className="glass-card rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{t("pricingStrategy")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {analysis.pricingStrategy}
                      </p>
                    </div>
                  )}

                  {analysis.messagingStyle && (
                    <div className="glass-card rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{t("messagingStyle")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {analysis.messagingStyle}
                      </p>
                    </div>
                  )}
                </div>

                {/* Opportunities */}
                {analysis.opportunities && (
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold">{t("opportunities")}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {analysis.opportunities.map((opp: string, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border border-accent/20 bg-accent/5"
                        >
                          <p className="text-sm">{opp}</p>
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
