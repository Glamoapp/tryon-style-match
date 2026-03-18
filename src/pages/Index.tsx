import Navbar from "@/components/Navbar";
import HomepageHero from "@/components/HomepageHero";
import NearbyStylists from "@/components/NearbyStylists";
import ProductsNearYou from "@/components/ProductsNearYou";
import CategoryStylists from "@/components/CategoryStylists";
import BestDeals from "@/components/BestDeals";
import TopRatedStylists from "@/components/TopRatedStylists";
import FaceScanPromo from "@/components/FaceScanPromo";
import Footer from "@/components/Footer";
import useVisitorTracking from "@/hooks/useVisitorTracking";

const Index = () => {
  useVisitorTracking();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HomepageHero />
      <NearbyStylists />
      <ProductsNearYou />
      <CategoryStylists />
      <BestDeals />
      <TopRatedStylists />
      <FaceScanPromo />
      <Footer />
    </div>
  );
};

export default Index;
