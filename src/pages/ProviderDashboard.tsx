import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, Calendar, DollarSign, Bell, LogOut, Clock, Plus, Settings, Star, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Profile = {
  full_name: string;
  service_category: string | null;
  city: string | null;
  avatar_url: string | null;
};

type Service = {
  id: string;
  service_name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
};

type Booking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  completion_code: string | null;
  customer_address: string | null;
  notes: string | null;
  customer: { full_name: string } | null;
  service: { service_name: string } | null;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "services" | "notifications">("bookings");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/provider/login"); return; }
      setUserId(user.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, service_category, city, avatar_url")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch services
      const { data: servicesData } = await supabase
        .from("provider_services")
        .select("*")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });
      setServices(servicesData || []);

      // Fetch bookings with customer and service info
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*, customer:profiles!bookings_customer_id_fkey(full_name), service:provider_services!bookings_service_id_fkey(service_name)")
        .eq("provider_id", user.id)
        .order("booking_date", { ascending: false });
      setBookings((bookingsData as any) || []);

      // Fetch notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications(notifData || []);

      // Realtime bookings subscription
      const channel = supabase
        .channel("provider-bookings")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `provider_id=eq.${user.id}`,
        }, () => {
          // Refresh bookings
          supabase
            .from("bookings")
            .select("*, customer:profiles!bookings_customer_id_fkey(full_name), service:provider_services!bookings_service_id_fkey(service_name)")
            .eq("provider_id", user.id)
            .order("booking_date", { ascending: false })
            .then(({ data }) => setBookings((data as any) || []));
        })
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          toast.info((payload.new as Notification).title);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [navigate]);

  const handleBookingAction = async (bookingId: string, action: "confirmed" | "rejected") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update booking");
    } else {
      toast.success(`Booking ${action}`);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: action } : b)));
    }
  };

  const handleVerifyCode = async (bookingId: string) => {
    const code = prompt("Enter the customer's completion code:");
    if (!code) return;

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking?.completion_code === code) {
      await supabase.from("bookings").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", bookingId);
      toast.success("Service completed! Earnings added.");
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b)));
    } else {
      toast.error("Invalid completion code");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gold/20 text-gold border-gold/30";
      case "confirmed": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "cancelled": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const totalEarnings = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + Number(b.total_price), 0);
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-bold">NEXTLOOK</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{profile?.full_name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending", value: pendingCount, icon: Clock, color: "text-gold" },
            { label: "Confirmed", value: confirmedCount, icon: Calendar, color: "text-primary" },
            { label: "Completed", value: completedCount, icon: Star, color: "text-green-600" },
            { label: "Earnings", value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-border bg-card">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
          {[
            { key: "bookings" as const, label: "Bookings", icon: Calendar, badge: pendingCount },
            { key: "services" as const, label: "My Services", icon: Scissors },
            { key: "notifications" as const, label: "Notifications", icon: Bell, badge: unreadNotifs },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge ? (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{tab.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No bookings yet</p>
                <p className="text-sm">New bookings from customers will appear here</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{(booking.customer as any)?.full_name || "Customer"}</p>
                      <p className="text-sm text-muted-foreground">{(booking.service as any)?.service_name || "Service"}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{booking.booking_date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.booking_time}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${Number(booking.total_price).toFixed(0)}</span>
                  </div>
                  {booking.customer_address && (
                    <p className="text-sm text-muted-foreground mb-3">📍 {booking.customer_address}</p>
                  )}
                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="hero" onClick={() => handleBookingAction(booking.id, "confirmed")}>Confirm</Button>
                      <Button size="sm" variant="outline" onClick={() => handleBookingAction(booking.id, "rejected")}>Reject</Button>
                    </div>
                  )}
                  {booking.status === "confirmed" && (
                    <Button size="sm" variant="gold" onClick={() => handleVerifyCode(booking.id)}>Enter Completion Code</Button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Services tab */}
        {activeTab === "services" && (
          <div className="space-y-3">
            <Button variant="outline" className="mb-4" onClick={() => navigate("/provider/onboarding")}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
            {services.map((service) => (
              <div key={service.id} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    {service.description && <p className="text-sm text-muted-foreground mt-1">{service.description}</p>}
                  </div>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${Number(service.price).toFixed(0)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{service.duration_minutes} min</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === "notifications" && (
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-4 rounded-lg border ${notif.is_read ? "border-border bg-card" : "border-primary/20 bg-primary/5"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
