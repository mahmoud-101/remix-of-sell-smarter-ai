import { Languages, Zap, Shield, Headphones, Palette, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const uniqueFeatures = [
  {
    icon: Languages,
    title: { ar: "دعم عربي متقدم", en: "Advanced Arabic Support" },
    description: { 
      ar: "ذكاء اصطناعي مدرب خصيصاً على السوق العربي، يفهم الثقافة والسياق المحلي وينتج محتوى عربي طبيعي واحترافي.", 
      en: "AI specially trained on the Arabic market, understands local culture and context, producing natural and professional Arabic content." 
    },
    highlight: { ar: "الأول عربياً", en: "First in Arabic" }
  },
  {
    icon: Palette,
    title: { ar: "تصميم إعلانات بالذكاء الاصطناعي", en: "AI Ad Design" },
    description: { 
      ar: "ميزة فريدة لتصميم إعلانات بصرية مذهلة من صورة المنتج فقط، مع خيارات أنماط متعددة.", 
      en: "Unique feature to design stunning visual ads from just a product image, with multiple style options." 
    },
    highlight: { ar: "ميزة حصرية", en: "Exclusive Feature" }
  },
  {
    icon: Brain,
    title: { ar: "تعلم من أدائك", en: "Learns From Your Performance" },
    description: { 
      ar: "كلما استخدمت المنصة أكثر، كلما فهمت علامتك التجارية بشكل أفضل وقدمت نتائج مخصصة لك.", 
      en: "The more you use the platform, the better it understands your brand and delivers customized results." 
    },
    highlight: { ar: "ذكاء متطور", en: "Smart AI" }
  },
  {
    icon: Zap,
    title: { ar: "سرعة فائقة", en: "Lightning Fast" },
    description: { 
      ar: "احصل على محتوى احترافي في ثوانٍ بدلاً من ساعات. وفر وقتك للتركيز على تنمية عملك.", 
      en: "Get professional content in seconds instead of hours. Save your time to focus on growing your business." 
    },
    highlight: { ar: "ثوانٍ فقط", en: "Seconds Only" }
  },
  {
    icon: Shield,
    title: { ar: "خصوصية كاملة", en: "Complete Privacy" },
    description: { 
      ar: "بياناتك ومحتواك محمية بأعلى معايير الأمان. لا نشارك معلوماتك مع أي طرف ثالث.", 
      en: "Your data and content are protected with the highest security standards. We don't share your information with any third party." 
    },
    highlight: { ar: "آمن 100%", en: "100% Secure" }
  },
  {
    icon: Headphones,
    title: { ar: "دعم فني على مدار الساعة", en: "24/7 Technical Support" },
    description: { 
      ar: "فريق دعم متخصص متاح دائماً للإجابة على استفساراتك ومساعدتك في تحقيق أقصى استفادة.", 
      en: "Specialized support team always available to answer your questions and help you get the most value." 
    },
    highlight: { ar: "دعم عربي", en: "Arabic Support" }
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

              <h3 className="text-lg font-bold mb-3">{feature.title[language]}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description[language]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
