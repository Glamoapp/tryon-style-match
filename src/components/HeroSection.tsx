import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Stylist doing weave installation at home" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-sm text-cream/70 font-body">Trusted by 10,000+ clients</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-cream leading-tight mb-6">
              Beauty That
              <br />
              <span className="text-gradient-rose">Comes to You</span>
            </h1>

            <p className="text-lg text-cream/70 font-body mb-8 max-w-lg leading-relaxed">
              Try on styles virtually, match with top-rated stylists in your area, and get pampered at your doorstep. Weaves, braids, K-tips, wigs, makeup & more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-base px-8 py-6">
                Try Virtual Styles
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                Find a Stylist
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex items-center gap-8"
          >
            {[
              { value: "500+", label: "Stylists" },
              { value: "4.9★", label: "Avg Rating" },
              { value: "30min", label: "Avg Arrival" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-display font-bold text-cream">{stat.value}</div>
                <div className="text-xs text-cream/50 font-body">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
