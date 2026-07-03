/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { google: any; }
}
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, ChevronRight, Search, ArrowLeft, List, Map as MapIcon, SlidersHorizontal, ChevronUp } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProviders, ProviderListing } from "@/hooks/useProviders";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFavorites } from "@/hooks/useFavorites";
import blowdryerPin from "@/assets/blowdryer-pin.png";


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

// Custom overlay class for price pin markers
class PricePinOverlay {
  private div: HTMLDivElement | null = null;
  private position: any;
  private map: any;
  private price: string;
  private name: string;
  private stylistId: string;
  private isSelected: boolean;
  private onSelect: (id: string) => void;
  private onNavigate: (id: string) => void;
  private overlay: any;

  constructor(
    map: any,
    position: any,
    price: string,
    name: string,
    stylistId: string,
    isSelected: boolean,
    onSelect: (id: string) => void,
    onNavigate: (id: string) => void
  ) {
    this.map = map;
    this.position = position;
    this.price = price;
    this.name = name;
    this.stylistId = stylistId;
    this.isSelected = isSelected;
    this.onSelect = onSelect;
    this.onNavigate = onNavigate;

    this.overlay = new (window as any).google.maps.OverlayView();
    this.overlay.onAdd = () => this.onAdd();
    this.overlay.draw = () => this.draw();
    this.overlay.onRemove = () => this.onRemove();
    this.overlay.setMap(map);
  }

  onAdd() {
    this.div = document.createElement("div");
    this.div.style.position = "absolute";
    this.div.style.cursor = "pointer";
    this.div.style.transform = "translate(-50%, -100%)";
    this.div.style.zIndex = this.isSelected ? "10" : "1";
    this.div.innerHTML = `
      <div style="
        background: ${this.isSelected ? "hsl(270, 50%, 40%)" : "#fff"};
        color: ${this.isSelected ? "#fff" : "hsl(270, 30%, 10%)"};
        font-weight: 700;
        font-size: 13px;
        padding: 6px 10px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        border: 2px solid ${this.isSelected ? "hsl(270, 50%, 30%)" : "hsl(270, 20%, 90%)"};
        white-space: nowrap;
        transition: all 0.2s;
        text-align: center;
        min-width: 48px;
      ">${this.price}+</div>
      <div style="
        width: 0; height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${this.isSelected ? "hsl(270, 50%, 40%)" : "#fff"};
        margin: -1px auto 0;
      "></div>
    `;

    // Single click selects, double click navigates to profile
    this.div.addEventListener("click", (e) => {
      e.stopPropagation();
      this.onSelect(this.stylistId);
    });
    this.div.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.onNavigate(this.stylistId);
    });

    const panes = this.overlay.getPanes();
    panes.overlayMouseTarget.appendChild(this.div);
  }

  draw() {
    if (!this.div) return;
    const projection = this.overlay.getProjection();
    const point = projection.fromLatLngToDivPixel(this.position);
    if (point) {
      this.div.style.left = point.x + "px";
      this.div.style.top = point.y + "px";
    }
  }

  onRemove() {
    if (this.div?.parentNode) {
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  }

  remove() {
    this.overlay.setMap(null);
  }
}

