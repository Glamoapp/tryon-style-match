import Navbar from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import HomepageHero from "@/components/HomepageHero";
import ExploreNextlook from "@/components/ExploreNextlook";
import SeasonalPromo from "@/components/SeasonalPromo";
import NearbyStylists from "@/components/NearbyStylists";
import ServicesNearYou from "@/components/ServicesNearYou";
import ProductsNearYou from "@/components/ProductsNearYou";
import CategoryStylists from "@/components/CategoryStylists";
import BestDeals from "@/components/BestDeals";
import TopRatedStylists from "@/components/TopRatedStylists";
import FaceScanPromo from "@/components/FaceScanPromo";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import useVisitorTracking from "@/hooks/useVisitorTracking";

const Index = () => {
  useVisitorTracking();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="NEXTLOOK — Luxury Beauty That Comes to You" description="Match with top-rated stylists, try on hairstyles virtually, shop premium hair extensions, and book at-home beauty services." path="/" />
      <Navbar />
      <HomepageHero />
      <ExploreNextlook />
      <SeasonalPromo />
      <NearbyStylists />
      <CategoryStylists />
      <BestDeals />
      <ProductsNearYou />
      <TopRatedStylists />
      <FaceScanPromo />
      <HowItWorks />
      <ServicesNearYou />
      <Footer />
    </div>
  );
};

export default Index;
