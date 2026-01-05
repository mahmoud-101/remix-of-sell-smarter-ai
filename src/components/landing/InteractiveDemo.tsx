import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const demoProducts = [
  {
    ar: { name: "ساعة ذكية", features: "تتبع الصحة، مقاومة للماء، بطارية 7 أيام" },
    en: { name: "Smart Watch", features: "Health tracking, water resistant, 7-day battery" }
  },
  {
    ar: { name: "حقيبة سفر", features: "سعة كبيرة، خفيفة الوزن، عجلات 360 درجة" },
    en: { name: "Travel Bag", features: "Large capacity, lightweight, 360° wheels" }
  },
  {
    ar: { name: "كريم مرطب", features: "مكونات طبيعية، مناسب لجميع أنواع البشرة" },
    en: { name: "Moisturizing Cream", features: "Natural ingredients, suitable for all skin types" }
  }
];

const generateMockContent = (name: string, features: string, isRTL: boolean): string => {
  if (isRTL) {
    return `✨ ${name} - رفيقك المثالي!

اكتشف تجربة استثنائية مع ${name} الذي يجمع بين الأناقة والأداء العالي.

🌟 المميزات الرئيسية:
${features.split('، ').map(f => `• ${f}`).join('\n')}

💫 لماذا تختارنا؟
✅ جودة عالية مضمونة
✅ شحن سريع ومجاني
✅ ضمان استرداد الأموال

🛒 اطلب الآن واستمتع بخصم 20% لفترة محدودة!

#${name.replace(/\s/g, '_')} #تسوق_ذكي #عروض_حصرية`;
  }
  
  return `✨ ${name} - Your Perfect Companion!

Discover an exceptional experience with our ${name} that combines elegance with high performance.

🌟 Key Features:
${features.split(', ').map(f => `• ${f}`).join('\n')}

💫 Why Choose Us?
✅ Guaranteed high quality
✅ Fast & free shipping
✅ Money-back guarantee

🛒 Order now and enjoy 20% OFF for a limited time!

#${name.replace(/\s/g, '')} #SmartShopping #ExclusiveDeals`;
};

export default function InteractiveDemo() {
  const { language, isRTL } = useLanguage();
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleQuickFill = (index: number) => {
    const product = demoProducts[index][language];
    setProductName(product.name);
    setFeatures(product.features);
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error(isRTL ? "أدخل اسم المنتج أولاً" : "Enter product name first");
      return;
    }

    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = generateMockContent(productName, features || (isRTL ? "منتج مميز" : "Premium product"), isRTL);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success(isRTL ? "تم النسخ!" : "Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {isRTL ? "جربها مجاناً - بدون تسجيل" : "Try it Free - No Signup"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                جرب قوة
                <span className="gradient-text"> الذكاء الاصطناعي</span>
              </>
            ) : (
              <>
                Experience
                <span className="gradient-text"> AI Power</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "أدخل معلومات منتجك وشاهد كيف نحوله لمحتوى تسويقي جذاب في ثوانٍ"
              : "Enter your product info and watch us transform it into engaging marketing content in seconds"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          {/* Quick fill buttons */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              {isRTL ? "جرب بأحد هذه المنتجات:" : "Try with these products:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {demoProducts.map((product, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickFill(index)}
                  className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  {product[language].name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input side */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? "اسم المنتج" : "Product Name"}
                </label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={isRTL ? "مثال: ساعة ذكية" : "e.g., Smart Watch"}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? "المميزات (اختياري)" : "Features (optional)"}
                </label>
                <Textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder={isRTL ? "مثال: مقاومة للماء، بطارية طويلة..." : "e.g., water resistant, long battery..."}
                  className="input-field min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                variant="gradient"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isRTL ? "جاري التوليد..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {isRTL ? "توليد المحتوى" : "Generate Content"}
                  </>
                )}
              </Button>
            </div>

            {/* Output side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {isRTL ? "المحتوى المُولَّد" : "Generated Content"}
                </label>
                {generatedContent && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {isRTL ? "تم النسخ" : "Copied"}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {isRTL ? "نسخ" : "Copy"}
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 min-h-[200px] border border-border/50">
                {generatedContent ? (
                  <p className="text-sm whitespace-pre-line leading-relaxed animate-fade-in">
                    {generatedContent}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-16">
                    {isRTL 
                      ? "أدخل معلومات المنتج واضغط على زر التوليد لترى النتيجة"
                      : "Enter product info and click generate to see the result"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
