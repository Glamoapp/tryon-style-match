import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const VendorPayouts = ({ vendorId }: { vendorId: string }) => {
  const [connectStatus, setConnectStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [vendorId]);

  const checkStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-status", {
        body: { account_id: vendorId },
      });
      if (error) throw error;
      setConnectStatus(data?.status || "not_started");
    } catch {
      setConnectStatus("not_started");
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    setOnboarding(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboard", {
        body: { account_id: vendorId, return_url: window.location.href, refresh_url: window.location.href },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to start payout setup");
    } finally {
      setOnboarding(false);
    }
  };

  const openDashboard = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-dashboard", {
        body: { account_id: vendorId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to open dashboard");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Payouts</h2>
      <div className="p-6 rounded-xl border border-border bg-card">
        <CreditCard className="w-10 h-10 text-primary mb-4" />
        {connectStatus === "active" ? (
          <>
            <p className="font-medium text-foreground mb-1">Payouts Active</p>
            <p className="text-sm text-muted-foreground mb-4">Your Stripe Connect account is set up. You'll receive payouts automatically when customers purchase your products.</p>
            <Button variant="outline" onClick={openDashboard}>
              <ExternalLink className="w-4 h-4 mr-2" /> View Payout Dashboard
            </Button>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground mb-1">Set Up Payouts</p>
            <p className="text-sm text-muted-foreground mb-4">Connect your bank account to receive payments when customers buy your products.</p>
            <Button variant="hero" onClick={startOnboarding} disabled={onboarding}>
              {onboarding ? "Setting up..." : "Set Up Stripe Connect"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
