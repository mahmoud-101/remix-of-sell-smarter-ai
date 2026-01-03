import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type AIToolType = "product-copy" | "ads-copy" | "campaign" | "design" | "competitor";

interface UseAIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAI(toolType: AIToolType, options?: UseAIOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const generate = async (input: Record<string, any>) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { toolType, input },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.status === 429) {
          toast({
            title: t("aiRateLimited"),
            description: t("aiRateLimitedDesc"),
            variant: "destructive",
          });
        } else if (data.status === 402) {
          toast({
            title: t("aiPaymentRequired"),
            description: t("aiPaymentRequiredDesc"),
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return null;
      }

      setResult(data.result);
      options?.onSuccess?.(data.result);
      
      toast({
        title: t("contentGeneratedSuccess"),
        description: t("contentReady"),
      });

      return data.result;
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({
        title: t("errorOccurred"),
        description: error.message || t("tryAgain"),
        variant: "destructive",
      });
      options?.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, result };
}
