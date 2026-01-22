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
      'Ad Copywriter',
      'Standard templates'
    ],
    featuresAr: [
      '5 وصف منتج',
      '3 صور بالذكاء الاصطناعي',
      '2 سكريبت فيديو',
      'كاتب الإعلانات',
      'قوالب أساسية'
    ],
    limitations: [
      'No SEO Tool',
      'No Competitor Analysis',
      'No Product Research',
      'No Analytics'
    ],
    limitationsAr: [
      'بدون أداة SEO',
      'بدون تحليل المنافسين',
      'بدون البحث عن المنتجات',
      'بدون الإحصائيات'
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
      'Creative Factory',
      'Ad Copywriter',
      'Video Script Maker',
      'SEO Analyzer',
      'All templates',
      'Email support'
    ],
    featuresAr: [
      '50 وصف منتج شهرياً',
      '20 صورة AI شهرياً',
      '10 سكريبت فيديو شهرياً',
      'مصنع الكريتيفات',
      'كاتب الإعلانات',
      'صانع سكريبتات الفيديو',
      'خبير SEO',
      'جميع القوالب',
      'دعم بريد إلكتروني'
    ],
    limitations: [
      'No Competitor Analysis',
      'No Product Research',
      'No Analytics Dashboard'
    ],
    limitationsAr: [
      'بدون تحليل المنافسين',
      'بدون البحث عن المنتجات',
      'بدون لوحة الإحصائيات'
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
      '✅ Unlimited AI images',
      '✅ Unlimited video scripts',
      '✅ Creative Factory',
      '✅ Ad Copywriter',
      '✅ Video Script Maker',
      '✅ SEO Analyzer',
      '✅ Analytics Dashboard',
      '✅ Ad Designer',
      '✅ Priority email support'
    ],
    featuresAr: [
      '✅ وصف منتجات غير محدود',
      '✅ صور AI غير محدودة',
      '✅ سكريبتات فيديو غير محدودة',
      '✅ مصنع الكريتيفات',
      '✅ كاتب الإعلانات',
      '✅ صانع سكريبتات الفيديو',
      '✅ خبير SEO',
      '✅ لوحة الإحصائيات',
      '✅ مصمم الإعلانات',
      '✅ دعم بريد إلكتروني أولوية'
    ],
    limitations: [
      'No Competitor Analysis',
      'No Product Research'
    ],
    limitationsAr: [
      'بدون تحليل المنافسين',
      'بدون البحث عن المنتجات'
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
      '✅ Competitor Analysis Tool',
      '✅ Product Research Tool',
      '✅ Advanced Analytics',
      '✅ Leads Management',
      '✅ Priority WhatsApp support',
      '✅ API Access (coming soon)',
      '✅ White-label option'
    ],
    featuresAr: [
      '✅ كل مميزات Pro، بالإضافة إلى:',
      '✅ أداة تحليل المنافسين',
      '✅ أداة البحث عن المنتجات',
      '✅ تحليلات متقدمة',
      '✅ إدارة العملاء',
      '✅ دعم واتساب أولوية',
      '✅ وصول API (قريباً)',
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
