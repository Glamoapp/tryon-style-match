import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PayoutStatus = "not_connected" | "pending" | "active" | "loading";

export const DashboardCashout = ({ userId }: { userId: string }) => {
  const [status, setStatus] = useState<PayoutStatus>("loading");
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, available: 0 });

  useEffect(() => {
    fetchEarnings();
    checkStripeStatus();
  }, [userId]);

  const fetchEarnings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("total_price, status")
      .eq("provider_id", userId);

    if (data) {
      const completed = data.filter((b) => b.status === "completed");
      const confirmed = data.filter((b) => b.status === "confirmed");
      setEarnings({
        total: completed.reduce((s, b) => s + Number(b.total_price), 0),
        pending: confirmed.reduce((s, b) => s + Number(b.total_price), 0),
        available: completed.reduce((s, b) => s + Number(b.total_price), 0),
      });
    }
  };

  const checkStripeStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-status", {
        body: { provider_id: userId },
      });
      if (error || !data) {
        setStatus("not_connected");
        return;
      }
      setStatus(data.status || "not_connected");
    } catch {
      setStatus("not_connected");
    }
  };

  const connectStripe = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      const { data, error } = await supabase.functions.invoke("stripe-connect-onboard", {
        body: {
          provider_id: userId,
          email: profile?.email,
          return_url: window.location.href,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error("Failed to start Stripe setup");
    } finally {
      setLoading(false);
    }
  };

  const openStripeDashboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-dashboard", {
        body: { provider_id: userId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Failed to open payout dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Cash Out & Payouts</h2>

      {/* Earnings summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Earned", value: earnings.total, color: "text-green-600" },
          { label: "Pending", value: earnings.pending, color: "text-gold" },
          { label: "Available", value: earnings.available, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl border border-border bg-card">
            <DollarSign className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold">${stat.value.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stripe Connect status */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-medium text-lg mb-4">Payout Method</h3>

        {status === "loading" ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Checking payout status...</p>
          </div>
        ) : status === "active" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">Stripe Connected — Payouts Active</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your earnings are automatically deposited to your connected bank account or debit card.
            </p>
            <Button variant="outline" onClick={openStripeDashboard} disabled={loading}>
              <ExternalLink className="w-4 h-4 mr-2" />
              {loading ? "Opening..." : "Manage Payouts"}
            </Button>
          </div>
        ) : status === "pending" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Setup In Progress</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your Stripe account is being verified. This usually takes 1-2 business days.
            </p>
            <Button variant="outline" onClick={connectStripe} disabled={loading}>
              {loading ? "Loading..." : "Complete Setup"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">No Payout Method Connected</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your bank account or debit card through Stripe to receive automatic payouts for completed services.
            </p>
            <Button variant="hero" onClick={connectStripe} disabled={loading}>
              <DollarSign className="w-4 h-4 mr-2" />
              {loading ? "Setting up..." : "Connect Stripe"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
