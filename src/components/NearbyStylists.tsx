import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, MapPin, ChevronRight, Navigation } from "lucide-react";
import { useProviders } from "@/hooks/useProviders";
import BookingDialog from "@/components/BookingDialog";

const NearbyStylists = () => {
  const { providers, loading } = useProviders();

  const getDistance = () => {
    const distances = ["0.5 mi", "1.2 mi", "2.3 mi", "3.1 mi", "4.5 mi", "5.8 mi"];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  // Flatten: one card per service
  const serviceCards = providers.flatMap((p) =>
    p.services.map((svc) => ({
      key: `${p.id}-${svc.id}`,
      providerId: p.id,
      serviceId: svc.id,
      providerName: p.full_name,
      city: p.city,
      rating: p.rating || 0,
      reviews: p.reviewCount,
      serviceName: svc.service_name,
      price: svc.price,
      discountPrice: svc.discount_price,
      discountBadge: svc.discount_badge,
      photo: svc.photos[0] || p.coverPhoto || p.avatar_url,
      distance: getDistance(),
    }))
  );

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                Near You
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Services Near You
            </h2>
          </div>
          <Link to="/stylists">
            <Button variant="ghost" size="sm" className="text-primary font-body">
              See all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse h-64 min-w-[160px] flex-shrink-0" />
            ))}
          </div>
        )}

        {!loading && serviceCards.length === 0 && providers.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">
            No services available yet. Check back soon!
          </p>
        )}

        {/* Horizontal scrollable row */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {serviceCards.map((card, index) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="min-w-[calc(50%-6px)] md:min-w-[calc(25%-9px)] max-w-[calc(50%-6px)] md:max-w-[calc(25%-9px)] flex-shrink-0"
            >
              <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 bg-card border border-border/50">
                {/* Service photo — clicking opens booking */}
                <BookingDialog
                  trigger={
                    <div className="relative aspect-[4/3] overflow-hidden cursor-pointer">
                      {card.photo ? (
                        <img src={card.photo} alt={card.serviceName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-2xl font-bold text-muted-foreground">{card.serviceName[0]}</span>
                        </div>
                      )}

                      {/* Distance badge */}
                      <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-semibold text-foreground font-body">{card.distance}</span>
                      </div>

                      {/* Discount badge */}
                      {card.discountBadge && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                          <span className="text-[10px] font-bold font-body">{card.discountBadge}</span>
                        </div>
                      )}
                    </div>
                  }
                  stylistName={card.providerName}
                  styleName={card.serviceName}
                  servicePrice={card.discountPrice || card.price}
                  providerId={card.providerId}
                  serviceId={card.serviceId}
                />

                {/* Info */}
                <div className="p-2.5 space-y-1">
                  <h3 className="font-display font-bold text-foreground text-xs truncate">{card.serviceName}</h3>

                  {/* Price */}
                  <div className="flex items-center gap-1.5">
                    {card.discountPrice ? (
                      <>
                        <span className="text-xs font-bold text-primary font-body">${card.discountPrice}</span>
                        <span className="text-[10px] text-muted-foreground line-through font-body">${card.price}</span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-foreground font-body">${card.price}</span>
                    )}
                  </div>

                  {/* Stylist info */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <Link
                      to={`/stylist/${card.providerId}`}
                      className="text-[10px] text-primary font-body font-semibold truncate mr-1 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {card.providerName}
                    </Link>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span className="text-[10px] font-semibold text-foreground font-body">{card.rating}</span>
                    </div>
                  </div>

                  {card.city && (
                    <p className="text-[9px] text-muted-foreground font-body">{card.city}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NearbyStylists;
