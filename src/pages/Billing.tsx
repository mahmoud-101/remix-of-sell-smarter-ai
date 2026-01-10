import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Check, 
  Crown, 
  Zap, 
  Calendar,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

const Billing = () => {
  const { language } = useLanguage();
  const { subscription, currentPlan, planDetails, isLoading: subLoading } = useSubscription();
  const { generationsUsed, generationsLimit, plan } = useUsageLimit();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const isRTL = language === 'ar';

  const handleUpgrade = (planKey: string) => {
    setSelectedPlan(planKey);
    toast.info(
      isRTL 
        ? 'سيتم تفعيل المدفوعات قريباً! سجّل اهتمامك وسنتواصل معك.' 
        : 'Payments coming soon! Register your interest and we\'ll contact you.'
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'إدارة الاشتراك' : 'Billing & Subscription'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRTL ? 'إدارة خطتك والاستخدام' : 'Manage your plan and usage'}
          </p>
        </div>

        {/* Current Plan & Usage */}
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
              <div className="flex items-center gap-2 text-2xl font-bold">
                {planDetails.price === 0 ? (
                  <span className="text-muted-foreground">
                    {isRTL ? 'مجاناً' : 'Free'}
                  </span>
                ) : (
                  <>
                    <span>${planDetails.price}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      /{isRTL ? 'شهر' : 'month'}
                    </span>
                  </>
                )}
              </div>
              <ul className="space-y-2">
                {(isRTL ? planDetails.featuresAr : planDetails.features).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
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
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL 
                      ? 'أوشكت على استهلاك حد التوليدات الشهري' 
                      : 'You\'re approaching your monthly limit'}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  {isRTL 
                    ? 'يتجدد الرصيد في بداية كل شهر ميلادي' 
                    : 'Credits reset at the beginning of each calendar month'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isRTL ? 'ترقية خطتك' : 'Upgrade Your Plan'}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = currentPlan === key;
              const isPopular = key === 'pro';
              
              return (
                <Card 
                  key={key} 
                  className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrent ? 'bg-primary/5' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{isRTL ? plan.nameAr : plan.name}</span>
                      {isCurrent && (
                        <Badge variant="outline">
                          {isRTL ? 'الحالية' : 'Current'}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price === 0 ? (
                        <span>{isRTL ? 'مجاناً' : 'Free'}</span>
                      ) : (
                        <>
                          ${plan.price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{isRTL ? 'شهر' : 'mo'}
                          </span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {(isRTL ? plan.featuresAr : plan.features).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
                      disabled={isCurrent}
                      onClick={() => handleUpgrade(key)}
                    >
                      {isCurrent 
                        ? (isRTL ? 'خطتك الحالية' : 'Current Plan')
                        : (isRTL ? 'ترقية الآن' : 'Upgrade Now')
                      }
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
                <p className="text-sm mt-1">
                  {isRTL 
                    ? 'ستظهر هنا سجل مدفوعاتك عند الاشتراك' 
                    : 'Your payment history will appear here once you subscribe'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
