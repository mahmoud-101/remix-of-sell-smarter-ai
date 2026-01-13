import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Megaphone,
  Palette,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Video,
  Search,
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
      const { count: historyCount } = await supabase
        .from("history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

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

  // ------------------------------------------------------------------
  // 1. الأدوات الأساسية (Core Tools)
  // ------------------------------------------------------------------
  const mainTools = [
    {
      icon: Palette,
      title: isRTL ? "مصنع الكريتيفات" : "Creative Factory",
      description: isRTL 
        ? "تصميم صور منتجات وإعلانات سوشيال ميديا بضغطة زر" 
        : "Generate product photos & social media ads instantly",
      path: "/dashboard/creative-factory",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      badge: isRTL ? "الأكثر استخداماً" : "Popular",
    },
    {
      icon: Megaphone,
      title: isRTL ? "كاتب الإعلانات" : "Ad Copywriter",
      description: isRTL 
        ? "نصوص إعلانية مقنعة لفيسبوك، إنستجرام، وتيك توك" 
        : "Persuasive ad copies for Facebook, Instagram & TikTok",
      path: "/dashboard/ads-copy",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
    {
      icon: FileText,
      title: isRTL ? "وصف المنتجات" : "Product Descriptions",
      description: isRTL 
        ? "اكتب وصف بيعي احترافي يزود مبيعات متجرك" 
        : "Write professional product descriptions that sell",
      path: "/dashboard/product-copy",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
  ];

  // ------------------------------------------------------------------
  // 2. أدوات الفيديو والنمو (New Tools)
  // ------------------------------------------------------------------
  const growthTools = [
    {
      icon: Video,
      title: isRTL ? "صانع سكريبتات الفيديو" : "Video Script Maker",
      description: isRTL 
        ? "اكتب سكريبتات ريلز وتيك توك فيرال لمنتجاتك" 
        : "Create viral scripts for TikTok & Reels instantly",
      path: "/dashboard/video-scripts",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      badge: isRTL ? "جديد 🔥" : "New",
    },
    {
      icon: Search,
      title: isRTL ? "محسن محركات البحث" : "E-commerce SEO",
      description: isRTL 
        ? "حسن ظهور منتجاتك في جوجل وزود الزيارات المجانية" 
        : "Optimize your products for Google & get free traffic",
      path: "/dashboard/seo-analyzer",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      icon: Target,
      title: isRTL ? "تحليل المنافسين" : "Competitor Analysis",
      description: isRTL 
        ? "تجسس على إعلانات منافسيك واعرف سر نجاحهم" 
        : "Spy on competitors' ads and learn their secrets",
      path: "/dashboard/competitor",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    },
  ];

  const statsData = [
    { label: isRTL ? "محتوى مولد" : "Content Generated", value: stats.contentGenerated.toString(), icon: FileText },
    { label: isRTL ? "العملاء المحتملين" : "Leads", value: stats.leadsCount.toString(), icon: Users },
    { label: isRTL ? "ساعات موفرة" : "Time Saved", value: `${stats.timeSaved}h`, icon: Clock },
  ];

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <UsageBanner />
        
        {/* Welcome Section */}
        <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden border-primary/20">
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
                {isRTL ? "جاهز لمضاعفة مبيعاتك اليوم؟ اختر أداة وابدأ." : "Ready to scale your sales? Pick a tool to start."}
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
            <div key={index} className="glass-card rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
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

        {/* Main Tools Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isRTL ? "الأدوات الأساسية" : "Core Tools"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainTools.map((tool, index) => (
              <Link key={index} to={tool.path} className="feature-card group relative overflow-hidden">
                {tool.badge && (
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full shadow-sm z-10">
                    {tool.badge}
                  </span>
                )}
                <div className="flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className={`w-7 h-7 ${tool.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-primary font-medium mt-auto pt-2">
                    {isRTL ? "جرب الآن" : "Try Now"}
                    <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180 mr-1 group-hover:-translate-x-1" : "ml-1 group-hover:translate-x-1"}`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Growth Tools Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            {isRTL ? "أدوات الفيديو والنمو" : "Video & Growth Tools"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {growthTools.map((tool, index) => (
              <Link key={index} to={tool.path} className="feature-card group">
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="glass-card rounded-2xl p-6 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold">{t("quickTips")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <h3 className="font-bold mb-1 text-sm">{t("beSpecific")}</h3>
              <p className="text-xs text-muted-foreground">{t("beSpecificDesc")}</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <h3 className="font-bold mb-1 text-sm">{t("iterateRefine")}</h3>
              <p className="text-xs text-muted-foreground">{t("iterateRefineDesc")}</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <h3 className="font-bold mb-1 text-sm">{isRTL ? "استخدم القوالب" : "Use Templates"}</h3>
              <p className="text-xs text-muted-foreground">{isRTL ? "ابدأ بالقوالب الجاهزة لنتائج أسرع." : "Start with templates for faster results."}</p>
            </div>
          </div>
        </div>
      </div>
      <SalesChatbot />
    </DashboardLayout>
  );
}
