import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Heart, ChevronRight, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProviders, ProviderListing } from "@/hooks/useProviders";

const specialtyFilters = ["All", "Weave", "Braids", "Wigs", "K-Tips", "Makeup", "Natural Hair", "Frontals", "Locs"];

function mapProviderToCard(p: ProviderListing) {
  return {
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
  };
}

const StylistsPage = () => {
  const [searchParams] = useSearchParams();
  const initialSpecialty = searchParams.get("specialty") || "All";
  const { providers, loading } = useProviders();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialSpecialty);
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");

  const allCards = useMemo(() => providers.map(mapProviderToCard), [providers]);

  const filtered = useMemo(() => {
    let list = allCards;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.specialties.some(sp => sp.toLowerCase().includes(q)));
    }
    if (activeFilter !== "All") {
      list = list.filter(s => s.specialties.some(sp => sp.toLowerCase().includes(activeFilter.toLowerCase())));
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""));
      return 0;
    });
    return list;
  }, [search, activeFilter, sortBy, allCards]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-body">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Find Your <span className="text-gradient-rose">Perfect Stylist</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg font-body">
              Browse top-rated stylists near you. Filter by specialty, compare ratings, and book instantly.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
              </div>
              <div className="flex gap-2">
                {(["rating", "price"] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-4 py-2 rounded-full text-xs font-body font-semibold transition-all capitalize ${
                      sortBy === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                    }`}>
                    {s === "rating" ? "Top Rated" : "Lowest Price"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialtyFilters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                    activeFilter === f ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-body mb-6">
            {loading ? "Loading stylists..." : `Showing ${filtered.length} stylists`}
          </p>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-body">No stylists found. Try adjusting your filters.</p>
            </div>
          )}

          {/* Stylist Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 border border-border/50"
              >
                <Link to={`/stylist/${card.id}`} className="block">
                  <div className="relative h-40 overflow-hidden">
                    {card.coverPhoto ? (
                      <img src={card.coverPhoto} alt="Portfolio" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">No Photo</div>
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

                <div className="p-4">
                  <Link to={`/stylist/${card.id}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 bg-muted flex items-center justify-center shrink-0">
                        {card.avatar ? (
                          <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{card.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-sm">{card.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-gold text-gold" />
                          <span className="text-xs font-semibold text-foreground font-body">{card.rating}</span>
                          <span className="text-xs text-muted-foreground font-body">({card.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {card.specialties.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs bg-secondary px-2 py-0.5 rounded-full font-body text-secondary-foreground">{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-body mb-3">
                    {card.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {card.city}
                      </div>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StylistsPage;
