import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, MailX, CheckCircle, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const UnsubscribePage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6 py-12">
          {status === "loading" && <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />}
          {status === "valid" && (
            <div className="space-y-4">
              <MailX className="w-12 h-12 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-display font-bold text-foreground">Unsubscribe</h1>
              <p className="text-muted-foreground font-body text-sm">Are you sure you want to stop receiving emails from us?</p>
              <Button variant="hero" onClick={handleUnsubscribe} disabled={processing} className="w-full">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Unsubscribe"}
              </Button>
            </div>
          )}
          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h1 className="text-2xl font-display font-bold text-foreground">Unsubscribed</h1>
              <p className="text-muted-foreground font-body text-sm">You've been successfully unsubscribed from our emails.</p>
            </div>
          )}
          {status === "already" && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-display font-bold text-foreground">Already Unsubscribed</h1>
              <p className="text-muted-foreground font-body text-sm">You're already unsubscribed from our emails.</p>
            </div>
          )}
          {status === "invalid" && (
            <div className="space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h1 className="text-2xl font-display font-bold text-foreground">Invalid Link</h1>
              <p className="text-muted-foreground font-body text-sm">This unsubscribe link is invalid or has expired.</p>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h1 className="text-2xl font-display font-bold text-foreground">Something Went Wrong</h1>
              <p className="text-muted-foreground font-body text-sm">Please try again later.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UnsubscribePage;
