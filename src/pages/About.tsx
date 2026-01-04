import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Rocket,
  Award,
  Globe,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { isRTL, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const values = [
    {
      icon: Target,
      title: { ar: "التركيز على العميل", en: "Customer Focus" },
      description: { 
        ar: "نضع نجاح عملائنا في قلب كل قرار نتخذه", 
        en: "We put our customers' success at the heart of every decision we make" 
      }
    },
    {
      icon: Rocket,
      title: { ar: "الابتكار المستمر", en: "Continuous Innovation" },
      description: { 
        ar: "نسعى دائماً لتقديم أحدث تقنيات الذكاء الاصطناعي", 
        en: "We constantly strive to deliver the latest AI technologies" 
      }
    },
    {
      icon: Heart,
      title: { ar: "الشفافية والثقة", en: "Transparency & Trust" },
      description: { 
        ar: "نؤمن بالصدق والوضوح في كل تعاملاتنا", 
        en: "We believe in honesty and clarity in all our dealings" 
      }
    },
    {
      icon: Users,
      title: { ar: "روح الفريق", en: "Team Spirit" },
      description: { 
        ar: "نعمل معاً كفريق واحد لتحقيق أهداف مشتركة", 
        en: "We work together as one team to achieve shared goals" 
      }
    }
  ];

  const team = [
    {
      name: { ar: "أحمد الخالدي", en: "Ahmed Al-Khalidi" },
      role: { ar: "المؤسس والرئيس التنفيذي", en: "Founder & CEO" },
      avatar: "AK"
    },
    {
      name: { ar: "سارة المنصور", en: "Sara Al-Mansour" },
      role: { ar: "رئيسة قسم التكنولوجيا", en: "Chief Technology Officer" },
      avatar: "SM"
    },
    {
      name: { ar: "محمد العتيبي", en: "Mohammed Al-Otaibi" },
      role: { ar: "رئيس قسم المنتجات", en: "Head of Product" },
      avatar: "MO"
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

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl relative text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {isRTL ? (
              <>
                نحن <span className="gradient-text">سيل جينيوس</span>
              </>
            ) : (
              <>
                We are <span className="gradient-text">SellGenius</span>
              </>
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "نؤمن بأن كل بائع يستحق أدوات ذكاء اصطناعي قوية لتنمية تجارته، بغض النظر عن حجم عمله أو ميزانيته."
              : "We believe every seller deserves powerful AI tools to grow their business, regardless of their size or budget."}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="glass-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {isRTL ? "مهمتنا" : "Our Mission"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isRTL
                  ? "تمكين البائعين والمسوقين من إنشاء محتوى تسويقي احترافي يزيد مبيعاتهم، من خلال تقديم أدوات ذكاء اصطناعي سهلة الاستخدام ومتاحة للجميع. نسعى لتوفير ساعات من العمل اليدوي وتحويلها إلى نتائج مذهلة بنقرة زر واحدة."
                  : "Empowering sellers and marketers to create professional marketing content that increases their sales, by providing easy-to-use AI tools accessible to everyone. We strive to save hours of manual work and turn them into amazing results with a single click."}
              </p>
            </div>

            {/* Vision */}
            <div className="glass-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {isRTL ? "رؤيتنا" : "Our Vision"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isRTL
                  ? "أن نصبح المنصة الأولى عالمياً لأدوات التجارة الإلكترونية المدعومة بالذكاء الاصطناعي، مع التركيز على دعم السوق العربي وتقديم حلول مخصصة تناسب احتياجاته الفريدة. نتطلع لمستقبل يكون فيه الذكاء الاصطناعي شريكاً لكل تاجر."
                  : "To become the world's leading platform for AI-powered e-commerce tools, with a focus on supporting the Arabic market and providing customized solutions that meet its unique needs. We look forward to a future where AI is a partner for every merchant."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? (
                <>
                  قصتنا <span className="gradient-text">ورحلتنا</span>
                </>
              ) : (
                <>
                  Our <span className="gradient-text">Story</span>
                </>
              )}
            </h2>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p className="text-center leading-relaxed">
              {isRTL
                ? "بدأت رحلة سيل جينيوس في 2024 عندما لاحظنا الصعوبات التي يواجهها البائعون العرب في كتابة محتوى تسويقي احترافي. كان معظمهم يقضون ساعات في محاولة كتابة وصف منتج واحد، أو يدفعون مبالغ كبيرة لمحترفين. قررنا تغيير ذلك من خلال تسخير قوة الذكاء الاصطناعي لخدمة التجار العرب بلغتهم الأم. اليوم، نفتخر بخدمة أكثر من 10,000 بائع ومسوق يستخدمون منصتنا يومياً لتنمية أعمالهم."
                : "SellGenius's journey began in 2024 when we noticed the difficulties Arab sellers face in writing professional marketing content. Most of them spent hours trying to write a single product description, or paid large amounts to professionals. We decided to change that by harnessing the power of AI to serve Arab merchants in their native language. Today, we proudly serve over 10,000 sellers and marketers who use our platform daily to grow their businesses."}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? (
                <>
                  قيمنا <span className="gradient-text">ومبادئنا</span>
                </>
              ) : (
                <>
                  Our <span className="gradient-text">Values</span>
                </>
              )}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title[language]}</h3>
                <p className="text-sm text-muted-foreground">{value.description[language]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? (
                <>
                  فريق <span className="gradient-text">القيادة</span>
                </>
              ) : (
                <>
                  Leadership <span className="gradient-text">Team</span>
                </>
              )}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  {member.avatar}
                </div>
                <h3 className="font-semibold text-lg">{member.name[language]}</h3>
                <p className="text-muted-foreground">{member.role[language]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: { ar: "مستخدم نشط", en: "Active Users" } },
              { value: "500K+", label: { ar: "محتوى مولد", en: "Content Generated" } },
              { value: "15+", label: { ar: "دولة", en: "Countries" } },
              { value: "4.9", label: { ar: "تقييم العملاء", en: "Customer Rating" } },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label[language]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <Award className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            {isRTL ? "انضم لعائلة سيل جينيوس" : "Join the SellGenius Family"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isRTL
              ? "ابدأ رحلتك معنا اليوم واكتشف كيف يمكن للذكاء الاصطناعي تحويل تجارتك."
              : "Start your journey with us today and discover how AI can transform your business."}
          </p>
          <Link to="/signup">
            <Button variant="hero" size="xl" className="group">
              {isRTL ? "ابدأ مجاناً" : "Get Started Free"}
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
