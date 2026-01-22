import { useState, useEffect } from "react";
import { User, Mail, Globe, Bell, Shield, Save, Loader2, Palette, MessageCircle, Moon, Sun, Store, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import BrandVoiceSettings from "@/components/settings/BrandVoiceSettings";
import RealWhatsAppIntegration from "@/components/whatsapp/RealWhatsAppIntegration";
import WhatsAppBusinessSetup from "@/components/whatsapp/WhatsAppBusinessSetup";
import StoreIntegrations from "@/components/settings/StoreIntegrations";
import { TrackingIntegrations } from "@/components/settings/TrackingIntegrations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"ar" | "en">(language);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("full_name, preferred_language")
      .eq("id", user.id)
      .single();
    
    if (data) {
      setFullName(data.full_name || "");
      setPreferredLanguage((data.preferred_language as "ar" | "en") || language);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          preferred_language: preferredLanguage,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update language context
      setLanguage(preferredLanguage as "ar" | "en");

      toast({
        title: isRTL ? "تم الحفظ!" : "Saved!",
        description: isRTL ? "تم تحديث الإعدادات بنجاح." : "Settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل حفظ الإعدادات." : "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {isRTL ? "الإعدادات" : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? "إدارة حسابك وتفضيلاتك" : "Manage your account and preferences"}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-[900px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "الملف" : "Profile"}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "التفضيلات" : "Prefs"}</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "المتاجر" : "Stores"}</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "التتبع" : "Tracking"}</span>
            </TabsTrigger>
            <TabsTrigger value="brand" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "العلامة" : "Brand"}</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "واتساب" : "WhatsApp"}</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp-api" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "API" : "API"}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? "الإشعارات" : "Alerts"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-border">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{fullName || (isRTL ? "المستخدم" : "User")}</h3>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{isRTL ? "الاسم الكامل" : "Full Name"}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isRTL ? "أدخل اسمك الكامل" : "Enter your full name"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{isRTL ? "اللغة المفضلة" : "Preferred Language"}</Label>
                  <Select value={preferredLanguage} onValueChange={(value) => setPreferredLanguage(value as "ar" | "en")}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "المظهر" : "Appearance"}</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex-1"
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      {isRTL ? "فاتح" : "Light"}
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex-1"
                    >
                      <Moon className="w-4 h-4 mr-2" />
                      {isRTL ? "داكن" : "Dark"}
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="flex-1"
                    >
                      {isRTL ? "تلقائي" : "System"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Store Integrations Tab */}
          <TabsContent value="stores" className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <StoreIntegrations />
            </div>
          </TabsContent>

          {/* Tracking & Pixels Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isRTL ? "ربط المنصات الإعلانية والتحليلات" : "Ad Platforms & Analytics Integration"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? "أضف أكواد التتبع (Pixels) لتحليل حملاتك الإعلانية وسلوك زوار موقعك"
                    : "Add tracking pixels to analyze your ad campaigns and visitor behavior"}
                </p>
              </div>
              <TrackingIntegrations />
            </div>
          </TabsContent>

          {/* Brand Voice Tab */}
          <TabsContent value="brand" className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <BrandVoiceSettings />
            </div>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <RealWhatsAppIntegration />
            </div>
          </TabsContent>

          {/* WhatsApp Business API Tab */}
          <TabsContent value="whatsapp-api" className="space-y-6">
            <WhatsAppBusinessSetup />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{isRTL ? "إشعارات البريد الإلكتروني" : "Email Notifications"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "استلم إشعارات عن نشاط حسابك" : "Receive notifications about your account activity"}
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{isRTL ? "رسائل التسويق" : "Marketing Emails"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "استلم نصائح ومنتجات جديدة" : "Receive tips, updates and new features"}
                    </p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={loading} className="min-w-[120px]">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
