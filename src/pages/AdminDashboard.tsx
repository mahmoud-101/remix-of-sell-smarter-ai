import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CreditCard, TrendingUp, Activity, FileText, Settings,
  Search, MoreHorizontal, ArrowUpRight, ArrowDownRight, Crown
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAILS = [
  "r13028918@gmail.com",
];

export default function AdminDashboard() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");

  // التحقق من الأدمن
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        toast({
          variant: "destructive",
          title: "Access Denied ⛔",
          description: isRTL ? "ليس لديك صلاحية لدخول هذه الصفحة" : "You are not authorized to view this page.",
        });
        navigate("/dashboard");
      } else {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, [navigate, isRTL, toast]);

  // جلب البيانات
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      if (!isAdmin) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: usageData } = useQuery({
    queryKey: ["admin-usage"],
    queryFn: async () => {
      if (!isAdmin) return [];
      const { data, error } = await supabase.from("usage").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: leadsData } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      if (!isAdmin) return [];
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Activity className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalUsers = profiles?.length || 0;
  const activeUsers = profiles?.filter(p => p.plan !== "free").length || 0;
  const totalGenerations = usageData?.reduce((acc, u) => acc + u.generations_count, 0) || 0;
  const totalLeads = leadsData?.length || 0;

  const planCounts = profiles?.reduce((acc, p) => {
    const plan = p.plan || "free";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const stats = [
    { label: isRTL ? "إجمالي المستخدمين" : "Total Users", value: totalUsers, icon: Users, change: "+12%", positive: true },
    { label: isRTL ? "المشتركين" : "Subscribers", value: activeUsers, icon: Crown, change: "+8%", positive: true },
    { label: isRTL ? "إجمالي التوليدات" : "Total Generations", value: totalGenerations, icon: FileText, change: "+23%", positive: true },
    { label: isRTL ? "العملاء المحتملين" : "Total Leads", value: totalLeads, icon: TrendingUp, change: "+15%", positive: true },
  ];

  const filteredProfiles = profiles?.filter((profile) => {
    const matchesSearch = profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || profile.id.includes(searchQuery);
    const matchesPlan = filterPlan === "all" || profile.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const getPlanBadge = (plan: string | null) => {
    const planStyles: Record<string, string> = {
      free: "bg-secondary text-secondary-foreground",
      start: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      pro: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    };
    return planStyles[plan || "free"] || planStyles.free;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{isRTL ? "لوحة تحكم المشرف" : "Admin Dashboard"}</h1>
          <p className="text-muted-foreground">{isRTL ? "إدارة المستخدمين والاشتراكات والإحصائيات" : "Manage users, subscriptions, and statistics"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? "text-green-600" : "text-red-600"}`}>
                  {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4">{isRTL ? "توزيع الخطط" : "Plan Distribution"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getPlanBadge(plan)}>{plan}</Badge>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{((count / totalUsers) * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h2 className="font-semibold">{isRTL ? "المستخدمين" : "Users"}</h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                <Input placeholder={isRTL ? "بحث..." : "Search..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={isRTL ? "pr-10" : "pl-10"} />
              </div>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="free">{isRTL ? "مجاني" : "Free"}</SelectItem>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{isRTL ? "الخطة" : "Plan"}</TableHead>
                  <TableHead>{isRTL ? "اللغة" : "Language"}</TableHead>
                  <TableHead>{isRTL ? "تاريخ الانضمام" : "Joined"}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profilesLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8"><Activity className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                ) : filteredProfiles?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{isRTL ? "لا يوجد مستخدمين" : "No users found"}</TableCell></TableRow>
                ) : (
                  filteredProfiles?.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
                          <span className="font-medium">{profile.full_name || (isRTL ? "بدون اسم" : "No name")}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={getPlanBadge(profile.plan)}>{profile.plan || "free"}</Badge></TableCell>
                      <TableCell>{profile.preferred_language === "ar" ? "العربية" : "English"}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Settings className="w-4 h-4 mr-2" />{isRTL ? "إعدادات" : "Settings"}</DropdownMenuItem>
                            <DropdownMenuItem><Crown className="w-4 h-4 mr-2" />{isRTL ? "تغيير الخطة" : "Change Plan"}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
