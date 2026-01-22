import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Facebook, 
  Instagram, 
  BarChart3, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Code,
  Link2,
  Save
} from "lucide-react";

interface TrackingConfig {
  // Pixels
  facebook_pixel_id: string;
  tiktok_pixel_id: string;
  snapchat_pixel_id: string;
  google_analytics_id: string;
  google_ads_id: string;
  clarity_project_id: string;
  
  // API Connections (stored status only, actual tokens in backend)
  facebook_connected: boolean;
  google_connected: boolean;
  tiktok_connected: boolean;
  snapchat_connected: boolean;
  
  // Enabled states
  facebook_pixel_enabled: boolean;
  tiktok_pixel_enabled: boolean;
  snapchat_pixel_enabled: boolean;
  google_analytics_enabled: boolean;
  google_ads_enabled: boolean;
  clarity_enabled: boolean;
}

const defaultConfig: TrackingConfig = {
  facebook_pixel_id: "",
  tiktok_pixel_id: "",
  snapchat_pixel_id: "",
  google_analytics_id: "",
  google_ads_id: "",
  clarity_project_id: "",
  facebook_connected: false,
  google_connected: false,
  tiktok_connected: false,
  snapchat_connected: false,
  facebook_pixel_enabled: false,
  tiktok_pixel_enabled: false,
  snapchat_pixel_enabled: false,
  google_analytics_enabled: false,
  google_ads_enabled: false,
  clarity_enabled: false,
};

