import { useState } from "react";
import { MessageCircle, Send, Phone, Link2, Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function RealWhatsAppIntegration() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("");
  const [autoReply, setAutoReply] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateWhatsAppLink = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    const encodedMessage = encodeURIComponent(defaultMessage);
    return `https://wa.me/${cleanPhone}${defaultMessage ? `?text=${encodedMessage}` : ""}`;
  };

  const copyLink = () => {
    const link = generateWhatsAppLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: isRTL ? "تم النسخ!" : "Copied!",
      description: isRTL ? "تم نسخ رابط واتساب" : "WhatsApp link copied to clipboard",
    });
  };

  const openWhatsApp = () => {
    window.open(generateWhatsAppLink(), "_blank");
  };

  const generateQRCode = () => {
    const link = generateWhatsAppLink();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold">{isRTL ? "ربط واتساب" : "WhatsApp Integration"}</h3>
          <p className="text-sm text-muted-foreground">
            {isRTL ? "اربط متجرك بواتساب للتواصل المباشر" : "Connect your store with WhatsApp for direct communication"}
          </p>
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label>{isRTL ? "رقم واتساب" : "WhatsApp Number"}</Label>
        <div className="relative">
          <Phone className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
          <Input
            placeholder={isRTL ? "966500000000+" : "+966500000000"}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={isRTL ? "pr-10" : "pl-10"}
            dir="ltr"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {isRTL ? "أدخل الرقم مع رمز الدولة بدون مسافات" : "Enter number with country code, no spaces"}
        </p>
      </div>

      {/* Default Message */}
      <div className="space-y-2">
        <Label>{isRTL ? "رسالة افتراضية" : "Default Message"}</Label>
        <Textarea
          placeholder={isRTL ? "مرحباً، أريد الاستفسار عن..." : "Hello, I'd like to inquire about..."}
          value={defaultMessage}
          onChange={(e) => setDefaultMessage(e.target.value)}
          rows={3}
        />
      </div>

      {/* Auto Reply Toggle */}
      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
        <div>
          <p className="font-medium">{isRTL ? "الرد التلقائي" : "Auto Reply"}</p>
          <p className="text-sm text-muted-foreground">
            {isRTL ? "إرسال رد تلقائي للعملاء" : "Send automatic replies to customers"}
          </p>
        </div>
        <Switch checked={autoReply} onCheckedChange={setAutoReply} />
      </div>

      {/* Generated Link */}
      {phoneNumber && (
        <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <Label>{isRTL ? "رابط واتساب المباشر" : "Direct WhatsApp Link"}</Label>
          <div className="flex gap-2">
            <Input
              value={generateWhatsAppLink()}
              readOnly
              className="bg-white dark:bg-background font-mono text-sm"
              dir="ltr"
            />
            <Button variant="outline" size="icon" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={openWhatsApp}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <p className="text-sm text-muted-foreground">
              {isRTL ? "امسح الكود للتواصل" : "Scan to chat"}
            </p>
            <img
              src={generateQRCode()}
              alt="WhatsApp QR Code"
              className="w-32 h-32 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={openWhatsApp}
          disabled={!phoneNumber}
          className="flex-1 bg-green-500 hover:bg-green-600"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {isRTL ? "فتح واتساب" : "Open WhatsApp"}
        </Button>
      </div>

      {/* Embed Code */}
      <div className="space-y-2">
        <Label>{isRTL ? "كود الإضافة للموقع" : "Embed Code"}</Label>
        <Textarea
          readOnly
          rows={4}
          className="font-mono text-xs"
          dir="ltr"
          value={`<!-- WhatsApp Button -->
<a href="${generateWhatsAppLink()}" target="_blank" style="position:fixed;bottom:20px;right:20px;background:#25D366;color:white;padding:15px;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
</a>`}
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(document.querySelector('textarea[readonly]')?.textContent || "");
            toast({ title: isRTL ? "تم النسخ!" : "Copied!" });
          }}
        >
          <Copy className="w-4 h-4 mr-2" />
          {isRTL ? "نسخ الكود" : "Copy Code"}
        </Button>
      </div>
    </div>
  );
}
