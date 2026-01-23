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
  const [pendingAuthUrl, setPendingAuthUrl] = useState<string | null>(null);

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const normalizeShopInput = (input: string): string | null => {
    let s = input.trim().toLowerCase();
    if (!s) return null;

    // Strip protocol + leading www
    s = s.replace(/^https?:\/\//, '').replace(/^www\./, '');

    // Support Shopify's new admin URLs: admin.shopify.com/store/{store}/...
    const adminMatch = s.match(/^admin\.shopify\.com\/store\/([^/]+)/);
    if (adminMatch?.[1]) {
      s = `${adminMatch[1]}.myshopify.com`;
    }

    // If user pasted a myshopify URL (maybe with /admin), keep hostname only
    const myshopifyIdx = s.indexOf('.myshopify.com');
    if (myshopifyIdx !== -1) {
      s = s.slice(0, myshopifyIdx + '.myshopify.com'.length);
    } else {
      // Otherwise take first segment as store name
      s = s.split('/')[0];
      if (!s) return null;
      s = `${s}.myshopify.com`;
    }

    return s;
  };

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
        description: isRTL ? 'أدخل اسم المتجر أو رابط لوحة التحكم' : 'Enter store name or admin URL',
        variant: 'destructive'
      });
      return;
    }

    setConnecting(true);
    setPendingAuthUrl(null);
    const popup = isInIframe ? window.open('about:blank', '_blank', 'noopener,noreferrer') : null;
    try {
      const cleanShop = normalizeShopInput(shopInput);
      if (!cleanShop) {
        throw new Error(isRTL ? 'صيغة رابط المتجر غير صحيحة' : 'Invalid store URL format');
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
        // localStorage works across tabs (needed when we open Shopify in a new tab)
        localStorage.setItem('shopify_oauth_state', data.state);
        localStorage.setItem('shopify_shop', data.shop);
        // keep sessionStorage as fallback
        sessionStorage.setItem('shopify_oauth_state', data.state);
        sessionStorage.setItem('shopify_shop', data.shop);

        // Shopify blocks being embedded in iframes; opening in the preview iframe can look like a blank page.
        if (isInIframe) {
          if (popup) {
            popup.location.href = data.authUrl;
          } else {
            setPendingAuthUrl(data.authUrl);
            window.open(data.authUrl, '_blank', 'noopener,noreferrer');
          }
          toast({
            title: isRTL ? 'افتح Shopify في تبويب جديد' : 'Open Shopify in a new tab',
            description: isRTL ? 'كمّل الموافقة هناك وارجع هنا.' : 'Complete approval there, then come back here.',
          });
          return;
        }

        // Normal navigation (non-iframe)
        window.location.href = data.authUrl;
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      if (popup) {
        try { popup.close(); } catch {}
      }
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
      <Card className="border-2 border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-background rounded-xl shadow-sm border">
            <img src={shopifyLogo} alt="Shopify" className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              Shopify
              {connection && (
                <Badge>
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
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-border">
              <CheckCircle2 className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {connection.shop_name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
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
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                  className="w-full text-lg font-semibold"
                  size="xl"
                  variant="hero"
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
                      ? 'اكتب اسم المتجر أو رابط لوحة التحكم (مرة واحدة)'
                      : 'Enter store name or admin URL (one-time)'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={isRTL ? "مثال: my-store أو https://my-store.myshopify.com/admin" : "Example: my-store or https://my-store.myshopify.com/admin"}
                      value={shopInput}
                      onChange={(e) => setShopInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnectShopify()}
                      className="h-12 text-lg"
                      dir="ltr"
                      autoFocus
                    />
                  </div>

                  {pendingAuthUrl && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={pendingAuthUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isRTL ? 'افتح صفحة Shopify' : 'Open Shopify page'}
                      </a>
                    </Button>
                  )}

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
                      className="flex-1"
                      variant="hero"
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
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {isRTL ? 'OAuth رسمي' : 'Official OAuth'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {isRTL ? 'ربط فوري' : 'Instant sync'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