// Google Maps component
const StylistMap = ({
  stylists,
  selectedId,
  onSelectStylist,
  onNavigateToStylist,
  userLocation,
}: {
  stylists: StylistCard[];
  selectedId: string | null;
  onSelectStylist: (id: string) => void;
  onNavigateToStylist: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<PricePinOverlay[]>([]);
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

    const center = userLocation || { lat: 33.749, lng: -84.388 };
    const map = new (window as any).google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
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
  }, [mapLoaded, userLocation]);

  // Update markers when stylists change
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const stylistsWithCoords = stylists.filter((s) => s.lat && s.lng);
    if (stylistsWithCoords.length === 0) {
      if (userLocation) {
        googleMapRef.current.setCenter(userLocation);
        googleMapRef.current.setZoom(12);
      }
      return;
    }

    const bounds = new (window as any).google.maps.LatLngBounds();

    if (userLocation) {
      bounds.extend(userLocation);
    }

    stylistsWithCoords.forEach((stylist) => {
      const position = new (window as any).google.maps.LatLng(stylist.lat!, stylist.lng!);
      bounds.extend(position);

      const pin = new PricePinOverlay(
        googleMapRef.current,
        position,
        stylist.price,
        stylist.name,
        stylist.id,
        stylist.id === selectedId,
        onSelectStylist,
        onNavigateToStylist
      );

      markersRef.current.push(pin);
    });

    googleMapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }, [stylists, selectedId, mapLoaded, onSelectStylist, onNavigateToStylist, userLocation]);

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
  isFavorite,
  onToggleFavorite,
}: {
  card: StylistCard;
  isSelected: boolean;
  onSelect: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
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
      {card.avatar ? (
        <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
      ) : card.coverPhoto ? (
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
        <FavoriteButton
          isFavorite={isFavorite}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
          size="sm"
        />
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

// Mobile bottom sheet for stylist list
const MobileBottomSheet = ({
  children,
  filtered,
  loading,
}: {
  children: React.ReactNode;
  filtered: StylistCard[];
  loading: boolean;
}) => {
  const [sheetPosition, setSheetPosition] = useState<"peek" | "half" | "full">("peek");
  const sheetRef = useRef<HTMLDivElement>(null);

  const peekHeight = 140;
  const halfHeight = typeof window !== "undefined" ? window.innerHeight * 0.5 : 400;
  const fullHeight = typeof window !== "undefined" ? window.innerHeight - 140 : 700;

  const currentHeight =
    sheetPosition === "peek" ? peekHeight : sheetPosition === "half" ? halfHeight : fullHeight;

  const cyclePosition = () => {
    setSheetPosition((prev) =>
      prev === "peek" ? "half" : prev === "half" ? "full" : "peek"
    );
  };

  const handleDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    const { offset, velocity } = info;
    if (velocity.y < -300 || offset.y < -80) {
      // Swiped up
      setSheetPosition((prev) => (prev === "peek" ? "half" : "full"));
    } else if (velocity.y > 300 || offset.y > 80) {
      // Swiped down
      setSheetPosition((prev) => (prev === "full" ? "half" : "peek"));
    }
  };

  return (
    <motion.div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex flex-col"
      animate={{ height: currentHeight }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={{ touchAction: "none" }}
    >
      {/* Drag handle */}
      <div
        className="flex flex-col items-center pt-2 pb-3 cursor-grab active:cursor-grabbing shrink-0"
        onClick={cyclePosition}
      >
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mb-2" />
        <div className="flex items-center gap-2 px-4 w-full">
          <span className="text-sm font-display font-bold text-foreground">
            {loading ? "Loading..." : `${filtered.length} stylists`}
          </span>
          <ChevronUp
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              sheetPosition === "full" ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-6 space-y-2"
        onTouchStart={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </motion.div>
  );
};

const StylistDiscoveryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialService = searchParams.get("service") || "All";
  const { providers, loading } = useProviders();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialService);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Get user's location via browser geolocation + IP fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          fetch("https://ipapi.co/json/")
            .then((r) => r.json())
            .then((data) => {
              if (data.latitude && data.longitude) {
                setUserLocation({ lat: data.latitude, lng: data.longitude });
              }
            })
            .catch(() => {});
        },
        { timeout: 5000 }
      );
    }
  }, []);

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
    const el = document.getElementById(`stylist-card-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const handleNavigateToStylist = useCallback((id: string) => {
    navigate(`/stylist/${id}`);
  }, [navigate]);

  const stylistListContent = (
    <>
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
              isFavorite={isFavorite(card.id)}
              onToggleFavorite={() => toggleFavorite(card.id)}
            />
          </Link>
        </div>
      ))}
    </>
  );

  // MOBILE LAYOUT: Full-screen map + bottom sheet
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO title="Discover Stylists on the Map | NEXTLOOK" description="Explore nearby beauty professionals with an interactive map. Find availability, pricing, and book instantly." path="/discover" />
        <Navbar />
        <div className="pt-16 flex-1 flex flex-col relative">
          {/* Search + filters overlay on top of map */}
          <div className="absolute top-0 left-0 right-0 z-30 px-3 pt-3 pb-2">
            <div className="flex gap-2 items-center mb-2">
              <Link to="/" className="p-2 rounded-full bg-background/90 backdrop-blur-sm shadow-sm border border-border">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </Link>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search stylists..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 bg-background/90 backdrop-blur-sm border-border text-sm shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {serviceFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold whitespace-nowrap transition-all shadow-sm ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-background/90 backdrop-blur-sm text-muted-foreground border border-border"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Full-screen map */}
          <div className="flex-1" style={{ height: "calc(100vh - 64px)" }}>
            <StylistMap
              stylists={filtered}
              selectedId={selectedStylist}
              onSelectStylist={handleSelectStylist}
              onNavigateToStylist={handleNavigateToStylist}
              userLocation={userLocation}
            />
          </div>

          {/* Bottom sheet */}
          <MobileBottomSheet filtered={filtered} loading={loading}>
            {stylistListContent}
          </MobileBottomSheet>
        </div>
      </div>
    );
  }

  // DESKTOP LAYOUT: Side-by-side
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
            </div>
          </div>
        </div>

        {/* Split view */}
        <div className="flex-1 flex max-w-[1800px] mx-auto w-full">
          {/* Left: Stylist list */}
          <div
            ref={listRef}
            className="w-1/2 lg:w-[45%] overflow-y-auto p-4 space-y-2"
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            {stylistListContent}
          </div>

          {/* Right: Map */}
          <div
            className="w-1/2 lg:w-[55%] sticky top-[180px]"
            style={{ height: "calc(100vh - 180px)" }}
          >
            <div className="h-full p-4">
              <StylistMap
                stylists={filtered}
                selectedId={selectedStylist}
                onSelectStylist={handleSelectStylist}
                onNavigateToStylist={handleNavigateToStylist}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistDiscoveryPage;
