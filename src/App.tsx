import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { TrackingScripts } from "@/components/tracking/TrackingScripts";

// Lazy load pages for better performance
// NOTE: After publishing a new frontend build, some users may have stale cached chunks.
// This helper retries once by forcing a reload on chunk-load errors.
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  key: string
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (e: any) {
      const message = String(e?.message ?? e);
      const isChunkError = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(
        message
      );

      const retryKey = `lazy-retry:${key}`;
      const alreadyRetried = sessionStorage.getItem(retryKey) === "1";

      if (isChunkError && !alreadyRetried) {
        sessionStorage.setItem(retryKey, "1");
        window.location.reload();
      }

      throw e;
    }
  });
}

const Landing = lazyWithRetry(() => import("./pages/Landing"), "Landing");
const Login = lazyWithRetry(() => import("./pages/Login"), "Login");
const Signup = lazyWithRetry(() => import("./pages/Signup"), "Signup");
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"), "ForgotPassword");
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"), "ResetPassword");

// MVP core - 4 Studios
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"), "Dashboard");
const History = lazyWithRetry(() => import("./pages/History"), "History");
const Settings = lazyWithRetry(() => import("./pages/Settings"), "Settings");
const Billing = lazyWithRetry(() => import("./pages/Billing"), "Billing");

// Shopify MVP support
const SyncedProducts = lazyWithRetry(() => import("./pages/SyncedProducts"), "SyncedProducts");
const ShopifyCallback = lazyWithRetry(() => import("./pages/ShopifyCallback"), "ShopifyCallback");
const ReelsGenerator = lazyWithRetry(() => import("./pages/ReelsGenerator"), "ReelsGenerator");
const ImageStudio = lazyWithRetry(() => import("./pages/ImageStudio"), "ImageStudio");
const AdsCopy = lazyWithRetry(() => import("./pages/AdsCopy"), "AdsCopy");

const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "NotFound");

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/synced-products"
          element={
            <ProtectedRoute>
              <SyncedProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reels"
          element={
            <ProtectedRoute>
              <ReelsGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/images"
          element={
            <ProtectedRoute>
              <ImageStudio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/ads-copy"
          element={
            <ProtectedRoute>
              <AdsCopy />
            </ProtectedRoute>
          }
        />

        <Route path="/shopify/callback" element={<ShopifyCallback />} />

        <Route 
          path="/dashboard/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <SecurityHeaders />
            <TrackingScripts />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
