import { useLanguage } from "@/contexts/LanguageContext";

export interface ProductTemplate {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  productName: string;
  productNameAr: string;
  productDescription: string;
  productDescriptionAr: string;
  targetAudience: string;
  targetAudienceAr: string;
  tone: string;
}

export const productTemplates: ProductTemplate[] = [
  {
    id: "electronics",
    name: "Electronics",
    nameAr: "إلكترونيات",
    icon: "📱",
    productName: "Wireless Bluetooth Headphones Pro",
    productNameAr: "سماعات بلوتوث لاسلكية برو",
    productDescription: "Premium wireless headphones with active noise cancellation, 40-hour battery life, Hi-Fi sound quality, comfortable memory foam ear cushions, and quick charge technology.",
    productDescriptionAr: "سماعات لاسلكية فاخرة مع عزل نشط للضوضاء، عمر بطارية 40 ساعة، جودة صوت عالية الدقة، وسائد أذن ميموري فوم مريحة، وتقنية الشحن السريع.",
    targetAudience: "Tech enthusiasts, remote workers, music lovers",
    targetAudienceAr: "عشاق التقنية، العاملين عن بعد، محبي الموسيقى",
    tone: "professional",
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    nameAr: "أزياء وملابس",
    icon: "👗",
    productName: "Premium Cotton T-Shirt Collection",
    productNameAr: "مجموعة تيشيرتات قطنية فاخرة",
    productDescription: "100% organic cotton t-shirts with modern fit, pre-shrunk fabric, double-stitched hems, available in 12 colors. Sustainably produced and ethically sourced.",
    productDescriptionAr: "تيشيرتات قطن عضوي 100% بقصة عصرية، قماش مقاوم للانكماش، خياطة مزدوجة، متوفرة بـ 12 لون. إنتاج مستدام ومصدر أخلاقي.",
    targetAudience: "Fashion-conscious millennials, eco-friendly shoppers",
    targetAudienceAr: "جيل الألفية المهتم بالموضة، المتسوقين الصديقين للبيئة",
    tone: "friendly",
  },
  {
    id: "beauty",
    name: "Beauty & Skincare",
    nameAr: "جمال وعناية بالبشرة",
    icon: "💄",
    productName: "Vitamin C Brightening Serum",
    productNameAr: "سيروم فيتامين سي للتفتيح",
    productDescription: "Clinical-grade vitamin C serum with hyaluronic acid and vitamin E. Reduces dark spots, boosts collagen, and provides antioxidant protection. Dermatologist tested.",
    productDescriptionAr: "سيروم فيتامين سي بدرجة طبية مع حمض الهيالورونيك وفيتامين إي. يقلل البقع الداكنة، يعزز الكولاجين، ويوفر حماية مضادة للأكسدة. مختبر من أطباء الجلدية.",
    targetAudience: "Women 25-45, skincare enthusiasts, beauty-conscious consumers",
    targetAudienceAr: "نساء 25-45، عشاق العناية بالبشرة، المستهلكين المهتمين بالجمال",
    tone: "luxury",
  },
  {
    id: "fitness",
    name: "Fitness & Sports",
    nameAr: "لياقة ورياضة",
    icon: "🏋️",
    productName: "Smart Fitness Watch Pro",
    productNameAr: "ساعة اللياقة الذكية برو",
    productDescription: "Advanced fitness tracker with heart rate monitoring, GPS, 50+ sport modes, sleep tracking, blood oxygen measurement, and 7-day battery life. Water resistant to 50m.",
    productDescriptionAr: "متتبع لياقة متقدم مع مراقبة معدل ضربات القلب، GPS، أكثر من 50 وضع رياضي، تتبع النوم، قياس أكسجين الدم، وعمر بطارية 7 أيام. مقاوم للماء حتى 50 متر.",
    targetAudience: "Athletes, fitness enthusiasts, health-conscious individuals",
    targetAudienceAr: "الرياضيين، عشاق اللياقة، الأفراد المهتمين بالصحة",
    tone: "aggressive",
  },
  {
    id: "home",
    name: "Home & Kitchen",
    nameAr: "منزل ومطبخ",
    icon: "🏠",
    productName: "Smart Air Fryer XL",
    productNameAr: "قلاية هوائية ذكية كبيرة",
    productDescription: "6-quart digital air fryer with 8 preset cooking functions, touch screen control, rapid air technology for crispy results with 95% less oil. Easy to clean basket.",
    productDescriptionAr: "قلاية هوائية رقمية سعة 6 لتر مع 8 وظائف طهي مسبقة، شاشة لمس، تقنية الهواء السريع لنتائج مقرمشة بزيت أقل 95%. سلة سهلة التنظيف.",
    targetAudience: "Home cooks, busy families, health-conscious eaters",
    targetAudienceAr: "طهاة المنزل، العائلات المشغولة، الأكلة المهتمين بالصحة",
    tone: "friendly",
  },
  {
    id: "supplements",
    name: "Supplements & Health",
    nameAr: "مكملات وصحة",
    icon: "💊",
    productName: "Premium Omega-3 Fish Oil",
    productNameAr: "زيت سمك أوميغا-3 فاخر",
    productDescription: "Triple-strength omega-3 with 2000mg EPA/DHA per serving. Molecularly distilled for purity, no fishy aftertaste, supports heart, brain, and joint health. 90 softgels.",
    productDescriptionAr: "أوميغا-3 ثلاثي القوة مع 2000 مجم EPA/DHA لكل جرعة. مقطر جزيئياً للنقاء، بدون طعم سمكي، يدعم صحة القلب والدماغ والمفاصل. 90 كبسولة.",
    targetAudience: "Health-conscious adults 35+, athletes, people with joint issues",
    targetAudienceAr: "البالغين المهتمين بالصحة 35+، الرياضيين، أصحاب مشاكل المفاصل",
    tone: "professional",
  },
];

interface TemplatePickerProps {
  onSelect: (template: ProductTemplate) => void;
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {isRTL ? "أو اختر قالب جاهز:" : "Or choose a template:"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {productTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center group"
          >
            <span className="text-2xl block mb-1">{template.icon}</span>
            <span className="text-xs font-medium group-hover:text-primary">
              {isRTL ? template.nameAr : template.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
