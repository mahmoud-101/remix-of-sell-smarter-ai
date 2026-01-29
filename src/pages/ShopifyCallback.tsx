import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ShopifyCallback() {
  const location = useLocation();

  const params = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const obj: Record<string, string> = {};
    sp.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Shopify Callback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This route is reserved for Shopify connection callbacks.
          </p>
          {Object.keys(params).length > 0 && (
            <pre className="text-xs bg-muted rounded-md p-3 overflow-auto">
              {JSON.stringify(params, null, 2)}
            </pre>
          )}
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Link to="/dashboard/synced-products">
              <Button variant="outline">Synced Products</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
