import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { maintenanceGuides } from "@/data/maintenanceGuides";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Hairstyle Maintenance Guides — NEXTLOOK"
        description="Learn how to care for your weave, braids, K-tips, wigs, and more. Tips, extension info, and video tutorials for every NEXTLOOK service."
        path="/maintenance"
      />
      <Navbar />
      <section className="pt-28 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <span className="text-sm font-semibold text-gold uppercase tracking-widest font-body">
            Care Guides
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mt-3">
            Make Your Style <span className="text-gradient-rose">Last Longer</span>
          </h1>
          <p className="text-cream/70 font-body mt-4 max-w-xl mx-auto">
            Pick a service to see how to maintain it, what extensions work best, and a video tutorial.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maintenanceGuides.map((g, i) => (
              <motion.div
                key={g.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/maintenance/${g.slug}`}
                  className="group block rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow bg-card"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-display font-bold text-foreground">{g.name}</h2>
                    <p className="text-sm text-muted-foreground font-body mt-1">
                      {g.shortDescription}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-primary">
                      View care guide <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MaintenancePage;
