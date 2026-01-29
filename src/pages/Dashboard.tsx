import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductUrlExtractor } from "@/components/common/ProductUrlExtractor";
import type { ProductData } from "@/lib/api/firecrawl";

type StudioResult = {
  shopifyTitle: { ar: string; en: string };
  meta: { title: string; description: string };
  description: { ar: string; en: string };
  variants: {
    options: Array<{ name: string; values: string[] }>;
  };
  altTexts: string[];
  jsonLd: string;
};

export default function Dashboard() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [productUrl, setProductUrl] = useState("");
  const [extracted, setExtracted] = useState<ProductData | null>(null);
  const [tone, setTone] = useState<"luxury" | "professional" | "modest" | "elegant">("luxury");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudioResult | null>(null);

  const tones = useMemo(
    () => [
      { value: "luxury", label: isRTL ? "فاخر" : "Luxury" },
      { value: "professional", label: isRTL ? "احترافي" : "Professional" },
      { value: "modest", label: isRTL ? "محتشم" : "Modest" },
      { value: "elegant", label: isRTL ? "أنيق" : "Elegant" },
    ],
    [isRTL]
  );

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: isRTL ? "تم النسخ" : "Copied",
      description: isRTL ? "تم نسخ المحتوى" : "Content copied",
    });
  };

  const copyAll = async () => {
    if (!result) return;
    const payload = [
      `Shopify Title (AR): ${result.shopifyTitle.ar}`,
      `Shopify Title (EN): ${result.shopifyTitle.en}`,
      "",
      `Meta Title: ${result.meta.title}`,
      `Meta Description: ${result.meta.description}`,
      "",
      "Description (AR):",
      result.description.ar,
      "",
      "Description (EN):",
      result.description.en,
      "",
      "Variants:",
      ...result.variants.options.map((o) => `${o.name}: ${o.values.join(", ")}`),
      "",
      "Alt Texts:",
      ...result.altTexts,
      "",
      "Schema JSON-LD:",
      result.jsonLd,
    ].join("\n");
    await copy(payload);
  };

  const handleGenerate = async () => {
    if (!user) return;
    if (!productUrl.trim()) {
      toast({
        title: isRTL ? "أدخل رابط المنتج" : "Enter product URL",
        description: isRTL ? "أدخل رابط المنتج أولاً" : "Please paste the product URL first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          toolType: "shopify-studio",
          language: "ar",
          input: {
            productUrl,
            tone,
            productData: extracted,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const res = data?.result as StudioResult | undefined;
      if (!res?.shopifyTitle?.ar || !res?.description?.ar) {
        throw new Error(isRTL ? "استجابة غير صالحة" : "Invalid response");
      }
      setResult(res);
    } catch (e: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: e?.message || (isRTL ? "فشل التوليد" : "Generation failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!user || !result) return;
    try {
      const { error } = await supabase.from("generated_content").insert([
        {
          user_id: user.id,
          content_type: "shopify_studio",
          input_data: { productUrl, tone, productData: extracted ?? null } as any,
          output_data: result as any,
          product_title: extracted?.title ?? null,
          product_image: extracted?.images?.[0] ?? null,
        } as any,
      ]);
      if (error) throw error;
      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم حفظ المحتوى في المكتبة" : "Saved to library",
      });
    } catch (e: any) {
      toast({
        title: isRTL ? "فشل الحفظ" : "Save failed",
        description: e?.message || (isRTL ? "تعذر الحفظ" : "Could not save"),
        variant: "destructive",
      });
    }
  };

  const handleCreateInShopify = async () => {
    if (!result) return;
    try {
      const { data, error } = await supabase.functions.invoke("shopify-create-product", {
        body: {
          studioResult: result,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: isRTL ? "تم إنشاء المنتج" : "Product created",
        description: isRTL ? "تم إنشاء المنتج في Shopify" : "Created in Shopify",
      });

      const url = data?.productAdminUrl as string | undefined;
      if (url) window.open(url, "_blank");
    } catch (e: any) {
      toast({
        title: isRTL ? "تعذر الإنشاء" : "Create failed",
        description:
          e?.message ||
          (isRTL
            ? "تأكد من ربط Shopify من صفحة منتجات Shopify أولاً"
            : "Please connect Shopify first in Synced Products"),
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div>
          <h1 className="text-2xl font-bold">
            {isRTL ? "استوديو منتجات Shopify" : "Shopify Product Studio"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "سير عمل واحد سريع: استخرج المنتج ثم ولّد محتوى فاخر ثنائي اللغة." 
              : "Single workflow: extract then generate premium bilingual content."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "1) رابط المنتج" : "1) Product URL"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? "رابط المنتج الجديد (Shein/BrandsGateway/Peppela/Namshi)" : "Product URL"}</Label>
              <Input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder={isRTL ? "https://..." : "https://..."}
                inputMode="url"
              />
            </div>

            <ProductUrlExtractor
              onExtract={(d) => {
                setExtracted(d);
                toast({
                  title: isRTL ? "تم الاستخراج" : "Extracted",
                  description: isRTL
                    ? "تم سحب بيانات المنتج من الرابط"
                    : "Product data extracted from URL",
                });
              }}
            />

            <div className="space-y-2">
              <Label>{isRTL ? "2) النبرة" : "2) Tone"}</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" className="w-full h-14 text-lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (isRTL ? "جارٍ التوليد..." : "Generating...") : isRTL ? "Generate Shopify Content" : "Generate Shopify Content"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "Shopify Title (عربي + إنجليزي)" : "Shopify Title (AR + EN)"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea readOnly value={result ? `${result.shopifyTitle.ar}\n\n${result.shopifyTitle.en}` : ""} rows={6} />
              <Button variant="outline" onClick={() => copy(result ? `${result.shopifyTitle.ar}\n${result.shopifyTitle.en}` : "")} disabled={!result}>
                {isRTL ? "نسخ" : "Copy"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "Meta Title/Description (SEO)" : "Meta Title/Description (SEO)"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea readOnly value={result ? `${result.meta.title}\n\n${result.meta.description}` : ""} rows={6} />
              <Button variant="outline" onClick={() => copy(result ? `${result.meta.title}\n${result.meta.description}` : "")} disabled={!result}>
                {isRTL ? "نسخ" : "Copy"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "Full Description (ثنائي اللغة ~2000 حرف)" : "Full Description (bilingual ~2000 chars)"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea readOnly value={result ? `${result.description.ar}\n\n${result.description.en}` : ""} rows={10} />
              <Button variant="outline" onClick={() => copy(result ? `${result.description.ar}\n\n${result.description.en}` : "")} disabled={!result}>
                {isRTL ? "نسخ" : "Copy"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "Size/Color Variants" : "Size/Color Variants"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                readOnly
                value={
                  result
                    ? result.variants.options.map((o) => `${o.name}: ${o.values.join(", ")}`).join("\n")
                    : ""
                }
                rows={10}
              />
              <Button
                variant="outline"
                onClick={() =>
                  copy(
                    result ? result.variants.options.map((o) => `${o.name}: ${o.values.join(", ")}`).join("\n") : ""
                  )
                }
                disabled={!result}
              >
                {isRTL ? "نسخ" : "Copy"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "Image Alt Text" : "Image Alt Text"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea readOnly value={result ? result.altTexts.join("\n") : ""} rows={10} />
              <Button variant="outline" onClick={() => copy(result ? result.altTexts.join("\n") : "")} disabled={!result}>
                {isRTL ? "نسخ" : "Copy"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "Schema JSON-LD" : "Schema JSON-LD"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea readOnly value={result ? result.jsonLd : ""} rows={10} />
              <Button variant="outline" onClick={() => copy(result ? result.jsonLd : "")} disabled={!result}>
                {isRTL ? "نسخ" : "Copy"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button size="lg" onClick={handleCreateInShopify} disabled={!result}>
            ➤ {isRTL ? "إنشاء في Shopify" : "Create in Shopify"}
          </Button>
          <Button size="lg" variant="outline" onClick={handleSaveToLibrary} disabled={!result}>
            💾 {isRTL ? "حفظ في المكتبة" : "Save to Library"}
          </Button>
          <Button size="lg" variant="outline" onClick={copyAll} disabled={!result}>
            📋 {isRTL ? "نسخ كل المحتوى" : "Copy All Content"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
