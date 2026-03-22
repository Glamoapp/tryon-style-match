import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Tag, CreditCard, LogOut, Clock, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo.png";
import { VendorProducts } from "@/components/vendor/VendorProducts";
import { VendorDeals } from "@/components/vendor/VendorDeals";
import { VendorPayouts } from "@/components/vendor/VendorPayouts";

type Tab = "products" | "deals" | "payouts";

const NAV_ITEMS: { key: Tab; label: string; icon: any }[] = [
  { key: "products", label: "Products", icon: Package },
  { key: "deals", label: "Deals", icon: Tag },
  { key: "payouts", label: "Payouts", icon: CreditCard },
];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/vendor/login"); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, is_approved")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "vendor") {
        toast.error("Access denied");
        navigate("/");
        return;
      }

      setProfileName(profile?.full_name || "");
      setIsApproved(profile?.is_approved ?? false);
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="NEXTLOOK" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold">NEXTLOOK</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Vendor</span>
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
                Your vendor account is under review. You'll be able to list products once the NEXTLOOK team approves your account.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Products", icon: Package, color: "text-primary" },
            { label: "Active Deals", icon: Tag, color: "text-accent" },
            { label: "Payouts", icon: CreditCard, color: "text-primary" },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-border bg-card">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
          {NAV_ITEMS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "products" && userId && <VendorProducts vendorId={userId} isApproved={isApproved ?? false} />}
        {activeTab === "deals" && userId && <VendorDeals vendorId={userId} isApproved={isApproved ?? false} />}
        {activeTab === "payouts" && userId && <VendorPayouts vendorId={userId} />}
      </div>
    </div>
  );
};

export default VendorDashboard;
