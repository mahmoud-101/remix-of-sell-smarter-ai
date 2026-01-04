import { Zap, AlertTriangle, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function UsageBanner() {
  const { language, isRTL } = useLanguage();
  const { plan, generationsUsed, generationsLimit, remainingGenerations, percentageUsed, canGenerate } = useUsageLimit();

  if (plan === "enterprise") {
    return null;
  }

  const isNearLimit = percentageUsed >= 80;
  const isAtLimit = !canGenerate;

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 mb-6",
        isAtLimit && "border-destructive/50 bg-destructive/5",
        isNearLimit && !isAtLimit && "border-yellow-500/50 bg-yellow-500/5"
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isAtLimit ? "bg-destructive/10" : isNearLimit ? "bg-yellow-500/10" : "bg-primary/10"
            )}
          >
            {isAtLimit ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <Zap className={cn("h-5 w-5", isNearLimit ? "text-yellow-500" : "text-primary")} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">
                {language === "ar" ? "استخدامك الشهري" : "Monthly Usage"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                {plan}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={percentageUsed} className="h-2 flex-1 max-w-[200px]" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {generationsUsed} / {generationsLimit === Infinity ? "∞" : generationsLimit}
              </span>
            </div>
            {isAtLimit && (
              <p className="text-sm text-destructive mt-1">
                {language === "ar"
                  ? "وصلت للحد الأقصى! قم بترقية خطتك للمتابعة."
                  : "You've reached your limit! Upgrade to continue."}
              </p>
            )}
            {isNearLimit && !isAtLimit && (
              <p className="text-sm text-yellow-600 mt-1">
                {language === "ar"
                  ? `متبقي ${remainingGenerations} توليد فقط هذا الشهر.`
                  : `Only ${remainingGenerations} generations left this month.`}
              </p>
            )}
          </div>
        </div>
        <Link to="/dashboard/settings">
          <Button variant={isAtLimit ? "default" : "outline"} size="sm" className="gap-2">
            <Crown className="h-4 w-4" />
            {language === "ar" ? "ترقية الخطة" : "Upgrade Plan"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
