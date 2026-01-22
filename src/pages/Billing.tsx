import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, Check, Crown, Zap, Calendar, AlertCircle, Sparkles, Building2, X
} from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_LINKS, getPaymentUrl, PlanType } from "@/lib/paymentConfig";

const Billing = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { subscription, currentPlan, planDetails, isLoading: subLoading } = useSubscription();
  const { generationsUsed, generationsLimit } = useUsageLimit();
  const isRTL = language === 'ar';

  const handleUpgrade = (planKey: 'start' | 'pro' | 'business') => {
    const url = getPaymentUrl(planKey, user?.email || undefined);
    window.open(url, '_blank');
    toast.success(
      isRTL ? 'جاري تحويلك لصفحة الدفع...' : 'Redirecting to checkout...'
    );
  };

  const usagePercentage = generationsLimit > 0 
    ? Math.min((generationsUsed / generationsLimit) * 100, 100) 
    : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return isRTL ? 'غير محدد' : 'Not set';
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const planConfigs: { key: keyof typeof PLANS; paymentKey?: 'start' | 'pro' | 'business'; icon: typeof Sparkles }[] = [
    { key: 'start', paymentKey: 'start', icon: Zap },
    { key: 'pro', paymentKey: 'pro', icon: Crown },
    { key: 'business', paymentKey: 'business', icon: Building2 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'إدارة الاشتراك' : 'Billing & Subscription'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRTL ? 'إدارة خطتك والاستخدام' : 'Manage your plan and usage'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Plan Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  {isRTL ? 'خطتك الحالية' : 'Current Plan'}
                </CardTitle>
                <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                  {isRTL ? planDetails.nameAr : planDetails.name}
                </Badge>
              </div>
              <CardDescription>
                {subscription?.expires_at 
                  ? `${isRTL ? 'تنتهي في:' : 'Expires:'} ${formatDate(subscription.expires_at)}`
                  : isRTL ? 'اشتراك نشط' : 'Active subscription'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-3xl font-bold">
                {planDetails.price === 0 ? (
                  <span className="text-muted-foreground">{isRTL ? 'مجاناً' : 'Free'}</span>
                ) : (
                  <>
                    <span className="text-primary">${planDetails.price}</span>
                    <span className="text-sm font-normal text-muted-foreground">/{isRTL ? 'شهر' : 'month'}</span>
                  </>
                )}
              </div>
              <ul className="space-y-2">
                {(isRTL ? planDetails.featuresAr : planDetails.features).slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {isRTL ? 'استخدامك هذا الشهر' : 'Monthly Usage'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'عدد التوليدات المستخدمة' : 'Generations used'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{isRTL ? 'مستخدم' : 'Used'}</span>
                  <span className="font-medium">
                    {generationsUsed} / {generationsLimit === -1 ? '∞' : generationsLimit}
                  </span>
                </div>
                <Progress value={generationsLimit === -1 ? 0 : usagePercentage} className="h-3" />
              </div>
              
              {usagePercentage >= 80 && generationsLimit !== -1 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">
                    {isRTL ? 'أوشكت على استهلاك حد التوليدات' : 'Approaching your monthly limit'}
                  </span>
                </div>
              )}
              
              {(currentPlan === 'free' || currentPlan === 'start') && (
                <Button 
                  className="w-full bg-primary"
                  onClick={() => handleUpgrade('pro')}
                >
                  {isRTL ? 'ترقية للحصول على توليدات غير محدودة' : 'Upgrade for Unlimited'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{isRTL ? 'ترقية خطتك' : 'Upgrade Your Plan'}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {planConfigs.map(({ key, paymentKey, icon: Icon }) => {
              const planData = PLANS[key];
              const isCurrent = currentPlan === key;
              const isPopular = key === 'pro';
              
              return (
                <Card 
                  key={key} 
                  className={`relative transition-all duration-300 hover:scale-[1.02] ${
                    isPopular ? 'border-primary border-2 shadow-lg shadow-primary/20' : ''
                  } ${isCurrent ? 'bg-primary/5 border-primary/40' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {isRTL ? 'الأكثر طلباً' : 'Most Popular'}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-2 pt-6">
                    <div className="flex justify-center mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isPopular ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{isRTL ? planData.nameAr : planData.name}</CardTitle>
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-4xl font-bold ${isPopular ? 'text-primary' : ''}`}>
                          ${planData.price}
                        </span>
                        <span className="text-muted-foreground">/{isRTL ? 'شهر' : 'mo'}</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <Badge variant="outline" className="mt-2 border-primary text-primary">
                        {isRTL ? 'خطتك الحالية' : 'Current Plan'}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-4">
                    <ul className="space-y-3">
                      {(isRTL ? planData.featuresAr : planData.features).slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full mt-4 ${isPopular && !isCurrent ? 'bg-primary' : ''}`}
                      variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
                      disabled={isCurrent}
                      onClick={() => paymentKey && handleUpgrade(paymentKey)}
                    >
                      {isCurrent 
                        ? (isRTL ? 'خطتك الحالية' : 'Current Plan')
                        : (isRTL ? 'اشترك الآن' : 'Subscribe Now')
                      }
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm py-4">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>{isRTL ? 'دفع آمن عبر Nzmly' : 'Secure Payment via Nzmly'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💳</span>
            <span>{isRTL ? 'جميع البطاقات مقبولة' : 'All Cards Accepted'}</span>
          </div>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {isRTL ? 'سجل المدفوعات' : 'Payment History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{isRTL ? 'لا توجد مدفوعات بعد' : 'No payments yet'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
