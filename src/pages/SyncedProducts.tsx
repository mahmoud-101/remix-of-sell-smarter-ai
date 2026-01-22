import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, Search, Sparkles, RefreshCw, ExternalLink, 
  Loader2, CheckCircle2, Clock, Store, ShoppingBag, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SyncedProduct {
  id: string;
  external_product_id: string;
  title: string;
  description: string | null;
  price: number | null;
  compare_at_price: number | null;
  image_url: string | null;
  product_url: string | null;
  inventory_quantity: number;
  status: string;
  generated_title: string | null;
  generated_description: string | null;
  generated_at: string | null;
  last_synced_at: string;
  store_connection_id: string;
  store_connections: {
    platform: 'shopify' | 'woocommerce';
    store_name: string;
  };
}

export default function SyncedProducts() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<SyncedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'generated' | 'pending'>('all');

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('synced_products')
        .select(`
          *,
          store_connections (
            platform,
            store_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as SyncedProduct[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (product: SyncedProduct) => {
    setGenerating(product.id);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          type: 'product',
          productName: product.title,
          productDescription: product.description || '',
          targetAudience: isRTL ? 'السوق العربي' : 'General audience',
          tone: isRTL ? 'professional' : 'professional'
        }
      });

      if (error) throw error;

      // Update product with generated content
      const generatedData = data.variations?.[0] || data;
      const { error: updateError } = await supabase
        .from('synced_products')
        .update({
          generated_title: generatedData.title || product.title,
          generated_description: generatedData.description || generatedData.bullets?.join('\n'),
          generated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      toast({
        title: isRTL ? 'تم التوليد!' : 'Generated!',
        description: isRTL ? 'تم توليد المحتوى بنجاح' : 'Content generated successfully'
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setGenerating(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'generated' && p.generated_at) ||
      (filter === 'pending' && !p.generated_at);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: products.length,
    generated: products.filter(p => p.generated_at).length,
    pending: products.filter(p => !p.generated_at).length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Package className="h-8 w-8" />
            {isRTL ? 'المنتجات المتزامنة' : 'Synced Products'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'إدارة منتجات متجرك وتوليد محتوى احترافي لها' 
              : 'Manage your store products and generate professional content'}
          </p>
        </div>

        {products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? 'لا توجد منتجات متزامنة' : 'No Synced Products'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isRTL 
                  ? 'اربط متجرك من صفحة الإعدادات لبدء مزامنة المنتجات'
                  : 'Connect your store from Settings to start syncing products'}
              </p>
              <Link to="/dashboard/settings">
                <Button>
                  <Store className="mr-2 h-4 w-4" />
                  {isRTL ? 'ربط متجر' : 'Connect Store'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إجمالي المنتجات' : 'Total Products'}
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'تم التوليد' : 'Generated'}
                      </p>
                      <p className="text-2xl font-bold text-green-600">{stats.generated}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'في الانتظار' : 'Pending'}
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'بحث في المنتجات...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">
                    {isRTL ? 'الكل' : 'All'} ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="generated">
                    {isRTL ? 'مُولَّد' : 'Generated'} ({stats.generated})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    {isRTL ? 'في الانتظار' : 'Pending'} ({stats.pending})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant={product.store_connections?.platform === 'shopify' ? 'default' : 'secondary'}>
                        {product.store_connections?.platform === 'shopify' ? (
                          <Store className="mr-1 h-3 w-3" />
                        ) : (
                          <ShoppingBag className="mr-1 h-3 w-3" />
                        )}
                        {product.store_connections?.store_name}
                      </Badge>
                    </div>
                    {product.generated_at && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {isRTL ? 'مُولَّد' : 'Generated'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2">
                      {product.generated_title || product.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{isRTL ? 'السعر:' : 'Price:'}</span>
                      <span className="font-bold">${product.price?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{isRTL ? 'المخزون:' : 'Stock:'}</span>
                      <span className={product.inventory_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.inventory_quantity}
                      </span>
                    </div>
                    
                    {product.generated_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 border-t pt-2">
                        {product.generated_description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant={product.generated_at ? 'outline' : 'default'}
                        className="flex-1"
                        onClick={() => generateContent(product)}
                        disabled={generating === product.id}
                      >
                        {generating === product.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        {product.generated_at 
                          ? (isRTL ? 'إعادة توليد' : 'Regenerate')
                          : (isRTL ? 'توليد محتوى' : 'Generate')
                        }
                      </Button>
                      {product.product_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(product.product_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد منتجات مطابقة للبحث' : 'No products match your search'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}