import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, MessageCircle, CheckCircle2, Circle, ArrowLeft, User, Mail, CreditCard, Calendar, Navigation, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import stylist1 from "@/assets/stylist-1.jpg";

interface BookingData {
  id: string;
  date: string;
  time: string;
  stylistName: string;
  styleName: string;
  stylistPhone: string | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

// Service-based educational videos (static placeholders)
const serviceVideos: Record<string, { url: string; title: string; description: string }> = {
  braids: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "All About Braids",
    description: "Learn what to expect during your braiding appointment and how to maintain your braids for weeks.",
  },
  weave: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Weave Installation Guide",
    description: "Discover the weave installation process and tips for keeping your weave looking fresh.",
  },
  locs: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Loc Care 101",
    description: "Everything you need to know about loc maintenance and what your stylist will do.",
  },
  wigs: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Wig Installation Tips",
    description: "See how a professional wig installation works and learn aftercare essentials.",
  },
  default: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Your Appointment Guide",
    description: "Learn what to expect during your styling appointment and how to maintain your new look.",
  },
};

interface StylistLocation {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  status: string;
}

const paymentLabels: Record<string, string> = {
  cashapp: "Cash App",
  applepay: "Apple Pay",
  card: "Debit / Credit Card",
};

const BookingTrackerPage = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [mapsKey, setMapsKey] = useState<string | null>(null);
  const [stylistLocation, setStylistLocation] = useState<StylistLocation | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const stylistMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const customerLocationRef = useRef<any>(null);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("currentBooking");
    if (data) {
      setBooking(JSON.parse(data));
    }
  }, []);

  // Save the PaymentIntent ID to the booking after successful checkout
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    const savePaymentIntent = async () => {
      try {
        await supabase.functions.invoke("save-booking-payment", {
          body: { sessionId },
        });
        console.log("Payment intent saved for session:", sessionId);
      } catch (err) {
        console.error("Failed to save payment intent:", err);
      }
    };
    savePaymentIntent();
  }, [searchParams]);

  // Fetch Google Maps API key
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-maps-key");
        if (!error && data?.key) {
          setMapsKey(data.key);
        }
      } catch (err) {
        console.error("Failed to load maps key:", err);
      }
    };
    fetchKey();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!mapsKey || document.getElementById("google-maps-script")) return;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, [mapsKey]);

  // Smoothly animate marker to new position
  const animateMarker = useCallback((marker: any, targetLat: number, targetLng: number) => {
    if (!marker) return;
    const g = (window as any).google;
    if (!g) return;

    const startPos = marker.getPosition();
    const startLat = startPos.lat();
    const startLng = startPos.lng();
    const duration = 1000;
    const startTime = Date.now();

    const step = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const lat = startLat + (targetLat - startLat) * eased;
      const lng = startLng + (targetLng - startLng) * eased;
      marker.setPosition(new g.maps.LatLng(lat, lng));
      if (t < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, []);

  // Update route and ETA when stylist location changes
  const updateRoute = useCallback((stylistLat: number, stylistLng: number) => {
    const g = (window as any).google;
    if (!g || !mapInstanceRef.current || !customerLocationRef.current) return;

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new g.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#e91e8c", strokeWeight: 4 },
      });
    }

    const directionsService = new g.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: stylistLat, lng: stylistLng },
        destination: customerLocationRef.current,
        travelMode: g.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === "OK" && result) {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          if (leg) {
            setEta(leg.duration?.text ?? null);
          }
        }
      }
    );
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || !booking?.address || !(window as any).google) return;

    const g = (window as any).google;
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode({ address: booking.address }, (results: any, status: any) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        customerLocationRef.current = location;

        const map = new g.maps.Map(mapRef.current!, {
          center: location,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: "all", elementType: "geometry", stylers: [{ saturation: -30 }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
          ],
        });
        mapInstanceRef.current = map;

        // Customer location marker
        new g.maps.Marker({
          position: location,
          map,
          title: "Your Location",
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#e91e8c",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          },
        });

        // Create stylist marker (will be positioned by realtime data or simulation)
        const initialLat = location.lat() + (Math.random() - 0.5) * 0.02;
        const initialLng = location.lng() + (Math.random() - 0.5) * 0.02;

        const stylistMarker = new g.maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map,
          title: booking.stylistName,
          icon: {
            url: stylist1,
            scaledSize: new g.maps.Size(44, 44),
            origin: new g.maps.Point(0, 0),
            anchor: new g.maps.Point(22, 22),
          },
        });
        stylistMarkerRef.current = stylistMarker;

        const infoWindow = new g.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:4px"><strong>${booking.stylistName}</strong><br/><span style="color:#666">En route to you</span></div>`,
        });
        stylistMarker.addListener("click", () => infoWindow.open(map, stylistMarker));

        // Initial route
        updateRoute(initialLat, initialLng);

        // Seed the database with initial location and start simulation
        seedAndSimulate(booking.id, booking.stylistName, initialLat, initialLng, location.lat(), location.lng());
      } else {
        new g.maps.Map(mapRef.current!, {
          center: { lat: 33.749, lng: -84.388 },
          zoom: 12,
          disableDefaultUI: true,
        });
      }
    });
  }, [booking, updateRoute]);

  // Seed stylist location and simulate movement toward customer
  const seedAndSimulate = useCallback(async (
    bookingId: string,
    stylistName: string,
    startLat: number,
    startLng: number,
    targetLat: number,
    targetLng: number
  ) => {
    // Seed initial location
    await supabase.functions.invoke("update-stylist-location", {
      body: {
        booking_id: bookingId,
        stylist_name: stylistName,
        latitude: startLat,
        longitude: startLng,
        status: "en_route",
      },
    });

    // Simulate movement every 3 seconds
    let currentLat = startLat;
    let currentLng = startLng;
    const steps = 30;
    let step = 0;

    if (simulationRef.current) clearInterval(simulationRef.current);

    simulationRef.current = setInterval(async () => {
      step++;
      if (step >= steps) {
        if (simulationRef.current) clearInterval(simulationRef.current);
        await supabase.functions.invoke("update-stylist-location", {
          body: {
            booking_id: bookingId,
            stylist_name: stylistName,
            latitude: targetLat,
            longitude: targetLng,
            status: "arrived",
          },
        });
        return;
      }

      // Move toward target with some jitter
      const progress = step / steps;
      const jitter = (Math.random() - 0.5) * 0.001;
      currentLat = startLat + (targetLat - startLat) * progress + jitter;
      currentLng = startLng + (targetLng - startLng) * progress + jitter;

      const heading = Math.atan2(targetLng - currentLng, targetLat - currentLat) * (180 / Math.PI);

      await supabase.functions.invoke("update-stylist-location", {
        body: {
          booking_id: bookingId,
          stylist_name: stylistName,
          latitude: currentLat,
          longitude: currentLng,
          heading,
          speed: 25 + Math.random() * 15,
          status: progress > 0.85 ? "arriving" : "en_route",
        },
      });
    }, 3000);
  }, []);

  // Subscribe to realtime location updates
  useEffect(() => {
    if (!booking?.id) return;

    const channel = supabase
      .channel(`stylist-location-${booking.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "stylist_locations",
          filter: `booking_id=eq.${booking.id}`,
        },
        (payload: any) => {
          const loc = payload.new as any;
          if (!loc) return;

          const newLocation: StylistLocation = {
            latitude: loc.latitude,
            longitude: loc.longitude,
            heading: loc.heading ?? 0,
            speed: loc.speed ?? 0,
            status: loc.status ?? "en_route",
          };

          setStylistLocation(newLocation);

          // Animate marker
          if (stylistMarkerRef.current) {
            animateMarker(stylistMarkerRef.current, newLocation.latitude, newLocation.longitude);
          }

          // Update route & ETA
          updateRoute(newLocation.latitude, newLocation.longitude);

          // Update tracking step based on status
          if (newLocation.status === "arrived") {
            setCurrentStep(3);
          } else if (newLocation.status === "arriving") {
            setCurrentStep(2);
          } else if (newLocation.status === "en_route") {
            setCurrentStep(1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [booking?.id, animateMarker, updateRoute]);

  // Initialize map when script is already loaded
  useEffect(() => {
    if (mapsKey && booking && (window as any).google) {
      initMap();
    }
  }, [mapsKey, booking, initMap]);

  const trackingSteps = [
    { label: "Booking Confirmed", icon: CheckCircle2 },
    { label: "Stylist En Route", icon: MapPin },
    { label: "Arriving Soon", icon: Clock },
    { label: "Service in Progress", icon: Circle },
    { label: "Completed", icon: CheckCircle2 },
  ];

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-6 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">No Active Booking</h1>
          <p className="text-muted-foreground font-body mb-6">You don't have an active booking to track.</p>
          <Link to="/">
            <Button variant="hero">Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Booking <span className="text-gradient-rose">Confirmed!</span>
            </h1>
            <p className="text-muted-foreground font-body mb-8">
              Booking ID: <span className="font-semibold text-foreground">{booking.id}</span>
            </p>
          </motion.div>

          {/* Stylist Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-3xl shadow-elevated border border-border/50 overflow-hidden mb-6"
          >
            <div className="bg-gradient-hero p-6">
              <div className="flex items-center gap-4">
                <img src={stylist1} alt="Stylist" className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/50" />
                <div>
                  <h3 className="font-display font-bold text-cream text-lg">{booking.stylistName}</h3>
                  <p className="text-cream/60 text-sm font-body">{booking.styleName}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  {booking.stylistPhone && (
                    <a
                      href={`tel:${booking.stylistPhone}`}
                      className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors"
                      title="Call Stylist"
                    >
                      <Phone className="w-4 h-4 text-cream" />
                    </a>
                  )}
                  <button className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-cream" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live ETA Banner */}
            {eta && stylistLocation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-sm font-body font-semibold text-foreground">
                    {stylistLocation.status === "arrived" ? "Stylist has arrived!" :
                     stylistLocation.status === "arriving" ? "Almost there!" : "En route to you"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-body font-bold text-primary">
                    ETA: {eta}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Live Google Map */}
            <div ref={mapRef} className="h-64 bg-muted relative overflow-hidden">
              {!mapsKey && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary animate-pulse flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-body">Loading map...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Speed indicator */}
            {stylistLocation && stylistLocation.speed > 0 && stylistLocation.status !== "arrived" && (
              <div className="px-6 py-2 bg-muted/50 text-xs font-body text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live tracking · {Math.round(stylistLocation.speed)} mph
              </div>
            )}

            {/* Timeline */}
            <div className="p-6">
              <h4 className="font-display font-semibold text-foreground mb-4">Booking Progress</h4>
              <div className="space-y-4">
                {trackingSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3">
                    {index <= currentStep ? (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-body flex-1 ${index <= currentStep ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Call Stylist Button */}
          {booking.stylistPhone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <a
                href={`tel:${booking.stylistPhone}`}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <Phone className="w-5 h-5" />
                Call {booking.stylistName.split(" ")[0]}
              </a>
            </motion.div>
          )}

          {/* Waiting Video - shown while stylist is en route */}
          {stylistLocation && stylistLocation.status !== "arrived" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-6"
            >
              <div className="p-5">
                <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Video className="w-5 h-5 text-primary" />
                  While You Wait
                </h4>
                <p className="text-sm text-muted-foreground font-body mb-4">
                  {(() => {
                    const key = booking.styleName.toLowerCase();
                    const video = Object.entries(serviceVideos).find(([k]) => key.includes(k))?.[1] || serviceVideos.default;
                    return video.description;
                  })()}
                </p>
              </div>
              <div className="aspect-video">
                <iframe
                  src={(() => {
                    const key = booking.styleName.toLowerCase();
                    return (Object.entries(serviceVideos).find(([k]) => key.includes(k))?.[1] || serviceVideos.default).url;
                  })()}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Service information video"
                />
              </div>
            </motion.div>
          )}

          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border/50 p-6 space-y-3"
          >
            <h4 className="font-display font-semibold text-foreground mb-2">Booking Details</h4>
            <div className="grid gap-3 text-sm font-body">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.date} at {booking.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Address:</span>
                <span className="font-semibold text-foreground ml-auto text-right max-w-[200px]">{booking.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Payment:</span>
                <span className="font-semibold text-foreground ml-auto">{paymentLabels[booking.paymentMethod] || booking.paymentMethod}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingTrackerPage;
