import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CTASection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      
      <div className="container mx-auto max-w-5xl relative">
        <div className="relative">
          {/* Gradient border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-[2rem] opacity-20 blur-sm" />
          
          {/* Main Card */}
          <div className="relative glass-card rounded-[2rem] p-8 md:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-2xl" />
            
            {/* Floating icons */}
            <div className="absolute top-8 left-8 animate-float hidden md:block">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-8 right-8 animate-float hidden md:block" style={{ animationDelay: "1s" }}>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
            </div>

            {/* Content */}
            <div className="relative space-y-8">
              {/* Icon */}
              <div className="inline-flex">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5">
                    <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
                      <Zap className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl animate-pulse" />
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight">
                {isRTL ? (
                  <>
                    جاهز تبدأ تبيع
                    <span className="gradient-text"> أكتر؟</span>
                    <br />
                    <span className="text-4xl md:text-5xl">🚀</span>
                  </>
                ) : (
                  <>
                    Ready to Sell
                    <span className="gradient-text"> More?</span>
                    <br />
                    <span className="text-4xl md:text-5xl">🚀</span>
                  </>
                )}
              </h2>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {isRTL 
                  ? "انضم لأكثر من 10,000 متجر يستخدمون سيل جينيوس لمضاعفة مبيعاتهم. ابدأ مجاناً بدون بطاقة ائتمان!"
                  : "Join 10,000+ stores using SellGenius to double their sales. Start free with no credit card!"}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 py-4">
                {[
                  { value: "+40%", label: isRTL ? "زيادة المبيعات" : "Sales Increase" },
                  { value: "5min", label: isRTL ? "لإنشاء حملة" : "Campaign Setup" },
                  { value: "24/7", label: isRTL ? "دعم متواصل" : "Always Available" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-black gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex flex-col items-center gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="group min-w-[320px] h-16 text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                    {isRTL ? "🎁 ابدأ مجاناً الآن" : "🎁 Start Free Now"}
                    <ArrowRight className={`w-6 h-6 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-2" : "group-hover:translate-x-2"}`} />
                  </Button>
                </Link>
                
                {/* Trust text */}
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {isRTL 
                    ? "بدون بطاقة ائتمان • إلغاء في أي وقت • بدون التزام" 
                    : "No credit card • Cancel anytime • No commitment"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
