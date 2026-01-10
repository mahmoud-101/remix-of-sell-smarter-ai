import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PlanDetails {
  name: string;
  nameAr: string;
  price: number;
  priceAr: string;
  features: string[];
  featuresAr: string[];
  generations: number;
}

export const PLANS: Record<string, PlanDetails> = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    priceAr: 'مجاناً',
    features: ['10 generations/month', 'Basic templates', 'Email support'],
    featuresAr: ['10 توليدات/شهر', 'قوالب أساسية', 'دعم بالبريد'],
    generations: 10,
  },
  pro: {
    name: 'Professional',
    nameAr: 'احترافي',
    price: 29,
    priceAr: '29$/شهر',
    features: ['500 generations/month', 'All templates', 'Priority support', 'Advanced analytics'],
    featuresAr: ['500 توليد/شهر', 'جميع القوالب', 'دعم أولوية', 'تحليلات متقدمة'],
    generations: 500,
  },
  business: {
    name: 'Business',
    nameAr: 'أعمال',
    price: 99,
    priceAr: '99$/شهر',
    features: ['Unlimited generations', 'All features', '24/7 support', 'API access', 'Custom branding'],
    featuresAr: ['توليدات غير محدودة', 'جميع المميزات', 'دعم 24/7', 'وصول API', 'علامة تجارية مخصصة'],
    generations: -1, // Unlimited
  },
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        // Create default free subscription
        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            status: 'active',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSubscription(newSub);
      } else {
        setSubscription(data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const currentPlan = subscription?.plan || 'free';
  const planDetails = PLANS[currentPlan] || PLANS.free;

  return {
    subscription,
    isLoading,
    error,
    currentPlan,
    planDetails,
    refreshSubscription: fetchSubscription,
  };
}
