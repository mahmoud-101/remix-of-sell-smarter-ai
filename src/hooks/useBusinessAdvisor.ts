import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { getCached, setCached, stableStringify, withTimeout } from '@/lib/memoryCache';

export type AnalysisType =
  | 'campaign-diagnosis'
  | 'ad-copy-conversion'
  | 'product-optimization'
  | 'ad-image-concept'
  | 'growth-tasks';

export interface BusinessContext {
  productType?: string;
  productPrice?: number;
  targetAudience?: string;
  country?: string;
  funnelStage?: 'awareness' | 'consideration' | 'conversion' | 'retention';
  platform?: string;
  businessGoal?: 'sales' | 'profit' | 'scale' | 'testing';
  campaignData?: {
    ctr?: number;
    cpc?: number;
    cpa?: number;
    roas?: number;
    conversions?: number;
    spend?: number;
    impressions?: number;
    clicks?: number;
  };
  productName?: string;
  productDescription?: string;
}

export function useBusinessAdvisor() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const { language, isRTL } = useLanguage();
  const { canGenerate, remainingGenerations, incrementUsage, refreshUsage } = useUsageLimit();

  const cacheKeyBase = useMemo(() => `business-advisor:${language}`, [language]);

  const analyze = async (analysisType: AnalysisType, context: BusinessContext) => {
    // Check usage limit before analyzing
    await refreshUsage();
    
    if (!canGenerate) {
      toast({
        title: isRTL ? 'تم استنفاد الحد الشهري' : 'Monthly Limit Reached',
        description: isRTL 
          ? 'لقد استخدمت جميع التوليدات المتاحة هذا الشهر. قم بترقية خطتك للمتابعة.'
          : 'You have used all your generations this month. Upgrade your plan to continue.',
        variant: 'destructive',
      });
      return null;
    }

    const cacheKey = `${cacheKeyBase}:${analysisType}:${stableStringify(context)}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      setResult(cached);
      return cached;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const invokePromise = supabase.functions.invoke('business-advisor', {
        body: {
          analysisType,
          context,
          language,
        },
      });

      const { data, error } = await withTimeout(
        invokePromise,
        45000,
        isRTL ? 'انتهت مهلة الطلب. حاول مرة أخرى.' : 'Request timed out. Please try again.'
      );

      if (error) throw error;

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: isRTL ? 'تم تجاوز الحد' : 'Rate Limit Exceeded',
            description: isRTL ? 'حاول مرة أخرى لاحقاً' : 'Please try again later',
            variant: 'destructive',
          });
        } else if (data.error.includes('Payment')) {
          toast({
            title: isRTL ? 'رصيد غير كافي' : 'Insufficient Credits',
            description: isRTL ? 'يرجى إضافة رصيد' : 'Please add credits',
            variant: 'destructive',
          });
        } else {
          throw new Error(data.error);
        }
        return null;
      }

      // Increment usage after successful generation
      await incrementUsage();

      setResult(data.result);
      setCached(cacheKey, data.result, 5 * 60 * 1000);
      return data.result;
    } catch (error) {
      console.error('Business advisor error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'حدث خطأ أثناء التحليل' : 'An error occurred during analysis',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyze,
    isLoading,
    result,
    canGenerate,
    remainingGenerations,
  };
}

