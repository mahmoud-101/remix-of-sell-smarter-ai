// Payment Links Configuration
export const PAYMENT_LINKS = {
  pro: {
    url: 'https://Sell-mate.nzmly.com/l/NgRgejCVJg',
    planType: 'pro' as const,
    price: 19,
    name: 'Pro',
    nameAr: 'برو'
  },
  business: {
    url: 'https://Sell-mate.nzmly.com/l/KLCfkEnzTn',
    planType: 'business' as const,
    price: 49,
    name: 'Business',
    nameAr: 'بيزنس'
  }
} as const;

export type PlanType = 'free' | 'pro' | 'business';

export interface PlanFeatures {
  name: string;
  nameAr: string;
  price: number;
  yearlyPrice?: number;
  limits: {
    products: number;
    ads: number;
    reels: number;
    images: number;
  };
  features: string[];
  featuresAr: string[];
  limitations?: string[];
  limitationsAr?: string[];
  badge?: string;
  badgeAr?: string;
  platforms?: string[];
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    limits: {
      products: 5,
      ads: 5,
      reels: 3,
      images: 2
    },
    features: [
      '5 product descriptions/month',
      '5 ad copies/month',
      '3 reels scripts/month',
      '2 AI images/month',
      'Product Studio only',
      'Basic templates'
    ],
    featuresAr: [
      '5 وصف منتج/شهر',
      '5 نسخ إعلانية/شهر',
      '3 سكريبت ريلز/شهر',
      '2 صورة AI/شهر',
      'استوديو المنتجات فقط',
      'قوالب أساسية'
    ],
    limitations: [
      'No store integrations',
      'No priority support'
    ],
    limitationsAr: [
      'بدون تكامل المتاجر',
      'بدون دعم أولوية'
    ]
  },
  pro: {
    name: 'Pro',
    nameAr: 'برو',
    price: 19,
    yearlyPrice: 190,
    limits: {
      products: 100,
      ads: 100,
      reels: 50,
      images: 30
    },
    features: [
      '100 products/month',
      '100 ad copies/month',
      '50 reels scripts/month',
      '30 AI images/month',
      'All 4 Studios',
      'Shopify integration',
      'Email support',
      'All templates'
    ],
    featuresAr: [
      '100 منتج/شهر',
      '100 نسخة إعلانية/شهر',
      '50 سكريبت ريلز/شهر',
      '30 صورة AI/شهر',
      'جميع الاستوديوهات الـ 4',
      'تكامل Shopify',
      'دعم بريد إلكتروني',
      'جميع القوالب'
    ],
    badge: 'POPULAR',
    badgeAr: 'الأكثر طلباً',
    platforms: ['Shopify']
  },
  business: {
    name: 'Business',
    nameAr: 'بيزنس',
    price: 49,
    yearlyPrice: 490,
    limits: {
      products: -1,
      ads: -1,
      reels: -1,
      images: -1
    },
    features: [
      'Unlimited products',
      'Unlimited ad copies',
      'Unlimited reels scripts',
      'Unlimited AI images',
      'All 4 Studios',
      'Shopify + Salla integrations',
      'Priority WhatsApp support',
      'API Access (coming soon)',
      'Team collaboration'
    ],
    featuresAr: [
      'منتجات غير محدودة',
      'نسخ إعلانية غير محدودة',
      'سكريبتات ريلز غير محدودة',
      'صور AI غير محدودة',
      'جميع الاستوديوهات الـ 4',
      'تكامل Shopify + سلة',
      'دعم واتساب أولوية',
      'وصول API (قريباً)',
      'تعاون الفريق'
    ],
    badge: 'BEST VALUE',
    badgeAr: 'أفضل قيمة',
    platforms: ['Shopify', 'Salla']
  }
};

// Helper to get payment URL with email
export const getPaymentUrl = (planKey: keyof typeof PAYMENT_LINKS, email?: string): string => {
  const paymentLink = PAYMENT_LINKS[planKey];
  if (email) {
    return `${paymentLink.url}?email=${encodeURIComponent(email)}`;
  }
  return paymentLink.url;
};
