import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProviders, ProviderListing } from "@/hooks/useProviders";
import serviceBraids from "@/assets/service-braids.jpg";
import serviceWeave from "@/assets/service-weave.jpg";
import serviceWigs from "@/assets/service-wigs.jpg";
import serviceLocs from "@/assets/service-locs.jpg";
import serviceMakeup from "@/assets/service-makeup.jpg";
import serviceBarber from "@/assets/service-barber.jpg";
import serviceKtips from "@/assets/service-ktips.jpg";
import serviceNatural from "@/assets/service-natural.jpg";

const SERVICES = [
  { label: "Braids", image: serviceBraids, match: ["braid", "knotless", "box braid", "cornrow", "tribal", "fulani", "senegalese"], from: 120 },
  { label: "Weaves", image: serviceWeave, match: ["weave", "sew-in", "sew in", "sewin"], from: 150 },
  { label: "Wigs", image: serviceWigs, match: ["wig", "frontal", "closure", "lace front", "glueless"], from: 180 },
  { label: "Locs", image: serviceLocs, match: ["loc", "dreadlock", "faux loc", "goddess loc"], from: 200 },
  { label: "Extensions", image: serviceKtips, match: ["extension", "k-tip", "ktip", "i-tip", "nano", "fusion", "tape-in"], from: 250 },
  { label: "Makeup", image: serviceMakeup, match: ["makeup", "make up", "glam", "beat", "bridal makeup"], from: 85 },
  { label: "Barber", image: serviceBarber, match: ["barber", "fade", "lineup", "line up", "taper", "beard trim", "haircut", "cut"], from: 45 },
  { label: "Natural", image: serviceNatural, match: ["natural", "silk press", "twist out", "wash"], from: 95 },
];

const countProviders = (providers: ProviderListing[], matchTerms: string[]) =>
  providers.filter((p) =>
    p.services.some((s) => matchTerms.some((t) => s.service_name.toLowerCase().includes(t)))
  ).length;

const ServicesNearYou = () => {
  const { providers, loading } = useProviders();

  const sections = SERVICES.map((s) => ({
    ...s,
    count: loading ? 0 : countProviders(providers, s.match),
  }));

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Services Near You
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mt-1">
              What we offer in your area
            </h2>
          </div>
          <Link to="/stylists">
            <Button variant="ghost" size="sm" className="text-primary font-body">
              Browse all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex items-start gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {sections.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="w-[132px] sm:w-[140px] md:w-[148px] lg:w-[156px] flex-none"
            >
              <Link
                to={`/stylists?specialty=${encodeURIComponent(s.label)}`}
                className="block group"
              >
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] shadow-card hover:shadow-elevated transition-all duration-300">
                  <img src={s.image} alt={s.label} className="block w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
                  <div className="absolute top-1.5 right-1.5 bg-background/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    <span className="text-[9px] font-bold text-primary font-body">
                      {s.count > 0 ? `${s.count}` : "•"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h3 className="font-display font-bold text-cream text-xs leading-tight">
                      {s.label}
                    </h3>
                    <p className="text-[9px] text-cream/80 font-body">
                      From ${s.from}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesNearYou;
