import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_FEATURES, PlanType } from "@/lib/paymentConfig";

export type ToolType = 'productDescriptions' | 'images' | 'videoScripts' | 'general';

interface UsageData {
  plan: PlanType;
  generationsUsed: number;
  generationsLimit: number;
  canGenerate: boolean;
  remainingGenerations: number;
  percentageUsed: number;
}

// Map plan names to limits
const getPlanLimits = (plan: string): number => {
  switch (plan) {
    case 'business':
    case 'pro':
      return -1; // Unlimited
    case 'start':
      return 50;
    case 'free':
    default:
      return 5;
  }
};

export function useUsageLimit() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData>({
    plan: "free",
    generationsUsed: 0,
    generationsLimit: 5,
    canGenerate: true,
    remainingGenerations: 5,
    percentageUsed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // First check subscriptions table for active subscription
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      let plan: PlanType = "free";
      
      if (subData && subData.status === 'active') {
        // Check if subscription is not expired
        if (!subData.expires_at || new Date(subData.expires_at) > new Date()) {
          plan = subData.plan as PlanType;
        }
      } else {
        // Fallback to profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();

        plan = (profileData?.plan as PlanType) || "free";
      }

      const monthYear = getCurrentMonthYear();

      // Get current month's usage
      const { data: usage } = await supabase
        .from("usage")
        .select("generations_count")
        .eq("user_id", user.id)
        .eq("month_year", monthYear)
        .maybeSingle();

      const generationsUsed = usage?.generations_count || 0;
      const generationsLimit = getPlanLimits(plan);
      const isUnlimited = generationsLimit === -1;
      const remainingGenerations = isUnlimited ? -1 : Math.max(0, generationsLimit - generationsUsed);
      const canGenerate = isUnlimited || remainingGenerations > 0;
      const percentageUsed = isUnlimited ? 0 : (generationsUsed / generationsLimit) * 100;

      setUsageData({
        plan,
        generationsUsed,
        generationsLimit,
        canGenerate,
        remainingGenerations,
        percentageUsed,
      });
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const incrementUsage = async (): Promise<boolean> => {
    if (!user) return false;

    // Check if user can generate
    if (!usageData.canGenerate) {
      return false;
    }

    const monthYear = getCurrentMonthYear();

    try {
      // Try to update existing record
      const { data: existing } = await supabase
        .from("usage")
        .select("id, generations_count")
        .eq("user_id", user.id)
        .eq("month_year", monthYear)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("usage")
          .update({ 
            generations_count: existing.generations_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        // Insert new record
        await supabase.from("usage").insert({
          user_id: user.id,
          month_year: monthYear,
          generations_count: 1,
          plan: usageData.plan,
        });
      }

      // Log the usage
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: 'generation',
        credits: 1,
        metadata: { month_year: monthYear, plan: usageData.plan }
      });

      // Refresh usage data
      await fetchUsage();
      return true;
    } catch (error) {
      console.error("Error incrementing usage:", error);
      return false;
    }
  };

  const checkCanGenerate = (): { allowed: boolean; message: string } => {
    if (usageData.generationsLimit === -1) {
      return { allowed: true, message: '' };
    }

    if (!usageData.canGenerate) {
      return { 
        allowed: false, 
        message: `لقد استهلكت حد التوليدات الشهري (${usageData.generationsLimit}). قم بالترقية للحصول على المزيد!`
      };
    }

    return { allowed: true, message: '' };
  };

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    ...usageData,
    isLoading,
    incrementUsage,
    refreshUsage: fetchUsage,
    checkCanGenerate,
  };
}
