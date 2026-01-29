import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StoreConnection = {
  id: string;
  store_name: string;
  store_url: string;
  platform: "shopify" | "woocommerce";
  is_active: boolean | null;
  last_sync_at: string | null;
  products_count: number | null;
};

type SyncedProduct = {
  id: string;
  title: string;
  price: number | null;
  product_url: string | null;
  image_url: string | null;
  status: string | null;
  last_synced_at: string | null;
};

export default function SyncedProducts() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [storeUrl, setStoreUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [shopifyAccessToken, setShopifyAccessToken] = useState("");

  const [connection, setConnection] = useState<StoreConnection | null>(null);
  const [products, setProducts] = useState<SyncedProduct[]>([]);

  const canSync = useMemo(() => !!connection?.id, [connection?.id]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: conn } = await supabase
        .from("store_connections_safe")
        .select("id, store_name, store_url, platform, is_active, last_sync_at, products_count")
        .eq("user_id", user.id)
        .eq("platform", "shopify")
        .maybeSingle();

      if (conn?.id) {
        setConnection(conn as any);
        const { data: prods } = await supabase
          .from("synced_products")
          .select("id, title, price, product_url, image_url, status, last_synced_at")
          .eq("user_id", user.id)
          .order("last_synced_at", { ascending: false })
          .limit(50);
        setProducts((prods || []) as any);
      } else {
        setConnection(null);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleConnect = async () => {
    if (!storeUrl.trim() || !shopifyAccessToken.trim()) {
      toast({
        title: isRTL ? "بيانات ناقصة" : "Missing info",
        description: isRTL
          ? "أدخل رابط المتجر وShopify Admin Access Token"
          : "Enter store URL and Shopify Admin access token",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("store-sync", {
        body: {
          action: "connect",
          platform: "shopify",
          storeUrl,
          storeName: storeName || "Shopify",
          apiKey: shopifyAccessToken,
          apiSecret: null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: isRTL ? "تم الاتصال" : "Connected",
        description: data?.message || (isRTL ? "تم الاتصال بنجاح" : "Connected successfully"),
      });

      await load();
    } catch (e: any) {
      toast({
        title: isRTL ? "فشل الاتصال" : "Connect failed",
        description: e?.message || (isRTL ? "تعذر الاتصال" : "Could not connect"),
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!connection?.id) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("store-sync", {
        body: {
          action: "sync",
          connectionId: connection.id,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: isRTL ? "تمت المزامنة" : "Synced",
        description: data?.message || (isRTL ? "تمت المزامنة" : "Sync completed"),
      });
      await load();
    } catch (e: any) {
      toast({
        title: isRTL ? "فشل المزامنة" : "Sync failed",
        description: e?.message || (isRTL ? "تعذر المزامنة" : "Could not sync"),
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div>
          <h1 className="text-2xl font-bold">
            {isRTL ? "المنتجات المتزامنة" : "Synced Products"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "اربط متجرك Shopify ثم اعمل Sync لجلب المنتجات (بدون صور/أنيميشن لتسريع الـMVP)."
              : "Connect your Shopify store and sync products (lean MVP UI)."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "ربط Shopify" : "Connect Shopify"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connection?.id ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">{connection.store_name}</div>
                  <div className="text-muted-foreground">{connection.store_url}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleSync} disabled={syncing || !canSync}>
                    {syncing ? (isRTL ? "جارٍ المزامنة..." : "Syncing...") : isRTL ? "مزامنة المنتجات" : "Sync Products"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>{isRTL ? "رابط المتجر" : "Store URL"}</Label>
                  <Input
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder={isRTL ? "example.myshopify.com" : "example.myshopify.com"}
                    inputMode="url"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{isRTL ? "اسم المتجر (اختياري)" : "Store name (optional)"}</Label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>{isRTL ? "Shopify Admin Access Token" : "Shopify Admin Access Token"}</Label>
                  <Input
                    value={shopifyAccessToken}
                    onChange={(e) => setShopifyAccessToken(e.target.value)}
                    placeholder={isRTL ? "shpat_..." : "shpat_..."}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL
                      ? "يتم حفظه بشكل آمن في الـbackend ولا يظهر مرة أخرى."
                      : "Stored securely in the backend and never shown again."}
                  </p>
                </div>
                <Button onClick={handleConnect} disabled={connecting}>
                  {connecting ? (isRTL ? "جارٍ الربط..." : "Connecting...") : isRTL ? "ربط Shopify" : "Connect"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "قائمة المنتجات" : "Products"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {isRTL ? "جارٍ التحميل..." : "Loading..."}
              </div>
            ) : products.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {isRTL ? "لا توجد منتجات بعد" : "No products yet"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "العنوان" : "Title"}</TableHead>
                    <TableHead>{isRTL ? "السعر" : "Price"}</TableHead>
                    <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isRTL ? "الرابط" : "Link"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.price ?? "-"}</TableCell>
                      <TableCell>{p.status ?? "-"}</TableCell>
                      <TableCell>
                        {p.product_url ? (
                          <a
                            className="text-primary underline"
                            href={p.product_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {isRTL ? "فتح" : "Open"}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
