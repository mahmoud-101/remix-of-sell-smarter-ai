import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const handleConnectShopify = async () => {
    setConnecting(true);
    try {
      // Get the Shopify App installation URL from our backend
      const redirectUri = `${window.location.origin}/shopify/callback`;
      
      const { data, error } = await supabase.functions.invoke('shopify-oauth', {
        body: {
          action: 'get_install_url',
          redirectUri
        }
      });

      if (error) throw error;

      if (data.installUrl) {
        // Store state for CSRF validation
        sessionStorage.setItem('shopify_oauth_state', data.state);
        
        // Redirect to Shopify App installation
        window.location.href = data.installUrl;
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
          // ❌ Not Connected State - ONE BUTTON ONLY
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? 'اربط متجرك بضغطة واحدة' : 'Connect Your Store in One Click'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {isRTL 
                  ? 'سيتم توجيهك لـ Shopify للموافقة على الربط. لا تحتاج إدخال أي بيانات!'
                  : "You'll be redirected to Shopify to approve the connection. No data entry needed!"}
              </p>
            </div>

            <Button 
              onClick={handleConnectShopify}
              disabled={connecting}
              className="w-full h-14 text-lg bg-[#96bf48] hover:bg-[#7aa93c] text-white font-semibold"
              size="lg"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  {isRTL ? 'جارٍ التوجيه...' : 'Redirecting...'}
                </>
              ) : (
                <>
                  <img src={shopifyLogo} alt="" className="h-6 w-6 mr-3" />
                  {isRTL ? 'ربط Shopify الآن' : 'Connect Shopify Now'}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {isRTL ? 'آمن 100%' : '100% Secure'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {isRTL ? 'بدون بيانات يدوية' : 'No manual data'}
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
