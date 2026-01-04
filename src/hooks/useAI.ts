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
  const { t, language, isRTL } = useLanguage();

  const generate = async (input: Record<string, any>) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { toolType, input, language },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.status === 429) {
          toast({
            title: isRTL ? "تجاوز الحد المسموح" : "Rate Limited",
            description: isRTL ? "يرجى الانتظار قليلاً ثم المحاولة مرة أخرى" : "Please wait a moment and try again",
            variant: "destructive",
          });
        } else if (data.status === 402) {
          toast({
            title: isRTL ? "الرصيد غير كافي" : "Payment Required",
            description: isRTL ? "يرجى إضافة رصيد لمتابعة الاستخدام" : "Please add credits to continue",
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
        title: isRTL ? "تم بنجاح! ✨" : "Success! ✨",
        description: isRTL ? "تم إنشاء المحتوى بنجاح" : "Content generated successfully",
      });

      return data.result;
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({
        title: isRTL ? "حدث خطأ" : "Error",
        description: error.message || (isRTL ? "يرجى المحاولة مرة أخرى" : "Please try again"),
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
