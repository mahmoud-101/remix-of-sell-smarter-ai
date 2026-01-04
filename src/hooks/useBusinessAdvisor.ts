import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

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

  const analyze = async (
    analysisType: AnalysisType,
    context: BusinessContext
  ) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('business-advisor', {
        body: {
          analysisType,
          context,
          language,
        },
      });

      if (error) {
        throw error;
      }

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

      setResult(data.result);
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
  };
}
