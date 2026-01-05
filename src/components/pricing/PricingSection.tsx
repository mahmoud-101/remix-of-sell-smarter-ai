import { useState } from "react";
import { Check, Sparkles, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
interface PlanFeature {
  ar: string;
  en: string;
}

interface Plan {
  id: string;
  name: { ar: string; en: string };
  price: number | null;
  period: { ar: string; en: string };
  description: { ar: string; en: string };
  features: PlanFeature[];
  icon: React.ElementType;
  popular?: boolean;
  buttonText: { ar: string; en: string };
}

const plans: Plan[] = [
  {
    id: "free",
    name: { ar: "مجاني", en: "Free" },
    price: 0,
    period: { ar: "/شهر", en: "/month" },
    description: { 
      ar: "للمبتدئين والتجربة", 
      en: "For beginners and trial" 
    },
    features: [
      { ar: "5 توليدات شهرياً", en: "5 generations/month" },
      { ar: "جميع أدوات الذكاء الاصطناعي", en: "All AI tools access" },
      { ar: "دعم المجتمع", en: "Community support" },
      { ar: "تاريخ 7 أيام", en: "7-day history" },
    ],
    icon: Sparkles,
    buttonText: { ar: "ابدأ مجاناً", en: "Start Free" },
  },
  {
    id: "start",
    name: { ar: "Start", en: "Start" },
    price: 5,
    period: { ar: "/شهر", en: "/month" },
    description: { 
      ar: "للبائعين الصغار", 
      en: "For small sellers" 
    },
    features: [
      { ar: "50 توليد شهرياً", en: "50 generations/month" },
      { ar: "جميع أدوات الذكاء الاصطناعي", en: "All AI tools access" },
      { ar: "دعم البريد الإلكتروني", en: "Email support" },
      { ar: "تاريخ 30 يوم", en: "30-day history" },
      { ar: "تصدير المحتوى", en: "Content export" },
    ],
    icon: Zap,
    buttonText: { ar: "اشترك الآن", en: "Subscribe Now" },
  },
  {
    id: "pro",
    name: { ar: "Pro", en: "Pro" },
    price: 10,
    period: { ar: "/شهر", en: "/month" },
    description: { 
      ar: "للبائعين المحترفين", 
      en: "For professional sellers" 
    },
    features: [
      { ar: "200 توليد شهرياً", en: "200 generations/month" },
      { ar: "جميع أدوات الذكاء الاصطناعي", en: "All AI tools access" },
      { ar: "دعم أولوية 24/7", en: "24/7 priority support" },
      { ar: "تاريخ غير محدود", en: "Unlimited history" },
      { ar: "تصدير متقدم", en: "Advanced export" },
      { ar: "تحليلات متقدمة", en: "Advanced analytics" },
    ],
    icon: Crown,
    popular: true,
    buttonText: { ar: "اشترك الآن", en: "Subscribe Now" },
  },
  {
    id: "enterprise",
    name: { ar: "Enterprise", en: "Enterprise" },
    price: 20,
    period: { ar: "/شهر", en: "/month" },
    description: { 
      ar: "للفرق والمؤسسات", 
      en: "For teams and enterprises" 
    },
    features: [
      { ar: "توليدات غير محدودة", en: "Unlimited generations" },
      { ar: "جميع أدوات الذكاء الاصطناعي", en: "All AI tools access" },
      { ar: "مدير حساب مخصص", en: "Dedicated account manager" },
      { ar: "تاريخ غير محدود", en: "Unlimited history" },
      { ar: "API كامل", en: "Full API access" },
      { ar: "تدريب مخصص", en: "Custom training" },
      { ar: "SLA مضمون", en: "Guaranteed SLA" },
    ],
    icon: Building2,
    buttonText: { ar: "تواصل معنا", en: "Contact Us" },
  },
];

export default function PricingSection() {
  const { language, isRTL } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (monthlyPrice: number | null) => {
    if (monthlyPrice === null || monthlyPrice === 0) return monthlyPrice;
    if (billingPeriod === "yearly") {
      return Math.round(monthlyPrice * 0.8); // 20% discount
    }
    return monthlyPrice;
  };

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                خطط أسعار
                <span className="gradient-text"> تناسب الجميع</span>
              </>
            ) : (
              <>
                Pricing Plans
                <span className="gradient-text"> for Everyone</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {isRTL
              ? "اختر الخطة المناسبة لحجم أعمالك وابدأ في تنمية مبيعاتك اليوم"
              : "Choose the right plan for your business size and start growing your sales today"}
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-secondary border border-border">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                billingPeriod === "monthly" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRTL ? "شهري" : "Monthly"}
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all relative",
                billingPeriod === "yearly" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRTL ? "سنوي" : "Yearly"}
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in",
                plan.popular 
                  ? "border-primary shadow-lg shadow-primary/10 scale-105 lg:scale-110 z-10" 
                  : "border-border hover:border-primary/50"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                    {isRTL ? "الأكثر شعبية ⭐" : "⭐ Most Popular"}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{plan.name[language]}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description[language]}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold">{isRTL ? "مجاني" : "Free"}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${getPrice(plan.price)}</span>
                      <span className="text-muted-foreground">
                        {billingPeriod === "yearly" 
                          ? (isRTL ? "/شهر (سنوي)" : "/mo (billed yearly)")
                          : plan.period[language]}
                      </span>
                    </>
                  )}
                </div>
                {billingPeriod === "yearly" && plan.price && plan.price > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {isRTL 
                      ? `وفر $${Math.round(plan.price * 12 * 0.2)} سنوياً`
                      : `Save $${Math.round(plan.price * 12 * 0.2)}/year`}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>{feature[language]}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="w-full">
                <Button
                  className="w-full"
                  variant={plan.popular ? "gradient" : "outline"}
                  size="lg"
                >
                  {plan.buttonText[language]}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
            <Check className="w-4 h-4" />
            {isRTL 
              ? "ضمان استرداد الأموال خلال 14 يوم - بدون أسئلة"
              : "14-day money-back guarantee - No questions asked"}
          </div>
        </div>
      </div>
    </section>
  );
}
