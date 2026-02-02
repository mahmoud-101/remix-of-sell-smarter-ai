import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileText, 
  Megaphone, 
  BarChart3, 
  Image, 
  Video, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Feature {
  icon: React.ElementType;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  gradient: string;
  badge?: { ar: string; en: string };
  link: string;
}

const features: Feature[] = [
  {
    icon: FileText,
    title: { ar: "وصف المنتجات", en: "Product Descriptions" },
    description: { 
      ar: "وصف منتجات أزياء احترافي يزيد التحويل ويقلل المرتجعات", 
      en: "Professional fashion product copy that converts and reduces returns" 
    },
    gradient: "from-green-500 to-emerald-600",
    badge: { ar: "الأكثر استخداماً", en: "Most Popular" },
    link: "/dashboard"
  },
  {
    icon: Megaphone,
    title: { ar: "كاتب الإعلانات", en: "Ad Copywriter" },
    description: { 
      ar: "إعلانات Meta عالية التحويل مع زوايا إعلانية متعددة", 
      en: "High-converting Meta ads with multiple ad angles" 
    },
    gradient: "from-orange-500 to-red-500",
    link: "/ads-copy"
  },
  {
    icon: BarChart3,
    title: { ar: "خبير السيو", en: "SEO Expert" },
    description: { 
      ar: "حسّن منتجاتك للظهور #1 في جوجل", 
      en: "Optimize products to rank #1 on Google" 
    },
    gradient: "from-blue-500 to-cyan-500",
    link: "/seo-analyzer"
  },
  {
    icon: Image,
    title: { ar: "استوديو الصور", en: "Image Studio" },
    description: { 
      ar: "صور منتجات احترافية بالذكاء الاصطناعي", 
      en: "Professional product photos with AI" 
    },
    gradient: "from-purple-500 to-pink-500",
    link: "/image-studio"
  },
  {
    icon: Video,
    title: { ar: "استوديو الريلز", en: "Reels Studio" },
    description: { 
      ar: "فيديوهات قصيرة جذابة لمنتجاتك", 
      en: "Engaging short videos for your products" 
    },
    gradient: "from-pink-500 to-rose-500",
    link: "/reels-generator"
  },
  {
    icon: MessageSquare,
    title: { ar: "مستشار الأعمال", en: "Business Advisor" },
    description: { 
      ar: "استشارات ذكية لتنمية متجرك", 
      en: "Smart advice to grow your store" 
    },
    gradient: "from-amber-500 to-orange-500",
    link: "/growth-console"
  },
];

export default function FeaturesGrid() {
  const { language, isRTL } = useLanguage();

  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container mx-auto max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="gradient-text">{isRTL ? "أدوات قوية" : "Powerful Tools"}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black">
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
              ? "6 أدوات ذكية لمساعدتك في إنشاء محتوى احترافي لمتجرك"
              : "6 smart tools to help you create professional content for your store"}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-full glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 overflow-hidden">
                {/* Badge */}
                {feature.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                      {feature.badge[language]}
                    </span>
                  </div>
                )}

                {/* Gradient glow on hover */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-2xl`} />

                {/* Content */}
                <div className="relative space-y-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5`}>
                    <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
                      <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {feature.title[language]}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description[language]}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    {isRTL ? "ابدأ الآن" : "Get Started"}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/signup">
            <Button variant="hero" size="lg" className="group">
              {isRTL ? "جرب جميع الأدوات مجاناً" : "Try All Tools Free"}
              <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
