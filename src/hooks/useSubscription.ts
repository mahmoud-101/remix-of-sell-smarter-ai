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
    limit: PLAN_FEATURES.free.limits.productDescriptions
  },
  pro: {
    name: "Pro",
    nameAr: "المحترف",
    price: PLAN_FEATURES.pro.price,
    features: PLAN_FEATURES.pro.features,
    featuresAr: PLAN_FEATURES.pro.featuresAr,
    limit: -1 // Unlimited
  },
  business: {
    name: "Business",
    nameAr: "بيزنس",
    price: PLAN_FEATURES.business.price,
    features: PLAN_FEATURES.business.features,
    featuresAr: PLAN_FEATURES.business.featuresAr,
    limit: -1 // Unlimited
  }
};

export const useSubscription = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Try to get subscription from subscriptions table first
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
      
      // Fallback to profiles table
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
