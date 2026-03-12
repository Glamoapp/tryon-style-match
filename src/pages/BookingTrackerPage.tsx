import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, MessageCircle, CheckCircle2, Circle, ArrowLeft, User, Mail, CreditCard, Calendar } from "lucide-react";
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
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("currentBooking");
    if (data) {
      setBooking(JSON.parse(data));
    }
  }, []);

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

    return () => {
      // cleanup not strictly needed for script tags
    };
  }, [mapsKey]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !booking?.address || !window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: booking.address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        const map = new google.maps.Map(mapRef.current!, {
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
        new google.maps.Marker({
          position: location,
          map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#e91e8c",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          },
        });

        // Simulate stylist location nearby
        const stylistLat = location.lat() + (Math.random() - 0.5) * 0.02;
        const stylistLng = location.lng() + (Math.random() - 0.5) * 0.02;
        const stylistMarker = new google.maps.Marker({
          position: { lat: stylistLat, lng: stylistLng },
          map,
          title: booking.stylistName,
          icon: {
            url: stylist1,
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 20),
          },
        });

        // Info window for stylist
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:4px"><strong>${booking.stylistName}</strong><br/><span style="color:#666">En route to you</span></div>`,
        });
        stylistMarker.addListener("click", () => infoWindow.open(map, stylistMarker));

        // Draw route
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: { strokeColor: "#e91e8c", strokeWeight: 4 },
        });
        directionsService.route(
          {
            origin: { lat: stylistLat, lng: stylistLng },
            destination: location,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result) {
              directionsRenderer.setDirections(result);
            }
          }
        );
      } else {
        // Fallback: show a default map
        new google.maps.Map(mapRef.current!, {
          center: { lat: 33.749, lng: -84.388 },
          zoom: 12,
          disableDefaultUI: true,
        });
      }
    });
  }, [booking]);

  // Initialize map when script is already loaded
  useEffect(() => {
    if (mapsKey && booking && window.google) {
      initMap();
    }
  }, [mapsKey, booking, initMap]);

  // Simulate progress
  useEffect(() => {
    if (!booking) return;
    const timers = [
      setTimeout(() => setCurrentStep(1), 2000),
      setTimeout(() => setCurrentStep(2), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [booking]);

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
                  <button className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-cream" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-cream" />
                  </button>
                </div>
              </div>
            </div>

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
