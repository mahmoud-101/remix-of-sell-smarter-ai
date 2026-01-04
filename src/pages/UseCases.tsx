import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Store, 
  Megaphone, 
  Building2, 
  ShoppingBag,
  Briefcase,
  Shirt,
  Laptop,
  Home,
  Heart,
  Globe,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function UseCases() {
  const { isRTL, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const useCases = [
    {
      icon: Store,
      title: { ar: "متاجر التجزئة الإلكترونية", en: "E-commerce Retail Stores" },
      description: { 
        ar: "أنشئ وصف منتجات جذاب لآلاف المنتجات في دقائق بدلاً من أيام", 
        en: "Create engaging product descriptions for thousands of products in minutes instead of days" 
      },
      benefits: {
        ar: ["زيادة معدلات التحويل بنسبة 40%", "توفير 10+ ساعات أسبوعياً", "تحسين SEO تلقائياً"],
        en: ["Increase conversion rates by 40%", "Save 10+ hours weekly", "Automatic SEO optimization"]
      },
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: Megaphone,
      title: { ar: "وكالات التسويق الرقمي", en: "Digital Marketing Agencies" },
      description: { 
        ar: "أدر حملات متعددة لعملاء مختلفين بكفاءة عالية", 
        en: "Manage multiple campaigns for different clients with high efficiency" 
      },
      benefits: {
        ar: ["إنتاجية أعلى 5 مرات", "خدمة عملاء أكثر", "تقليل التكاليف التشغيلية"],
        en: ["5x higher productivity", "Serve more clients", "Reduce operational costs"]
      },
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      icon: Building2,
      title: { ar: "الشركات الناشئة", en: "Startups" },
      description: { 
        ar: "أطلق منتجاتك بسرعة مع محتوى تسويقي احترافي بميزانية محدودة", 
        en: "Launch your products quickly with professional marketing content on a limited budget" 
      },
      benefits: {
        ar: ["إطلاق أسرع للسوق", "توفير ميزانية التوظيف", "جودة احترافية بتكلفة أقل"],
        en: ["Faster market launch", "Save hiring budget", "Professional quality at lower cost"]
      },
      color: "bg-green-500/10 text-green-500"
    },
    {
      icon: Briefcase,
      title: { ar: "رواد الأعمال المستقلون", en: "Solo Entrepreneurs" },
      description: { 
        ar: "كن فريقاً كاملاً بمفردك مع مساعد ذكاء اصطناعي متخصص", 
        en: "Be a complete team by yourself with a specialized AI assistant" 
      },
      benefits: {
        ar: ["لا حاجة لفريق تسويق", "محتوى على مدار الساعة", "تركيز على ما تجيده"],
        en: ["No marketing team needed", "Content around the clock", "Focus on what you do best"]
      },
      color: "bg-orange-500/10 text-orange-500"
    }
  ];

  const industries = [
    { icon: Shirt, name: { ar: "الأزياء والملابس", en: "Fashion & Apparel" } },
    { icon: Laptop, name: { ar: "الإلكترونيات", en: "Electronics" } },
    { icon: Home, name: { ar: "المنزل والديكور", en: "Home & Decor" } },
    { icon: Heart, name: { ar: "الصحة والجمال", en: "Health & Beauty" } },
    { icon: ShoppingBag, name: { ar: "المستلزمات اليومية", en: "Daily Essentials" } },
    { icon: Store, name: { ar: "الأغذية والمشروبات", en: "Food & Beverages" } },
  ];

  const caseStudies = [
    {
      company: { ar: "متجر أناقة", en: "Anaqah Store" },
      industry: { ar: "أزياء نسائية", en: "Women's Fashion" },
      result: { 
        ar: "زيادة المبيعات 85% خلال 3 أشهر", 
        en: "85% sales increase in 3 months" 
      },
      quote: {
        ar: "سيل جينيوس وفر علينا تكلفة توظيف كاتب محتوى وأعطانا نتائج أفضل!",
        en: "SellGenius saved us the cost of hiring a copywriter and gave us better results!"
      },
      avatar: "AS"
    },
    {
      company: { ar: "تك زون", en: "TechZone" },
      industry: { ar: "إلكترونيات", en: "Electronics" },
      result: { 
        ar: "تخفيض وقت إنشاء المحتوى 90%", 
        en: "90% reduction in content creation time" 
      },
      quote: {
        ar: "كنا نقضي أيام على وصف 100 منتج، الآن ننتهي في ساعة واحدة.",
        en: "We used to spend days on 100 product descriptions, now we finish in one hour."
      },
      avatar: "TZ"
    },
    {
      company: { ar: "وكالة نجاح", en: "Najah Agency" },
      industry: { ar: "تسويق رقمي", en: "Digital Marketing" },
      result: { 
        ar: "مضاعفة عدد العملاء دون زيادة الفريق", 
        en: "Doubled clients without expanding team" 
      },
      quote: {
        ar: "استطعنا خدمة ضعف عدد العملاء بنفس الفريق بفضل سيل جينيوس.",
        en: "We were able to serve twice as many clients with the same team thanks to SellGenius."
      },
      avatar: "NA"
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl gradient-text">
              {isRTL ? "سيل جينيوس" : "SellGenius"}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isRTL ? "المميزات" : "Features"}
            </Link>
            <Link to="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isRTL ? "الأسعار" : "Pricing"}
            </Link>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === "ar" ? "EN" : "ع"}
            </button>
            <Link to="/signup">
              <Button variant="hero" size="sm">
                {isRTL ? "ابدأ الآن" : "Get Started"}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl relative text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {isRTL ? (
              <>
                حالات <span className="gradient-text">الاستخدام</span>
              </>
            ) : (
              <>
                Use <span className="gradient-text">Cases</span>
              </>
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "اكتشف كيف تستخدم الشركات والأفراد سيل جينيوس لتحقيق نتائج استثنائية في مجالات مختلفة."
              : "Discover how businesses and individuals use SellGenius to achieve exceptional results across different fields."}
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div 
                key={index}
                className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl ${useCase.color.split(' ')[0]} flex items-center justify-center mb-6`}>
                  <useCase.icon className={`w-7 h-7 ${useCase.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{useCase.title[language]}</h3>
                <p className="text-muted-foreground mb-6">{useCase.description[language]}</p>
                <ul className="space-y-3">
                  {useCase.benefits[language].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? (
                <>
                  الصناعات <span className="gradient-text">التي نخدمها</span>
                </>
              ) : (
                <>
                  Industries <span className="gradient-text">We Serve</span>
                </>
              )}
            </h2>
            <p className="text-muted-foreground">
              {isRTL
                ? "سيل جينيوس مصمم ليعمل مع جميع أنواع المنتجات والصناعات"
                : "SellGenius is designed to work with all types of products and industries"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <industry.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">{industry.name[language]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? (
                <>
                  قصص <span className="gradient-text">النجاح</span>
                </>
              ) : (
                <>
                  Success <span className="gradient-text">Stories</span>
                </>
              )}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {study.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{study.company[language]}</h4>
                    <p className="text-sm text-muted-foreground">{study.industry[language]}</p>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg px-4 py-2 mb-4">
                  <p className="text-primary font-semibold text-sm">{study.result[language]}</p>
                </div>
                <p className="text-muted-foreground text-sm italic">
                  "{study.quote[language]}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isRTL ? "مستعد لتحقيق نتائج مماثلة؟" : "Ready to Achieve Similar Results?"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isRTL
              ? "ابدأ تجربتك المجانية اليوم واكتشف الفرق بنفسك."
              : "Start your free trial today and discover the difference yourself."}
          </p>
          <Link to="/signup">
            <Button variant="hero" size="xl" className="group">
              {isRTL ? "ابدأ تجربة مجانية" : "Start Free Trial"}
              <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 {isRTL ? "سيل جينيوس" : "SellGenius"}. {isRTL ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
