import { FileText, Wand2, Rocket, ArrowDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: { ar: "أدخل تفاصيل منتجك", en: "Enter Your Product Details" },
    description: { 
      ar: "أضف اسم المنتج، الوصف، والجمهور المستهدف. كلما أضفت تفاصيل أكثر، كانت النتائج أفضل.", 
      en: "Add product name, description, and target audience. The more details you add, the better the results." 
    }
  },
  {
    icon: Wand2,
    number: "02",
    title: { ar: "اختر نوع المحتوى", en: "Choose Content Type" },
    description: { 
      ar: "حدد ما تريد: وصف منتج، إعلانات، حملة تسويقية، أو تصميم إعلان.", 
      en: "Select what you want: product description, ads, marketing campaign, or ad design." 
    }
  },
  {
    icon: Rocket,
    number: "03",
    title: { ar: "احصل على نتائج فورية", en: "Get Instant Results" },
    description: { 
      ar: "في ثوانٍ، يولد الذكاء الاصطناعي محتوى احترافي جاهز للنشر والاستخدام.", 
      en: "In seconds, AI generates professional content ready for publishing and use." 
    }
  }
];

export default function HowItWorksSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
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

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary hidden md:block" style={{ transform: 'translateX(-50%)' }} />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-2 gap-8 items-center">
                  {/* Content */}
                  <div className={`${index % 2 === 0 ? 'md:text-end' : 'md:order-2'}`}>
                    <div className={`inline-block ${index % 2 === 0 ? '' : 'text-start'}`}>
                      <span className="text-5xl font-bold gradient-text opacity-50">{step.number}</span>
                      <h3 className="text-xl font-bold mt-2 mb-3">{step.title[language]}</h3>
                      <p className="text-muted-foreground max-w-sm">{step.description[language]}</p>
                    </div>
                  </div>

                  {/* Icon (Center) */}
                  <div className={`${index % 2 === 0 ? '' : 'md:order-1'} flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center z-10 relative bg-background">
                        <step.icon className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden glass-card rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <span className="text-3xl font-bold gradient-text opacity-50">{step.number}</span>
                      <h3 className="text-lg font-bold mb-2">{step.title[language]}</h3>
                      <p className="text-muted-foreground text-sm">{step.description[language]}</p>
                    </div>
                  </div>
                </div>

                {/* Arrow between steps (mobile) */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4 md:hidden">
                    <ArrowDown className="w-6 h-6 text-primary/50" />
                  </div>
                )}

                {/* Spacing for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block h-24" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
