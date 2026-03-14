import Navbar from "@/components/Navbar";
import HomepageHero from "@/components/HomepageHero";
import NearbyStylists from "@/components/NearbyStylists";
import BestDeals from "@/components/BestDeals";
import TopRatedStylists from "@/components/TopRatedStylists";
import FaceScanPromo from "@/components/FaceScanPromo";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HomepageHero />
      <NearbyStylists />
      <BestDeals />
      <TopRatedStylists />
      <FaceScanPromo />
      <Footer />
    </div>
  );
};

export default Index;
