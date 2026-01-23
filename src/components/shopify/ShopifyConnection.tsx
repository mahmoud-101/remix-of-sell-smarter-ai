import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Link2, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface ShopifyConnectionData {
  id: string;
  shop_url: string;
  shop_name: string;
  connected_at: string;
  is_active: boolean;
  last_used_at: string | null;
}

export function ShopifyConnection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [connection, setConnection] = useState<ShopifyConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [shopUrl, setShopUrl] = useState('');

  useEffect(() => {
    if (user) {
      fetchConnection();
    }
  }, [user]);

  const fetchConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('shopify_connections')
        .select('id, shop_url, shop_name, connected_at, is_active, last_used_at')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (error) {
      console.error('Error fetching connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!shopUrl.trim()) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال رابط المتجر' : 'Please enter store URL',
        variant: 'destructive'
      });
      return;
    }

    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/shopify/callback`;
      
      const { data, error } = await supabase.functions.invoke('shopify-oauth', {
        body: {
          action: 'get_auth_url',
          shop: shopUrl,
          redirectUri
        }
      });

      if (error) throw error;

      if (data.authUrl) {
        // Store state for CSRF validation
        sessionStorage.setItem('shopify_oauth_state', data.state);
        sessionStorage.setItem('shopify_shop', data.shop);
        
        // Redirect to Shopify OAuth
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      console.error('Connect error:', error);
      toast({
        title: isRTL ? 'خطأ في الربط' : 'Connection Error',
        description: error.message || (isRTL ? 'فشل في الاتصال بـ Shopify' : 'Failed to connect to Shopify'),
        variant: 'destructive'
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    try {
      const { error } = await supabase
        .from('shopify_connections')
        .update({ is_active: false })
        .eq('id', connection.id);

      if (error) throw error;

      setConnection(null);
      toast({
        title: isRTL ? 'تم الفصل' : 'Disconnected',
        description: isRTL ? 'تم فصل المتجر بنجاح' : 'Store disconnected successfully'
      });
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Store className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {isRTL ? 'ربط متجر Shopify' : 'Connect Shopify Store'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'اربط متجرك لسحب المنتجات وتوليد المحتوى تلقائياً'
                : 'Connect your store to fetch products and generate content automatically'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {connection ? (
          // Connected State
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  {isRTL ? `✅ تم ربط ${connection.shop_name} بنجاح!` : `✅ ${connection.shop_name} connected!`}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {connection.shop_url}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isRTL ? 'متصل' : 'Connected'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{isRTL ? 'تاريخ الربط' : 'Connected on'}</p>
                <p className="font-medium">{formatDate(connection.connected_at)}</p>
              </div>
              {connection.last_used_at && (
                <div>
                  <p className="text-muted-foreground">{isRTL ? 'آخر استخدام' : 'Last used'}</p>
                  <p className="font-medium">{formatDate(connection.last_used_at)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(`https://${connection.shop_url}/admin`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {isRTL ? 'فتح لوحة Shopify' : 'Open Shopify Admin'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isRTL ? 'فصل' : 'Disconnect'}
              </Button>
            </div>
          </div>
        ) : (
          // Not Connected State
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? 'رابط المتجر' : 'Store URL'}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="mystore.myshopify.com"
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                  className="flex-1"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isRTL 
                  ? 'أدخل اسم المتجر فقط (مثال: mystore) أو الرابط الكامل'
                  : 'Enter store name (e.g., mystore) or full URL'}
              </p>
            </div>

            <Button 
              onClick={handleConnect}
              disabled={connecting || !shopUrl.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRTL ? 'جارٍ الربط...' : 'Connecting...'}
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  {isRTL ? 'ربط المتجر الآن' : 'Connect Store Now'}
                </>
              )}
            </Button>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Store className="h-4 w-4" />
                {isRTL ? 'الصلاحيات المطلوبة:' : 'Required Permissions:'}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {isRTL ? 'قراءة المنتجات' : 'Read products'}</li>
                <li>• {isRTL ? 'تعديل المنتجات' : 'Write products'}</li>
                <li>• {isRTL ? 'قراءة المخزون' : 'Read inventory'}</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}