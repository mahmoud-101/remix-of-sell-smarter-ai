import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ShopifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('جارٍ ربط متجرك...');
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const shop = searchParams.get('shop') || sessionStorage.getItem('shopify_shop');
      const savedState = sessionStorage.getItem('shopify_oauth_state');

      // Validate state for CSRF protection
      if (state !== savedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      if (!code || !shop) {
        throw new Error('Missing authorization code or shop');
      }

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Exchange code for token
      const { data, error } = await supabase.functions.invoke('shopify-oauth', {
        body: {
          action: 'exchange_token',
          code,
          shop
        }
      });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setShopName(data.connection?.shop_name || shop);
        setMessage(data.message || `✅ تم ربط ${data.connection?.shop_name} بنجاح!`);
        
        // Clean up session storage
        sessionStorage.removeItem('shopify_oauth_state');
        sessionStorage.removeItem('shopify_shop');

        toast({
          title: 'تم الربط بنجاح!',
          description: `تم ربط متجر ${data.connection?.shop_name}`,
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/create-content');
        }, 2000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'فشل في ربط المتجر');
      
      toast({
        title: 'خطأ في الربط',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-xl font-semibold mb-2">جارٍ ربط متجرك</h2>
                <p className="text-muted-foreground">يرجى الانتظار...</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-green-600">
                  تم الربط بنجاح! ✅
                </h2>
                <p className="text-muted-foreground mb-4">
                  تم ربط متجر <strong>{shopName}</strong> بنجاح
                </p>
                <p className="text-sm text-muted-foreground">
                  جارٍ توجيهك لصفحة إنشاء المحتوى...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-red-600">
                  فشل الربط ❌
                </h2>
                <p className="text-muted-foreground mb-4">{message}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/settings')} variant="outline">
                  الإعدادات
                </Button>
                <Button onClick={() => window.location.reload()}>
                  إعادة المحاولة
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}