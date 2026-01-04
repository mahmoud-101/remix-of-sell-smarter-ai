import { useState } from "react";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Target,
  Zap,
  BarChart3,
  Lightbulb,
  ListTodo,
  DollarSign,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosisResult {
  diagnosis?: {
    mainProblem: string;
    severity: string;
    affectedMetric: string;
    currentValue: string;
    benchmarkValue: string;
  };
  reason?: {
    whyHappening: string;
    rootCause: string;
    impact: string;
  };
  recommendations?: Array<{
    priority: number;
    action: string;
    expectedImpact: string;
    timeframe: string;
  }>;
  nextActions?: Array<{
    task: string;
    tool: string;
    urgency: string;
  }>;
  forecast?: {
    withChanges: string;
    withoutChanges: string;
  };
}

export default function GrowthConsole() {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  
  // Business Context
  const [productType, setProductType] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [country, setCountry] = useState("SA");
  const [funnelStage, setFunnelStage] = useState<string>("conversion");
  const [platform, setPlatform] = useState("facebook");
  const [businessGoal, setBusinessGoal] = useState<string>("sales");
  
  // Campaign Metrics
  const [ctr, setCtr] = useState("");
  const [cpc, setCpc] = useState("");
  const [cpa, setCpa] = useState("");
  const [roas, setRoas] = useState("");
  const [conversions, setConversions] = useState("");
  const [spend, setSpend] = useState("");

  const countries = [
    { value: "SA", label: isRTL ? "السعودية" : "Saudi Arabia" },
    { value: "AE", label: isRTL ? "الإمارات" : "UAE" },
    { value: "EG", label: isRTL ? "مصر" : "Egypt" },
    { value: "KW", label: isRTL ? "الكويت" : "Kuwait" },
    { value: "QA", label: isRTL ? "قطر" : "Qatar" },
    { value: "JO", label: isRTL ? "الأردن" : "Jordan" },
    { value: "OTHER", label: isRTL ? "أخرى" : "Other" },
  ];

  const platforms = [
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "google", label: "Google Ads" },
    { value: "tiktok", label: "TikTok" },
    { value: "snapchat", label: "Snapchat" },
  ];

  const funnelStages = [
    { value: "awareness", label: isRTL ? "الوعي" : "Awareness" },
    { value: "consideration", label: isRTL ? "الاهتمام" : "Consideration" },
    { value: "conversion", label: isRTL ? "التحويل" : "Conversion" },
    { value: "retention", label: isRTL ? "الاحتفاظ" : "Retention" },
  ];

  const goals = [
    { value: "sales", label: isRTL ? "زيادة المبيعات" : "Increase Sales" },
    { value: "profit", label: isRTL ? "تحسين الربحية" : "Improve Profit" },
    { value: "scale", label: isRTL ? "التوسع" : "Scale" },
    { value: "testing", label: isRTL ? "اختبار" : "Testing" },
  ];

  const handleAnalyze = async () => {
    if (!productType) {
      toast({
        title: isRTL ? "معلومات ناقصة" : "Missing Information",
        description: isRTL ? "يرجى إدخال نوع المنتج" : "Please enter product type",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('business-advisor', {
        body: {
          analysisType: 'campaign-diagnosis',
          context: {
            productType,
            productPrice: productPrice ? parseFloat(productPrice) : undefined,
            targetAudience,
            country,
            funnelStage,
            platform,
            businessGoal,
            campaignData: {
              ctr: ctr ? parseFloat(ctr) : undefined,
              cpc: cpc ? parseFloat(cpc) : undefined,
              cpa: cpa ? parseFloat(cpa) : undefined,
              roas: roas ? parseFloat(roas) : undefined,
              conversions: conversions ? parseInt(conversions) : undefined,
              spend: spend ? parseFloat(spend) : undefined,
            }
          },
          language,
        }
      });

      if (error) throw error;
      
      if (data?.result) {
        setResult(data.result);
        toast({
          title: isRTL ? "تم التحليل بنجاح" : "Analysis Complete",
          description: isRTL ? "تم تشخيص حملتك" : "Your campaign has been diagnosed",
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "حدث خطأ أثناء التحليل" : "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      default: return 'bg-green-500/10 text-green-500 border-green-500/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {isRTL ? "مركز النمو الذكي" : "AI Growth Console"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isRTL ? "مستشار أعمالك الخبير - تحليل، تشخيص، توصيات" : "Your Expert Business Advisor - Analyze, Diagnose, Recommend"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="context" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="context">
                  {isRTL ? "سياق العمل" : "Business Context"}
                </TabsTrigger>
                <TabsTrigger value="metrics">
                  {isRTL ? "مقاييس الحملة" : "Campaign Metrics"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="context" className="space-y-4 mt-4">
                <Card className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "نوع المنتج *" : "Product Type *"}</Label>
                    <Input
                      placeholder={isRTL ? "مثال: ساعة ذكية رياضية" : "e.g. Sports smartwatch"}
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{isRTL ? "السعر ($)" : "Price ($)"}</Label>
                      <Input
                        type="number"
                        placeholder="99"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? "الدولة" : "Country"}</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? "الجمهور المستهدف" : "Target Audience"}</Label>
                    <Textarea
                      placeholder={isRTL ? "مثال: رجال 25-40 مهتمين بالرياضة" : "e.g. Men 25-40 interested in fitness"}
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{isRTL ? "المنصة" : "Platform"}</Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
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
                    <div className="space-y-2">
                      <Label>{isRTL ? "مرحلة القمع" : "Funnel Stage"}</Label>
                      <Select value={funnelStage} onValueChange={setFunnelStage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {funnelStages.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? "هدف العمل" : "Business Goal"}</Label>
                    <Select value={businessGoal} onValueChange={setBusinessGoal}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4 mt-4">
                <Card className="p-5 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "أدخل مقاييس حملتك للحصول على تشخيص دقيق" : "Enter your campaign metrics for accurate diagnosis"}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>CTR (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1.5"
                        value={ctr}
                        onChange={(e) => setCtr(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPC ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.50"
                        value={cpc}
                        onChange={(e) => setCpc(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>CPA ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="25"
                        value={cpa}
                        onChange={(e) => setCpa(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ROAS (x)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="3.0"
                        value={roas}
                        onChange={(e) => setRoas(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{isRTL ? "التحويلات" : "Conversions"}</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={conversions}
                        onChange={(e) => setConversions(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? "الإنفاق ($)" : "Spend ($)"}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="500"
                        value={spend}
                        onChange={(e) => setSpend(e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  {isRTL ? "جاري التحليل..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  {isRTL ? "شخّص حملتي" : "Diagnose My Campaign"}
                </>
              )}
            </Button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {!result ? (
              <Card className="p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isRTL ? "جاهز للتحليل" : "Ready to Analyze"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isRTL 
                    ? "أدخل بيانات عملك وحملتك واحصل على تشخيص دقيق مع توصيات عملية لزيادة مبيعاتك"
                    : "Enter your business and campaign data to get an accurate diagnosis with actionable recommendations to increase your sales"
                  }
                </p>
              </Card>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Diagnosis Card */}
                {result.diagnosis && (
                  <Card className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl border ${getSeverityColor(result.diagnosis.severity)}`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {isRTL ? "التشخيص" : "Diagnosis"}
                          </h3>
                          <Badge variant="outline" className={getSeverityColor(result.diagnosis.severity)}>
                            {result.diagnosis.severity === 'critical' ? (isRTL ? "حرج" : "Critical") :
                             result.diagnosis.severity === 'high' ? (isRTL ? "مرتفع" : "High") :
                             result.diagnosis.severity === 'medium' ? (isRTL ? "متوسط" : "Medium") :
                             (isRTL ? "منخفض" : "Low")}
                          </Badge>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          {result.diagnosis.mainProblem}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {isRTL ? "المقياس المتأثر" : "Affected Metric"}
                        </p>
                        <p className="font-medium">{result.diagnosis.affectedMetric}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {isRTL ? "القيمة الحالية" : "Current Value"}
                        </p>
                        <p className="font-medium text-red-500">{result.diagnosis.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {isRTL ? "القيمة المطلوبة" : "Benchmark"}
                        </p>
                        <p className="font-medium text-green-500">{result.diagnosis.benchmarkValue}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Reason Card */}
                {result.reason && (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold">{isRTL ? "السبب" : "Reason"}</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <p className="text-sm font-medium text-amber-600 mb-1">
                          {isRTL ? "لماذا يحدث هذا؟" : "Why is this happening?"}
                        </p>
                        <p>{result.reason.whyHappening}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {isRTL ? "السبب الجذري" : "Root Cause"}
                          </p>
                          <p className="text-sm font-medium">{result.reason.rootCause}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {isRTL ? "التأثير على الإيرادات" : "Revenue Impact"}
                          </p>
                          <p className="text-sm font-medium">{result.reason.impact}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Recommendations Card */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">{isRTL ? "التوصيات" : "Recommendations"}</h3>
                    </div>
                    <div className="space-y-3">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {rec.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1">{rec.action}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">
                                {rec.expectedImpact}
                              </span>
                              <span className="px-2 py-1 bg-muted rounded">
                                {rec.timeframe}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Next Actions Card */}
                {result.nextActions && result.nextActions.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ListTodo className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold">{isRTL ? "الخطوات التالية" : "Next Actions"}</h3>
                    </div>
                    <div className="space-y-2">
                      {result.nextActions.map((action, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{action.task}</p>
                            <p className="text-xs text-muted-foreground">{action.tool}</p>
                          </div>
                          {action.urgency === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">
                              {isRTL ? "عاجل" : "Urgent"}
                            </Badge>
                          )}
                          <ArrowRight className={`w-4 h-4 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Forecast Card */}
                {result.forecast && (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold">{isRTL ? "التوقعات" : "Forecast"}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                        <p className="text-xs text-green-600 mb-1">
                          {isRTL ? "مع التغييرات" : "With Changes"}
                        </p>
                        <p className="text-sm font-medium">{result.forecast.withChanges}</p>
                      </div>
                      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-600 mb-1">
                          {isRTL ? "بدون تغييرات" : "Without Changes"}
                        </p>
                        <p className="text-sm font-medium">{result.forecast.withoutChanges}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
