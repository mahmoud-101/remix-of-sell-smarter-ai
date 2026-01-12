import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const PLANS = {
  free: {
    name: "Free Trial",
    nameAr: "تجربة مجانية",
    price: 0,
    features: ["5 credits total", "Try all tools", "Standard speed"],
    featuresAr: ["5 محاولات مجانية", "تجرية كل الأدوات", "سرعة عادية"],
    limit: 5
  },
  start: {
    name: "Starter",
    nameAr: "تاجر (بداية)",
    price: 5,
    features: ["50 Products/mo", "Ads Copywriting", "Basic Support"],
    featuresAr: ["وصف 50 منتج شهرياً", "كتابة إعلانات احترافية", "دعم فني أساسي"],
    limit: 50
  },
  pro: {
    name: "Pro",
    nameAr: "المحترف (الأكثر طلباً)",
    price: 12,
    features: ["Unlimited Text", "50 AI Images", "Competitor Analysis", "Priority Support"],
    featuresAr: ["نصوص لا محدودة ♾️", "50 صورة بالذكاء الاصطناعي", "تحليل المنافسين", "أولوية في الدعم"],
    limit: 1000 // رقم كبير يعامل معاملة اللامحدود للنصوص
  },
  enterprise: {
    name: "Business",
    nameAr: "بيزنس (شركات)",
    price: 29,
    features: ["Unlimited Everything", "High-Res Images", "Direct WhatsApp Support", "Early Access"],
    featuresAr: ["كل شيء لا محدود 🚀", "صور بدقة عالية 4K", "دعم مباشر واتساب", "وصول مبكر للتحديثات"],
    limit: -1
  }
};

export const useSubscription = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, subscription_status, subscription_end_date")
        .eq("id", user.id)
        .single();
      
      if (error) return null;
      return {
        plan: data.plan || 'free',
        status: data.subscription_status,
        expires_at: data.subscription_end_date
      };
    },
    enabled: !!user,
  });

  const currentPlan = subscription?.plan || 'free';
  const planDetails = PLANS[currentPlan as keyof typeof PLANS] || PLANS.free;

  return {
    subscription,
    currentPlan,
    planDetails,
    isLoading
  };
};
