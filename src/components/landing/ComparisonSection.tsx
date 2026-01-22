import { Check, X, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ComparisonFeature {
  name: { ar: string; en: string };
  sellgenius: boolean | string;
  traditional: boolean | string;
  competitors: boolean | string;
}

const features: ComparisonFeature[] = [
  {
    name: { ar: "دعم اللغة العربية الكامل", en: "Full Arabic Language Support" },
    sellgenius: true,
    traditional: false,
    competitors: "partial"
  },
  {
    name: { ar: "مصنع الكريتيفات (صور + إعلانات)", en: "Creative Factory (Images + Ads)" },
    sellgenius: true,
    traditional: false,
    competitors: "partial"
  },
  {
    name: { ar: "كاتب وصف المنتجات", en: "Product Description Writer" },
    sellgenius: true,
    traditional: false,
    competitors: true
  },
  {
    name: { ar: "كاتب الإعلانات متعدد المنصات", en: "Multi-Platform Ad Copywriter" },
    sellgenius: true,
    traditional: false,
    competitors: "partial"
  },
  {
    name: { ar: "صانع سكريبتات الفيديو", en: "Video Script Maker" },
    sellgenius: true,
    traditional: false,
    competitors: "partial"
  },
  {
    name: { ar: "مصمم الإعلانات بالذكاء الاصطناعي", en: "AI Ad Designer" },
    sellgenius: true,
    traditional: false,
    competitors: false
  },
  {
    name: { ar: "خبير SEO للمتاجر", en: "E-commerce SEO Expert" },
    sellgenius: true,
    traditional: "partial",
    competitors: "partial"
  },
  {
    name: { ar: "تحليل المنافسين والتجسس على إعلاناتهم", en: "Competitor Analysis & Ad Spy" },
    sellgenius: true,
    traditional: false,
    competitors: "partial"
  },
  {
    name: { ar: "البحث عن المنتجات الرابحة", en: "Winning Product Research" },
    sellgenius: true,
    traditional: false,
    competitors: false
  },
  {
    name: { ar: "لوحة الإحصائيات والتحليلات", en: "Analytics Dashboard" },
    sellgenius: true,
    traditional: "partial",
    competitors: "partial"
  },
  {
    name: { ar: "إدارة العملاء والطلبات", en: "Leads Management" },
    sellgenius: true,
    traditional: false,
    competitors: false
  },
  {
    name: { ar: "أسعار مناسبة (تبدأ من $5)", en: "Affordable Pricing (from $5)" },
    sellgenius: true,
    traditional: "partial",
    competitors: false
  }
];

const renderStatus = (status: boolean | string) => {
  if (status === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-green-500" />
      </div>
    );
  }
  if (status === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
        <X className="w-4 h-4 text-red-500" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
      <span className="text-yellow-500 text-xs font-bold">~</span>
    </div>
  );
};

export default function ComparisonSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                لماذا <span className="gradient-text">سيل جينيوس؟</span>
              </>
            ) : (
              <>
                Why <span className="gradient-text">SellGenius?</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "مقارنة شاملة توضح لماذا سيل جينيوس هو الخيار الأفضل لنمو تجارتك"
              : "A comprehensive comparison showing why SellGenius is the best choice for your business growth"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-start p-4 border-b border-border">
                  {isRTL ? "الميزة" : "Feature"}
                </th>
                <th className="p-4 border-b border-border">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold gradient-text">SellGenius</span>
                  </div>
                </th>
                <th className="p-4 border-b border-border text-muted-foreground">
                  {isRTL ? "الطريقة التقليدية" : "Traditional Way"}
                </th>
                <th className="p-4 border-b border-border text-muted-foreground">
                  {isRTL ? "المنافسون الآخرون" : "Other Competitors"}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={index}
                  className="hover:bg-secondary/50 transition-colors"
                >
                  <td className="p-4 border-b border-border/50 font-medium">
                    {feature.name[language]}
                  </td>
                  <td className="p-4 border-b border-border/50">
                    <div className="flex justify-center">
                      {renderStatus(feature.sellgenius)}
                    </div>
                  </td>
                  <td className="p-4 border-b border-border/50">
                    <div className="flex justify-center">
                      {renderStatus(feature.traditional)}
                    </div>
                  </td>
                  <td className="p-4 border-b border-border/50">
                    <div className="flex justify-center">
                      {renderStatus(feature.competitors)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <span>{isRTL ? "متوفر بالكامل" : "Fully Available"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-yellow-500 text-[10px] font-bold">~</span>
            </div>
            <span>{isRTL ? "متوفر جزئياً" : "Partially Available"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-3 h-3 text-red-500" />
            </div>
            <span>{isRTL ? "غير متوفر" : "Not Available"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
