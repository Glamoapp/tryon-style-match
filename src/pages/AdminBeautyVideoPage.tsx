import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Sparkles } from "lucide-react";
import beautyVideo from "@/assets/videos/beauty-transformation.mp4.asset.json";

const ADMIN_EMAIL = "nextlookbeauty@gmail.com";

const AdminBeautyVideoPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.email === ADMIN_EMAIL);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-body">Verifying access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
          <Shield className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Admin Only</h1>
          <p className="text-muted-foreground font-body mb-6 max-w-md">
            This page is restricted to the NEXTLOOK admin account.
          </p>
          <Button variant="hero" onClick={() => navigate("/auth")}>Sign In as Admin</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
              Brand Reel
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
            The NEXTLOOK Transformation
          </h1>
          <p className="text-muted-foreground font-body text-lg mb-8 max-w-2xl">
            From shopping luxury hair to a free professional install — the moment she sees her new look.
          </p>

          <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-2xl">
            <video
              src={beautyVideo.url}
              controls
              autoPlay
              playsInline
              className="w-full h-auto"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={beautyVideo.url} download>
              <Button variant="outline">Download Video</Button>
            </a>
            <Button
              variant="hero"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + beautyVideo.url);
              }}
            >
              Copy Video Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBeautyVideoPage;
