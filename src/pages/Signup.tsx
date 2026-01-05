import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { emailSchema, passwordSchema, fullNameSchema, authRateLimiter } from "@/lib/validation";
import { Separator } from "@/components/ui/separator";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signInWithGoogle } = useAuth();
  const { t, isRTL } = useLanguage();

  const benefits = [
    t("featureProductCopy"),
    t("featureAds"),
    t("featureCampaign"),
    t("featureCompetitor"),
  ];

  // Password strength indicator
  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { score: 0, label: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const labels = ["", "ضعيف", "متوسط", "جيد", "قوي", "ممتاز"];
    return { score, label: labels[score] || "" };
  }, [password]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    const nameResult = fullNameSchema.safeParse(name);
    if (!nameResult.success) {
      newErrors.name = nameResult.error.errors[0]?.message;
    }
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0]?.message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0]?.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (authRateLimiter.isRateLimited(email)) {
      const remaining = authRateLimiter.getRemainingTime(email);
      toast({
        title: "محاولات كثيرة جداً",
        description: `يرجى الانتظار ${remaining} ثانية`,
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    authRateLimiter.recordAttempt(email);

    const { error } = await signUp(email.trim().toLowerCase(), password, name.trim());

    if (error) {
      setIsLoading(false);
      let message = t("tryAgain");
      if (error.message.includes("already registered")) {
        message = t("userExists");
      } else if (error.message.includes("weak")) {
        message = t("weakPassword");
      }
      toast({
        title: t("errorOccurred"),
        description: message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("signupSuccess"),
      description: t("signupSuccessDesc"),
    });
    navigate("/dashboard");
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setIsGoogleLoading(false);
      toast({
        title: t("errorOccurred"),
        description: isRTL ? "فشل التسجيل بـ Google" : "Google sign up failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Left side - Benefits */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">{t("appName")}</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {t("startFreeTrial")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("ctaDescription")}
          </p>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md relative">
          <div className="glass-card rounded-2xl p-8 animate-scale-in">
            {/* Mobile Logo */}
            <Link
              to="/"
              className="flex items-center justify-center gap-2 mb-8 lg:hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl gradient-text">{t("appName")}</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{t("createAccount")}</h1>
              <p className="text-muted-foreground">
                {t("startFreeTrial")}
              </p>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                isRTL ? "جاري التحميل..." : "Loading..."
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isRTL ? "التسجيل بـ Google" : "Sign up with Google"}
                </>
              )}
            </Button>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                {isRTL ? "أو" : "OR"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <div className="relative">
                  <User className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    id="name"
                    type="text"
                    placeholder={isRTL ? "أحمد محمد" : "John Doe"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${isRTL ? "pr-10" : "pl-10"} input-field ${errors.name ? "border-destructive" : ""}`}
                    required
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

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
                <Label htmlFor="password">{t("password")}</Label>
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
                    minLength={8}
                    autoComplete="new-password"
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
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? "bg-destructive"
                                : passwordStrength.score <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("passwordMinLength")} - <span className={
                        passwordStrength.score <= 2 ? "text-destructive" :
                        passwordStrength.score <= 3 ? "text-yellow-500" : "text-green-500"
                      }>{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  t("creatingAccount")
                ) : (
                  <>
                    {t("createAccount")}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              {t("termsAgreement")}
            </p>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("hasAccount")}{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
