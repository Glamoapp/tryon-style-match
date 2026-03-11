import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Heart, ChevronRight } from "lucide-react";
import BookingDialog from "@/components/BookingDialog";
import stylist1 from "@/assets/stylist-1.jpg";
import stylist2 from "@/assets/stylist-2.jpg";
import stylist3 from "@/assets/stylist-3.jpg";
import weaveImg from "@/assets/service-weave.jpg";
import braidsImg from "@/assets/service-braids.jpg";
import wigsImg from "@/assets/service-wigs.jpg";

const stylists = [
  {
    name: "Keisha Williams",
    avatar: stylist1,
    rating: 4.9,
    reviews: 247,
    specialties: ["Weave", "Braids"],
    distance: "1.2 mi",
    eta: "25 min",
    price: "$120+",
    portfolio: [weaveImg, braidsImg],
    available: true,
  },
  {
    name: "Amara Johnson",
    avatar: stylist2,
    rating: 4.8,
    reviews: 189,
    specialties: ["Wigs", "Makeup"],
    distance: "2.5 mi",
    eta: "30 min",
    price: "$95+",
    portfolio: [wigsImg, weaveImg],
    available: true,
  },
  {
    name: "Marcus Davis",
    avatar: stylist3,
    rating: 5.0,
    reviews: 312,
    specialties: ["K-Tips", "Weave"],
    distance: "0.8 mi",
    eta: "15 min",
    price: "$150+",
    portfolio: [weaveImg, braidsImg],
    available: true,
  },
];

const StylistsSection = () => {
  return (
    <section id="stylists" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">Top Rated</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            Stylists <span className="text-gradient-rose">Near You</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto font-body">
            Browse portfolios, check ratings, and book your favorite stylist to come to you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stylists.map((stylist, index) => (
            <motion.div
              key={stylist.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 border border-border/50"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={stylist.portfolio[0]} alt="Portfolio" className="w-full h-full object-cover" />
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </button>
                {stylist.available && (
                  <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-cream animate-pulse" />
                    <span className="text-xs font-semibold text-cream font-body">Available</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <img src={stylist.avatar} alt={stylist.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                  <div>
                    <h3 className="font-display font-bold text-foreground">{stylist.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                      <span className="text-sm font-semibold text-foreground font-body">{stylist.rating}</span>
                      <span className="text-xs text-muted-foreground font-body">({stylist.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {stylist.specialties.map((s) => (
                    <span key={s} className="text-xs bg-secondary px-3 py-1 rounded-full font-body text-secondary-foreground">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground font-body mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {stylist.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {stylist.eta}
                  </div>
                  <span className="font-semibold text-foreground">{stylist.price}</span>
                </div>

                <BookingDialog
                  stylistName={stylist.name}
                  trigger={
                    <Button variant="hero" className="w-full" size="sm">
                      Book Now <ChevronRight className="w-4 h-4" />
                    </Button>
                  }
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StylistsSection;
