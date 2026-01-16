import { Link } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Megaphone,
  Palette,
  Target,
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Play,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import PricingSection from "@/components/pricing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FAQSection from "@/components/landing/FAQSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import UniqueFeatures from "@/components/landing/UniqueFeatures";
import WhatsAppChatbot from "@/components/chat/WhatsAppChatbot";
import HeroMockup from "@/components/landing/HeroMockup";
import BeforeAfterSection from "@/components/landing/BeforeAfterSection";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import StatsSection from "@/components/landing/StatsSection";
import VideoSection from "@/components/landing/VideoSection";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { useState, useEffect } from "react";

export default function Landing() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Palette,
      title: isRTL ? "مصنع الكريتيفات" : "Creative Factory",
      description: isRTL 
        ? "صمم صور منتجات وإعلانات سوشيال ميديا احترافية بالذكاء الاصطناعي بضغطة زر واحدة." 
        : "Design professional product photos and social media ads with AI in one click.",
      badge: isRTL ? "الأكثر استخداماً" : "Most Popular",
    },
    {
      icon: FileText,
      title: isRTL ? "وصف المنتجات" : "Product Descriptions",
      description: isRTL 
        ? "اكتب وصف منتجات بيعي واحترافي يزيد من مبيعاتك ويحسن ظهورك في محركات البحث." 
        : "Write compelling product descriptions that boost sales and improve SEO.",
    },
    {
      icon: Megaphone,
      title: isRTL ? "كاتب الإعلانات" : "Ad Copywriter",
      description: isRTL 
        ? "نصوص إعلانية مقنعة لفيسبوك وإنستجرام وتيك توك وجوجل مع نسخ A/B للاختبار." 
        : "Persuasive ad copies for Facebook, Instagram, TikTok & Google with A/B variations.",
    },
    {
      icon: Play,
      title: isRTL ? "سكريبتات الفيديو" : "Video Scripts",
      description: isRTL 
        ? "اكتب سكريبتات ريلز وتيك توك فيرال (Viral) تجذب العملاء وتزيد المبيعات." 
        : "Create viral TikTok & Reels scripts that attract customers and boost sales.",
      badge: isRTL ? "جديد 🔥" : "New 🔥",
    },
    {
      icon: BarChart3,
      title: isRTL ? "خبير السيو" : "SEO Expert",
      description: isRTL 
        ? "حسّن منتجاتك ومتجرك لتظهر في الصفحة الأولى من جوجل وتجلب زوار مجانيين." 
        : "Optimize your products to rank #1 on Google and get free organic traffic.",
    },
    {
      icon: Target,
      title: isRTL ? "تحليل المنافسين" : "Competitor Analysis",
      description: isRTL 
        ? "تجسس على إعلانات ومنتجات منافسيك واكتشف نقاط قوتهم وضعفهم." 
        : "Spy on competitors' ads and products to discover their strengths and weaknesses.",
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
      <SEOHead />
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-xl shadow-sm" : "bg-background/80 backdrop-blur-xl"
      } border-b border-border/50`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">{t("appName")}</span>
          </Link>
          
          {/* Desktop Nav */}
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
            <Link
              to="/use-cases"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRTL ? "حالات الاستخدام" : "Use Cases"}
            </Link>
            <Link
              to="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRTL ? "من نحن" : "About"}
            </Link>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle language"
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
          
          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border animate-fade-in">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                {t("features")}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                {t("pricing")}
              </a>
              <Link
                to="/use-cases"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                {isRTL ? "حالات الاستخدام" : "Use Cases"}
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                {isRTL ? "من نحن" : "About"}
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                {t("login")}
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full">
                  {t("getStarted")}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              {t("heroTagline")}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              {isRTL ? (
                <>
                  ضاعف مبيعاتك
                  <span className="gradient-text"> بالذكاء الاصطناعي</span>
                  <br />
                  <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-normal mt-2 block">
                    محتوى تسويقي احترافي في ثوانٍ
                  </span>
                </>
              ) : (
                <>
                  Double Your Sales
                  <span className="gradient-text"> With AI</span>
                  <br />
                  <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-normal mt-2 block">
                    Professional Marketing Content in Seconds
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              {isRTL 
                ? "أنشئ وصف منتجات جذاب، إعلانات عالية التحويل، وتصاميم مذهلة - كل ذلك بالذكاء الاصطناعي. وفر ساعات من العمل وزد مبيعاتك حتى 40%."
                : "Create engaging product descriptions, high-converting ads, and stunning designs - all powered by AI. Save hours of work and increase your sales by up to 40%."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group min-w-[280px]">
                  {isRTL ? "ابدأ مجاناً - بدون بطاقة ائتمان" : "Start Free - No Credit Card"}
                  <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="hero-outline" size="xl" className="group min-w-[200px]">
                  <Play className="w-5 h-5" />
                  {t("viewDemo")}
                </Button>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("noCreditCard")}
            </p>
          </div>

          {/* Benefits list */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {benefit}
              </div>
            ))}
          </div>

          {/* Hero Mockup */}
          <HeroMockup />
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Trusted By Section */}
      <TrustedBySection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Interactive Demo Section */}
      <div id="demo">
        <InteractiveDemo />
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? (
                <>
                  6 أدوات قوية
                  <span className="gradient-text"> لتنمية أعمالك</span>
                </>
              ) : (
                <>
                  6 Powerful Tools to
                  <span className="gradient-text"> Scale Your Business</span>
                </>
              )}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "أدوات ذكاء اصطناعي متخصصة لبائعي التجارة الإلكترونية والوكالات والمسوقين."
                : "AI tools designed specifically for e-commerce sellers, agencies, and marketers."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card animate-fade-in relative overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {feature.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full shadow-sm z-10">
                    {feature.badge}
                  </span>
                )}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features */}
      <UniqueFeatures />


      {/* Before/After Section */}
      <BeforeAfterSection />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {isRTL ? "مستعد لتضاعف مبيعاتك؟" : "Ready to Double Your Sales?"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                {isRTL 
                  ? "انضم لأكثر من 10,000 بائع ومسوق يستخدمون سيل جينيوس لتنمية أعمالهم. ابدأ تجربتك المجانية اليوم."
                  : "Join over 10,000 sellers and marketers using SellGenius to grow their businesses. Start your free trial today."}
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
      <Footer />

      {/* WhatsApp Chatbot */}
      <WhatsAppChatbot />
    </div>
  );
}
