import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function WhatsAppBusinessSetup() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState({
    phoneNumberId: "",
    accessToken: "",
    verifyToken: "",
    businessAccountId: "",
  });

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: isRTL ? "تم النسخ" : "Copied",
      description: isRTL ? "تم نسخ الرابط" : "URL copied to clipboard",
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: isRTL ? "اختبار الاتصال" : "Connection Test",
      description: isRTL 
        ? "لاختبار الاتصال، أرسل رسالة لرقم WhatsApp Business الخاص بك"
        : "To test connection, send a message to your WhatsApp Business number",
    });
    
    setIsTesting(false);
  };

  const handleSaveConfig = () => {
    if (!config.phoneNumberId || !config.accessToken || !config.verifyToken) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsConnected(true);
    toast({
      title: isRTL ? "تم الحفظ" : "Saved",
      description: isRTL 
        ? "تم حفظ إعدادات WhatsApp Business API بنجاح"
        : "WhatsApp Business API settings saved successfully",
    });
  };

  const setupSteps = [
    {
      title: isRTL ? "إنشاء تطبيق Meta" : "Create Meta App",
      description: isRTL 
        ? "اذهب إلى Meta for Developers وأنشئ تطبيقًا جديدًا"
        : "Go to Meta for Developers and create a new app",
      link: "https://developers.facebook.com/apps",
    },
    {
      title: isRTL ? "إضافة WhatsApp" : "Add WhatsApp Product",
      description: isRTL
        ? "أضف منتج WhatsApp لتطبيقك"
        : "Add the WhatsApp product to your app",
    },
    {
      title: isRTL ? "إعداد Webhook" : "Configure Webhook",
      description: isRTL
        ? "أضف رابط الـ Webhook أدناه في إعدادات التطبيق"
        : "Add the webhook URL below to your app settings",
    },
    {
      title: isRTL ? "اختبار الاتصال" : "Test Connection",
      description: isRTL
        ? "أرسل رسالة اختبار للتأكد من عمل الربط"
        : "Send a test message to verify the connection",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>{isRTL ? "WhatsApp Business API" : "WhatsApp Business API"}</CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "ربط chatbot الذكاء الاصطناعي مع WhatsApp Business"
                    : "Connect AI chatbot with WhatsApp Business"}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {isRTL ? "متصل" : "Connected"}
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  {isRTL ? "غير متصل" : "Not Connected"}
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              {isRTL ? "خطوات الإعداد" : "Setup Steps"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {setupSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.link && (
                      <a 
                        href={step.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        {isRTL ? "فتح الرابط" : "Open Link"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook URL */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{isRTL ? "رابط Webhook" : "Webhook URL"}</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {webhookUrl}
                </code>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => handleCopy(webhookUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                {isRTL 
                  ? "انسخ هذا الرابط وأضفه في إعدادات Webhook في Meta for Developers"
                  : "Copy this URL and add it to Webhook settings in Meta for Developers"}
              </p>
            </AlertDescription>
          </Alert>

          {/* Configuration Form */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              {isRTL ? "إعدادات API" : "API Configuration"}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? "Phone Number ID" : "Phone Number ID"} *</Label>
                <Input 
                  placeholder="123456789012345"
                  value={config.phoneNumberId}
                  onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{isRTL ? "Business Account ID" : "Business Account ID"}</Label>
                <Input 
                  placeholder="123456789012345"
                  value={config.businessAccountId}
                  onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>{isRTL ? "Access Token" : "Access Token"} *</Label>
                <Input 
                  type="password"
                  placeholder="EAAxxxxxxxx..."
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>{isRTL ? "Verify Token" : "Verify Token"} *</Label>
                <Input 
                  placeholder={isRTL ? "أي نص تختاره للتحقق" : "Any text you choose for verification"}
                  value={config.verifyToken}
                  onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL 
                    ? "اختر أي نص واستخدم نفس النص في إعدادات Webhook"
                    : "Choose any text and use the same in Webhook settings"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSaveConfig} className="flex-1">
              {isRTL ? "حفظ الإعدادات" : "Save Settings"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting || !isConnected}
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isRTL ? "اختبار الاتصال" : "Test Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "الميزات المتاحة" : "Available Features"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">
                {isRTL ? "الرد التلقائي بالذكاء الاصطناعي" : "AI Auto-Reply"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? "رد تلقائي على رسائل العملاء باستخدام الذكاء الاصطناعي"
                  : "Automatic AI-powered replies to customer messages"}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">
                {isRTL ? "جمع بيانات العملاء" : "Lead Collection"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? "حفظ بيانات العملاء تلقائيًا من المحادثات"
                  : "Automatically save customer data from conversations"}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">
                {isRTL ? "تقارير المحادثات" : "Conversation Reports"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? "تتبع وتحليل جميع المحادثات مع العملاء"
                  : "Track and analyze all customer conversations"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
