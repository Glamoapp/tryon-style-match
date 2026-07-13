import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, MapPin, ChevronRight } from "lucide-react";
import { useProviders, ProviderListing } from "@/hooks/useProviders";
import GoldenCrownBadge from "@/components/GoldenCrownBadge";

const CATEGORIES = [
  { label: "Weaves", match: ["weave", "sew-in", "sew in", "sewin"] },
  { label: "Braids", match: ["braid", "knotless", "box braid", "cornrow", "tribal", "fulani", "senegalese"] },
  { label: "Wigs", match: ["wig", "frontal", "closure", "lace front", "glueless"] },
  { label: "Locs", match: ["loc", "dreadlock", "faux loc", "goddess loc"] },
  { label: "Extensions", match: ["extension", "k-tip", "ktip", "i-tip", "nano", "fusion", "tape-in"] },
  { label: "Makeup", match: ["makeup", "make up", "glam", "beat", "bridal makeup"] },
  { label: "Barber", match: ["barber", "fade", "lineup", "line up", "taper", "beard trim", "haircut", "cut"] },
];

const getDistance = () => {
  const distances = ["0.5 mi", "1.2 mi", "2.3 mi", "3.1 mi", "4.5 mi", "5.8 mi"];
  return distances[Math.floor(Math.random() * distances.length)];
};

const matchesCategory = (provider: ProviderListing, matchTerms: string[]) => {
  return provider.services.some((s) =>
    matchTerms.some((term) => s.service_name.toLowerCase().includes(term))
  );
};

const CategoryStylists = () => {
  const { providers, loading } = useProviders();

  if (loading) return null;

  const categorySections = CATEGORIES.map((cat) => ({
    ...cat,
    providers: providers.filter((p) => matchesCategory(p, cat.match)),
  })).filter((cat) => cat.providers.length > 5);

  if (categorySections.length === 0) return null;

  return (
    <>
      {categorySections.map((section) => (
        <section key={section.label} className="py-10 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                  In Your Area
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {section.label} Near You
                </h2>
              </div>
              <Link to={`/stylists?specialty=${encodeURIComponent(section.label)}`}>
                <Button variant="ghost" size="sm" className="text-primary font-body">
                  See all <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {section.providers.slice(0, 6).map((p, index) => {
                const matchingService = p.services.find((s) =>
                  section.match.some((term) => s.service_name.toLowerCase().includes(term))
                );
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="min-w-[calc(50%-6px)] md:min-w-[calc(25%-9px)] max-w-[calc(50%-6px)] md:max-w-[calc(25%-9px)] flex-shrink-0"
                  >
                    <Link to={`/stylist/${p.id}`} className="block group">
                      <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-elevated transition-all duration-300">
                        {p.coverPhoto ? (
                          <img src={p.coverPhoto} alt={p.full_name} className="w-full h-full object-cover" />
                        ) : p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-3xl font-bold text-muted-foreground">{p.full_name[0]}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

                        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-semibold text-foreground font-body">{getDistance()}</span>
                        </div>

                        {/* Discount badge */}
                        {matchingService && (matchingService as any).discount_price && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                            <span className="text-[10px] font-bold font-body">
                              {(matchingService as any).discount_badge || `$${(matchingService as any).discount_price}`}
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display font-bold text-cream text-sm truncate">{p.full_name}</h3>
                            <GoldenCrownBadge size={16} animate={false} />
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-gold text-gold" />
                            <span className="text-xs font-semibold text-cream font-body">{p.rating}</span>
                            <span className="text-[10px] text-cream/60 font-body">({p.reviewCount})</span>
                          </div>
                          {matchingService && (
                            <div className="flex items-center gap-1.5 mt-1">
                              {(matchingService as any).discount_price ? (
                                <>
                                  <span className="text-[10px] font-bold text-cream font-body">
                                    ${(matchingService as any).discount_price}
                                  </span>
                                  <span className="text-[10px] text-cream/50 line-through font-body">
                                    ${matchingService.price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[10px] text-cream/70 font-body">
                                  From ${matchingService.price}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </>
  );
};

export default CategoryStylists;
