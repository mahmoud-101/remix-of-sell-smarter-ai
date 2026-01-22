import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Eye, DollarSign, Star, ShoppingCart, Flame, ExternalLink, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  price: string;
  orders: number;
  rating: number;
  imageUrl: string;
  supplierUrl: string;
  estimatedProfit: string;
  source: string;
  trendScore: number;
}

interface FacebookAd {
  id: string;
  pageUrl: string;
  adText: string;
  imageUrl: string;
  callToAction: string;
  startDate: string;
}

export default function ProductResearch() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [facebookAds, setFacebookAds] = useState<FacebookAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [sortBy, setSortBy] = useState('orders');

  const searchAliExpressProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-products', {
        body: { 
          query: searchQuery,
          sortBy: sortBy
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setProducts(data.products || []);
      
      toast({
        title: isRTL ? 'تم البحث بنجاح' : 'Search Complete',
        description: isRTL 
          ? `تم العثور على ${data.products?.length || 0} منتج رابح`
          : `Found ${data.products?.length || 0} winning products`,
      });
    } catch (error: any) {
      console.error('Error searching products:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const searchFacebookAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-facebook-ads', {
        body: { 
          query: searchQuery,
          adType: 'ecommerce'
        }
      });
      
      if (error) throw error;
      setFacebookAds(data.ads || []);
    } catch (error: any) {
      console.error('Error searching ads:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: isRTL ? 'مطلوب' : 'Required',
        description: isRTL ? 'يرجى إدخال كلمة للبحث' : 'Please enter a search term',
        variant: 'destructive'
      });
      return;
    }
    
    if (activeTab === 'products') {
      searchAliExpressProducts();
    } else {
      searchFacebookAds();
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            🔍 {isRTL ? 'أداة البحث عن المنتجات' : 'Product Research Tool'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'اكتشف المنتجات الرابحة وتجسس على إعلانات المنافسين' : 'Discover winning products and spy on competitor ads'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input
            placeholder={isRTL ? "ابحث عن منتجات... (مثال: phone accessories, smart watch)" : "Search for products... (e.g., phone accessories, smart watch)"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-lg"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder={isRTL ? "ترتيب حسب" : "Sort by"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orders">{isRTL ? "الأكثر مبيعاً" : "Best Selling"}</SelectItem>
              <SelectItem value="profit">{isRTL ? "أعلى ربح" : "Highest Profit"}</SelectItem>
              <SelectItem value="trend">{isRTL ? "الأكثر رواجاً" : "Most Trending"}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading} size="lg" className="whitespace-nowrap">
            <Search className="mr-2 h-5 w-5" />
            {loading ? (isRTL ? 'جاري البحث...' : 'Searching...') : (isRTL ? 'بحث' : 'Search')}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="text-base">
              <TrendingUp className="mr-2 h-5 w-5" />
              {isRTL ? 'المنتجات الرابحة' : 'Winning Products'}
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-base">
              <Eye className="mr-2 h-5 w-5" />
              {isRTL ? 'إعلانات المنافسين' : 'Competitor Ads'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">{isRTL ? 'جاري البحث عن المنتجات...' : 'Searching for products...'}</p>
              </div>
            )}
            
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                    <div className="relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/400/400?grayscale';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Badge className="bg-primary text-primary-foreground">
                          <Flame className="h-3 w-3 mr-1" />
                          {product.trendScore}% {isRTL ? 'رائج' : 'Trending'}
                        </Badge>
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          {product.source}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-2 leading-tight">
                        {product.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{isRTL ? 'سعر المورد:' : 'Supplier Price:'}</span>
                          <span className="font-bold text-xl text-primary">{product.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{isRTL ? 'المبيعات الشهرية:' : 'Monthly Sales:'}</span>
                          <span className="font-semibold text-green-600 flex items-center gap-1">
                            <ShoppingCart className="h-4 w-4" />
                            {product.orders.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{isRTL ? 'التقييم:' : 'Rating:'}</span>
                          <span className="font-semibold flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {product.rating}/5
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-dashed">
                          <span className="text-sm text-muted-foreground font-semibold">{isRTL ? 'الربح المتوقع:' : 'Est. Profit:'}</span>
                          <span className="font-bold text-lg text-blue-600 flex items-center">
                            <DollarSign className="h-5 w-5" />
                            {product.estimatedProfit}
                          </span>
                        </div>
                        <Button 
                          className="w-full mt-4 group-hover:bg-primary/90" 
                          variant="default"
                          onClick={() => window.open(product.supplierUrl, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {isRTL ? 'عرض المورد' : 'View Supplier'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {products.length === 0 && !loading && (
              <div className="text-center py-16">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">{isRTL ? 'ابحث عن منتجات لعرض النتائج' : 'Search for products to see results'}</p>
                <p className="text-sm text-muted-foreground mt-2">{isRTL ? 'جرب البحث عن: phone case, smart watch, led lights' : 'Try searching: phone case, smart watch, led lights'}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ads">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">{isRTL ? 'جاري البحث عن الإعلانات...' : 'Searching for ads...'}</p>
              </div>
            )}
            
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facebookAds.map((ad) => (
                  <Card key={ad.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img 
                        src={ad.imageUrl} 
                        alt="Ad creative"
                        className="w-full h-72 object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        📢 Facebook Ad
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-bold text-muted-foreground block mb-2">
                            {isRTL ? 'نص الإعلان:' : 'Ad Text:'}
                          </span>
                          <p className="text-sm line-clamp-4 bg-muted p-3 rounded-lg">
                            {ad.adText}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t">
                          <span className="text-muted-foreground">{isRTL ? 'تاريخ البدء:' : 'Start Date:'}</span>
                          <span className="font-semibold">{ad.startDate}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Call to Action:</span>
                          <span className="font-bold text-primary">{ad.callToAction}</span>
                        </div>
                        <Button 
                          className="w-full mt-2" 
                          variant="default"
                          onClick={() => window.open(ad.pageUrl, '_blank')}
                        >
                          {isRTL ? 'عرض الإعلان الأصلي 👀' : 'View Original Ad 👀'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {facebookAds.length === 0 && !loading && (
              <div className="text-center py-16">
                <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">{isRTL ? 'ابحث عن إعلانات لعرض النتائج' : 'Search for ads to see results'}</p>
                <p className="text-sm text-muted-foreground mt-2">{isRTL ? 'جرب البحث عن أسماء براندات أو منتجات شهيرة' : 'Try searching for brand names or popular products'}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
