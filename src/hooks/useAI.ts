import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useAI = (toolType: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const generate = async (inputData: any) => {
    setIsLoading(true);
    try {
      console.log(`Generating ${toolType} with data:`, inputData);

      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          input: inputData,
          toolType: toolType,
          language: language === 'ar' ? 'ar' : 'en',
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error connecting to AI service');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.result) {
        throw new Error('No result received from AI');
      }

      return data.result;

    } catch (error: any) {
      console.error("AI Generation Error:", error);
      
      toast({
        title: language === 'ar' ? "خطأ في التوليد" : "Generation Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading };
};
