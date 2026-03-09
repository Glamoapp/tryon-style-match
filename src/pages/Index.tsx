import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import VirtualTryOn from "@/components/VirtualTryOn";
import StylistsSection from "@/components/StylistsSection";
import HowItWorks from "@/components/HowItWorks";
import BookingTracker from "@/components/BookingTracker";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <VirtualTryOn />
      <StylistsSection />
      <HowItWorks />
      <BookingTracker />
      <Footer />
    </div>
  );
};

export default Index;
