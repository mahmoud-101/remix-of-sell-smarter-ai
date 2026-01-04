import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Megaphone,
  Calendar,
  Palette,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Image,
  Wand2,
  TrendingUp,
  Users,
  Brain,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SalesChatbot from "@/components/chat/SalesChatbot";
import { UsageBanner } from "@/components/usage/UsageBanner";

export default function Dashboard() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    contentGenerated: 0,
    leadsCount: 0,
    timeSaved: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch history count
      const { count: historyCount } = await supabase
        .from("history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch leads count
      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        contentGenerated: historyCount || 0,
        leadsCount: leadsCount || 0,
        timeSaved: Math.round((historyCount || 0) * 0.5),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const tools = [
    {
      icon: Brain,
      title: isRTL ? "مركز النمو الذكي" : "AI Growth Console",
      description: isRTL ? "مستشار أعمالك - تحليل وتشخيص وتوصيات" : "Your business advisor - analyze, diagnose, recommend",
      path: "/dashboard/growth-console",
      color: "from-violet-500 to-purple-600",
      featured: true,
    },
    {
      icon: FileText,
      title: t("featureProductCopy"),
      description: isRTL ? "أنشئ وصف منتجات مقنع" : "Create compelling product descriptions",
      path: "/dashboard/product-copy",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Megaphone,
      title: t("featureAds"),
      description: isRTL ? "أنشئ إعلانات عالية التحويل" : "Generate high-converting ad copy",
      path: "/dashboard/ads-copy",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Image,
      title: isRTL ? "صور المنتجات" : "Product Images",
      description: isRTL ? "ولد صور منتجات احترافية" : "Generate professional product images",
      path: "/dashboard/image-generator",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Wand2,
      title: isRTL ? "مصمم الإعلانات" : "Ad Designer",
      description: isRTL ? "صمم إعلانات بالذكاء الاصطناعي" : "Design ads with AI",
      path: "/dashboard/ad-designer",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: isRTL ? "منصات الإعلانات" : "Ad Platforms",
      description: isRTL ? "ربط وتحليل حملاتك" : "Connect and analyze your campaigns",
      path: "/dashboard/ads-platforms",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Calendar,
      title: t("featureCampaign"),
      description: isRTL ? "خطط حملات تسويقية كاملة" : "Plan complete marketing campaigns",
      path: "/dashboard/campaign",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Palette,
      title: t("featureDesign"),
      description: isRTL ? "احصل على توصيات التصميم" : "Get UX and design recommendations",
      path: "/dashboard/design",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Target,
      title: t("featureCompetitor"),
      description: isRTL ? "حلل منافسيك" : "Analyze competitors and find opportunities",
      path: "/dashboard/competitor",
      color: "from-violet-500 to-purple-500",
    },
  ];

  const statsData = [
    { label: isRTL ? "محتوى مولد" : "Content Generated", value: stats.contentGenerated.toString(), icon: FileText },
    { label: isRTL ? "العملاء المحتملين" : "Leads", value: stats.leadsCount.toString(), icon: Users },
    { label: isRTL ? "وقت موفر" : "Time Saved", value: `${stats.timeSaved}h`, icon: Clock },
  ];

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Usage Banner */}
        <UsageBanner />
        
        {/* Welcome Section */}
        <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t("welcomeToDashboard")}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {isRTL ? `مرحباً${firstName ? ` ${firstName}` : ""}! 👋` : `Welcome${firstName ? ` ${firstName}` : ""}! 👋`}
              </h1>
              <p className="text-muted-foreground">
                {t("chooseToolBelow")}
              </p>
            </div>
            <Link to="/dashboard/product-copy">
              <Button variant="hero" className="group">
                {t("generateContent")}
                <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{t("aiTools")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, index) => (
              <Link
                key={index}
                to={tool.path}
                className={`feature-card group ${tool.featured ? 'lg:col-span-3 md:col-span-2 bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20' : ''}`}
              >
                <div className={`flex ${tool.featured ? 'flex-row items-center gap-6' : 'flex-col'}`}>
                  <div
                    className={`${tool.featured ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center ${tool.featured ? '' : 'mb-4'} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <tool.icon className={`${tool.featured ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`${tool.featured ? 'text-xl' : 'text-lg'} font-semibold mb-2 group-hover:text-primary transition-colors`}>
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tool.description}
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium">
                      {isRTL ? "ابدأ الآن" : "Get Started"}
                      <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180 mr-1 group-hover:-translate-x-1" : "ml-1 group-hover:translate-x-1"}`} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">{t("quickTips")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <h3 className="font-medium mb-1">{t("beSpecific")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("beSpecificDesc")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <h3 className="font-medium mb-1">{t("iterateRefine")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("iterateRefineDesc")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <h3 className="font-medium mb-1">{isRTL ? "استخدم القوالب" : "Use Templates"}</h3>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "استخدم القوالب الجاهزة للبدء بسرعة" : "Use ready templates to start quickly"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chatbot */}
      <SalesChatbot />
    </DashboardLayout>
  );
}
