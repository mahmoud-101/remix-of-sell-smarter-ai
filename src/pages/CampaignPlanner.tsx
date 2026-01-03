import { useState } from "react";
import {
  Calendar,
  Sparkles,
  RotateCcw,
  Target,
  DollarSign,
  Clock,
  ChevronRight,
  Copy,
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

export default function CampaignPlanner() {
  const [campaignName, setCampaignName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [budget, setBudget] = useState("2000");
  const [duration, setDuration] = useState("4");
  const [campaignPlan, setCampaignPlan] = useState<any>(null);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { generate, isLoading } = useAI("campaign");
  const { saveToHistory } = useHistory();

  const budgetRanges = [
    { value: "500", label: "$500 - $1,000" },
    { value: "2000", label: "$2,000 - $5,000" },
    { value: "5000", label: "$5,000 - $10,000" },
    { value: "10000", label: "$10,000+" },
  ];

  const durations = [
    { value: "1", label: t("oneWeek") },
    { value: "2", label: t("twoWeeks") },
    { value: "4", label: t("oneMonth") },
    { value: "12", label: t("threeMonths") },
  ];

  const handleGenerate = async () => {
    if (!campaignName || !businessType) {
      toast({
        title: t("missingInfo"),
        description: t("pleaseFilRequired"),
        variant: "destructive",
      });
      return;
    }

    const input = {
      campaignName,
      businessType,
      goal: campaignGoal,
      budget: budgetRanges.find(b => b.value === budget)?.label,
      duration: durations.find(d => d.value === duration)?.label,
    };

    const result = await generate(input);

    if (result) {
      setCampaignPlan({
        ...result,
        overview: {
          goal: campaignGoal || campaignName,
          duration: durations.find(d => d.value === duration)?.label,
          budget: budgetRanges.find(b => b.value === budget)?.label,
        },
      });
      await saveToHistory("campaign", input, result);
    }
  };

  const getPlanAsText = () => {
    if (!campaignPlan) return "";
    let text = `${isRTL ? "خطة الحملة" : "Campaign Plan"}: ${campaignName}\n\n`;
    
    if (campaignPlan.funnel) {
      text += `${isRTL ? "استراتيجية القمع" : "Funnel Strategy"}:\n`;
      Object.entries(campaignPlan.funnel).forEach(([stage, data]: [string, any]) => {
        text += `- ${stage}: ${data.percentage}% - ${data.tactics?.join(", ")}\n`;
      });
    }
    
    if (campaignPlan.contentIdeas) {
      text += `\n${isRTL ? "أفكار المحتوى" : "Content Ideas"}:\n`;
      campaignPlan.contentIdeas.forEach((idea: string) => {
        text += `- ${idea}\n`;
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{t("campaignPlanner")}</h1>
          </div>
          <p className="text-muted-foreground">
            {t("campaignPlannerDesc")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">{t("campaignInfo")}</h2>

              <div className="space-y-2">
                <Label htmlFor="campaignName">{t("campaignName")} *</Label>
                <Input
                  id="campaignName"
                  placeholder={t("campaignNamePlaceholder")}
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">{t("businessType")} *</Label>
                <Textarea
                  id="businessType"
                  placeholder={t("businessTypePlaceholder")}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignGoal">{t("mainGoal")}</Label>
                <Input
                  id="campaignGoal"
                  placeholder={isRTL ? "مثال: زيادة المبيعات 30%" : "e.g., increase sales by 30%"}
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("budget")}</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("duration")}</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  {t("generatePlan")}
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-6">
            {!campaignPlan ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
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
                  <ExportButtons content={getPlanAsText()} filename="campaign-plan" />
                </div>

                {/* Overview */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">{t("campaignPlan")}</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <Target className="w-5 h-5 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">{t("mainGoal")}</p>
                      <p className="font-medium text-sm">{campaignPlan.overview.goal}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <Clock className="w-5 h-5 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">{t("duration")}</p>
                      <p className="font-medium text-sm">{campaignPlan.overview.duration}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <DollarSign className="w-5 h-5 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">{t("budget")}</p>
                      <p className="font-medium text-sm">{campaignPlan.overview.budget}</p>
                    </div>
                  </div>
                </div>

                {/* Funnel Strategy */}
                {campaignPlan.funnel && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="font-semibold mb-4">{t("funnelStrategy")}</h2>
                    <div className="space-y-4">
                      {Object.entries(campaignPlan.funnel).map(([stage, data]: [string, any], index: number) => (
                        <div key={stage} className="p-4 rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium capitalize">{stage}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {data.percentage}%
                                </p>
                              </div>
                            </div>
                          </div>
                          {data.tactics && (
                            <ul className="space-y-1 text-sm">
                              {data.tactics.map((tactic: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <ChevronRight className="w-3 h-3 text-primary" />
                                  {tactic}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Ideas */}
                {campaignPlan.contentIdeas && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="font-semibold mb-4">{t("contentIdeas")}</h2>
                    <div className="space-y-2">
                      {campaignPlan.contentIdeas.map((idea: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <p className="text-sm">{idea}</p>
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
