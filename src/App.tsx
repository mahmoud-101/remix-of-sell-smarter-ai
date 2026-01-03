import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProductCopy from "./pages/ProductCopy";
import AdsCopy from "./pages/AdsCopy";
import CampaignPlanner from "./pages/CampaignPlanner";
import DesignAdvisor from "./pages/DesignAdvisor";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/product-copy" element={<ProductCopy />} />
          <Route path="/dashboard/ads-copy" element={<AdsCopy />} />
          <Route path="/dashboard/campaign" element={<CampaignPlanner />} />
          <Route path="/dashboard/design" element={<DesignAdvisor />} />
          <Route path="/dashboard/competitor" element={<CompetitorAnalysis />} />
          <Route path="/dashboard/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
