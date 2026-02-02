import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_FEATURES, PlanType } from "@/lib/paymentConfig";

// Re-export PLANS for backward compatibility
export const PLANS = {
  free: {
    name: "Free",
    nameAr: "مجاني",
    price: 0,
    features: PLAN_FEATURES.free.features,
    featuresAr: PLAN_FEATURES.free.featuresAr,
    limit: 5
  },
  pro: {
    name: "Pro",
    nameAr: "برو",
    price: 19,
    features: PLAN_FEATURES.pro.features,
    featuresAr: PLAN_FEATURES.pro.featuresAr,
    limit: 100
  },
  business: {
    name: "Business",
    nameAr: "بيزنس",
    price: 49,
    features: PLAN_FEATURES.business.features,
    featuresAr: PLAN_FEATURES.business.featuresAr,
    limit: -1
  }
};

export const useSubscription = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", user.id)
        .single();
      
      if (subData) {
        return {
          plan: subData.plan || 'free',
          status: subData.status,
          expires_at: subData.expires_at
        };
      }
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      
      return {
        plan: profileData?.plan || 'free',
        status: 'active',
        expires_at: null
      };
    },
    enabled: !!user,
  });

  const currentPlan = (subscription?.plan || 'free') as PlanType;
  const planDetails = PLANS[currentPlan as keyof typeof PLANS] || PLANS.free;

  return {
    subscription,
    currentPlan,
    planDetails,
    isLoading
  };
};
