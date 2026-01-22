import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Store, Link2, Unlink, RefreshCw, ShoppingBag, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface StoreConnection {
  id: string;
  platform: 'shopify' | 'woocommerce';
  store_name: string;
  store_url: string;
  is_active: boolean;
  products_count: number;
  last_sync_at: string | null;
  created_at: string;
}

export default function StoreIntegrations() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'shopify' | 'woocommerce'>('shopify');
  
  // Form state
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('store_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections((data || []) as StoreConnection[]);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!storeName || !storeUrl || !apiKey) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (selectedPlatform === 'woocommerce' && !apiSecret) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'Consumer Secret مطلوب لـ WooCommerce' : 'Consumer Secret is required for WooCommerce',
        variant: 'destructive'
      });
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('store-sync', {
        body: {
          action: 'connect',
          platform: selectedPlatform,
          storeName,
          storeUrl,
          apiKey,
          apiSecret: selectedPlatform === 'woocommerce' ? apiSecret : null
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: isRTL ? 'تم الاتصال بنجاح!' : 'Connected Successfully!',
        description: data.message
      });

      setDialogOpen(false);
      resetForm();
      fetchConnections();
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: isRTL ? 'فشل الاتصال' : 'Connection Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      const { data, error } = await supabase.functions.invoke('store-sync', {
        body: { action: 'sync', connectionId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: isRTL ? 'تمت المزامنة!' : 'Sync Complete!',
        description: data.message
      });

      fetchConnections();
    } catch (error: any) {
      toast({
        title: isRTL ? 'فشلت المزامنة' : 'Sync Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('store-sync', {
        body: { action: 'disconnect', connectionId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: isRTL ? 'تم الفصل' : 'Disconnected',
        description: data.message
      });

      fetchConnections();
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setStoreName('');
    setStoreUrl('');
    setApiKey('');
    setApiSecret('');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return isRTL ? 'لم تتم المزامنة بعد' : 'Not synced yet';
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shopifyConnection = connections.find(c => c.platform === 'shopify');
  const wooConnection = connections.find(c => c.platform === 'woocommerce');

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
              ? 'اربط متجرك لاستيراد المنتجات وتوليد المحتوى تلقائياً'
              : 'Connect your store to import products and auto-generate content'}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="mr-2 h-4 w-4" />
              {isRTL ? 'ربط متجر جديد' : 'Connect Store'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'ربط متجرك' : 'Connect Your Store'}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'أدخل بيانات متجرك للاتصال ومزامنة المنتجات'
                  : 'Enter your store details to connect and sync products'}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as 'shopify' | 'woocommerce')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="shopify" disabled={!!shopifyConnection}>
                  <Store className="mr-2 h-4 w-4" />
                  Shopify
                </TabsTrigger>
                <TabsTrigger value="woocommerce" disabled={!!wooConnection}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  WooCommerce
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shopify" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'اسم المتجر' : 'Store Name'}</Label>
                  <Input 
                    placeholder={isRTL ? 'مثال: متجري' : 'e.g., My Store'}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'رابط المتجر' : 'Store URL'}</Label>
                  <Input 
                    placeholder="mystore.myshopify.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'اسم المتجر فقط بدون https://' : 'Store name only without https://'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Access Token</Label>
                  <Input 
                    type="password"
                    placeholder="shpat_xxxxx..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? 'من Settings → Apps → Develop apps → Admin API access token'
                      : 'From Settings → Apps → Develop apps → Admin API access token'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="woocommerce" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'اسم المتجر' : 'Store Name'}</Label>
                  <Input 
                    placeholder={isRTL ? 'مثال: متجري' : 'e.g., My Store'}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'رابط المتجر' : 'Store URL'}</Label>
                  <Input 
                    placeholder="https://mystore.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consumer Key</Label>
                  <Input 
                    type="password"
                    placeholder="ck_xxxxx..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consumer Secret</Label>
                  <Input 
                    type="password"
                    placeholder="cs_xxxxx..."
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? 'من WooCommerce → Settings → Advanced → REST API'
                      : 'From WooCommerce → Settings → Advanced → REST API'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleConnect} disabled={connecting} className="w-full mt-4">
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRTL ? 'جاري الاتصال...' : 'Connecting...'}
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  {isRTL ? 'اتصال ومزامنة' : 'Connect & Sync'}
                </>
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connected Stores */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Shopify Card */}
        <Card className={shopifyConnection ? 'border-green-500/50' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#96bf48]/20 flex items-center justify-center">
                  <Store className="h-5 w-5 text-[#96bf48]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Shopify</CardTitle>
                  <CardDescription>
                    {shopifyConnection ? shopifyConnection.store_name : (isRTL ? 'غير متصل' : 'Not connected')}
                  </CardDescription>
                </div>
              </div>
              {shopifyConnection && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {isRTL ? 'متصل' : 'Connected'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {shopifyConnection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{isRTL ? 'المنتجات' : 'Products'}</p>
                    <p className="font-bold text-lg">{shopifyConnection.products_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{isRTL ? 'آخر مزامنة' : 'Last Sync'}</p>
                    <p className="font-medium text-sm">{formatDate(shopifyConnection.last_sync_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSync(shopifyConnection.id)}
                    disabled={syncing === shopifyConnection.id}
                  >
                    {syncing === shopifyConnection.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isRTL ? 'مزامنة' : 'Sync'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDisconnect(shopifyConnection.id)}
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    {isRTL ? 'فصل' : 'Disconnect'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'اربط متجر Shopify لاستيراد منتجاتك' : 'Connect your Shopify store to import products'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WooCommerce Card */}
        <Card className={wooConnection ? 'border-purple-500/50' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">WooCommerce</CardTitle>
                  <CardDescription>
                    {wooConnection ? wooConnection.store_name : (isRTL ? 'غير متصل' : 'Not connected')}
                  </CardDescription>
                </div>
              </div>
              {wooConnection && (
                <Badge variant="default" className="bg-purple-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {isRTL ? 'متصل' : 'Connected'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {wooConnection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{isRTL ? 'المنتجات' : 'Products'}</p>
                    <p className="font-bold text-lg">{wooConnection.products_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{isRTL ? 'آخر مزامنة' : 'Last Sync'}</p>
                    <p className="font-medium text-sm">{formatDate(wooConnection.last_sync_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSync(wooConnection.id)}
                    disabled={syncing === wooConnection.id}
                  >
                    {syncing === wooConnection.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isRTL ? 'مزامنة' : 'Sync'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDisconnect(wooConnection.id)}
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    {isRTL ? 'فصل' : 'Disconnect'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'اربط متجر WooCommerce لاستيراد منتجاتك' : 'Connect your WooCommerce store to import products'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isRTL ? 'كيفية الحصول على بيانات الاتصال' : 'How to Get Connection Credentials'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Shopify:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>{isRTL ? 'افتح لوحة تحكم Shopify' : 'Open Shopify Admin'}</li>
              <li>{isRTL ? 'اذهب إلى Settings → Apps and sales channels' : 'Go to Settings → Apps and sales channels'}</li>
              <li>{isRTL ? 'اضغط على Develop apps → Create an app' : 'Click Develop apps → Create an app'}</li>
              <li>{isRTL ? 'فعّل Admin API scopes (read_products)' : 'Enable Admin API scopes (read_products)'}</li>
              <li>{isRTL ? 'اضغط Install app وانسخ Access Token' : 'Click Install app and copy Access Token'}</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">WooCommerce:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>{isRTL ? 'افتح لوحة تحكم WordPress' : 'Open WordPress Admin'}</li>
              <li>{isRTL ? 'اذهب إلى WooCommerce → Settings → Advanced → REST API' : 'Go to WooCommerce → Settings → Advanced → REST API'}</li>
              <li>{isRTL ? 'اضغط Add Key' : 'Click Add Key'}</li>
              <li>{isRTL ? 'اختر Permissions: Read' : 'Select Permissions: Read'}</li>
              <li>{isRTL ? 'انسخ Consumer Key و Consumer Secret' : 'Copy Consumer Key and Consumer Secret'}</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}