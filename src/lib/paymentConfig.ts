// Nzmly Payment Links Configuration
export const PAYMENT_LINKS = {
  start: {
    url: 'https://Sell-mate.nzmly.com/l/vrYhypJJeg',
    planType: 'start' as const,
    price: 5,
    name: 'Start',
    nameAr: 'ستارت'
  },
  pro: {
    url: 'https://Sell-mate.nzmly.com/l/NgRgejCVJg',
    planType: 'pro' as const,
    price: 10,
    name: 'Pro',
    nameAr: 'المحترف'
  },
  business: {
    url: 'https://Sell-mate.nzmly.com/l/KLCfkEnzTn',
    planType: 'business' as const,
    price: 20,
    name: 'Business',
    nameAr: 'بيزنس'
  }
} as const;

export type PlanType = 'free' | 'start' | 'pro' | 'business';

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
    name: 'Free Trial',
    nameAr: 'تجربة مجانية',
    price: 0,
    limits: {
      productDescriptions: 5,
      images: 3,
      videoScripts: 2
    },
    features: [
      '5 product descriptions',
      '3 AI images',
      '2 video scripts',
      'Standard quality',
      'Community support'
    ],
    featuresAr: [
      '5 وصف منتج',
      '3 صور بالذكاء الاصطناعي',
      '2 سكريبت فيديو',
      'جودة عادية',
      'دعم المجتمع'
    ],
    limitations: [
      'Limited generations',
      'No priority support'
    ],
    limitationsAr: [
      'توليدات محدودة',
      'بدون دعم أولوية'
    ]
  },
  start: {
    name: 'Start',
    nameAr: 'ستارت',
    price: 5,
    yearlyPrice: 50,
    limits: {
      productDescriptions: 50,
      images: 20,
      videoScripts: 10
    },
    features: [
      '50 product descriptions/month',
      '20 AI images/month',
      '10 video scripts/month',
      'HD quality',
      'Email support',
      'All templates',
      'Export all formats'
    ],
    featuresAr: [
      '50 وصف منتج شهرياً',
      '20 صورة AI شهرياً',
      '10 سكريبت فيديو شهرياً',
      'جودة عالية HD',
      'دعم بريد إلكتروني',
      'جميع القوالب',
      'تصدير كل الصيغ'
    ]
  },
  pro: {
    name: 'Pro',
    nameAr: 'المحترف',
    price: 10,
    yearlyPrice: 100,
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
      '✅ Priority email support',
      '✅ Advanced AI models',
      '✅ Analytics dashboard'
    ],
    featuresAr: [
      '✅ وصف منتجات غير محدود',
      '✅ صور AI غير محدودة (HD)',
      '✅ سكريبتات فيديو غير محدودة',
      '✅ بدون علامة مائية',
      '✅ دعم بريد إلكتروني أولوية',
      '✅ نماذج AI متقدمة',
      '✅ لوحة التحليلات'
    ],
    badge: 'MOST POPULAR',
    badgeAr: 'الأكثر طلباً'
  },
  business: {
    name: 'Business',
    nameAr: 'بيزنس',
    price: 20,
    yearlyPrice: 200,
    limits: {
      productDescriptions: -1,
      images: -1,
      videoScripts: -1
    },
    features: [
      '✅ Everything in Pro, plus:',
      '✅ Product Research Tool',
      '✅ Competitor Spy Tool',
      '✅ API Access (coming soon)',
      '✅ Priority WhatsApp support',
      '✅ 1:1 onboarding call',
      '✅ White-label option'
    ],
    featuresAr: [
      '✅ كل مميزات Pro، بالإضافة إلى:',
      '✅ أداة البحث عن المنتجات',
      '✅ أداة التجسس على المنافسين',
      '✅ وصول API (قريباً)',
      '✅ دعم واتساب أولوية',
      '✅ مكالمة تعريفية 1:1',
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
