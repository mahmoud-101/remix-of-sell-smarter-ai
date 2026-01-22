import { useState } from "react";
import { Check, X, Sparkles, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { PAYMENT_LINKS, PLAN_FEATURES, getPaymentUrl } from "@/lib/paymentConfig";

interface Plan {
  id: 'free' | 'pro' | 'business';
  paymentKey: 'starter' | 'pro' | 'business';
  icon: React.ElementType;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    paymentKey: "starter",
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
  const { language, isRTL } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (plan: Plan) => {
    const planData = PLAN_FEATURES[plan.id];
    if (planData.price === 0) return 0;
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
                اختر خطتك
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> المثالية</span>
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
              ? "ابدأ مجاناً، وقم بالترقية عندما تكون جاهزاً للتوسع"
              : "Start free, upgrade when you're ready to scale"}
          </p>
          
          {/* Special offer badge */}
          <div className="inline-block bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 rounded-full px-6 py-2 mb-8">
            <span className="text-yellow-800 dark:text-yellow-300 font-bold text-sm">
              🎉 {isRTL ? 'عرض خاص: أول 100 مستخدم يحصلون على 20% خصم!' : 'Special Launch Offer: First 100 users get 20% off forever!'}
            </span>
          </div>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-secondary border border-border shadow-lg">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-semibold transition-all",
                billingPeriod === "monthly" 
                  ? "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRTL ? "شهري" : "Monthly Billing"}
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-semibold transition-all relative",
                billingPeriod === "yearly" 
                  ? "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isRTL ? "سنوي" : "Yearly Billing"}
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
                {(planData.badge || planData.badgeAr) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={cn(
                      "text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg",
                      plan.id === 'pro' 
                        ? "bg-gradient-to-r from-primary to-purple-600" 
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
                    {price === 0 ? (
                      <span className="text-5xl font-bold">{isRTL ? "مجاني" : "Free"}</span>
                    ) : (
                      <>
                        <span className={cn(
                          "text-5xl font-bold",
                          plan.popular && "bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                        )}>
                          ${price}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /{isRTL ? 'شهر' : 'month'}
                        </span>
                      </>
                    )}
                  </div>
                  {planData.price === 0 && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {isRTL ? 'مجاني للأبد' : 'Forever free'}
                    </p>
                  )}
                  {billingPeriod === "yearly" && savings > 0 && (
                    <p className="text-green-600 text-sm font-semibold mt-2">
                      {isRTL 
                        ? `أو $${planData.yearlyPrice}/سنة (وفر $${savings})`
                        : `or $${planData.yearlyPrice}/year (save $${savings})`}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {(isRTL ? planData.featuresAr : planData.features).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.id === 'business' ? "bg-purple-100 dark:bg-purple-900/30" : "bg-primary/10"
                      )}>
                        <Check className={cn(
                          "w-3 h-3",
                          plan.id === 'business' ? "text-purple-600" : "text-primary"
                        )} />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                  
                  {/* Limitations for free plan */}
                  {planData.limitations && (isRTL ? planData.limitationsAr : planData.limitations).map((limitation, limIndex) => (
                    <li key={`lim-${limIndex}`} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">{limitation}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <Link to="/signup" className="w-full">
                    <Button
                      className="w-full py-6 text-lg font-bold"
                      variant="outline"
                      size="lg"
                    >
                      {isRTL ? 'ابدأ مجاناً' : 'Get Started'}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className={cn(
                      "w-full py-6 text-lg font-bold transition-all",
                      plan.popular 
                        ? "bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl hover:scale-105" 
                        : "bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-xl hover:scale-105"
                    )}
                    size="lg"
                    onClick={() => handleUpgrade(plan)}
                  >
                    {isRTL 
                      ? `ترقية إلى ${planData.nameAr}` 
                      : `Upgrade to ${planData.name}`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">🔒</span>
              <span>{isRTL ? 'دفع آمن عبر Nzmly' : 'Secure Payment via Nzmly'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">💳</span>
              <span>{isRTL ? 'جميع البطاقات المصرية مقبولة' : 'All Egyptian Cards Accepted'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500">↩️</span>
              <span>{isRTL ? 'إلغاء في أي وقت' : 'Cancel Anytime'}</span>
            </div>
          </div>
        </div>

        {/* Money back guarantee */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary text-sm font-medium">
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
