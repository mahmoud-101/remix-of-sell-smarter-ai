import { Link } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Megaphone,
  Calendar,
  Palette,
  Target,
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Landing() {
  const { t, isRTL, language, setLanguage } = useLanguage();

  const features = [
    {
      icon: FileText,
      title: t("featureProductCopy"),
      description: t("featureProductCopyDesc"),
    },
    {
      icon: Megaphone,
      title: t("featureAds"),
      description: t("featureAdsDesc"),
    },
    {
      icon: Calendar,
      title: t("featureCampaign"),
      description: t("featureCampaignDesc"),
    },
    {
      icon: Palette,
      title: t("featureDesign"),
      description: t("featureDesignDesc"),
    },
    {
      icon: Target,
      title: t("featureCompetitor"),
      description: t("featureCompetitorDesc"),
    },
    {
      icon: BarChart3,
      title: t("featureGrowth"),
      description: t("featureGrowthDesc"),
    },
  ];

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
    t("benefit4"),
  ];

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">{t("appName")}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("features")}
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("pricing")}
            </a>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === "ar" ? "EN" : "ع"}
            </button>
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("login")}
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm">
                {t("getStarted")}
              </Button>
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <Globe className="w-5 h-5" />
            </button>
            <Link to="/signup">
              <Button variant="hero" size="sm">
                {t("getStarted")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              {t("heroTagline")}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              {t("heroTitle")}
              <span className="gradient-text"> {t("heroTitleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group">
                  {t("startFreeTrialBtn")}
                  <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="hero-outline" size="xl">
                  {t("viewDemo")}
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("noCreditCard")}
            </p>
          </div>

          {/* Benefits list */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? (
                <>
                  كل ما تحتاجه
                  <span className="gradient-text"> لتنمية أعمالك</span>
                </>
              ) : (
                <>
                  Everything You Need to
                  <span className="gradient-text"> Scale Your Business</span>
                </>
              )}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "أدوات ذكاء اصطناعي قوية مصممة خصيصاً لبائعي التجارة الإلكترونية والوكالات والمسوقين."
                : "Powerful AI tools designed specifically for e-commerce sellers, agencies, and marketers."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("ctaTitle")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                {t("ctaDescription")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button variant="gradient" size="xl" className="group">
                    {t("getStartedFree")}
                    <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold gradient-text">{t("appName")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 {t("appName")}. {isRTL ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
