import { useEffect, useState } from "react";
import { DollarSign, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PayoutStatus = "not_connected" | "pending" | "active" | "loading" | "setup_blocked";

type StripeFunctionResponse = {
  url?: string;
  status?: PayoutStatus;
  code?: string;
  error?: string;
  blocked?: boolean;
};

const PLATFORM_PROFILE_ERROR =
  "Stripe platform setup is incomplete. Finish the Connect platform profile/questionnaire in Stripe, then try again.";

export const DashboardCashout = ({ userId }: { userId: string }) => {
  const [status, setStatus] = useState<PayoutStatus>("loading");
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, available: 0 });

  useEffect(() => {
    void fetchEarnings();
    void checkStripeStatus();
  }, [userId]);

  const fetchEarnings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("total_price, status")
      .eq("provider_id", userId);

    if (!data) return;

    const completed = data.filter((booking) => booking.status === "completed");
    const confirmed = data.filter((booking) => booking.status === "confirmed");

    setEarnings({
      total: completed.reduce((sum, booking) => sum + Number(booking.total_price), 0),
      pending: confirmed.reduce((sum, booking) => sum + Number(booking.total_price), 0),
      available: completed.reduce((sum, booking) => sum + Number(booking.total_price), 0),
    });
  };

  const checkStripeStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke<StripeFunctionResponse>("stripe-connect-status", {
        body: { provider_id: userId },
      });

      console.log("Stripe status response:", { data, error });

      if (error || !data) {
        console.warn("Stripe status check failed:", error);
        setStatus("not_connected");
        return;
      }

      if (data.error) {
        console.warn("Stripe status error:", data.error);
        setStatus("not_connected");
        return;
      }

      if (data.code === "platform_profile_incomplete" || data.status === "setup_blocked") {
        setStatus("setup_blocked");
        return;
      }

      setStatus(data.status || "not_connected");
    } catch (err) {
      console.error("Stripe status exception:", err);
      setStatus("not_connected");
    }
  };

  const connectStripe = async () => {
    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      const { data, error } = await supabase.functions.invoke<StripeFunctionResponse>("stripe-connect-onboard", {
        body: {
          provider_id: userId,
          email: profile?.email,
          return_url: window.location.href,
        },
      });

      console.log("Stripe onboard response:", { data, error });

      if (error) {
        throw new Error(typeof error === "object" && "message" in error ? (error as any).message : "Failed to start Stripe setup");
      }

      if (data?.code === "platform_profile_incomplete" || data?.blocked) {
        setStatus("setup_blocked");
        toast.error(PLATFORM_PROFILE_ERROR, {
          description: data.error,
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error(data?.error || "Failed to start Stripe setup");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start Stripe setup";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const openStripeDashboard = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke<StripeFunctionResponse>("stripe-connect-dashboard", {
        body: { provider_id: userId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.code === "platform_profile_incomplete" || data?.blocked) {
        setStatus("setup_blocked");
        toast.error(PLATFORM_PROFILE_ERROR, {
          description: data.error,
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error(data?.error || "Failed to open payout dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to open payout dashboard";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Cash Out &amp; Payouts</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Earned", value: earnings.total, color: "text-primary" },
          { label: "Pending", value: earnings.pending, color: "text-gold" },
          { label: "Available", value: earnings.available, color: "text-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <DollarSign className={`mb-2 h-5 w-5 ${stat.color}`} />
            <p className="text-2xl font-bold">${stat.value.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-medium">Payout Method</h3>

        {status === "loading" ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Checking payout status...</p>
          </div>
        ) : status === "active" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">Stripe Connected — Payouts Active</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your earnings are automatically deposited to your connected bank account or debit card.
            </p>
            <Button variant="outline" onClick={openStripeDashboard} disabled={loading}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {loading ? "Opening..." : "Manage Payouts"}
            </Button>
          </div>
        ) : status === "pending" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Setup In Progress</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your Stripe account is being verified. This usually takes 1-2 business days.
            </p>
            <Button variant="outline" onClick={connectStripe} disabled={loading}>
              {loading ? "Loading..." : "Complete Setup"}
            </Button>
          </div>
        ) : status === "setup_blocked" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Platform Stripe Setup Required</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Provider payouts are blocked until the business owner completes the Stripe Connect platform profile and questionnaire.
            </p>
            <Button variant="outline" onClick={connectStripe} disabled={loading}>
              {loading ? "Checking..." : "Check Again"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">No Payout Method Connected</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your bank account or debit card through Stripe to receive automatic payouts for completed services.
            </p>
            <Button variant="hero" onClick={connectStripe} disabled={loading}>
              <DollarSign className="mr-2 h-4 w-4" />
              {loading ? "Setting up..." : "Connect Stripe"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};