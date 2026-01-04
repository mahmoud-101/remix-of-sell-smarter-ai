import { useState, useEffect } from "react";
import { Palette, Save, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrandVoice {
  id: string;
  name: string;
  tone: string;
  style: string;
  keywords: string;
  avoidWords: string;
  description: string;
}

export default function BrandVoiceSettings() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [activeVoice, setActiveVoice] = useState<BrandVoice | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    tone: "professional",
    style: "modern",
    keywords: "",
    avoidWords: "",
    description: "",
  });

  const tones = [
    { value: "professional", label: isRTL ? "احترافي" : "Professional" },
    { value: "friendly", label: isRTL ? "ودود" : "Friendly" },
    { value: "luxury", label: isRTL ? "فاخر" : "Luxury" },
    { value: "playful", label: isRTL ? "مرح" : "Playful" },
    { value: "authoritative", label: isRTL ? "موثوق" : "Authoritative" },
  ];

  const styles = [
    { value: "modern", label: isRTL ? "حديث" : "Modern" },
    { value: "classic", label: isRTL ? "كلاسيكي" : "Classic" },
    { value: "minimalist", label: isRTL ? "بسيط" : "Minimalist" },
    { value: "bold", label: isRTL ? "جريء" : "Bold" },
    { value: "elegant", label: isRTL ? "أنيق" : "Elegant" },
  ];

  // Load saved voices from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`brand-voices-${user?.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setVoices(parsed);
      if (parsed.length > 0) {
        setActiveVoice(parsed[0]);
      }
    }
  }, [user?.id]);

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال اسم للهوية" : "Please enter a name for the brand voice",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const newVoice: BrandVoice = {
      id: Date.now().toString(),
      ...formData,
    };

    const updatedVoices = [...voices, newVoice];
    setVoices(updatedVoices);
    localStorage.setItem(`brand-voices-${user?.id}`, JSON.stringify(updatedVoices));
    
    setFormData({
      name: "",
      tone: "professional",
      style: "modern",
      keywords: "",
      avoidWords: "",
      description: "",
    });

    setLoading(false);
    toast({
      title: isRTL ? "تم الحفظ!" : "Saved!",
      description: isRTL ? "تم حفظ هوية العلامة التجارية" : "Brand voice saved successfully",
    });
  };

  const handleDelete = (id: string) => {
    const updatedVoices = voices.filter(v => v.id !== id);
    setVoices(updatedVoices);
    localStorage.setItem(`brand-voices-${user?.id}`, JSON.stringify(updatedVoices));
    if (activeVoice?.id === id) {
      setActiveVoice(updatedVoices[0] || null);
    }
    toast({
      title: isRTL ? "تم الحذف" : "Deleted",
      description: isRTL ? "تم حذف هوية العلامة التجارية" : "Brand voice deleted",
    });
  };

  const handleSelect = (voice: BrandVoice) => {
    setActiveVoice(voice);
    localStorage.setItem(`active-brand-voice-${user?.id}`, JSON.stringify(voice));
    toast({
      title: isRTL ? "تم التفعيل" : "Activated",
      description: isRTL ? `تم تفعيل "${voice.name}"` : `"${voice.name}" is now active`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{isRTL ? "هوية العلامة التجارية" : "Brand Voice"}</h3>
          <p className="text-sm text-muted-foreground">
            {isRTL ? "احفظ إعدادات علامتك التجارية للاستخدام في التوليد" : "Save your brand settings for content generation"}
          </p>
        </div>
      </div>

      {/* Saved Voices */}
      {voices.length > 0 && (
        <div className="space-y-3">
          <Label>{isRTL ? "الهويات المحفوظة" : "Saved Brand Voices"}</Label>
          <div className="grid gap-2">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  activeVoice?.id === voice.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {voice.tone} • {voice.style}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={activeVoice?.id === voice.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelect(voice)}
                  >
                    {activeVoice?.id === voice.id ? (isRTL ? "نشط" : "Active") : (isRTL ? "تفعيل" : "Activate")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(voice.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Voice Form */}
      <div className="space-y-4 pt-4 border-t border-border">
        <Label className="text-lg">{isRTL ? "إضافة هوية جديدة" : "Add New Brand Voice"}</Label>
        
        <div className="space-y-2">
          <Label htmlFor="voiceName">{isRTL ? "اسم الهوية" : "Voice Name"}</Label>
          <Input
            id="voiceName"
            placeholder={isRTL ? "مثال: متجري الإلكتروني" : "e.g., My E-commerce Store"}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{isRTL ? "نبرة الصوت" : "Tone"}</Label>
            <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? "الأسلوب" : "Style"}</Label>
            <Select value={formData.style} onValueChange={(v) => setFormData({ ...formData, style: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "الكلمات المفتاحية" : "Keywords"}</Label>
          <Input
            placeholder={isRTL ? "كلمات تريد استخدامها (مفصولة بفاصلة)" : "Words to use (comma separated)"}
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "كلمات يجب تجنبها" : "Words to Avoid"}</Label>
          <Input
            placeholder={isRTL ? "كلمات لا تريد استخدامها (مفصولة بفاصلة)" : "Words to avoid (comma separated)"}
            value={formData.avoidWords}
            onChange={(e) => setFormData({ ...formData, avoidWords: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "وصف العلامة التجارية" : "Brand Description"}</Label>
          <Textarea
            placeholder={isRTL ? "صف علامتك التجارية وقيمها..." : "Describe your brand and its values..."}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isRTL ? "حفظ الهوية" : "Save Brand Voice"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
