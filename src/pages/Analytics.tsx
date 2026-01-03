import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Megaphone,
  Calendar,
  Palette,
  Target,
  Clock,
  Activity,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface UsageStats {
  totalGenerations: number;
  productCopy: number;
  adsCopy: number;
  campaigns: number;
  designs: number;
  competitors: number;
  thisWeek: number;
  lastWeek: number;
}

interface DailyData {
  date: string;
  count: number;
}

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];

const toolIcons: Record<string, any> = {
  product: FileText,
  ads: Megaphone,
  campaign: Calendar,
  design: Palette,
  competitor: Target,
};

export default function Analytics() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats>({
    totalGenerations: 0,
    productCopy: 0,
    adsCopy: 0,
    campaigns: 0,
    designs: 0,
    competitors: 0,
    thisWeek: 0,
    lastWeek: 0,
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch all history for this user
      const { data: history } = await supabase
        .from("history")
        .select("tool_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (history) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const counts = {
          product: 0,
          ads: 0,
          campaign: 0,
          design: 0,
          competitor: 0,
        };

        let thisWeek = 0;
        let lastWeek = 0;

        const dailyCounts: Record<string, number> = {};

        history.forEach((item) => {
          const type = item.tool_type as keyof typeof counts;
          if (counts[type] !== undefined) {
            counts[type]++;
          }

          const itemDate = new Date(item.created_at);
          const dateKey = itemDate.toISOString().split("T")[0];
          dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;

          if (itemDate >= oneWeekAgo) {
            thisWeek++;
          } else if (itemDate >= twoWeeksAgo) {
            lastWeek++;
          }
        });

        setStats({
          totalGenerations: history.length,
          productCopy: counts.product,
          adsCopy: counts.ads,
          campaigns: counts.campaign,
          designs: counts.design,
          competitors: counts.competitor,
          thisWeek,
          lastWeek,
        });

        // Prepare daily data for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateKey = date.toISOString().split("T")[0];
          const dayName = date.toLocaleDateString(isRTL ? "ar" : "en", { weekday: "short" });
          last7Days.push({
            date: dayName,
            count: dailyCounts[dateKey] || 0,
          });
        }
        setDailyData(last7Days);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: isRTL ? "نصوص المنتجات" : "Product Copy", value: stats.productCopy, color: COLORS[0] },
    { name: isRTL ? "نصوص الإعلانات" : "Ads Copy", value: stats.adsCopy, color: COLORS[1] },
    { name: isRTL ? "الحملات" : "Campaigns", value: stats.campaigns, color: COLORS[2] },
    { name: isRTL ? "التصميم" : "Design", value: stats.designs, color: COLORS[3] },
    { name: isRTL ? "المنافسين" : "Competitors", value: stats.competitors, color: COLORS[4] },
  ].filter((item) => item.value > 0);

  const growthPercentage =
    stats.lastWeek > 0
      ? Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100)
      : stats.thisWeek > 0
      ? 100
      : 0;

  const toolStats = [
    { key: "product", label: isRTL ? "نصوص المنتجات" : "Product Copy", value: stats.productCopy, color: "from-blue-500 to-indigo-500" },
    { key: "ads", label: isRTL ? "نصوص الإعلانات" : "Ads Copy", value: stats.adsCopy, color: "from-pink-500 to-rose-500" },
    { key: "campaign", label: isRTL ? "الحملات" : "Campaigns", value: stats.campaigns, color: "from-amber-500 to-orange-500" },
    { key: "design", label: isRTL ? "التصميم" : "Design", value: stats.designs, color: "from-emerald-500 to-teal-500" },
    { key: "competitor", label: isRTL ? "تحليل المنافسين" : "Competitor Analysis", value: stats.competitors, color: "from-violet-500 to-purple-500" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {isRTL ? "لوحة الإحصائيات" : "Analytics Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? "تتبع استخدامك وأداءك" : "Track your usage and performance"}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGenerations}</p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "إجمالي المحتوى" : "Total Generations"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "هذا الأسبوع" : "This Week"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {growthPercentage > 0 ? "+" : ""}
                  {growthPercentage}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "النمو الأسبوعي" : "Weekly Growth"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.totalGenerations * 0.5)}h</p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "الوقت الموفر" : "Time Saved"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Activity Chart */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {isRTL ? "النشاط اليومي" : "Daily Activity"}
              </h2>
            </div>
            <div className="h-[250px]">
              {dailyData.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {isRTL ? "لا توجد بيانات بعد" : "No data yet"}
                </div>
              )}
            </div>
          </div>

          {/* Tool Distribution */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {isRTL ? "توزيع الأدوات" : "Tool Distribution"}
              </h2>
            </div>
            <div className="h-[250px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {isRTL ? "لا توجد بيانات بعد" : "No data yet"}
                </div>
              )}
            </div>
            {pieData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tool Stats Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isRTL ? "استخدام الأدوات" : "Tool Usage"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {toolStats.map((tool) => {
              const Icon = toolIcons[tool.key];
              return (
                <div key={tool.key} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold">{tool.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
