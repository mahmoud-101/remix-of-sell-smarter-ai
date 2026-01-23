import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Package, Link2, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  image: string | null;
  description: string;
  descriptionText?: string;
  url: string;
  vendor?: string;
  productType?: string;
  compareAtPrice?: string | null;
  inventoryQuantity?: number;
}

interface ProductSelectorProps {
  onProductSelect: (product: Product | null) => void;
  selectedProduct: Product | null;
}

export function ProductSelector({ onProductSelect, selectedProduct }: ProductSelectorProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const [productUrl, setProductUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasConnection, setHasConnection] = useState<boolean | null>(null);

  // Check if user has Shopify connection
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const { data } = await supabase
      .from('shopify_connections')
      .select('id')
      .eq('is_active', true)
      .maybeSingle();
    
    setHasConnection(!!data);
  };

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { action: 'search', searchTerm: term }
      });

      if (error) throw error;

      if (data.error === 'no_connection') {
        setHasConnection(false);
        return;
      }

      setSearchResults(data.products || []);
    } catch (error: any) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFetchByUrl = async () => {
    if (!productUrl.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { action: 'fetch_by_url', productUrl }
      });

      if (error) throw error;

      if (data.error === 'no_connection') {
        setHasConnection(false);
        toast({
          title: isRTL ? 'غير متصل' : 'Not Connected',
          description: isRTL ? 'يجب ربط متجر Shopify أولاً' : 'Please connect your Shopify store first',
          variant: 'destructive'
        });
        return;
      }

      if (data.error) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: data.error,
          variant: 'destructive'
        });
        return;
      }

      onProductSelect(data.product);
      setProductUrl('');
      setSearchTerm('');
      setSearchResults([]);
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل سحب المنتج' : 'Failed to fetch product'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromSearch = async (product: Product) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { action: 'fetch_by_id', productId: product.id }
      });

      if (error) throw error;
      
      onProductSelect(data.product);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    onProductSelect(null);
  };

  // No connection state
  if (hasConnection === false) {
    return (
      <Card className="border-dashed border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="py-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="font-semibold mb-2">
            {isRTL ? 'يجب ربط متجر Shopify أولاً' : 'Connect Shopify Store First'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isRTL 
              ? 'اذهب للإعدادات لربط متجرك'
              : 'Go to Settings to connect your store'}
          </p>
          <Button onClick={() => window.location.href = '/settings'}>
            {isRTL ? 'الذهاب للإعدادات' : 'Go to Settings'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Selected product display
  if (selectedProduct) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {selectedProduct.image ? (
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold truncate">{selectedProduct.title}</h3>
                  <p className="text-lg font-bold text-primary">{selectedProduct.price} EGP</p>
                  {selectedProduct.vendor && (
                    <p className="text-sm text-muted-foreground">{selectedProduct.vendor}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={clearSelection}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <Label>{isRTL ? 'الصق رابط المنتج' : 'Paste Product URL'}</Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://mystore.myshopify.com/products/..."
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="flex-1"
            dir="ltr"
          />
          <Button 
            onClick={handleFetchByUrl}
            disabled={loading || !productUrl.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
          {isRTL ? 'أو' : 'or'}
        </span>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <Label>{isRTL ? 'ابحث عن منتج في متجرك' : 'Search your products'}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? 'ابحث بالاسم...' : 'Search by name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="max-h-64 overflow-auto">
            <CardContent className="p-2">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectFromSearch(product)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors text-left"
                  disabled={loading}
                >
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-primary font-semibold">{product.price} EGP</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}