import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Heart, ChevronRight, Search, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BookingDialog from "@/components/BookingDialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allStylists } from "@/data/stylistsData";

const specialtyFilters = ["Weave", "Braids", "Wigs", "K-Tips", "Makeup", "Natural Hair", "Frontals", "Locs"];

const StylistsPage = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "price">("rating");

  const filtered = useMemo(() => {
    let list = allStylists;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.specialties.some(sp => sp.toLowerCase().includes(q)));
    }
    if (activeFilter !== "All") {
      list = list.filter(s => s.specialties.some(sp => sp.toLowerCase().includes(activeFilter.toLowerCase())));
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
      return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""));
    });
    return list;
  }, [search, activeFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-body">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Find Your <span className="text-gradient-rose">Perfect Stylist</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg font-body">
              Browse {allStylists.length}+ top-rated stylists near you. Filter by specialty, compare ratings, and book instantly.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <div className="flex gap-2">
                {(["rating", "distance", "price"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-4 py-2 rounded-full text-xs font-body font-semibold transition-all capitalize ${
                      sortBy === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                    }`}
                  >
                    {s === "rating" ? "Top Rated" : s === "distance" ? "Nearest" : "Lowest Price"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {specialtyFilters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground font-body mb-6">
            Showing {filtered.length} stylists
          </p>

          {/* Stylist Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((stylist, index) => (
              <motion.div
                key={`${stylist.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 border border-border/50"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={stylist.portfolio[0]} alt="Portfolio" className="w-full h-full object-cover" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </button>
                  {stylist.available && (
                    <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs font-semibold text-white font-body">Available</span>
                    </div>
                  )}
                  {!stylist.available && (
                    <div className="absolute top-3 left-3 bg-muted/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-semibold text-muted-foreground font-body">Booked</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={stylist.avatar} alt={stylist.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
                    <div>
                      <h3 className="font-display font-bold text-foreground text-sm">{stylist.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-gold text-gold" />
                        <span className="text-xs font-semibold text-foreground font-body">{stylist.rating}</span>
                        <span className="text-xs text-muted-foreground font-body">({stylist.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {stylist.specialties.map((s) => (
                      <span key={s} className="text-xs bg-secondary px-2 py-0.5 rounded-full font-body text-secondary-foreground">{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-body mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {stylist.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {stylist.eta}
                    </div>
                    <span className="font-semibold text-foreground">{stylist.price}</span>
                  </div>

                  <BookingDialog
                    stylistName={stylist.name}
                    trigger={
                      <Button variant="hero" className="w-full" size="sm" disabled={!stylist.available}>
                        {stylist.available ? <>Book Now <ChevronRight className="w-4 h-4" /></> : "Unavailable"}
                      </Button>
                    }
                  />
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
