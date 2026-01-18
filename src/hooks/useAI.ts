import { useMemo, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCached, setCached, stableStringify, withTimeout } from "@/lib/memoryCache";

export const useAI = (toolType: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const cacheKeyBase = useMemo(() => `ai-generate:${toolType}:${language === 'ar' ? 'ar' : 'en'}`, [toolType, language]);

  const generate = async (inputData: any) => {
    const cacheKey = `${cacheKeyBase}:${stableStringify(inputData)}`;
    const cached = getCached<unknown>(cacheKey);
    if (cached) return cached;

    setIsLoading(true);
    try {
      const invokePromise = supabase.functions.invoke('ai-generate', {
        body: {
          input: inputData,
          toolType: toolType,
          language: language === 'ar' ? 'ar' : 'en',
        },
      });

      const { data, error } = await withTimeout(
        invokePromise,
        45000,
        language === 'ar'
          ? 'انتهت مهلة الطلب. حاول مرة أخرى.'
          : 'Request timed out. Please try again.'
      );

      if (error) {
        throw new Error((error as any)?.message || 'Error connecting to AI service');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.result) {
        throw new Error(language === 'ar' ? 'لم يتم استلام نتيجة' : 'No result received');
      }

      // Cache identical requests briefly to make repeated runs feel instant
      setCached(cacheKey, data.result, 5 * 60 * 1000);
      return data.result;
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ في التوليد' : 'Generation Error',
        description: error?.message || (language === 'ar' ? 'حصل خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.'),
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading };
};

