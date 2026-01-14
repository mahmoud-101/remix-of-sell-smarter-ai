import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  Video,
  Search,
  Target,
  History,
  Settings,
  ChevronLeft,
  Sparkles,
  LogOut,
  Globe,
  BarChart3,
  Users,
  Brush,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, isRTL, language, setLanguage } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: t("navigation.dashboard"), path: "/dashboard" },
    { icon: Brush, label: isRTL ? "مصنع الكريتيفات" : "Creative Factory", path: "/dashboard/creative-factory" },
    { icon: FileText, label: t("navigation.productCopy"), path: "/dashboard/product-copy" },
    { icon: Megaphone, label: t("navigation.adsCopy"), path: "/dashboard/ads-copy" },
    { icon: Video, label: isRTL ? "سكريبتات الفيديو" : "Video Scripts", path: "/dashboard/video-scripts" },
    { icon: Search, label: isRTL ? "خبير السيو" : "SEO Expert", path: "/dashboard/seo-analyzer" },
    { icon: Target, label: t("navigation.competitor"), path: "/dashboard/competitor" },
    { icon: Users, label: isRTL ? "العملاء" : "Leads", path: "/dashboard/leads" },
    { icon: History, label: t("navigation.history"), path: "/dashboard/history" },
    { icon: BarChart3, label: isRTL ? "الإحصائيات" : "Analytics", path: "/dashboard/analytics" },
  ];

  const bottomNavItems = [
    { icon: CreditCard, label: isRTL ? "الاشتراك" : "Billing", path: "/dashboard/billing" },
    { icon: Settings, label: t("navigation.settings"), path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <div className="min-h-screen bg-background flex" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-full bg-card border-border z-50 transition-all duration-300 flex flex-col",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg gradient-text">{t("appName")}</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "transition-transform duration-300",
              collapsed && "rotate-180",
              isRTL && !collapsed && "rotate-180",
              isRTL && collapsed && "rotate-0"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="py-4 px-3 border-t border-border space-y-1">
          {/* Settings & Analytics */}
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* Admin Link */}
          <Link
            to="/dashboard/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              location.pathname === "/dashboard/admin"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">
                {isRTL ? "لوحة التحكم" : "Admin"}
              </span>
            )}
          </Link>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 w-full"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">
                {language === "ar" ? "English" : "العربية"}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{t("logout")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          isRTL
            ? collapsed ? "mr-[72px]" : "mr-[260px]"
            : collapsed ? "ml-[72px]" : "ml-[260px]"
        )}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
