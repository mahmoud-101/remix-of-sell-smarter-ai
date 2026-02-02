// Payment Links Configuration - Egyptian Market (EGP)
export const PAYMENT_LINKS = {
  pro: {
    url: 'https://Sell-mate.nzmly.com/l/NgRgejCVJg',
    planType: 'pro' as const,
    price: 299,
    name: 'Pro',
    nameAr: 'برو'
  },
  business: {
    url: 'https://Sell-mate.nzmly.com/l/KLCfkEnzTn',
    planType: 'business' as const,
    price: 799,
    name: 'Business',
    nameAr: 'بيزنس'
  }
} as const;

export type PlanType = 'free' | 'pro' | 'business';

// Currency configuration
export const CURRENCY = {
  code: 'EGP',
  symbol: 'ج.م',
  symbolEn: 'EGP',
  position: 'after' as const // Symbol comes after the number in Arabic
};

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
      'استوديو المنتجات بس',
      'قوالب أساسية'
    ],
    limitations: [
      'No store integrations',
      'No priority support'
    ],
    limitationsAr: [
      'من غير ربط المتاجر',
      'من غير دعم أولوية'
    ]
  },
  pro: {
    name: 'Pro',
    nameAr: 'برو',
    price: 299,
    yearlyPrice: 2990,
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
      'كل الاستوديوهات الـ 4',
      'ربط Shopify',
      'دعم إيميل',
      'كل القوالب'
    ],
    badge: 'POPULAR',
    badgeAr: 'الأكتر طلباً',
    platforms: ['Shopify']
  },
  business: {
    name: 'Business',
    nameAr: 'بيزنس',
    price: 799,
    yearlyPrice: 7990,
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
      'منتجات مفيش ليها حدود',
      'نسخ إعلانية مفيش ليها حدود',
      'سكريبتات ريلز مفيش ليها حدود',
      'صور AI مفيش ليها حدود',
      'كل الاستوديوهات الـ 4',
      'ربط Shopify + سلة',
      'دعم واتساب أولوية',
      'وصول API (قريباً)',
      'شغل مع الفريق'
    ],
    badge: 'BEST VALUE',
    badgeAr: 'أحسن قيمة',
    platforms: ['Shopify', 'Salla']
  }
};

// Helper to format price with currency
export const formatPrice = (price: number, isRTL: boolean = true): string => {
  if (price === 0) return isRTL ? 'مجاني' : 'Free';
  return isRTL ? `${price} ${CURRENCY.symbol}` : `${CURRENCY.symbolEn} ${price}`;
};

// Helper to get payment URL with email
export const getPaymentUrl = (planKey: keyof typeof PAYMENT_LINKS, email?: string): string => {
  const paymentLink = PAYMENT_LINKS[planKey];
  if (email) {
    return `${paymentLink.url}?email=${encodeURIComponent(email)}`;
  }
  return paymentLink.url;
};
