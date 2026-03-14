import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomepageHero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/stylists");
  };

  return (
    <section className="relative pt-16 pb-6 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Beauty services" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/60 to-charcoal/90" />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-cream leading-tight mb-4">
            Beauty Delivered
            <br />
            <span className="text-gradient-rose">To Your Door</span>
          </h1>
          <p className="text-cream/60 font-body mb-8 text-base md:text-lg">
            Book top-rated stylists, grab deals on extensions, and try on looks before you buy.
          </p>

          {/* Search bar — DoorDash style */}
          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
            <div className="flex items-center bg-background rounded-full shadow-elevated overflow-hidden">
              <div className="flex items-center gap-2 pl-5 pr-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <input
                type="text"
                placeholder="Search services, stylists, or extensions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-4 px-2 text-sm font-body bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button type="submit" variant="hero" className="rounded-full m-1.5 px-5">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Quick category pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {["Weave", "Braids", "Wigs", "K-Tips", "Makeup", "Extensions"].map((cat) => (
              <Link
                key={cat}
                to={cat === "Extensions" ? "/extensions" : "/stylists"}
                className="px-4 py-2 rounded-full bg-cream/10 backdrop-blur-sm text-cream/80 text-xs font-body font-medium hover:bg-cream/20 transition-colors border border-cream/10"
              >
                {cat}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomepageHero;
