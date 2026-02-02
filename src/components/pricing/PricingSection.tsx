import { useState } from "react";
import { Check, X, Sparkles, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { PAYMENT_LINKS, PLAN_FEATURES, getPaymentUrl, PlanType, CURRENCY, formatPrice } from "@/lib/paymentConfig";

interface Plan {
  id: PlanType;
  paymentKey?: 'pro' | 'business';
  icon: React.ElementType;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    icon: Sparkles,
  },
  {
    id: "pro",
    paymentKey: "pro",
    icon: Crown,
    popular: true,
  },
  {
    id: "business",
    paymentKey: "business",
    icon: Building2,
  },
];

export default function PricingSection() {
  const { isRTL } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (plan: Plan) => {
    const planData = PLAN_FEATURES[plan.id];
    if (billingPeriod === "yearly" && planData.yearlyPrice) {
      return Math.round(planData.yearlyPrice / 12);
    }
    return planData.price;
  };

  const getYearlySavings = (plan: Plan) => {
    const planData = PLAN_FEATURES[plan.id];
    if (!planData.price || planData.price === 0) return 0;
    const monthlyTotal = planData.price * 12;
    const yearlyPrice = planData.yearlyPrice || monthlyTotal;
    return Math.round(monthlyTotal - yearlyPrice);
  };

  const handleUpgrade = (plan: Plan) => {
    if (!plan.paymentKey) {
      // Free plan - redirect to signup
      window.location.href = '/signup';
      return;
    }
    const url = getPaymentUrl(plan.paymentKey);
    window.open(url, '_blank');
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {isRTL ? (
              <>
                اختار
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> الباقة المناسبة</span>
              </>
            ) : (
              <>
                Choose Your
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Perfect Plan</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {isRTL
              ? "ابدأ دلوقتي وكبّر مبيعاتك مع أدوات الذكاء الاصطناعي"
              : "Start now and grow your sales with AI-powered tools"}
          </p>
          
          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-secondary border border-border shadow-lg">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-semibold transition-all",
                billingPeriod === "monthly" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRTL ? "شهري" : "Monthly"}
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-semibold transition-all relative",
                billingPeriod === "yearly" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRTL ? "سنوي" : "Yearly"}
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                {isRTL ? 'وفر 17%' : 'Save 17%'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const planData = PLAN_FEATURES[plan.id];
            const price = getPrice(plan);
            const savings = getYearlySavings(plan);
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in",
                  plan.popular 
                    ? "border-primary border-4 shadow-xl shadow-primary/20 scale-105 z-10" 
                    : "border-border hover:border-primary/50"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge */}
                {planData.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={cn(
                      "text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg",
                      plan.id === 'pro' 
                        ? "bg-primary" 
                        : "bg-gradient-to-r from-purple-500 to-pink-600"
                    )}>
                      ⭐ {isRTL ? planData.badgeAr : planData.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6 mt-2">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    <plan.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{isRTL ? planData.nameAr : planData.name}</h3>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-4xl font-bold",
                      plan.popular && "text-primary"
                    )}>
                      {price === 0 ? (isRTL ? 'مجاني' : 'Free') : price}
                    </span>
                    {price > 0 && (
                      <>
                        <span className="text-xl font-semibold text-muted-foreground">
                          {isRTL ? CURRENCY.symbol : CURRENCY.symbolEn}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /{isRTL ? 'شهر' : 'month'}
                        </span>
                      </>
                    )}
                  </div>
                  {billingPeriod === "yearly" && savings > 0 && (
                    <p className="text-green-600 text-sm font-semibold mt-2">
                      {isRTL 
                        ? `أو ${planData.yearlyPrice} ${CURRENCY.symbol}/سنة (وفر ${savings} ${CURRENCY.symbol})`
                        : `or ${CURRENCY.symbolEn} ${planData.yearlyPrice}/year (save ${CURRENCY.symbolEn} ${savings})`}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {(isRTL ? planData.featuresAr : planData.features).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full py-6 text-lg font-bold transition-all",
                    plan.popular && "bg-primary hover:bg-primary/90"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleUpgrade(plan)}
                >
                  {plan.id === 'free' 
                    ? (isRTL ? 'ابدأ مجاناً' : 'Start Free')
                    : (isRTL ? 'اشترك الآن' : 'Subscribe Now')}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>{isRTL ? 'دفع آمن عبر Nzmly' : 'Secure Payment via Nzmly'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💳</span>
              <span>{isRTL ? 'جميع البطاقات مقبولة' : 'All Cards Accepted'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>↩️</span>
              <span>{isRTL ? 'إلغاء في أي وقت' : 'Cancel Anytime'}</span>
            </div>
          </div>
        </div>

        {/* Money back guarantee */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Check className="w-4 h-4" />
            {isRTL 
              ? "ضمان استرداد الأموال خلال 14 يوم"
              : "14-day money-back guarantee"}
          </div>
        </div>
      </div>
    </section>
  );
}
