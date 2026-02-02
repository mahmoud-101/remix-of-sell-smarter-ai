import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Store, Loader2, Check, ExternalLink, ShoppingBag } from 'lucide-react';
import shopifyLogo from '@/assets/shopify-logo.svg';

type StoreConnection = {
  id: string;
  platform: 'shopify' | 'salla';
  store_name: string;
  store_url: string;
  is_active: boolean;
  products_count: number;
  last_sync_at: string | null;
};

export default function StoreIntegrations() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<StoreConnection[]>([]);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_connections')
        .select('id, platform, store_name, store_url, is_active, products_count, last_sync_at')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setConnections((data as StoreConnection[]) || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    {
      id: 'shopify',
      name: 'Shopify',
      logo: shopifyLogo,
      description: isRTL ? 'المنصة العالمية الأشهر للتجارة الإلكترونية' : 'The leading global e-commerce platform',
      status: 'available',
      statusLabel: isRTL ? 'متاح' : 'Available',
    },
    {
      id: 'salla',
      name: 'Salla سلة',
      logo: null,
      emoji: '🛒',
      description: isRTL ? 'منصة التجارة الإلكترونية السعودية الرائدة' : 'Leading Saudi e-commerce platform',
      status: 'coming_soon',
      statusLabel: isRTL ? 'قريباً' : 'Coming Soon',
    },
  ];

  const getConnectionForPlatform = (platformId: string) => {
    return connections.find(c => c.platform === platformId && c.is_active);
  };

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
              ? 'اربط متجرك واستورد منتجاتك لتوليد المحتوى تلقائياً'
              : 'Connect your store and import products for automatic content generation'}
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => {
          const connection = getConnectionForPlatform(platform.id);
          const isConnected = !!connection;

          return (
            <Card key={platform.id} className={isConnected ? 'border-primary/50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  {platform.logo ? (
                    <img src={platform.logo} alt={platform.name} className="h-8 w-8" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xl">
                      {platform.emoji}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{platform.description}</p>
                  </div>
                </div>
                <Badge variant={platform.status === 'available' ? 'default' : 'secondary'}>
                  {isConnected ? (
                    <><Check className="h-3 w-3 mr-1" /> {isRTL ? 'متصل' : 'Connected'}</>
                  ) : (
                    platform.statusLabel
                  )}
                </Badge>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{isRTL ? 'المتجر:' : 'Store:'}</span>
                      <span className="font-medium">{connection.store_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{isRTL ? 'المنتجات:' : 'Products:'}</span>
                      <span className="font-medium">{connection.products_count}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={connection.store_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {isRTL ? 'فتح المتجر' : 'Open Store'}
                      </a>
                    </Button>
                  </div>
                ) : platform.status === 'available' ? (
                  <Button className="w-full" variant="outline">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {isRTL ? 'ربط المتجر' : 'Connect Store'}
                  </Button>
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    {isRTL 
                      ? 'هذا التكامل قيد التطوير وسيتوفر قريباً'
                      : 'This integration is under development'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="flex items-start gap-4 pt-6">
          <Store className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">
              {isRTL ? 'لماذا تربط متجرك؟' : 'Why connect your store?'}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {isRTL ? 'استيراد منتجاتك تلقائياً' : 'Auto-import your products'}</li>
              <li>• {isRTL ? 'توليد محتوى لكل المنتجات بضغطة واحدة' : 'Generate content for all products with one click'}</li>
              <li>• {isRTL ? 'تحديث المتجر مباشرة من المنصة' : 'Update store directly from the platform'}</li>
              <li>• {isRTL ? 'مزامنة تلقائية للمخزون والأسعار' : 'Auto-sync inventory and prices'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
