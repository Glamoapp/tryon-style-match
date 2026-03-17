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
    price: p.services[0] ? `From $${p.services[0].price}` : "",
    service: p.services[0]?.service_name || "",
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

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible">
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
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-elevated transition-all duration-300">
                  {card.coverPhoto ? (
                    <img src={card.coverPhoto} alt={card.name} className="w-full h-full object-cover" />
                  ) : card.avatar ? (
                    <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-3xl font-bold text-muted-foreground">{card.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                  
                  {/* Distance badge */}
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-semibold text-foreground font-body">{card.distance}</span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-display font-bold text-cream text-sm truncate">{card.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span className="text-xs font-semibold text-cream font-body">{card.rating}</span>
                      <span className="text-[10px] text-cream/60 font-body">({card.reviews})</span>
                    </div>
                    {card.price && (
                      <p className="text-[10px] text-cream/70 font-body mt-1">{card.price}</p>
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
