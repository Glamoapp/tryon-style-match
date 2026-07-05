import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Bell, LogOut, Clock, Star, Users, MessageCircle, User, CreditCard, Scissors, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo.png";

import { DashboardBookings } from "@/components/dashboard/DashboardBookings";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardProfile } from "@/components/dashboard/DashboardProfile";
import { DashboardMessages } from "@/components/dashboard/DashboardMessages";
import { DashboardRatings } from "@/components/dashboard/DashboardRatings";
import { DashboardCashout } from "@/components/dashboard/DashboardCashout";
import { DashboardServices } from "@/components/dashboard/DashboardServices";
import { DashboardPortfolio } from "@/components/dashboard/DashboardPortfolio";
import { DashboardReferrals } from "@/components/dashboard/DashboardReferrals";

type Booking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  completion_code: string | null;
  customer_address: string | null;
  notes: string | null;
  customer_id: string;
  payment_intent_id: string | null;
  customer: { full_name: string } | null;
  service: { service_name: string; duration_minutes: number } | null;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

type Tab = "bookings" | "calendar" | "services" | "portfolio" | "messages" | "ratings" | "cashout" | "referrals" | "profile" | "notifications";

const NAV_ITEMS: { key: Tab; label: string; icon: any }[] = [
  { key: "bookings", label: "Bookings", icon: Calendar },
  { key: "calendar", label: "Calendar", icon: Clock },
  { key: "services", label: "Services", icon: Scissors },
  { key: "portfolio", label: "Portfolio", icon: Users },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "ratings", label: "Ratings", icon: Star },
  { key: "cashout", label: "Cash Out", icon: CreditCard },
  { key: "referrals", label: "Refer & Earn", icon: Gift },
  { key: "profile", label: "Profile", icon: User },
  { key: "notifications", label: "Alerts", icon: Bell },
];

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [customerBookingsCount, setCustomerBookingsCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/provider/login"); return; }
      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, is_approved")
        .eq("id", user.id)
        .single();

      const { count } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id);

      setProfileName(profileData?.full_name || "");
      setIsApproved((profileData as any)?.is_approved ?? false);
      setCustomerBookingsCount(count || 0);

      fetchBookings(user.id);
      fetchNotifications(user.id);
      fetchUnreadMessages(user.id);

      const channel = supabase
        .channel("provider-dashboard")
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `provider_id=eq.${user.id}` }, () => fetchBookings(user.id))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          toast.info((payload.new as Notification).title);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
          setUnreadMessages((prev) => prev + 1);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, (payload) => {
          setIsApproved((payload.new as any)?.is_approved ?? false);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [navigate]);

  const fetchBookings = async (uid: string) => {
    const { data } = await supabase
      .from("bookings")
      .select("*, customer:profiles!bookings_customer_id_fkey(full_name), service:provider_services!bookings_service_id_fkey(service_name, duration_minutes)")
      .eq("provider_id", uid)
      .order("booking_date", { ascending: false });
    setBookings((data as any) || []);
  };

  const fetchNotifications = async (uid: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
  };

  const fetchUnreadMessages = async (uid: string) => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", uid)
      .eq("is_read", false);
    setUnreadMessages(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const totalEarnings = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + Number(b.total_price), 0);
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  const getBadge = (key: Tab) => {
    if (key === "bookings" && pendingCount > 0) return pendingCount;
    if (key === "notifications" && unreadNotifs > 0) return unreadNotifs;
    if (key === "messages" && unreadMessages > 0) return unreadMessages;
    return 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="NEXTLOOK" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold">NEXTLOOK</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{profileName}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        {isApproved === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-body font-semibold text-foreground text-sm">Account Pending Approval</p>
              <p className="text-xs text-muted-foreground font-body">
                Your profile is under review. You'll be able to receive bookings once the NEXTLOOK team approves your account.
              </p>
            </div>
          </motion.div>
        )}

        {customerBookingsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-border bg-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-body font-semibold text-foreground text-sm">Your bookings are available in your customer account</p>
                <p className="text-xs text-muted-foreground font-body">
                  You have {customerBookingsCount} personal {customerBookingsCount === 1 ? "booking" : "bookings"} ready to view.
                </p>
              </div>
            </div>
            <Button variant="outline" asChild className="shrink-0">
              <Link to="/dashboard">View Bookings</Link>
            </Button>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Pending", value: pendingCount, icon: Clock, color: "text-gold" },
            { label: "Completed", value: completedCount, icon: Star, color: "text-primary" },
            { label: "Earnings", value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
            { label: "Messages", value: unreadMessages, icon: MessageCircle, color: "text-accent" },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-border bg-card">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
          {NAV_ITEMS.map((tab) => {
            const badge = getBadge(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key === "messages") setUnreadMessages(0); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "bookings" && (
          <DashboardBookings bookings={bookings} onUpdate={() => userId && fetchBookings(userId)} />
        )}
        {activeTab === "calendar" && userId && <DashboardCalendar userId={userId} />}
        {activeTab === "services" && userId && <DashboardServices userId={userId} />}
        {activeTab === "portfolio" && userId && <DashboardPortfolio userId={userId} />}
        {activeTab === "messages" && userId && <DashboardMessages userId={userId} />}
        {activeTab === "ratings" && userId && <DashboardRatings userId={userId} />}
        {activeTab === "cashout" && userId && <DashboardCashout userId={userId} />}
        {activeTab === "referrals" && userId && <DashboardReferrals userId={userId} />}
        {activeTab === "profile" && userId && <DashboardProfile userId={userId} />}
        {activeTab === "notifications" && (
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold mb-4">Notifications</h2>
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
