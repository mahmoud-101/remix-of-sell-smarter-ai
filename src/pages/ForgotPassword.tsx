import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { emailSchema } from "@/lib/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0]?.message || "بريد إلكتروني غير صالح");
      return;
    }
    
    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setIsLoading(false);

    if (resetError) {
      toast({
        title: t("errorOccurred") || "حدث خطأ",
        description: resetError.message,
        variant: "destructive",
      });
      return;
    }

    setIsSuccess(true);
    toast({
      title: t("emailSent") || "تم إرسال البريد",
      description: t("checkYourEmail") || "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور",
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative">
          <div className="glass-card rounded-2xl p-8 animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("emailSent") || "تم إرسال البريد"}</h1>
            <p className="text-muted-foreground mb-6">
              {t("resetEmailSent") || "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد."}
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                {t("backToLogin") || "العودة لتسجيل الدخول"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="glass-card rounded-2xl p-8 animate-scale-in">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">{t("appName")}</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{t("forgotPassword") || "نسيت كلمة المرور؟"}</h1>
            <p className="text-muted-foreground">
              {t("enterEmailForReset") || "أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${isRTL ? "pr-10" : "pl-10"} input-field ${error ? "border-destructive" : ""}`}
                  required
                  autoComplete="email"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                t("sending") || "جاري الإرسال..."
              ) : (
                <>
                  {t("sendResetLink") || "إرسال رابط الإعادة"}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary hover:underline font-medium flex items-center justify-center gap-2">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              {t("backToLogin") || "العودة لتسجيل الدخول"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
