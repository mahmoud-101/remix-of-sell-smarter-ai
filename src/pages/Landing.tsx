import { Link } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Megaphone,
  ArrowRight,
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
      icon: FileText,
      title: isRTL ? "وصف المنتجات" : "Product Descriptions",
      description: isRTL 
        ? "اكتب وصف منتجات أزياء (مقاسات/خامات/ستايل) يزيد التحويل ويقلل المرتجعات." 
        : "Write compelling product descriptions that boost sales and improve SEO.",
      badge: isRTL ? "Fashion + MENA" : "Fashion + MENA",
    },
    {
      icon: Megaphone,
      title: isRTL ? "كاتب الإعلانات" : "Ad Copywriter",
      description: isRTL 
        ? "زوايا وإعلانات Meta عالية التحويل لبراندات الأزياء في مصر/السعودية/الإمارات + اعتراضات COD/Prepaid." 
        : "High-converting Meta ad angles for fashion brands in MENA (COD/Prepaid objections included).",
    },
    {
      icon: BarChart3,
      title: isRTL ? "خبير السيو" : "SEO Expert",
      description: isRTL 
        ? "حسّن عنوان المنتج وMeta Description وكلمات البحث لتزيد الزيارات المجانية والتحويل." 
        : "Optimize your products to rank #1 on Google and get free organic traffic.",
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
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
              <Zap className="w-4 h-4" />
              {isRTL ? "🚀 أكثر من 10,000 متجر يثقون بنا" : "🚀 Trusted by 10,000+ Stores"}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance leading-tight">
              {isRTL ? (
                <>
                  <span className="gradient-text">طلّع حملتك الإعلانية كاملة</span>
                  <br />
                  <span className="text-foreground">في أقل من 5 دقائق ⚡</span>
                </>
              ) : (
                <>
                  <span className="gradient-text">Launch Your Complete Ad Campaign</span>
                  <br />
                  <span className="text-foreground">in Under 5 Minutes ⚡</span>
                </>
              )}
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto text-balance font-medium leading-relaxed">
              {isRTL 
                ? "محتوى براند أزياء جاهز للنشر: وصف منتجات + إعلانات Meta + SEO—مخصص لمتاجر Shopify/DTC في MENA 🎯"
                : "Publish-ready fashion growth copy: Product descriptions + Meta Ads + SEO—built for Shopify/DTC in MENA 🎯"}
            </p>
            
            {/* Stats inline */}
            <div className="flex flex-wrap items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary">+40%</div>
                <div className="text-sm text-muted-foreground">{isRTL ? "زيادة في المبيعات" : "Sales Increase"}</div>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary">5 {isRTL ? "دقائق" : "min"}</div>
                <div className="text-sm text-muted-foreground">{isRTL ? "لإنشاء حملة كاملة" : "Complete Campaign"}</div>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">{isRTL ? "يعمل بدون توقف" : "Always Available"}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group min-w-[320px] text-lg h-14">
                  {isRTL ? "ابدأ مجانًا - بدون بطاقة ائتمان" : "🎁 Try Free - No Credit Card"}
                  <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="hero-outline" size="xl" className="group min-w-[200px] h-14">
                  <Play className="w-5 h-5" />
                  {isRTL ? "شوف كيف يعمل" : "See How It Works"}
                </Button>
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              {isRTL ? "آمن 100% • إلغاء في أي وقت • بدون التزام" : "100% Secure • Cancel Anytime • No Commitment"}
            </p>
          </div>

          {/* Benefits list */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {[
                isRTL ? "✅ وصف أزياء يقلل المرتجعات" : "✅ Fashion copy that reduces returns",
                isRTL ? "✅ إعلانات Meta عالية التحويل" : "✅ High-converting Meta Ads",
                isRTL ? "✅ SEO للمنتجات والمتجر" : "✅ Product + store SEO",
                isRTL ? "✅ اعتراضات COD/Prepaid + سياسة مرتجعات" : "✅ COD/Prepaid + returns policy",
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 animate-fade-in bg-card/50 px-4 py-2 rounded-full border border-border/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold mb-6">
              {isRTL ? "🛠️ أدوات قوية" : "🛠️ Powerful Tools"}
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              {isRTL ? (
                <>
                  كل اللي تحتاجه في
                  <span className="gradient-text"> مكان واحد</span>
                </>
              ) : (
                <>
                  Everything You Need in
                  <span className="gradient-text"> One Place</span>
                </>
              )}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "3 أدوات أساسية لبراندات الأزياء على Shopify/DTC في مصر/السعودية/الإمارات—مركّزة على Meta Ads ورفع التحويل"
                : "3 core tools for Shopify/DTC fashion brands in MENA—focused on Meta Ads and conversion"}
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
      <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-8 md:p-14 text-center relative overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 animate-bounce-in">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                {isRTL ? "جاهز تبدأ تبيع أكتر؟ 🚀" : "Ready to Sell More? 🚀"}
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10">
                {isRTL 
                  ? "انضم لأكثر من 10,000 متجر يستخدمون سيل جينيوس لمضاعفة مبيعاتهم. ابدأ مجاناً الآن!"
                  : "Join 10,000+ stores using SellGenius to double their sales. Start free now!"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="group min-w-[320px] text-lg h-14">
                    {isRTL ? "🎁 ابدأ مجاناً الآن" : "🎁 Start Free Now"}
                    <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                {isRTL ? "بدون بطاقة ائتمان • إلغاء في أي وقت" : "No credit card • Cancel anytime"}
              </p>
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
