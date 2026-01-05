import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Sparkles, XCircle, CheckCircle2 } from "lucide-react";

const examples = [
  {
    id: 1,
    category: { ar: "وصف منتج", en: "Product Description" },
    before: {
      ar: "سماعات بلوتوث جيدة. صوت جيد. بطارية طويلة. اشتري الآن.",
      en: "Good Bluetooth headphones. Good sound. Long battery. Buy now."
    },
    after: {
      ar: "🎧 اغمر نفسك في عالم من الصوت النقي! سماعاتنا اللاسلكية المتطورة تمنحك تجربة استماع استثنائية مع صوت كريستالي HD، بطارية خارقة تدوم 24 ساعة متواصلة، وتصميم أنيق يرافقك في كل مكان. ✨ احصل عليها الآن واستمتع بتوصيل مجاني!",
      en: "🎧 Immerse yourself in a world of pure sound! Our advanced wireless headphones deliver an exceptional listening experience with crystal-clear HD audio, an incredible 24-hour battery life, and a sleek design that goes wherever you go. ✨ Get yours now with FREE shipping!"
    },
    improvement: { ar: "زيادة التحويلات بـ 40%", en: "40% more conversions" }
  },
  {
    id: 2,
    category: { ar: "إعلان سوشيال ميديا", en: "Social Media Ad" },
    before: {
      ar: "خصم على الملابس. أسعار جيدة. تسوق معنا.",
      en: "Discount on clothes. Good prices. Shop with us."
    },
    after: {
      ar: "⚡ آخر يومين! خصم 50% على تشكيلة الصيف 🔥\n\n👗 ملابس عصرية بأسعار لا تُصدق\n✅ توصيل مجاني فوق 100 ر.س\n⏰ العرض ينتهي الجمعة!\n\n🛒 تسوقي الآن قبل نفاد الكمية →",
      en: "⚡ Last 2 days! 50% OFF Summer Collection 🔥\n\n👗 Trendy clothes at unbelievable prices\n✅ FREE shipping over $50\n⏰ Offer ends Friday!\n\n🛒 Shop now before it's gone →"
    },
    improvement: { ar: "ضعف معدل النقرات", en: "2x click-through rate" }
  },
  {
    id: 3,
    category: { ar: "نص إعلان جوجل", en: "Google Ad Copy" },
    before: {
      ar: "برنامج محاسبة للشركات - اشترك الآن",
      en: "Accounting software for companies - Subscribe now"
    },
    after: {
      ar: "برنامج محاسبة ذكي | وفر 10 ساعات أسبوعياً\n★★★★★ موثوق من +5000 شركة | تجربة مجانية 14 يوم\nفواتير • رواتب • تقارير تلقائية | ابدأ الآن ←",
      en: "Smart Accounting Software | Save 10 Hours/Week\n★★★★★ Trusted by 5000+ Businesses | 14-Day Free Trial\nInvoicing • Payroll • Auto Reports | Start Now ←"
    },
    improvement: { ar: "تكلفة نقرة أقل 30%", en: "30% lower CPC" }
  }
];

export default function BeforeAfterSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                شاهد الفرق
                <span className="gradient-text"> بنفسك</span>
              </>
            ) : (
              <>
                See the Difference
                <span className="gradient-text"> Yourself</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "قارن بين المحتوى العادي والمحتوى المُولَّد بالذكاء الاصطناعي"
              : "Compare regular content with AI-generated content"}
          </p>
        </div>

        <div className="space-y-8">
          {examples.map((example, index) => (
            <div
              key={example.id}
              className="glass-card rounded-2xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Category header */}
              <div className="px-6 py-3 bg-secondary/50 border-b border-border/50 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {example.category[language]}
                </span>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {example.improvement[language]}
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start">
                  {/* Before */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">
                        {isRTL ? "قبل" : "Before"}
                      </span>
                    </div>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                        {example.before[language]}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center pt-10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">
                        {isRTL ? "بعد" : "After"}
                      </span>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 relative">
                      <div className="absolute -top-2 -right-2">
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                        {example.after[language]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
