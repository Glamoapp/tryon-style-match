import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, ChevronRight, Crown } from "lucide-react";
import { useProviders } from "@/hooks/useProviders";

const TopRatedStylists = () => {
  const { providers, loading } = useProviders();

  // Sort by rating desc, then by review count
  const topRated = [...providers]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold text-gold uppercase tracking-widest font-body">
                Highest Rated
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Top Rated Stylists
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse h-48 min-w-[calc(50%-6px)] md:min-w-[calc(25%-9px)] flex-shrink-0" />
            ))}
          </div>
        )}

        {!loading && topRated.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">
            No top-rated stylists yet. Check back soon!
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topRated.map((stylist, index) => (
            <motion.div
              key={stylist.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/stylist/${stylist.id}`} className="block group">
                <div className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gold/30 bg-muted flex-shrink-0">
                      {stylist.avatar_url ? (
                        <img src={stylist.avatar_url} alt={stylist.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-bold text-muted-foreground">{stylist.full_name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-foreground truncate">{stylist.full_name}</h3>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.round(stylist.rating) ? "fill-gold text-gold" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-foreground font-body ml-1">
                          {stylist.rating}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-body">
                          ({stylist.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Popular services */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {stylist.specialties.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-secondary px-2.5 py-1 rounded-full font-body text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Profile <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRatedStylists;
