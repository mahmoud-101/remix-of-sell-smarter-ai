import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Loader2 } from 'lucide-react';

export default function StoreIntegrations() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulating load
      setTimeout(() => setLoading(false), 500);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isRTL ? 'تكامل المتاجر' : 'Store Integrations'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'قريباً - ميزة ربط المتاجر قيد التطوير'
              : 'Coming Soon - Store integration feature is under development'}
          </p>
        </div>
      </div>
      
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Store className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isRTL ? 'ميزة قادمة قريباً' : 'Coming Soon'}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {isRTL 
              ? 'نعمل على تطوير ميزة ربط المتاجر الإلكترونية (Shopify, WooCommerce) لتسهيل استيراد المنتجات وتوليد المحتوى تلقائياً.'
              : 'We are developing store integration features (Shopify, WooCommerce) to easily import products and auto-generate content.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