export function TrackingIntegrations() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<TrackingConfig>(defaultConfig);

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("tracking_config")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      
      if (data?.tracking_config && typeof data.tracking_config === 'object' && !Array.isArray(data.tracking_config)) {
        const configData = data.tracking_config as unknown as Partial<TrackingConfig>;
        setConfig({ ...defaultConfig, ...configData });
      }
    } catch (error) {
      console.error("Error loading tracking config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ tracking_config: config as unknown as Record<string, never> })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم حفظ إعدادات التتبع بنجاح" : "Tracking settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving tracking config:", error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حفظ الإعدادات" : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof TrackingConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleConnectPlatform = (platform: string) => {
    // For now, show a message that OAuth is coming soon
    toast({
      title: isRTL ? "قريباً" : "Coming Soon",
      description: isRTL 
        ? `ربط ${platform} عبر OAuth سيكون متاحاً قريباً. حالياً يمكنك إضافة Pixel ID فقط.`
        : `${platform} OAuth connection coming soon. For now, you can add the Pixel ID.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const platforms = [
    {
      id: "facebook",
      name: "Facebook / Meta",
      icon: Facebook,
      color: "bg-blue-500",
      pixelKey: "facebook_pixel_id" as keyof TrackingConfig,
      enabledKey: "facebook_pixel_enabled" as keyof TrackingConfig,
      connectedKey: "facebook_connected" as keyof TrackingConfig,
      placeholder: "123456789012345",
      description: isRTL ? "Facebook Pixel و Instagram" : "Facebook Pixel & Instagram",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      color: "bg-black",
      pixelKey: "tiktok_pixel_id" as keyof TrackingConfig,
      enabledKey: "tiktok_pixel_enabled" as keyof TrackingConfig,
      connectedKey: "tiktok_connected" as keyof TrackingConfig,
      placeholder: "XXXXXXXXXXXXXXXXX",
      description: isRTL ? "TikTok Pixel للتتبع" : "TikTok Pixel for tracking",
    },
    {
      id: "snapchat",
      name: "Snapchat",
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.076-.36-.075-.765-.151-1.227-.151-.075 0-.15 0-.224.015-.209.015-.42.045-.63.104-.69.181-1.289.507-1.845.93-.659.57-1.228.91-1.739.988-.06.014-.105.014-.149.014h-.12c-.044 0-.089 0-.134-.014-.51-.078-1.08-.42-1.739-.988-.556-.423-1.156-.749-1.845-.93-.21-.059-.42-.089-.63-.104-.074-.015-.149-.015-.224-.015-.465 0-.869.076-1.227.151-.226.045-.403.076-.539.076-.284 0-.479-.135-.555-.405-.059-.193-.104-.374-.134-.553-.044-.195-.104-.479-.164-.57-1.873-.283-2.906-.702-3.147-1.271-.03-.076-.044-.15-.044-.225-.016-.239.164-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.014l.015-.015c.181-.344.209-.644.119-.868-.193-.45-.883-.675-1.332-.81-.136-.044-.255-.09-.346-.119-.823-.329-1.227-.719-1.212-1.168 0-.36.284-.689.734-.838.151-.061.328-.09.51-.09.119 0 .299.016.463.104.375.181.733.285 1.034.301.197 0 .326-.045.401-.09-.009-.165-.019-.33-.031-.51l-.002-.06c-.105-1.628-.231-3.654.298-4.847 1.583-3.545 4.94-3.821 5.93-3.821h.418z"/>
        </svg>
      ),
      color: "bg-yellow-400",
      pixelKey: "snapchat_pixel_id" as keyof TrackingConfig,
      enabledKey: "snapchat_pixel_enabled" as keyof TrackingConfig,
      connectedKey: "snapchat_connected" as keyof TrackingConfig,
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      description: isRTL ? "Snapchat Pixel للتتبع" : "Snapchat Pixel for tracking",
    },
  ];

  const googleServices = [
    {
      id: "analytics",
      name: "Google Analytics 4",
      icon: BarChart3,
      color: "bg-orange-500",
      idKey: "google_analytics_id" as keyof TrackingConfig,
      enabledKey: "google_analytics_enabled" as keyof TrackingConfig,
      placeholder: "G-XXXXXXXXXX",
      description: isRTL ? "تحليلات شاملة للموقع" : "Comprehensive website analytics",
    },
    {
      id: "ads",
      name: "Google Ads",
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.25 0a5.43 5.43 0 0 0-4.83 2.96L1.19 14.68a5.47 5.47 0 0 0 1.98 7.45A5.4 5.4 0 0 0 10.67 20L12.25 17.23l6.26-10.85A5.47 5.47 0 0 0 16.53 0a5.4 5.4 0 0 0-4.28 0zm-.01 14.47a2.74 2.74 0 0 1 2.73 2.76 2.74 2.74 0 0 1-2.73 2.77 2.74 2.74 0 0 1-2.73-2.77 2.74 2.74 0 0 1 2.73-2.76z"/>
        </svg>
      ),
      color: "bg-blue-600",
      idKey: "google_ads_id" as keyof TrackingConfig,
      enabledKey: "google_ads_enabled" as keyof TrackingConfig,
      placeholder: "AW-XXXXXXXXX",
      description: isRTL ? "تتبع التحويلات من Google Ads" : "Track conversions from Google Ads",
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pixels" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pixels" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            {isRTL ? "أكواد التتبع" : "Tracking Pixels"}
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Google
          </TabsTrigger>
          <TabsTrigger value="clarity" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Clarity
          </TabsTrigger>
        </TabsList>

        {/* Social Pixels Tab */}
        <TabsContent value="pixels" className="space-y-4">
          <div className="grid gap-4">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              const isEnabled = config[platform.enabledKey] as boolean;
              const pixelId = config[platform.pixelKey] as string;
              
              return (
                <Card key={platform.id} className={`transition-all ${isEnabled ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <CardDescription>{platform.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pixelId && isEnabled && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {isRTL ? "مفعّل" : "Active"}
                          </Badge>
                        )}
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => updateConfig(platform.enabledKey, checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {isEnabled && (
                    <CardContent className="pt-0 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={platform.pixelKey}>
                          Pixel ID
                        </Label>
                        <Input
                          id={platform.pixelKey}
                          placeholder={platform.placeholder}
                          value={pixelId}
                          onChange={(e) => updateConfig(platform.pixelKey, e.target.value)}
                          dir="ltr"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConnectPlatform(platform.name)}
                        className="w-full"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        {isRTL ? `ربط حساب ${platform.name} (قريباً)` : `Connect ${platform.name} Account (Coming Soon)`}
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Google Services Tab */}
        <TabsContent value="google" className="space-y-4">
          <div className="grid gap-4">
            {googleServices.map((service) => {
              const IconComponent = service.icon;
              const isEnabled = config[service.enabledKey] as boolean;
              const serviceId = config[service.idKey] as string;
              
              return (
                <Card key={service.id} className={`transition-all ${isEnabled ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {serviceId && isEnabled && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {isRTL ? "مفعّل" : "Active"}
                          </Badge>
                        )}
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => updateConfig(service.enabledKey, checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {isEnabled && (
                    <CardContent className="pt-0 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={service.idKey}>
                          {service.id === "analytics" ? "Measurement ID" : "Conversion ID"}
                        </Label>
                        <Input
                          id={service.idKey}
                          placeholder={service.placeholder}
                          value={serviceId}
                          onChange={(e) => updateConfig(service.idKey, e.target.value)}
                          dir="ltr"
                        />
                      </div>
                      {service.id === "analytics" && (
                        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                          {isRTL 
                            ? "يمكنك الحصول على Measurement ID من Google Analytics > Admin > Data Streams"
                            : "Get your Measurement ID from Google Analytics > Admin > Data Streams"}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Clarity Tab */}
        <TabsContent value="clarity" className="space-y-4">
          <Card className={`transition-all ${config.clarity_enabled ? 'ring-2 ring-primary/20' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Microsoft Clarity</CardTitle>
                    <CardDescription>
                      {isRTL 
                        ? "خرائط حرارية وتسجيلات جلسات المستخدمين - مجاني 100%"
                        : "Heatmaps & session recordings - 100% free"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {config.clarity_project_id && config.clarity_enabled && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {isRTL ? "مفعّل" : "Active"}
                    </Badge>
                  )}
                  <Switch
                    checked={config.clarity_enabled}
                    onCheckedChange={(checked) => updateConfig("clarity_enabled", checked)}
                  />
                </div>
              </div>
            </CardHeader>
            {config.clarity_enabled && (
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clarity_project_id">
                    Project ID
                  </Label>
                  <Input
                    id="clarity_project_id"
                    placeholder="xxxxxxxxxx"
                    value={config.clarity_project_id}
                    onChange={(e) => updateConfig("clarity_project_id", e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">
                    {isRTL ? "كيفية الحصول على Project ID:" : "How to get your Project ID:"}
                  </p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>{isRTL ? "اذهب إلى clarity.microsoft.com" : "Go to clarity.microsoft.com"}</li>
                    <li>{isRTL ? "أنشئ مشروع جديد" : "Create a new project"}</li>
                    <li>{isRTL ? "انسخ Project ID من الإعدادات" : "Copy the Project ID from settings"}</li>
                  </ol>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-primary">🔥</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isRTL ? "خرائط حرارية" : "Heatmaps"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-primary">📹</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isRTL ? "تسجيل الجلسات" : "Session Recordings"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-primary">📊</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isRTL ? "تحليلات" : "Analytics"}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isRTL ? "جاري الحفظ..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isRTL ? "حفظ الإعدادات" : "Save Settings"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
