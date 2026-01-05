import { FileText, Wand2, Rocket, ArrowDown, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: { ar: "أدخل تفاصيل منتجك", en: "Enter Your Product Details" },
    description: { 
      ar: "أضف اسم المنتج، الوصف، والجمهور المستهدف. كلما أضفت تفاصيل أكثر، كانت النتائج أفضل.", 
      en: "Add product name, description, and target audience. The more details you add, the better the results." 
    },
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: Wand2,
    number: "02",
    title: { ar: "اختر نوع المحتوى", en: "Choose Content Type" },
    description: { 
      ar: "حدد ما تريد: وصف منتج، إعلانات، حملة تسويقية، أو تصميم إعلان.", 
      en: "Select what you want: product description, ads, marketing campaign, or ad design." 
    },
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Rocket,
    number: "03",
    title: { ar: "احصل على نتائج فورية", en: "Get Instant Results" },
    description: { 
      ar: "في ثوانٍ، يولد الذكاء الاصطناعي محتوى احترافي جاهز للنشر والاستخدام.", 
      en: "In seconds, AI generates professional content ready for publishing and use." 
    },
    color: "from-green-500 to-emerald-500"
  }
];

export default function HowItWorksSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-20 px-4 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            {isRTL ? "سهولة الاستخدام" : "Easy to Use"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                كيف <span className="gradient-text">يعمل؟</span>
              </>
            ) : (
              <>
                How It <span className="gradient-text">Works</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "ثلاث خطوات بسيطة للحصول على محتوى تسويقي احترافي"
              : "Three simple steps to get professional marketing content"}
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`absolute top-10 ${isRTL ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0`} />
              )}
              
              <div className="glass-card rounded-2xl p-6 relative z-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group-hover:border-primary/50">
                {/* Number badge */}
                <div className="absolute -top-4 -right-2 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{step.number}</span>
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{step.title[language]}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description[language]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold gradient-text">{step.number}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title[language]}</h3>
                    <p className="text-muted-foreground text-sm">{step.description[language]}</p>
                  </div>
                </div>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-3">
                  <ArrowDown className="w-6 h-6 text-primary/50 animate-bounce" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            {isRTL 
              ? "⏱️ متوسط وقت التوليد: 5-10 ثوانٍ فقط!" 
              : "⏱️ Average generation time: Only 5-10 seconds!"}
          </p>
        </div>
      </div>
    </section>
  );
}
