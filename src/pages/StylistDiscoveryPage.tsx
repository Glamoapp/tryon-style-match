/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { google: any; }
}
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Heart, ChevronRight, Search, ArrowLeft, List, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProviders, ProviderListing } from "@/hooks/useProviders";
import { Skeleton } from "@/components/ui/skeleton";

const serviceFilters = [
  "All",
  "Weave",
  "Braids",
  "Wigs",
  "K-Tips",
  "Makeup",
  "Natural Hair",
  "Frontals",
  "Locs",
];

interface StylistCard {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
  reviews: number;
  specialties: string[];
  coverPhoto: string | null;
  price: string;
  priceNum: number;
  city: string | null;
  lat: number | null;
  lng: number | null;
}

function mapProviderToCard(p: ProviderListing): StylistCard {
  const firstService = p.services[0];
  return {
    id: p.id,
    name: p.full_name,
    avatar: p.avatar_url,
    rating: p.rating || 0,
    reviews: p.reviewCount,
    specialties: p.specialties,
    coverPhoto: p.coverPhoto,
    price: firstService ? `$${firstService.price}` : "$0",
    priceNum: firstService ? firstService.price : 0,
    city: p.city,
    lat: p.latitude ?? null,
    lng: p.longitude ?? null,
  };
}

// Google Maps component
const StylistMap = ({
  stylists,
  selectedId,
  onSelectStylist,
}: {
  stylists: StylistCard[];
  selectedId: string | null;
  onSelectStylist: (id: string) => void;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const fetchKey = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-maps-key`,
          { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
        );
        const { key } = await res.json();
        if (!key) return;

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker&v=weekly`;
        script.async = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
      } catch (e) {
        console.error("Failed to load maps:", e);
      }
    };
    fetchKey();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 33.749, lng: -84.388 }, // Atlanta default
      zoom: 11,
      mapId: "stylist-discovery",
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#f5f0f6" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#e8e0ec" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4c8db" }] },
      ],
    });
    googleMapRef.current = map;
  }, [mapLoaded]);

  // Update markers when stylists change
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    const stylistsWithCoords = stylists.filter((s) => s.lat && s.lng);
    if (stylistsWithCoords.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    stylistsWithCoords.forEach((stylist) => {
      const position = { lat: stylist.lat!, lng: stylist.lng! };
      bounds.extend(position);

      const isSelected = stylist.id === selectedId;

      // Create price pin element
      const pinEl = document.createElement("div");
      pinEl.className = "stylist-map-pin";
      pinEl.innerHTML = `<span>${stylist.price}</span>`;
      pinEl.style.cssText = `
        background: ${isSelected ? "hsl(320, 70%, 55%)" : "hsl(270, 20%, 98%)"};
        color: ${isSelected ? "#fff" : "hsl(270, 30%, 10%)"};
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        border: 2px solid ${isSelected ? "hsl(320, 70%, 55%)" : "hsl(270, 15%, 90%)"};
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        font-family: 'Inter', sans-serif;
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: googleMapRef.current!,
        position,
        content: pinEl,
        title: stylist.name,
      });

      marker.addListener("click", () => {
        onSelectStylist(stylist.id);
      });

      markersRef.current.push(marker);
    });

    if (stylistsWithCoords.length > 1) {
      googleMapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    } else {
      googleMapRef.current.setCenter({ lat: stylistsWithCoords[0].lat!, lng: stylistsWithCoords[0].lng! });
      googleMapRef.current.setZoom(13);
    }
  }, [stylists, selectedId, mapLoaded, onSelectStylist]);

  // Pan to selected stylist
  useEffect(() => {
    if (!selectedId || !googleMapRef.current) return;
    const stylist = stylists.find((s) => s.id === selectedId);
    if (stylist?.lat && stylist?.lng) {
      googleMapRef.current.panTo({ lat: stylist.lat, lng: stylist.lng });
    }
  }, [selectedId, stylists]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden bg-muted">
      {!mapLoaded && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground font-body">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Stylist card in list
const StylistListCard = ({
  card,
  isSelected,
  onSelect,
}: {
  card: StylistCard;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <motion.div
    layout
    onClick={onSelect}
    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
      isSelected
        ? "bg-primary/5 border-primary/30 shadow-soft"
        : "bg-card border-border/50 hover:border-border hover:shadow-card"
    }`}
  >
    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-muted">
      {card.coverPhoto ? (
        <img src={card.coverPhoto} alt={card.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-body">
          No Photo
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary/20 bg-muted flex items-center justify-center shrink-0">
            {card.avatar ? (
              <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-muted-foreground">{card.name[0]}</span>
            )}
          </div>
          <h3 className="font-display font-bold text-foreground text-sm truncate">{card.name}</h3>
        </div>
        <Heart className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="flex items-center gap-1 mt-1">
        <Star className="w-3 h-3 fill-gold text-gold" />
        <span className="text-xs font-semibold text-foreground font-body">{card.rating}</span>
        <span className="text-xs text-muted-foreground font-body">({card.reviews})</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-1.5">
        {card.specialties.slice(0, 2).map((s) => (
          <span key={s} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-body text-secondary-foreground">
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2">
        {card.city && (
          <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
            <MapPin className="w-3 h-3" /> {card.city}
          </span>
        )}
        <span className="text-sm font-bold text-foreground font-body">{card.price}+</span>
      </div>
    </div>
  </motion.div>
);

const StylistDiscoveryPage = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") || "All";
  const { providers, loading } = useProviders();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialService);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const allCards = useMemo(() => providers.map(mapProviderToCard), [providers]);

  const filtered = useMemo(() => {
    let list = allCards;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.specialties.some((sp) => sp.toLowerCase().includes(q))
      );
    }
    if (activeFilter !== "All") {
      list = list.filter((s) =>
        s.specialties.some((sp) => sp.toLowerCase().includes(activeFilter.toLowerCase()))
      );
    }
    return list.sort((a, b) => b.rating - a.rating);
  }, [search, activeFilter, allCards]);

  const handleSelectStylist = useCallback((id: string) => {
    setSelectedStylist((prev) => (prev === id ? null : id));
    // Scroll to stylist in list
    const el = document.getElementById(`stylist-card-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-16 z-30">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                {activeFilter === "All" ? "All Stylists" : `${activeFilter} Stylists`}
              </h1>
              <span className="text-sm text-muted-foreground font-body ml-auto">
                {loading ? "..." : `${filtered.length} found`}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search stylists..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 bg-card border-border text-sm"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                {serviceFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold whitespace-nowrap transition-all ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="md:hidden p-2 rounded-full bg-card border border-border"
              >
                {showMap ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Split view */}
        <div className="flex-1 flex max-w-[1800px] mx-auto w-full">
          {/* Left: Stylist list */}
          <div
            ref={listRef}
            className={`${
              showMap ? "hidden md:block" : "block"
            } w-full md:w-1/2 lg:w-[45%] overflow-y-auto p-4 space-y-2`}
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            {loading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-card rounded-xl border border-border/50">
                    <Skeleton className="w-24 h-24 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground font-body">No stylists found for this service.</p>
              </div>
            )}

            {filtered.map((card) => (
              <div key={card.id} id={`stylist-card-${card.id}`}>
                <Link to={`/stylist/${card.id}`} className="block">
                  <StylistListCard
                    card={card}
                    isSelected={selectedStylist === card.id}
                    onSelect={() => handleSelectStylist(card.id)}
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* Right: Map */}
          <div
            className={`${
              showMap ? "block" : "hidden md:block"
            } w-full md:w-1/2 lg:w-[55%] sticky top-[180px]`}
            style={{ height: "calc(100vh - 180px)" }}
          >
            <div className="h-full p-2 md:p-4">
              <StylistMap
                stylists={filtered}
                selectedId={selectedStylist}
                onSelectStylist={handleSelectStylist}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistDiscoveryPage;
