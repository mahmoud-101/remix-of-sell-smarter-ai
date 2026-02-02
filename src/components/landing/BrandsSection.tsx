import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, CheckCircle, Award, Zap, Globe } from "lucide-react";
import shopifyLogoUrl from "@/assets/shopify-logo.svg";

export default function BrandsSection() {
  const { isRTL } = useLanguage();

  const platforms = [
    { name: "Shopify", logo: shopifyLogoUrl },
  ];

  const trustIndicators = [
    { icon: Lock, text: isRTL ? "SSL مشفر" : "SSL Encrypted" },
    { icon: Shield, text: isRTL ? "دفع آمن" : "Secure Payments" },
    { icon: CheckCircle, text: isRTL ? "GDPR متوافق" : "GDPR Compliant" },
    { icon: Award, text: isRTL ? "موثوق" : "Verified" },
  ];

  const stats = [
    { value: "10K+", label: isRTL ? "متجر نشط" : "Active Stores" },
    { value: "500K+", label: isRTL ? "محتوى تم توليده" : "Content Generated" },
    { value: "98%", label: isRTL ? "رضا العملاء" : "Satisfaction" },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-secondary/30" />
      
      <div className="container mx-auto max-w-6xl relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {isRTL ? "موثوق من الآلاف" : "TRUSTED BY THOUSANDS"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold">
            {isRTL 
              ? "متوافق مع أكبر منصات التجارة الإلكترونية" 
              : "Compatible with Leading E-commerce Platforms"}
          </h2>
        </div>

        {/* Platform Logos */}
        <div className="flex justify-center items-center gap-8 mb-12">
          {platforms.map((platform, index) => (
            <div 
              key={index}
              className="group relative"
            >
              <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-8 py-6 hover:border-primary/30 transition-all hover:shadow-lg">
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="h-10 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
          
          {/* Coming Soon Badges */}
          <div className="flex gap-4">
            {["WooCommerce", "Salla"].map((name, i) => (
              <div 
                key={i}
                className="flex flex-col items-center gap-2 opacity-50"
              >
                <div className="bg-secondary/50 border border-border/30 rounded-xl px-6 py-4">
                  <span className="text-sm font-medium text-muted-foreground">{name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{isRTL ? "قريباً" : "Coming Soon"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="glass-card rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-black gradient-text mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {trustIndicators.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2.5 bg-card/50 backdrop-blur-sm border border-border/30 rounded-full text-sm text-muted-foreground hover:border-primary/30 transition-all"
            >
              <item.icon className="w-4 h-4 text-primary" />
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
