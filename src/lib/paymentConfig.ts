// Nzmly Payment Links Configuration
export const PAYMENT_LINKS = {
  starter: {
    url: 'https://Sell-mate.nzmly.com/l/vrYhypJJeg',
    planType: 'free' as const,
    price: 0,
    name: 'Starter (Free)',
    nameAr: 'مجاني'
  },
  pro: {
    url: 'https://Sell-mate.nzmly.com/l/NgRgejCVJg',
    planType: 'pro' as const,
    price: 4.99,
    name: 'Pro',
    nameAr: 'المحترف'
  },
  business: {
    url: 'https://Sell-mate.nzmly.com/l/KLCfkEnzTn',
    planType: 'business' as const,
    price: 14.99,
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
    productDescriptions: number;
    images: number;
    videoScripts: number;
  };
  features: string[];
  featuresAr: string[];
  limitations?: string[];
  limitationsAr?: string[];
  badge?: string;
  badgeAr?: string;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    limits: {
      productDescriptions: 5,
      images: 3,
      videoScripts: 2
    },
    features: [
      '5 product descriptions/month',
      '3 AI images/month',
      '2 video scripts/month',
      'Standard quality',
      'Watermark on images',
      '10 basic templates',
      'Community support'
    ],
    featuresAr: [
      '5 وصف منتج شهرياً',
      '3 صور بالذكاء الاصطناعي',
      '2 سكريبت فيديو',
      'جودة عادية',
      'علامة مائية على الصور',
      '10 قوالب أساسية',
      'دعم المجتمع'
    ],
    limitations: [
      'No Product Research',
      'No Analytics Dashboard',
      'No Competitor Spy Tools'
    ],
    limitationsAr: [
      'بدون بحث المنتجات',
      'بدون لوحة التحليلات',
      'بدون أدوات التجسس على المنافسين'
    ]
  },
  pro: {
    name: 'Pro',
    nameAr: 'المحترف',
    price: 4.99,
    yearlyPrice: 49,
    limits: {
      productDescriptions: -1,
      images: -1,
      videoScripts: -1
    },
    features: [
      '✅ Unlimited product descriptions',
      '✅ Unlimited AI images (HD)',
      '✅ Unlimited video scripts',
      '✅ No watermarks',
      '✅ 50+ premium templates',
      '✅ All export formats',
      '✅ Priority email support',
      '✅ Advanced AI models'
    ],
    featuresAr: [
      '✅ وصف منتجات غير محدود',
      '✅ صور AI غير محدودة (HD)',
      '✅ سكريبتات فيديو غير محدودة',
      '✅ بدون علامة مائية',
      '✅ +50 قالب احترافي',
      '✅ جميع صيغ التصدير',
      '✅ دعم بريد إلكتروني أولوية',
      '✅ نماذج AI متقدمة'
    ],
    badge: 'MOST POPULAR',
    badgeAr: 'الأكثر طلباً'
  },
  business: {
    name: 'Business',
    nameAr: 'بيزنس',
    price: 14.99,
    yearlyPrice: 149,
    limits: {
      productDescriptions: -1,
      images: -1,
      videoScripts: -1
    },
    features: [
      '✅ Everything in Pro, plus:',
      '✅ Product Research Tool',
      '✅ Competitor Spy Tool',
      '✅ Analytics Dashboard',
      '✅ API Access (coming soon)',
      '✅ Priority WhatsApp support',
      '✅ 1:1 onboarding call (30 min)',
      '✅ White-label option'
    ],
    featuresAr: [
      '✅ كل مميزات Pro، بالإضافة إلى:',
      '✅ أداة البحث عن المنتجات',
      '✅ أداة التجسس على المنافسين',
      '✅ لوحة التحليلات',
      '✅ وصول API (قريباً)',
      '✅ دعم واتساب أولوية',
      '✅ مكالمة تعريفية 1:1 (30 دقيقة)',
      '✅ خيار العلامة البيضاء'
    ],
    badge: 'BEST VALUE',
    badgeAr: 'أفضل قيمة'
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

// Helper to check if a feature is available for a plan
export const isFeatureAvailable = (planType: PlanType, feature: 'productResearch' | 'analytics' | 'competitorSpy'): boolean => {
  if (planType === 'business') return true;
  if (planType === 'pro' && feature !== 'productResearch' && feature !== 'competitorSpy') return true;
  return false;
};
