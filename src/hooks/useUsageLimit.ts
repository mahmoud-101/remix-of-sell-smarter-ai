import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  start: 50,
  pro: 200,
  enterprise: Infinity,
};

interface UsageData {
  plan: string;
  generationsUsed: number;
  generationsLimit: number;
  canGenerate: boolean;
  remainingGenerations: number;
  percentageUsed: number;
}

export function useUsageLimit() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData>({
    plan: "free",
    generationsUsed: 0,
    generationsLimit: PLAN_LIMITS.free,
    canGenerate: true,
    remainingGenerations: PLAN_LIMITS.free,
    percentageUsed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const fetchUsage = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's plan from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();

      const plan = profile?.plan || "free";
      const monthYear = getCurrentMonthYear();

      // Get current month's usage
      const { data: usage } = await supabase
        .from("usage")
        .select("generations_count")
        .eq("user_id", user.id)
        .eq("month_year", monthYear)
        .maybeSingle();

      const generationsUsed = usage?.generations_count || 0;
      const generationsLimit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
      const remainingGenerations = Math.max(0, generationsLimit - generationsUsed);
      const canGenerate = remainingGenerations > 0 || plan === "enterprise";
      const percentageUsed = plan === "enterprise" ? 0 : (generationsUsed / generationsLimit) * 100;

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
  };

  const incrementUsage = async () => {
    if (!user) return false;

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
          .update({ generations_count: existing.generations_count + 1 })
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

      // Refresh usage data
      await fetchUsage();
      return true;
    } catch (error) {
      console.error("Error incrementing usage:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  return {
    ...usageData,
    isLoading,
    incrementUsage,
    refreshUsage: fetchUsage,
  };
}
