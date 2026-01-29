import { useEffect, useMemo, useState } from "react";
import { Globe, Save } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Settings() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [preferredLanguage, setPreferredLanguage] = useState<"ar" | "en">(language);

  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [billingRows, setBillingRows] = useState<any[]>([]);
  const [monthUsage, setMonthUsage] = useState<number>(0);

  const monthKey = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("full_name, preferred_language, avatar_url, plan")
      .eq("id", user.id)
      .single();
    
    if (data) {
      setBrandName(data.full_name || "");
      setPreferredLanguage((data.preferred_language as "ar" | "en") || language);
      setLogoUrl(data.avatar_url || "");
      setCurrentPlan(data.plan || "free");
    }

    // Billing history (simple)
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("plan, status, created_at, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setBillingRows(subs || []);

    const { data: usage } = await supabase
      .from("usage")
      .select("generations_count")
      .eq("user_id", user.id)
      .eq("month_year", monthKey)
      .maybeSingle();
    setMonthUsage(usage?.generations_count || 0);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: brandName,
          avatar_url: logoUrl || null,
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
      setSaving(false);
    }
  };

  const handleLogoFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === "string" ? reader.result : "";
      setLogoUrl(res);
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl" dir={isRTL ? "rtl" : "ltr"}>
        <div>
          <h1 className="text-2xl font-bold">{isRTL ? "إعدادات البراند" : "Brand Settings"}</h1>
          <p className="text-sm text-muted-foreground">
            {isRTL ? "إعدادات أساسية فقط للـMVP" : "MVP-only settings"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "البراند" : "Brand"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{isRTL ? "اسم البراند" : "Brand name"}</Label>
              <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>{isRTL ? "شعار البراند" : "Logo"}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleLogoFile(f);
                }}
              />
              {logoUrl && (
                <div className="text-xs text-muted-foreground break-all">{logoUrl.slice(0, 80)}...</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {isRTL ? "اللغة" : "Language"}
              </Label>
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

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              <Save className="w-4 h-4 me-2" />
              {saving ? (isRTL ? "جارٍ الحفظ..." : "Saving...") : isRTL ? "حفظ" : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "الاشتراك" : "Subscription"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">{isRTL ? "الخطة الحالية:" : "Current plan:"}</span>{" "}
              <span className="font-medium">{currentPlan}</span>
            </div>
            <Button asChild className="w-full">
              <a href="/dashboard/billing">{isRTL ? "ترقية الخطة" : "Upgrade plan"}</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "الاستخدام" : "Usage"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <span className="text-muted-foreground">{isRTL ? "هذا الشهر:" : "This month:"}</span>{" "}
              <span className="font-medium">{monthUsage}</span>{" "}
              <span className="text-muted-foreground">{isRTL ? "منتج/توليد" : "products/generations"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "سجل الفواتير" : "Billing history"}</CardTitle>
          </CardHeader>
          <CardContent>
            {billingRows.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {isRTL ? "لا يوجد سجل بعد" : "No history yet"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "الخطة" : "Plan"}</TableHead>
                    <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isRTL ? "تاريخ" : "Date"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingRows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.plan}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
