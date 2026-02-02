import { Link } from "react-router-dom";
import {
  Sparkles,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import PricingSection from "@/components/pricing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import UniqueFeatures from "@/components/landing/UniqueFeatures";
import WhatsAppChatbot from "@/components/chat/WhatsAppChatbot";
import BeforeAfterSection from "@/components/landing/BeforeAfterSection";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import BrandsSection from "@/components/landing/BrandsSection";
import CTASection from "@/components/landing/CTASection";
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

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <SEOHead />
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50" 
          : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">{t("appName")}</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
            >
              {t("features")}
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
            >
              {t("pricing")}
            </a>
            <Link
              to="/use-cases"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
            >
              {isRTL ? "حالات الاستخدام" : "Use Cases"}
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
            >
              {isRTL ? "من نحن" : "About"}
            </Link>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              {language === "ar" ? "EN" : "ع"}
            </button>
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
            >
              {t("login")}
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm" className="shadow-lg shadow-primary/25">
                {t("getStarted")}
              </Button>
            </Link>
          </nav>
          
          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 animate-fade-in">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-all"
              >
                {t("features")}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-all"
              >
                {t("pricing")}
              </a>
              <Link
                to="/use-cases"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-all"
              >
                {isRTL ? "حالات الاستخدام" : "Use Cases"}
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-all"
              >
                {isRTL ? "من نحن" : "About"}
              </Link>
              <div className="h-px bg-border my-2" />
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-all"
              >
                {t("login")}
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full mt-2">
                  {t("getStarted")}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Brands/Trust Section */}
      <BrandsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Interactive Demo Section */}
      <div id="demo">
        <InteractiveDemo />
      </div>

      {/* Features Grid */}
      <FeaturesGrid />

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
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* WhatsApp Chatbot */}
      <WhatsAppChatbot />
    </div>
  );
}
