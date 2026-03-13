import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index.tsx";
import StylistsPage from "./pages/StylistsPage.tsx";
import StylistProfilePage from "./pages/StylistProfilePage.tsx";
import TryOnPage from "./pages/TryOnPage.tsx";
import ExtensionsPage from "./pages/ExtensionsPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import BookingTrackerPage from "./pages/BookingTrackerPage.tsx";
import ProviderSignup from "./pages/ProviderSignup.tsx";
import ProviderLogin from "./pages/ProviderLogin.tsx";
import ProviderOnboarding from "./pages/ProviderOnboarding.tsx";
import ProviderDashboard from "./pages/ProviderDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/stylists" element={<StylistsPage />} />
      <Route path="/stylist/:id" element={<StylistProfilePage />} />
      <Route path="/tryon" element={<TryOnPage />} />
      <Route path="/extensions" element={<ExtensionsPage />} />
      <Route path="/product/:handle" element={<ProductPage />} />
      <Route path="/booking-tracker" element={<BookingTrackerPage />} />
      <Route path="/provider/signup" element={<ProviderSignup />} />
      <Route path="/provider/login" element={<ProviderLogin />} />
      <Route path="/provider/onboarding" element={<ProviderOnboarding />} />
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
