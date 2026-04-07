import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, CheckCircle, CreditCard, UserPlus } from "lucide-react";

interface AlertItem {
  id: string;
  type: string;
  title: string;
  message: string;
  customerEmail: string | null;
  created_at: string;
  is_read: boolean;
  completion_code: string | null;
}

const iconMap: Record<string, typeof Bell> = {
  booking: Calendar,
  completion: CheckCircle,
  payout: CreditCard,
  signup: UserPlus,
};

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      // Fetch recent bookings as alerts
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, status, booking_date, booking_time, created_at, completion_code, customer:profiles!bookings_customer_id_fkey(full_name, email), provider:profiles!bookings_provider_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      const alertItems: AlertItem[] = (bookings || []).map((b: any) => ({
        id: b.id,
        type: b.status === "completed" ? "completion" : "booking",
        title: b.status === "completed" ? "Service Completed" :
               b.status === "confirmed" ? "Booking Confirmed" : "New Booking",
        message: `${b.customer?.full_name || "Customer"} → ${b.provider?.full_name || "Stylist"} on ${b.booking_date} at ${b.booking_time}`,
        customerEmail: b.customer?.email || null,
        created_at: b.created_at,
        is_read: false,
        completion_code: b.completion_code || null,
      }));

      setAlerts(alertItems);
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Platform Activity
          </CardTitle>
          <p className="text-xs text-muted-foreground font-body">
            Alerts are also sent to nextlookbeauty@gmail.com
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No platform activity yet.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const Icon = iconMap[alert.type] || Bell;
                return (
                  <div key={alert.id} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.type === "completion" ? "bg-emerald-500/10" :
                      alert.type === "booking" ? "bg-primary/10" :
                      "bg-gold/10"
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        alert.type === "completion" ? "text-emerald-500" :
                        alert.type === "booking" ? "text-primary" :
                        "text-gold"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">{alert.message}</p>
                      {alert.customerEmail && (
                        <p className="text-xs text-muted-foreground/70 font-body mt-0.5">📧 {alert.customerEmail}</p>
                      )}
                      {alert.completion_code && (
                        <p className="text-xs font-mono mt-1 px-2 py-0.5 bg-primary/10 text-primary rounded-md inline-block">
                          Code: {alert.completion_code}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-body whitespace-nowrap">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAlerts;
