import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Sparkles, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAI } from "@/hooks/useAI";

const DesignAdvisor = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const { generate, isLoading } = useAI("design-advisor");

  const handleGenerate = async () => {
    if (!description.trim()) return;
    const response = await generate({ description });
    if (response) {
      setResult(response);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            {isRTL ? "مستشار التصميم" : "Design Advisor"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {isRTL ? "احصل على نصائح تصميم احترافية" : "Get Professional Design Tips"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={isRTL ? "صف تصميمك أو منتجك..." : "Describe your design or product..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <Button onClick={handleGenerate} disabled={isLoading || !description.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isRTL ? "جاري التحليل..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isRTL ? "احصل على نصائح" : "Get Advice"}
                </>
              )}
            </Button>

            {result && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="whitespace-pre-wrap">{result}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DesignAdvisor;
