import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, Zap, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { isRTL } = useLanguage();

  const trustBadges = [
    { icon: CheckCircle2, text: isRTL ? "بدون بطاقة ائتمان" : "No Credit Card" },
    { icon: Shield, text: isRTL ? "آمن 100%" : "100% Secure" },
    { icon: Star, text: isRTL ? "4.9/5 تقييم" : "4.9/5 Rating" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-accent/15 to-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                             linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Side */}
          <div className="space-y-8 text-center lg:text-start animate-fade-in">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm">
              <div className="relative">
                <Zap className="w-4 h-4 text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Zap className="w-4 h-4 text-primary/50" />
                </div>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {isRTL ? "🚀 أكثر من 10,000 متجر يثقون بنا" : "🚀 Trusted by 10,000+ Stores"}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1]">
              {isRTL ? (
                <>
                  <span className="block text-foreground">طلّع حملتك</span>
                  <span className="block gradient-text">الإعلانية كاملة</span>
                  <span className="block text-foreground">في 5 دقائق ⚡</span>
                </>
              ) : (
                <>
                  <span className="block text-foreground">Launch Your</span>
                  <span className="block gradient-text">Complete Campaign</span>
                  <span className="block text-foreground">in 5 Minutes ⚡</span>
                </>
              )}
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {isRTL 
                ? "محتوى براند أزياء جاهز للنشر: وصف منتجات + إعلانات Meta + SEO—مخصص لمتاجر MENA 🎯"
                : "Publish-ready fashion copy: Product descriptions + Meta Ads + SEO—built for MENA stores 🎯"}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group min-w-[280px] h-14 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all">
                  {isRTL ? "🎁 ابدأ مجاناً الآن" : "🎁 Start Free Now"}
                  <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="hero-outline" size="xl" className="group min-w-[180px] h-14">
                  <div className="relative">
                    <Play className="w-5 h-5" />
                    <div className="absolute inset-0 animate-ping opacity-50">
                      <Play className="w-5 h-5" />
                    </div>
                  </div>
                  {isRTL ? "شاهد العرض" : "Watch Demo"}
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start pt-2">
              {trustBadges.map((badge, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Side - Premium Dashboard Preview */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {/* Glow effect behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl opacity-60" />
            
            {/* Main Preview Card */}
            <div className="relative">
              <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-primary/10">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/70" />
                    <div className="w-3 h-3 rounded-full bg-accent/70" />
                    <div className="w-3 h-3 rounded-full bg-primary/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-background/60 rounded-lg px-4 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      sellgenius.app
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 bg-gradient-to-br from-background via-background to-secondary/30">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { value: "+47%", label: isRTL ? "مبيعات" : "Sales", colorClass: "text-primary" },
                      { value: "2.3K", label: isRTL ? "زوار" : "Visitors", colorClass: "text-accent" },
                      { value: "89%", label: isRTL ? "تحويل" : "Convert", colorClass: "text-primary" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-card/50 rounded-xl p-3 text-center border border-border/30">
                        <div className={`text-xl font-bold ${stat.colorClass}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* AI Generation Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                        <Zap className="w-3 h-3 text-primary-foreground" />
                      </div>
                      {isRTL ? "توليد ذكي" : "AI Generation"}
                    </div>
                    
                    <div className="bg-card rounded-xl p-4 border border-primary/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{isRTL ? "إعلان Meta" : "Meta Ad"}</span>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            {isRTL ? "✓ جاهز" : "✓ Ready"}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                          {isRTL 
                            ? "🔥 عرض اليوم فقط! خصم 30% على أحدث تشكيلة ملابس صيفية..."
                            : "🔥 Today Only! 30% off our latest summer collection..."}
                        </p>
                        <div className="flex gap-2">
                          <div className="h-2 flex-1 bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-primary rounded-full" />
                          </div>
                          <span className="text-xs text-muted-foreground">80%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 animate-float hidden md:block" style={{ animationDelay: "0.5s" }}>
                <div className="glass-card rounded-xl px-4 py-3 shadow-lg border border-primary/20">
                  <div className="text-2xl font-bold gradient-text">+40%</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "زيادة المبيعات" : "Sales Boost"}</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-6 animate-float hidden md:block" style={{ animationDelay: "1s" }}>
                <div className="glass-card rounded-xl px-4 py-3 shadow-lg border border-accent/20">
                  <div className="text-2xl font-bold gradient-accent-text">10x</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "أسرع" : "Faster"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Benefits Bar */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {[
              isRTL ? "✅ وصف منتجات احترافي" : "✅ Pro Product Descriptions",
              isRTL ? "✅ إعلانات Meta محسّنة" : "✅ Optimized Meta Ads",
              isRTL ? "✅ تحسين SEO" : "✅ SEO Optimization",
              isRTL ? "✅ دعم عربي كامل" : "✅ Full Arabic Support",
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 bg-card/30 backdrop-blur-sm px-4 py-2.5 rounded-full border border-border/30 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
