import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, MapPin, ChevronRight } from "lucide-react";
import { useProviders } from "@/hooks/useProviders";
import { useFavorites } from "@/hooks/useFavorites";
import FavoriteButton from "@/components/FavoriteButton";

const StylistsSection = () => {
  const { providers, loading } = useProviders();
  const { isFavorite, toggleFavorite } = useFavorites();

  const topCards = providers.slice(0, 3).map((p) => ({
    id: p.id,
    name: p.full_name,
    avatar: p.avatar_url,
    rating: p.rating || 0,
    reviews: p.reviewCount,
    specialties: p.specialties,
    coverPhoto: p.coverPhoto,
    price: p.services[0] ? `$${p.services[0].price}+` : "$0",
    city: p.city,
    available: true,
  }));

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

        {loading && (
          <p className="text-center text-muted-foreground font-body">Loading stylists...</p>
        )}

        {!loading && topCards.length === 0 && (
          <p className="text-center text-muted-foreground font-body">No stylists available yet. Check back soon!</p>
        )}

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
              <Link to={`/stylist/${card.id}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  {card.coverPhoto ? (
                    <img src={card.coverPhoto} alt="Portfolio" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  <FavoriteButton
                    isFavorite={isFavorite(card.id)}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(card.id); }}
                    className="absolute top-3 right-3"
                  />
                  {card.available && (
                    <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs font-semibold text-white font-body">Available</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-5">
                <Link to={`/stylist/${card.id}`}>
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
                </Link>

                <div className="flex flex-wrap gap-2 mb-4">
                  {card.specialties.map((s) => (
                    <span key={s} className="text-xs bg-secondary px-3 py-1 rounded-full font-body text-secondary-foreground">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground font-body mb-4">
                  {card.city && (
                    <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {card.city}</div>
                  )}
                  <span className="font-semibold text-foreground">{card.price}</span>
                </div>

                <Link to={`/stylist/${card.id}`}>
                  <Button variant="hero" className="w-full" size="sm">
                    View Profile <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
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
