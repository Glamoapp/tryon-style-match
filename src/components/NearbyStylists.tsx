import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, MapPin, ChevronRight, Navigation } from "lucide-react";
import { useProviders } from "@/hooks/useProviders";
import { useState, useEffect } from "react";

const NearbyStylists = () => {
  const { providers, loading } = useProviders();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null)
    );
  }, []);

  const getDistance = () => {
    // Simulated distances since providers don't have lat/lng yet
    const distances = ["0.5 mi", "1.2 mi", "2.3 mi", "3.1 mi", "4.5 mi", "5.8 mi"];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  const cards = providers.map((p) => ({
    id: p.id,
    name: p.full_name,
    avatar: p.avatar_url,
    rating: p.rating || 0,
    reviews: p.reviewCount,
    coverPhoto: p.coverPhoto,
    services: p.services,
    city: p.city,
    distance: getDistance(),
  }));

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                Near You
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Nearby Stylists
            </h2>
          </div>
          <Link to="/stylists">
            <Button variant="ghost" size="sm" className="text-primary font-body">
              See all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />
            ))}
          </div>
        )}

        {!loading && cards.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">
            No stylists available yet. Check back soon!
          </p>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:overflow-visible">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="min-w-[160px] md:min-w-0"
            >
              <Link to={`/stylist/${card.id}`} className="block group">
                <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 bg-card border border-border/50">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {card.coverPhoto ? (
                      <img src={card.coverPhoto} alt={card.name} className="w-full h-full object-cover" />
                    ) : card.avatar ? (
                      <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-3xl font-bold text-muted-foreground">{card.name[0]}</span>
                      </div>
                    )}
                    {/* Distance badge */}
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold text-foreground font-body">{card.distance}</span>
                    </div>
                  </div>

                  {/* Info below image */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-foreground text-sm truncate">{card.name}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-gold text-gold" />
                        <span className="text-xs font-semibold text-foreground font-body">{card.rating}</span>
                        <span className="text-[10px] text-muted-foreground font-body">({card.reviews})</span>
                      </div>
                    </div>

                    {card.city && (
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5">{card.city}</p>
                    )}

                    {/* All services */}
                    {card.services.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {card.services.map((svc) => (
                          <div key={svc.id} className="flex items-center justify-between text-[11px] font-body">
                            <span className="text-foreground truncate mr-2">{svc.service_name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {svc.discount_price ? (
                                <>
                                  <span className="font-semibold text-primary">${svc.discount_price}</span>
                                  <span className="text-muted-foreground line-through text-[9px]">${svc.price}</span>
                                </>
                              ) : (
                                <span className="font-semibold text-foreground">${svc.price}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default NearbyStylists;
