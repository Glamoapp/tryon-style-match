import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, Clock, MapPin, Phone, MessageCircle, CheckCircle2, Circle,
  ArrowLeft, User, History, ChevronRight, Video, Navigation, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const serviceVideos: Record<string, { url: string; title: string; description: string }> = {
  braids: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", title: "All About Braids", description: "Learn what to expect during your braiding appointment and how to maintain your braids." },
  weave: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", title: "Weave Installation Guide", description: "Discover the weave process and tips for keeping your weave fresh." },
  locs: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", title: "Loc Care 101", description: "Everything about loc maintenance and what your stylist will do." },
  wigs: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", title: "Wig Installation Tips", description: "See how a professional wig installation works." },
  default: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", title: "Your Appointment Guide", description: "Learn what to expect during your styling appointment." },
};

type BookingWithDetails = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  customer_address: string | null;
  notes: string | null;
  completion_code: string | null;
  created_at: string;
  provider: { id: string; full_name: string; phone: string | null; avatar_url: string | null } | null;
  service: { service_name: string; duration_minutes: number } | null;
};

const statusSteps = [
  { key: "pending", label: "Request Sent" },
  { key: "confirmed", label: "Booking Confirmed" },
  { key: "on_the_way", label: "Stylist On The Way" },
  { key: "arrived", label: "Stylist Arrived" },
  { key: "in_progress", label: "Service In Progress" },
  { key: "completed", label: "Service Completed" },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "pending": return "bg-gold/20 text-gold border-gold/30";
    case "confirmed": return "bg-primary/10 text-primary border-primary/20";
    case "on_the_way": return "bg-blue-100 text-blue-700 border-blue-200";
    case "arrived": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "in_progress": return "bg-orange-100 text-orange-700 border-orange-200";
    case "completed": return "bg-green-100 text-green-700 border-green-200";
    case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const getStepIndex = (status: string) => {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

const getVideoForService = (serviceName: string) => {
  const key = serviceName.toLowerCase();
  return Object.entries(serviceVideos).find(([k]) => key.includes(k))?.[1] || serviceVideos.default;
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/dashboard");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth?redirect=/dashboard");
      else setUserId(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBookings = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, provider:profiles!bookings_provider_id_fkey(id, full_name, phone, avatar_url), service:provider_services!bookings_service_id_fkey(service_name, duration_minutes)")
      .eq("customer_id", userId)
      .order("booking_date", { ascending: false });

    if (error) {
      toast.error("Failed to load bookings");
    } else {
      setBookings((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  // Realtime subscription for booking updates
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("customer-bookings")
      .on("postgres_changes" as any, {
        event: "*",
        schema: "public",
        table: "bookings",
        filter: `customer_id=eq.${userId}`,
      }, () => {
        fetchBookings();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const upcoming = bookings.filter((b) => !["completed", "rejected"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "rejected"].includes(b.status));

  const detail = selectedBooking ? bookings.find((b) => b.id === selectedBooking) : null;

  if (detail) {
    const stepIndex = getStepIndex(detail.status);
    const providerName = (detail.provider as any)?.full_name || "Stylist";
    const providerPhone = (detail.provider as any)?.phone;
    const providerId = (detail.provider as any)?.id;
    const serviceName = (detail.service as any)?.service_name || "Service";
    const isEnRoute = ["on_the_way", "arrived"].includes(detail.status);
    const video = getVideoForService(serviceName);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-6 max-w-2xl">
          <button
            onClick={() => setSelectedBooking(null)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
              Booking Details
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-6">ID: {detail.id.slice(0, 8)}...</p>
          </motion.div>

          {/* Status Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-6 mb-6"
          >
            <h3 className="font-display font-semibold text-foreground mb-4">Booking Status</h3>
            <div className="space-y-3">
              {statusSteps.map((step, i) => (
                <div key={step.key} className="flex items-center gap-3">
                  {i <= stepIndex ? (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-body ${i <= stepIndex ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stylist Info + Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border/50 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-bold text-foreground text-lg">{providerName}</p>
                <p className="text-sm text-muted-foreground font-body">{serviceName}</p>
              </div>
              <Badge className={`${statusBadge(detail.status)} capitalize text-xs`}>{detail.status.replace(/_/g, " ")}</Badge>
            </div>

            <div className="grid gap-2 text-sm font-body text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{detail.booking_date} at {detail.booking_time}</span>
              </div>
              {detail.customer_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{detail.customer_address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold">${Number(detail.total_price).toFixed(0)}</span>
              </div>
            </div>

            {/* Contact buttons */}
            <div className="flex gap-3">
              {providerPhone && (
                <a
                  href={`tel:${providerPhone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Phone className="w-4 h-4" /> Call Stylist
                </a>
              )}
              {providerId && (
                <Link
                  to={`/messages?to=${providerId}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-foreground font-body font-semibold text-sm hover:bg-muted transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
              )}
            </div>
          </motion.div>

          {/* Map Tracking - show when stylist is on the way */}
          {isEnRoute && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <Link
                to={`/booking-tracker?id=${detail.id}`}
                className="flex items-center justify-between w-full py-4 px-5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">Track Stylist on Map</p>
                    <p className="text-xs text-muted-foreground font-body">See live location & ETA</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </Link>
            </motion.div>
          )}

          {/* Waiting Video */}
          {isEnRoute && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-6"
            >
              <div className="p-5">
                <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Video className="w-5 h-5 text-primary" /> While You Wait
                </h4>
                <p className="text-sm text-muted-foreground font-body mb-4">{video.description}</p>
              </div>
              <div className="aspect-video">
                <iframe
                  src={video.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              </div>
            </motion.div>
          )}

          {/* Notes */}
          {detail.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-2xl border border-border/50 p-6 mb-6"
            >
              <h4 className="font-display font-semibold text-foreground mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground font-body">{detail.notes}</p>
            </motion.div>
          )}

          {/* Completion Code */}
          {detail.status === "confirmed" && detail.completion_code && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gold/10 border border-gold/30 rounded-2xl p-6 text-center"
            >
              <p className="text-sm text-muted-foreground font-body mb-1">Your Completion Code</p>
              <p className="font-display text-3xl font-bold text-gold tracking-widest">{detail.completion_code}</p>
              <p className="text-xs text-muted-foreground font-body mt-2">Give this code to your stylist when the service is done</p>
            </motion.div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            My <span className="text-gradient-rose">Bookings</span>
          </h1>
          <p className="text-muted-foreground font-body mb-8">Track, manage, and review your appointments</p>
        </motion.div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="upcoming" className="flex-1 gap-2">
              <Calendar className="w-4 h-4" /> Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-2">
              <History className="w-4 h-4" /> History ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="font-display font-semibold text-foreground">No upcoming bookings</p>
                <p className="text-sm text-muted-foreground font-body mt-1 mb-6">Browse stylists and book your next appointment</p>
                <Link to="/stylists">
                  <Button variant="hero">Find Stylists</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((b, i) => (
                  <BookingCard key={b.id} booking={b} index={i} onClick={() => setSelectedBooking(b.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : past.length === 0 ? (
              <div className="text-center py-16">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="font-display font-semibold text-foreground">No past bookings</p>
                <p className="text-sm text-muted-foreground font-body mt-1">Your completed services will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {past.map((b, i) => (
                  <BookingCard key={b.id} booking={b} index={i} onClick={() => setSelectedBooking(b.id)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

const BookingCard = ({ booking, index, onClick }: { booking: BookingWithDetails; index: number; onClick: () => void }) => {
  const providerName = (booking.provider as any)?.full_name || "Stylist";
  const serviceName = (booking.service as any)?.service_name || "Service";
  const isEnRoute = ["on_the_way", "arrived"].includes(booking.status);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-display font-bold text-foreground">{providerName}</p>
          <p className="text-sm text-muted-foreground font-body">{serviceName}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEnRoute && (
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <Badge className={`${statusBadge(booking.status)} capitalize text-xs`}>
            {booking.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> {booking.booking_date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {booking.booking_time}
        </span>
        {booking.customer_address && (
          <span className="flex items-center gap-1 truncate max-w-[150px]">
            <MapPin className="w-3.5 h-3.5" /> {booking.customer_address}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="text-sm font-semibold text-foreground">${Number(booking.total_price).toFixed(0)}</span>
        <span className="text-xs text-primary font-body flex items-center gap-1">
          View Details <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.button>
  );
};

export default CustomerDashboard;
