import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Store, CheckCircle2, XCircle, Loader2, ExternalLink, ShoppingBag } from 'lucide-react';
import shopifyLogo from '@/assets/shopify-logo.svg';

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
  const [shopInput, setShopInput] = useState('');
  const [showInput, setShowInput] = useState(false);

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

  const handleConnectClick = () => {
    setShowInput(true);
  };

  const handleConnectShopify = async () => {
    if (!shopInput.trim()) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'أدخل اسم متجرك' : 'Enter your store name',
        variant: 'destructive'
      });
      return;
    }

    setConnecting(true);
    try {
      // Clean the shop input
      let cleanShop = shopInput.trim().toLowerCase();
      cleanShop = cleanShop.replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (!cleanShop.includes('.myshopify.com')) {
        cleanShop = `${cleanShop}.myshopify.com`;
      }

      const redirectUri = `${window.location.origin}/shopify/callback`;
      
      const { data, error } = await supabase.functions.invoke('shopify-oauth', {
        body: {
          action: 'get_auth_url',
          shop: cleanShop,
          redirectUri
        }
      });

      if (error) throw error;

      if (data.authUrl) {
        // Store state and shop for CSRF validation
        sessionStorage.setItem('shopify_oauth_state', data.state);
        sessionStorage.setItem('shopify_shop', data.shop);
        
        // Redirect to Shopify OAuth
        window.location.href = data.authUrl;
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Connect error:', error);
      toast({
        title: isRTL ? 'خطأ في الربط' : 'Connection Error',
        description: error.message || (isRTL ? 'فشل في الاتصال بـ Shopify' : 'Failed to connect to Shopify'),
        variant: 'destructive'
      });
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
      <Card className="border-2 border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <img src={shopifyLogo} alt="Shopify" className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              Shopify
              {connection && (
                <Badge className="bg-green-500 text-white">
                  {isRTL ? 'متصل' : 'Connected'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'اسحب منتجاتك تلقائياً وولّد محتوى احترافي'
                : 'Auto-sync products and generate professional content'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {connection ? (
          // ✅ Connected State
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-green-800 dark:text-green-200 truncate">
                  {connection.shop_name}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 truncate">
                  {connection.shop_url}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 rounded-lg p-4">
              <div>
                <p className="text-muted-foreground">{isRTL ? 'تاريخ الربط' : 'Connected'}</p>
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
                {isRTL ? 'فتح Shopify' : 'Open Shopify'}
              </Button>
              <Button 
                variant="ghost" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDisconnect}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isRTL ? 'فصل' : 'Disconnect'}
              </Button>
            </div>
          </div>
        ) : (
          // ❌ Not Connected State
          <div className="space-y-6">
            {!showInput ? (
              // Step 1: Show connect button
              <>
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? 'اربط متجرك الآن' : 'Connect Your Store Now'}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    {isRTL 
                      ? 'سيتم توجيهك لـ Shopify للموافقة على الربط بشكل آمن'
                      : "You'll be redirected to Shopify to securely approve the connection"}
                  </p>
                </div>

                <Button 
                  onClick={handleConnectClick}
                  className="w-full h-14 text-lg bg-[#96bf48] hover:bg-[#7aa93c] text-white font-semibold"
                  size="lg"
                >
                  <img src={shopifyLogo} alt="" className="h-6 w-6 mr-3" />
                  {isRTL ? 'ربط Shopify الآن' : 'Connect Shopify Now'}
                </Button>
              </>
            ) : (
              // Step 2: Show shop input
              <>
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? 'أدخل اسم متجرك' : 'Enter Your Store Name'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {isRTL 
                      ? 'اسم المتجر بدون .myshopify.com'
                      : 'Store name without .myshopify.com'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={isRTL ? "مثال: my-store" : "Example: my-store"}
                      value={shopInput}
                      onChange={(e) => setShopInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnectShopify()}
                      className="h-12 text-lg pr-36 rtl:pr-4 rtl:pl-36"
                      dir="ltr"
                      autoFocus
                    />
                    <span className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      .myshopify.com
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowInput(false);
                        setShopInput('');
                      }}
                      className="flex-1"
                    >
                      {isRTL ? 'رجوع' : 'Back'}
                    </Button>
                    <Button 
                      onClick={handleConnectShopify}
                      disabled={connecting || !shopInput.trim()}
                      className="flex-1 bg-[#96bf48] hover:bg-[#7aa93c] text-white"
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isRTL ? 'جارٍ الربط...' : 'Connecting...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {isRTL ? 'ربط المتجر' : 'Connect Store'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {isRTL ? 'آمن 100%' : '100% Secure'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {isRTL ? 'OAuth رسمي' : 'Official OAuth'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {isRTL ? 'ربط فوري' : 'Instant sync'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
