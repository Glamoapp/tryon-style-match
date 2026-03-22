import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCartSync } from "@/hooks/useCartSync";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index.tsx";
import StylistsPage from "./pages/StylistsPage.tsx";
import StylistDiscoveryPage from "./pages/StylistDiscoveryPage.tsx";
import StylistProfilePage from "./pages/StylistProfilePage.tsx";
import TryOnPage from "./pages/TryOnPage.tsx";
import LiveTryOnPage from "./pages/LiveTryOnPage.tsx";
import ExtensionsPage from "./pages/ExtensionsPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import BookingTrackerPage from "./pages/BookingTrackerPage.tsx";
import ProviderSignup from "./pages/ProviderSignup.tsx";
import ProviderLogin from "./pages/ProviderLogin.tsx";
import ProviderOnboarding from "./pages/ProviderOnboarding.tsx";
import ProviderDashboard from "./pages/ProviderDashboard.tsx";
import CustomerAuth from "./pages/CustomerAuth.tsx";
import MessagesPage from "./pages/MessagesPage.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import CustomerDashboard from "./pages/CustomerDashboard.tsx";
import GlowUpMondayPage from "./pages/GlowUpMondayPage.tsx";
import HandbookPage from "./pages/HandbookPage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import VendorSignup from "./pages/VendorSignup.tsx";
import VendorLogin from "./pages/VendorLogin.tsx";
import VendorDashboard from "./pages/VendorDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/stylists" element={<PageTransition><StylistsPage /></PageTransition>} />
        <Route path="/discover" element={<PageTransition><StylistDiscoveryPage /></PageTransition>} />
        <Route path="/stylist/:id" element={<PageTransition><StylistProfilePage /></PageTransition>} />
        <Route path="/tryon" element={<PageTransition><TryOnPage /></PageTransition>} />
        <Route path="/tryon/live" element={<PageTransition><LiveTryOnPage /></PageTransition>} />
        <Route path="/extensions" element={<PageTransition><ExtensionsPage /></PageTransition>} />
        <Route path="/product/:handle" element={<PageTransition><ProductPage /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/booking-tracker" element={<PageTransition><BookingTrackerPage /></PageTransition>} />
        <Route path="/provider/signup" element={<PageTransition><ProviderSignup /></PageTransition>} />
        <Route path="/provider/login" element={<PageTransition><ProviderLogin /></PageTransition>} />
        <Route path="/provider/onboarding" element={<PageTransition><ProviderOnboarding /></PageTransition>} />
        <Route path="/provider/dashboard" element={<PageTransition><ProviderDashboard /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><CustomerAuth /></PageTransition>} />
        <Route path="/messages" element={<PageTransition><MessagesPage /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><CustomerDashboard /></PageTransition>} />
        <Route path="/glowup-monday" element={<PageTransition><GlowUpMondayPage /></PageTransition>} />
        <Route path="/handbook" element={<PageTransition><HandbookPage /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
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
