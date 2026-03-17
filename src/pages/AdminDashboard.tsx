import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import AdminCommissions from "@/components/admin/AdminCommissions";
import AdminStylists from "@/components/admin/AdminStylists";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminProviders from "@/components/admin/AdminProviders";
import AdminDeals from "@/components/admin/AdminDeals";
import AdminRewards from "@/components/admin/AdminRewards";
import AdminAlerts from "@/components/admin/AdminAlerts";
import AdminVisitors from "@/components/admin/AdminVisitors";

const ADMIN_EMAIL = "nextlookbeauty@gmail.com";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkAdmin();
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
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground font-body mb-6 max-w-md">
            You must be logged in with the admin account to access this dashboard.
          </p>
          <div className="flex gap-3">
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Sign In as Admin
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                  Admin Panel
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                NEXTLOOK Dashboard
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="commissions" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-card border border-border p-1.5 rounded-xl">
              <TabsTrigger value="commissions" className="font-body text-sm">Commissions</TabsTrigger>
              <TabsTrigger value="stylists" className="font-body text-sm">Stylists</TabsTrigger>
              <TabsTrigger value="payments" className="font-body text-sm">Payments</TabsTrigger>
              <TabsTrigger value="notifications" className="font-body text-sm">Notifications</TabsTrigger>
              <TabsTrigger value="providers" className="font-body text-sm">Providers</TabsTrigger>
              <TabsTrigger value="deals" className="font-body text-sm">Deals & Promos</TabsTrigger>
              <TabsTrigger value="rewards" className="font-body text-sm">GlowUp Monday</TabsTrigger>
              <TabsTrigger value="alerts" className="font-body text-sm">Admin Alerts</TabsTrigger>
              <TabsTrigger value="visitors" className="font-body text-sm">Visitors</TabsTrigger>
            </TabsList>

            <TabsContent value="commissions"><AdminCommissions /></TabsContent>
            <TabsContent value="stylists"><AdminStylists /></TabsContent>
            <TabsContent value="payments"><AdminPayments /></TabsContent>
            <TabsContent value="notifications"><AdminNotifications /></TabsContent>
            <TabsContent value="providers"><AdminProviders /></TabsContent>
            <TabsContent value="deals"><AdminDeals /></TabsContent>
            <TabsContent value="rewards"><AdminRewards /></TabsContent>
            <TabsContent value="alerts"><AdminAlerts /></TabsContent>
            <TabsContent value="visitors"><AdminVisitors /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
