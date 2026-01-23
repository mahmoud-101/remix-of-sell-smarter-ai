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
import { Store, Link2, Unlink, RefreshCw, ShoppingBag, CheckCircle2, AlertCircle, Loader2, ExternalLink, Copy, Check, ArrowRight } from 'lucide-react';
import { ShopifyConnection } from '@/components/shopify/ShopifyConnection';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  
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
    if (!storeUrl || !apiKey) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال Access Token' : 'Please enter the Access Token',
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
      // Extract store name from URL
      const extractedStoreName = storeUrl.replace(/^https?:\/\//, '').replace('.myshopify.com', '').replace(/\/$/, '');
      
      const { data, error } = await supabase.functions.invoke('store-sync', {
        body: {
          action: 'connect',
          platform: selectedPlatform,
          storeName: storeName || extractedStoreName,
          storeUrl,
          apiKey,
          apiSecret: selectedPlatform === 'woocommerce' ? apiSecret : null
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: isRTL ? 'تم الاتصال بنجاح! 🎉' : 'Connected Successfully! 🎉',
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
    setCurrentStep(1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const getShopifyAdminUrl = () => {
    const cleanUrl = storeUrl.replace(/^https?:\/\//, '').replace('.myshopify.com', '').replace(/\/$/, '');
    return `https://admin.shopify.com/store/${cleanUrl}/settings/apps/development`;
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
              ? 'اربط متجرك لاستيراد المنتجات وتوليد المحتوى تلقائياً'
              : 'Connect your store to import products and auto-generate content'}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="mr-2 h-4 w-4" />
              {isRTL ? 'ربط متجر جديد' : 'Connect Store'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'ربط متجرك بخطوات بسيطة' : 'Connect Your Store - Easy Steps'}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'اتبع الخطوات التالية لربط متجرك بضغطة زر'
                  : 'Follow these simple steps to connect your store'}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={selectedPlatform} onValueChange={(v) => { setSelectedPlatform(v as 'shopify' | 'woocommerce'); setCurrentStep(1); }}>
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
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep >= step 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {currentStep > step ? <Check className="h-4 w-4" /> : step}
                      </div>
                      {step < 3 && (
                        <ArrowRight className={`h-4 w-4 mx-2 ${currentStep > step ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Enter Store URL */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                        {isRTL ? 'أدخل رابط متجرك' : 'Enter Your Store URL'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL ? 'فقط اسم المتجر بدون .myshopify.com' : 'Just the store name without .myshopify.com'}
                      </p>
                      <Input 
                        placeholder="your-store-name"
                        value={storeUrl}
                        onChange={(e) => setStoreUrl(e.target.value)}
                        className="text-center font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {isRTL ? 'مثال: my-awesome-store' : 'Example: my-awesome-store'}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      disabled={!storeUrl}
                      className="w-full"
                    >
                      {isRTL ? 'التالي' : 'Next'}
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Create App */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                        {isRTL ? 'أنشئ تطبيق في Shopify' : 'Create App in Shopify'}
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {isRTL 
                            ? '1. اضغط على الزر أدناه لفتح إعدادات Shopify'
                            : '1. Click the button below to open Shopify settings'}
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                          <a href={getShopifyAdminUrl()} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {isRTL ? 'فتح إعدادات Shopify' : 'Open Shopify Settings'}
                          </a>
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          {isRTL 
                            ? '2. اضغط "Create an app" ثم "Create app"'
                            : '2. Click "Create an app" then "Create app"'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isRTL 
                            ? '3. اختر اسم للتطبيق (مثلاً: Store Sync)'
                            : '3. Choose an app name (e.g., Store Sync)'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isRTL 
                            ? '4. اضغط "Configure Admin API scopes" واختر الصلاحيات التالية:'
                            : '4. Click "Configure Admin API scopes" and select:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {['read_products', 'write_products', 'read_inventory'].map((scope) => (
                            <Badge key={scope} variant="secondary" className="font-mono text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL 
                            ? '5. اضغط "Save" ثم "Install app"'
                            : '5. Click "Save" then "Install app"'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        {isRTL ? 'السابق' : 'Back'}
                      </Button>
                      <Button onClick={() => setCurrentStep(3)} className="flex-1">
                        {isRTL ? 'تم، التالي' : 'Done, Next'}
                        <ArrowRight className="mr-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Paste Access Token */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
                        {isRTL ? 'انسخ الـ Access Token' : 'Copy the Access Token'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? 'في صفحة التطبيق، اضغط "Reveal token once" وانسخ الكود'
                          : 'In the app page, click "Reveal token once" and copy the token'}
                      </p>
                      <div className="relative">
                        <Input 
                          type="password"
                          placeholder="shpat_xxxxx..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="font-mono"
                          autoComplete="off"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        🔒 {isRTL ? 'يتم تخزين التوكن بشكل آمن ومشفر' : 'Token is stored securely and encrypted'}
                      </p>
                      <p className="text-xs text-destructive mt-1">
                        {isRTL
                          ? '⚠️ هذا الكود يظهر مرة واحدة فقط! احفظه في مكان آمن'
                          : '⚠️ This token is shown only once! Save it somewhere safe'}
                      </p>
                    </div>

                    {/* Optional: Store Name */}
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم المتجر (اختياري)' : 'Store Name (optional)'}</Label>
                      <Input 
                        placeholder={isRTL ? 'مثال: متجري الرائع' : 'e.g., My Awesome Store'}
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                        {isRTL ? 'السابق' : 'Back'}
                      </Button>
                      <Button 
                        onClick={handleConnect} 
                        disabled={connecting || !apiKey} 
                        className="flex-1 bg-[#96bf48] hover:bg-[#7ea53c] text-white"
                      >
                        {connecting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isRTL ? 'جاري الربط...' : 'Connecting...'}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {isRTL ? 'ربط المتجر' : 'Connect Store'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
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
                <Button onClick={handleConnect} disabled={connecting} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
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
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connected Stores */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Shopify - One Click OAuth Connection */}
        <ShopifyConnection />

        {/* WooCommerce Card - Still uses manual API keys */}
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
                <p className="text-sm text-muted-foreground mb-3">
                  {isRTL ? 'اربط متجر WooCommerce لاستيراد منتجاتك' : 'Connect your WooCommerce store to import products'}
                </p>
                <Button variant="outline" size="sm" onClick={() => { setSelectedPlatform('woocommerce'); setDialogOpen(true); }}>
                  <Link2 className="mr-2 h-4 w-4" />
                  {isRTL ? 'ربط الآن' : 'Connect Now'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}