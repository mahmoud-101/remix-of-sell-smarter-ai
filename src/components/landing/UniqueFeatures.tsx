import { FileText, Megaphone, Video, Palette, Search, Target, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const uniqueFeatures = [
  {
    icon: Palette,
    title: { ar: "مصنع الكريتيفات", en: "Creative Factory" },
    description: { 
      ar: "صمم صور منتجات وإعلانات سوشيال ميديا احترافية بضغطة زر واحدة باستخدام الذكاء الاصطناعي.", 
      en: "Design professional product images and social media ads with one click using AI." 
    },
    highlight: { ar: "الأكثر استخداماً", en: "Most Popular" },
    plan: { ar: "جميع الباقات", en: "All Plans" }
  },
  {
    icon: FileText,
    title: { ar: "كاتب وصف المنتجات", en: "Product Description Writer" },
    description: { 
      ar: "اكتب وصف بيعي احترافي يزود مبيعات متجرك مع 3 نسخ A/B Testing لكل منتج.", 
      en: "Write professional sales copy that boosts your store's sales with 3 A/B Testing variations." 
    },
    highlight: { ar: "أساسي", en: "Essential" },
    plan: { ar: "جميع الباقات", en: "All Plans" }
  },
  {
    icon: Megaphone,
    title: { ar: "كاتب الإعلانات", en: "Ad Copywriter" },
    description: { 
      ar: "نصوص إعلانية مقنعة لفيسبوك، إنستجرام، وتيك توك تحول المتصفحين لمشترين.", 
      en: "Persuasive ad copies for Facebook, Instagram & TikTok that convert browsers to buyers." 
    },
    highlight: { ar: "متعدد المنصات", en: "Multi-Platform" },
    plan: { ar: "جميع الباقات", en: "All Plans" }
  },
  {
    icon: Video,
    title: { ar: "صانع سكريبتات الفيديو", en: "Video Script Maker" },
    description: { 
      ar: "اكتب سكريبتات ريلز وتيك توك فيرال (Viral) تجذب الملايين لمنتجاتك.", 
      en: "Write viral Reels and TikTok scripts that attract millions to your products." 
    },
    highlight: { ar: "جديد 🔥", en: "New 🔥" },
    plan: { ar: "Start وأعلى", en: "Start & Above" }
  },
  {
    icon: Search,
    title: { ar: "خبير SEO المتاجر", en: "E-commerce SEO Expert" },
    description: { 
      ar: "حسن منتجاتك لتظهر في الصفحة الأولى من جوجل وزود زيارات متجرك مجاناً.", 
      en: "Optimize products to rank #1 on Google and increase your store traffic for free." 
    },
    highlight: { ar: "مجاني", en: "Free Traffic" },
    plan: { ar: "Start وأعلى", en: "Start & Above" }
  },
  {
    icon: Palette,
    title: { ar: "مصمم الإعلانات AI", en: "AI Ad Designer" },
    description: { 
      ar: "صمم إعلانات بصرية مذهلة من صورة المنتج فقط مع خيارات أنماط وخلفيات متعددة.", 
      en: "Design stunning visual ads from just a product image with multiple styles and backgrounds." 
    },
    highlight: { ar: "حصري", en: "Exclusive" },
    plan: { ar: "Pro وأعلى", en: "Pro & Above" }
  },
  {
    icon: Target,
    title: { ar: "تحليل المنافسين", en: "Competitor Analysis" },
    description: { 
      ar: "تجسس على إعلانات منافسيك واعرف استراتيجياتهم الناجحة لتتفوق عليهم.", 
      en: "Spy on competitors' ads and discover their winning strategies to outperform them." 
    },
    highlight: { ar: "Business فقط", en: "Business Only" },
    plan: { ar: "باقة Business", en: "Business Plan" }
  },
  {
    icon: TrendingUp,
    title: { ar: "البحث عن المنتجات الرابحة", en: "Winning Product Research" },
    description: { 
      ar: "اكتشف المنتجات الرابحة والترندات الجديدة قبل منافسيك.", 
      en: "Discover winning products and new trends before your competitors." 
    },
    highlight: { ar: "Business فقط", en: "Business Only" },
    plan: { ar: "باقة Business", en: "Business Plan" }
  },
  {
    icon: Users,
    title: { ar: "إدارة العملاء", en: "Leads Management" },
    description: { 
      ar: "نظم وتابع عملاءك وطلباتك في مكان واحد مع تتبع كامل للمبيعات.", 
      en: "Organize and track your customers and orders in one place with full sales tracking." 
    },
    highlight: { ar: "Business فقط", en: "Business Only" },
    plan: { ar: "باقة Business", en: "Business Plan" }
  }
];

export default function UniqueFeatures() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                ما يميزنا عن <span className="gradient-text">الآخرين</span>
              </>
            ) : (
              <>
                What Makes Us <span className="gradient-text">Different</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "مميزات فريدة لن تجدها في أي منصة أخرى"
              : "Unique features you won't find on any other platform"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueFeatures.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Highlight Badge */}
              <div className="absolute -top-3 right-4">
                <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {feature.highlight[language]}
                </span>
              </div>

              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-lg font-bold mb-2">{feature.title[language]}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                {feature.description[language]}
              </p>
              <span className="text-xs text-primary font-medium">
                {feature.plan[language]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
