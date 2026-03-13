import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Heart, ChevronRight } from "lucide-react";
import BookingDialog from "@/components/BookingDialog";
import { allStylists } from "@/data/stylistsData";
import { useProviders } from "@/hooks/useProviders";

const StylistsSection = () => {
  const { providers } = useProviders();

  // Show real providers first, then fill with mock data up to 3
  const realCards = providers.slice(0, 3).map((p) => ({
    type: "real" as const,
    id: p.id,
    name: p.full_name,
    avatar: p.avatar_url,
    rating: p.rating || 4.8,
    reviews: p.reviewCount,
    specialties: p.specialties,
    coverPhoto: p.coverPhoto,
    price: p.services[0] ? `$${p.services[0].price}+` : "$0",
    city: p.city,
    available: true,
  }));

  const mockNeeded = 3 - realCards.length;
  const mockCards = allStylists.slice(0, mockNeeded).map((s, i) => ({
    type: "mock" as const,
    id: `mock-${i}`,
    name: s.name,
    avatar: s.avatar as string | null,
    rating: s.rating,
    reviews: s.reviews,
    specialties: s.specialties,
    coverPhoto: s.portfolio[0] as string | null,
    price: s.price,
    city: null as string | null,
    available: s.available,
    distance: s.distance,
    eta: s.eta,
  }));

  const topCards = [...realCards, ...mockCards];

  return (
    <section id="stylists" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">Top Rated</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            Stylists <span className="text-gradient-rose">Near You</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto font-body">
            Browse portfolios, check ratings, and book your favorite stylist to come to you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {topCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 border border-border/50"
            >
              <Link to={card.type === "real" ? `/stylist/${card.id}` : "/stylists"} className="block">
                <div className="relative h-48 overflow-hidden">
                  {card.coverPhoto ? (
                    <img src={card.coverPhoto} alt="Portfolio" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </button>
                  {card.available && (
                    <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs font-semibold text-white font-body">Available</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 bg-muted flex items-center justify-center">
                    {card.avatar ? (
                      <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">{card.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{card.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                      <span className="text-sm font-semibold text-foreground font-body">{card.rating}</span>
                      <span className="text-xs text-muted-foreground font-body">({card.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {card.specialties.map((s) => (
                    <span key={s} className="text-xs bg-secondary px-3 py-1 rounded-full font-body text-secondary-foreground">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground font-body mb-4">
                  {card.city && (
                    <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {card.city}</div>
                  )}
                  {"distance" in card && card.distance && (
                    <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {card.distance}</div>
                  )}
                  {"eta" in card && card.eta && (
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {card.eta}</div>
                  )}
                  <span className="font-semibold text-foreground">{card.price}</span>
                </div>

                {card.type === "real" ? (
                  <Link to={`/stylist/${card.id}`}>
                    <Button variant="hero" className="w-full" size="sm">
                      View Profile <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <BookingDialog
                    stylistName={card.name}
                    trigger={
                      <Button variant="hero" className="w-full" size="sm">
                        Book Now <ChevronRight className="w-4 h-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/stylists">
            <Button variant="outline" size="lg" className="px-8">
              View All Stylists <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StylistsSection;
