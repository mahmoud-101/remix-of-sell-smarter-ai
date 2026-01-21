import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { emailSchema, authRateLimiter } from "@/lib/validation";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState(false);
  const [isResendingConfirm, setIsResendingConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithGoogle, resendConfirmationEmail } = useAuth();
  const { t, isRTL } = useLanguage();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0]?.message;
    }
    
    if (password.length < 6) {
      newErrors.password = t("passwordTooShort") || "كلمة المرور قصيرة جداً";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResendConfirm(false);
    
    // Rate limiting check
    if (authRateLimiter.isRateLimited(email)) {
      const remaining = authRateLimiter.getRemainingTime(email);
      toast({
        title: t("tooManyAttempts") || "محاولات كثيرة جداً",
        description: `${t("pleaseWait") || "يرجى الانتظار"} ${remaining} ${t("seconds") || "ثانية"}`,
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    authRateLimiter.recordAttempt(email);

    const { error } = await signIn(email.trim().toLowerCase(), password);

    if (error) {
      setIsLoading(false);

      const msg = (error as any)?.message ? String((error as any).message) : "";
      const isUnconfirmed = /email not confirmed|confirm your email/i.test(msg);

      if (isUnconfirmed) {
        setShowResendConfirm(true);
      }

      toast({
        title: t("errorOccurred"),
        description: isUnconfirmed
          ? (t("confirmEmailFirst") || (isRTL ? "يرجى تأكيد بريدك الإلكتروني أولاً" : "Please confirm your email first"))
          : (t("invalidCredentials") || msg),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("loginSuccess"),
      description: t("loginSuccessDesc"),
    });
    navigate("/dashboard");
  };

  const handleResendConfirmation = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsResendingConfirm(true);
    const { error } = await resendConfirmationEmail(normalizedEmail);
    setIsResendingConfirm(false);

    if (error) {
      toast({
        title: t("errorOccurred"),
        description: t("tryAgain"),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isRTL ? "تم الإرسال" : "Sent",
      description: isRTL
        ? "تم إرسال رسالة تأكيد جديدة إلى بريدك الإلكتروني. افتح الرسالة واضغط رابط التأكيد." 
        : "We've sent a new confirmation email. Open it and click the confirmation link.",
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setIsGoogleLoading(false);
      toast({
        title: t("errorOccurred"),
        description: isRTL ? "فشل تسجيل الدخول بـ Google" : "Google sign in failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="glass-card rounded-2xl p-8 animate-scale-in">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">{t("appName")}</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{t("welcomeBack")}</h1>
            <p className="text-muted-foreground">
              {t("signInToContinue")}
            </p>
          </div>

          {/* Google Sign In - Enhanced */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 text-base font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 gap-3 shadow-sm hover:shadow-md"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>{isRTL ? "جاري التحميل..." : "Connecting..."}</span>
              </div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="flex-1 text-center">
                  {isRTL ? "الاستمرار بحساب Google" : "Continue with Google"}
                </span>
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            {isRTL ? "🔒 تسجيل دخول آمن وسريع بنقرة واحدة" : "🔒 Secure & fast one-click sign in"}
          </p>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              {isRTL ? "أو" : "OR"}
            </span>
          </div>

          {/* Form */}
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
                  className={`${isRTL ? "pr-10" : "pl-10"} input-field ${errors.email ? "border-destructive" : ""}`}
                  required
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"} input-field ${errors.password ? "border-destructive" : ""}`}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                t("signingIn")
              ) : (
                <>
                  {t("signIn")}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </>
              )}
            </Button>

            {showResendConfirm && (
              <div className="rounded-lg border bg-card/50 p-3 text-sm">
                <p className="text-muted-foreground">
                  {isRTL
                    ? "حسابك يحتاج تأكيد البريد الإلكتروني. لو ماوصلتك الرسالة، اضغط إعادة الإرسال."
                    : "Your account needs email confirmation. If you didn’t receive the email, resend it."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={handleResendConfirmation}
                  disabled={isResendingConfirm}
                >
                  {isResendingConfirm
                    ? (isRTL ? "جاري الإرسال..." : "Sending...")
                    : (isRTL ? "إعادة إرسال رسالة التأكيد" : "Resend confirmation email")}
                </Button>
              </div>
            )}
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("noAccount")}{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              {t("signUpFree")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
