import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Loader2,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  MousePointer,
  Eye,
  Target,
  Sparkles,
  Settings,
  BarChart3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CampaignData {
  name: string;
  platform: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

interface PlatformConfig {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
}

export default function AdsPlatforms() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const platforms: PlatformConfig[] = [
    { id: "facebook", name: "Facebook Ads", nameAr: "إعلانات فيسبوك", icon: <Facebook className="w-6 h-6" />, color: "bg-blue-600", connected: false },
    { id: "instagram", name: "Instagram Ads", nameAr: "إعلانات إنستغرام", icon: <Instagram className="w-6 h-6" />, color: "bg-gradient-to-br from-purple-600 to-pink-500", connected: false },
    { id: "google", name: "Google Ads", nameAr: "إعلانات جوجل", icon: <Target className="w-6 h-6" />, color: "bg-red-500", connected: false },
    { id: "tiktok", name: "TikTok Ads", nameAr: "إعلانات تيك توك", icon: <Sparkles className="w-6 h-6" />, color: "bg-black", connected: false },
    { id: "snapchat", name: "Snapchat Ads", nameAr: "إعلانات سناب شات", icon: <Eye className="w-6 h-6" />, color: "bg-yellow-400", connected: false },
    { id: "twitter", name: "X (Twitter) Ads", nameAr: "إعلانات تويتر", icon: <Twitter className="w-6 h-6" />, color: "bg-black", connected: false },
    { id: "youtube", name: "YouTube Ads", nameAr: "إعلانات يوتيوب", icon: <Youtube className="w-6 h-6" />, color: "bg-red-600", connected: false },
  ];

  // Mock campaign data for demonstration
  const mockCampaigns: CampaignData[] = [
    { name: "Summer Sale 2024", platform: "facebook", budget: 5000, spent: 3200, impressions: 150000, clicks: 4500, conversions: 120, ctr: 3.0, cpc: 0.71, roas: 4.2 },
    { name: "Product Launch", platform: "google", budget: 3000, spent: 2100, impressions: 80000, clicks: 2400, conversions: 85, ctr: 3.0, cpc: 0.88, roas: 3.8 },
    { name: "Brand Awareness", platform: "instagram", budget: 2000, spent: 1800, impressions: 200000, clicks: 6000, conversions: 45, ctr: 3.0, cpc: 0.30, roas: 2.5 },
    { name: "Holiday Promo", platform: "tiktok", budget: 1500, spent: 1200, impressions: 300000, clicks: 9000, conversions: 65, ctr: 3.0, cpc: 0.13, roas: 3.2 },
  ];

  const [campaigns] = useState<CampaignData[]>(mockCampaigns);

  const totalMetrics = {
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    avgCTR: campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length,
    avgROAS: campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length,
  };

  const handleAnalyze = async (campaign?: CampaignData) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const dataToAnalyze = campaign || {
        campaigns,
        totalMetrics,
        period: "Last 30 days",
      };

      const { data, error } = await supabase.functions.invoke("analyze-ads", {
        body: {
          campaignData: dataToAnalyze,
          platform: campaign?.platform || "all",
          language: isRTL ? "ar" : "en",
        },
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      
      toast({
        title: isRTL ? "تم التحليل بنجاح" : "Analysis Complete",
        description: isRTL ? "تم تحليل بيانات الحملة" : "Campaign data analyzed",
      });
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConnectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    toast({
      title: isRTL ? "ربط المنصة" : "Connect Platform",
      description: isRTL 
        ? "سيتم توجيهك لربط حسابك الإعلاني" 
        : "You will be redirected to connect your ad account",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isRTL ? "منصات الإعلانات" : "Ad Platforms"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? "ربط وإدارة جميع حملاتك الإعلانية من مكان واحد" 
                : "Connect and manage all your ad campaigns in one place"}
            </p>
          </div>
          <Button onClick={() => handleAnalyze()} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isRTL ? "تحليل شامل بالذكاء الاصطناعي" : "AI Full Analysis"}
          </Button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">{isRTL ? "الميزانية" : "Budget"}</span>
              </div>
              <p className="text-xl font-bold">${totalMetrics.totalBudget.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">{isRTL ? "المصروف" : "Spent"}</span>
              </div>
              <p className="text-xl font-bold">${totalMetrics.totalSpent.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-xs">{isRTL ? "المشاهدات" : "Impressions"}</span>
              </div>
              <p className="text-xl font-bold">{(totalMetrics.totalImpressions / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointer className="w-4 h-4" />
                <span className="text-xs">{isRTL ? "النقرات" : "Clicks"}</span>
              </div>
              <p className="text-xl font-bold">{totalMetrics.totalClicks.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">{isRTL ? "التحويلات" : "Conversions"}</span>
              </div>
              <p className="text-xl font-bold">{totalMetrics.totalConversions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">{isRTL ? "معدل CTR" : "Avg CTR"}</span>
              </div>
              <p className="text-xl font-bold">{totalMetrics.avgCTR.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">{isRTL ? "معدل ROAS" : "Avg ROAS"}</span>
              </div>
              <p className="text-xl font-bold text-green-600">{totalMetrics.avgROAS.toFixed(1)}x</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">
              {isRTL ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="platforms">
              {isRTL ? "المنصات" : "Platforms"}
            </TabsTrigger>
            <TabsTrigger value="analysis">
              {isRTL ? "التحليل" : "Analysis"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {campaigns.map((campaign, index) => {
                const platform = platforms.find(p => p.id === campaign.platform);
                const spentPercentage = (campaign.spent / campaign.budget) * 100;
                
                return (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${platform?.color} flex items-center justify-center text-white`}>
                            {platform?.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{campaign.name}</CardTitle>
                            <CardDescription>
                              {isRTL ? platform?.nameAr : platform?.name}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={campaign.roas >= 3 ? "default" : "secondary"}>
                          ROAS {campaign.roas}x
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            {isRTL ? "الميزانية المستخدمة" : "Budget Used"}
                          </span>
                          <span>${campaign.spent} / ${campaign.budget}</span>
                        </div>
                        <Progress value={spentPercentage} />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{(campaign.impressions / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "مشاهدة" : "Impressions"}
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.clicks.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "نقرة" : "Clicks"}
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.conversions}</p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "تحويل" : "Conversions"}
                          </p>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleAnalyze(campaign)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isRTL ? "تحليل بالذكاء الاصطناعي" : "AI Analysis"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <Card key={platform.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-white`}>
                          {platform.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {isRTL ? platform.nameAr : platform.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            {platform.connected ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-green-500">
                                  {isRTL ? "متصل" : "Connected"}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {isRTL ? "غير متصل" : "Not Connected"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isRTL 
                        ? `ربط حسابك في ${platform.nameAr} لاستيراد بيانات الحملات وتحليلها`
                        : `Connect your ${platform.name} account to import and analyze campaign data`}
                    </p>
                    <Button 
                      variant={platform.connected ? "outline" : "default"}
                      className="w-full"
                      onClick={() => handleConnectPlatform(platform.id)}
                    >
                      {platform.connected ? (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          {isRTL ? "إعدادات" : "Settings"}
                        </>
                      ) : (
                        isRTL ? "ربط الحساب" : "Connect Account"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Manual Data Entry */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "إدخال بيانات يدوي" : "Manual Data Entry"}</CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "أدخل بيانات حملتك الإعلانية للحصول على تحليل بالذكاء الاصطناعي"
                    : "Enter your campaign data to get AI analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "اسم الحملة" : "Campaign Name"}</Label>
                    <Input placeholder={isRTL ? "حملة الصيف" : "Summer Campaign"} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "الميزانية" : "Budget"}</Label>
                    <Input type="number" placeholder="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "المصروف" : "Spent"}</Label>
                    <Input type="number" placeholder="500" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "المشاهدات" : "Impressions"}</Label>
                    <Input type="number" placeholder="10000" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "النقرات" : "Clicks"}</Label>
                    <Input type="number" placeholder="300" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "التحويلات" : "Conversions"}</Label>
                    <Input type="number" placeholder="15" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "الإيرادات" : "Revenue"}</Label>
                    <Input type="number" placeholder="2000" />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isRTL ? "تحليل" : "Analyze"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {isRTL ? "تحليل الذكاء الاصطناعي" : "AI Analysis"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "تحليل شامل لأداء حملاتك الإعلانية مع توصيات تحسين"
                    : "Comprehensive analysis of your ad campaigns with improvement recommendations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                      {analysis}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {isRTL 
                        ? "اضغط على 'تحليل شامل بالذكاء الاصطناعي' للحصول على تقرير مفصل"
                        : "Click 'AI Full Analysis' to get a detailed report"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
