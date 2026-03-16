import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerPoints } from "@/hooks/useCustomerPoints";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Gift, Lock, Crown, TrendingUp, ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  reward_type: string;
  discount_percent: number | null;
  discount_amount: number | null;
  points_cost: number;
  image_url: string | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

const POINTS_TIERS = [
  { min: 0, max: 299, points: 10, label: "Under $300" },
  { min: 300, max: 999, points: 20, label: "$500+" },
  { min: 500, max: 1999, points: 50, label: "$1,000+" },
  { min: 2000, max: Infinity, points: 100, label: "$2,000+" },
];

const GlowUpMondayPage = () => {
  const navigate = useNavigate();
  const { balance, transactions, loading: pointsLoading, userId } = useCustomerPoints();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [hasBookingThisMonth, setHasBookingThisMonth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // Fetch active rewards
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setRewards((rewardsData as Reward[]) || []);

      if (user) {
        // Check if customer has a booking this month
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

        const { data: bookings } = await supabase
          .from("bookings")
          .select("id")
          .eq("customer_id", user.id)
          .gte("booking_date", firstOfMonth)
          .lte("booking_date", lastOfMonth)
          .limit(1);

        setHasBookingThisMonth((bookings?.length || 0) > 0);
      }

      setLoading(false);
    };
    load();
  }, []);

  const canAccessPromos = isLoggedIn && hasBookingThisMonth;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto py-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-body font-semibold text-primary">Every Monday</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-4">
              GlowUp Monday
            </h1>
            <p className="text-cream/70 font-body text-lg mb-6">
              Exclusive rewards & promotions for loyal NEXTLOOK customers. Book a service this month to unlock all deals!
            </p>
            {!isLoggedIn && (
              <Button variant="hero" size="lg" onClick={() => navigate("/auth?redirect=/glowup-monday")}>
                Sign In to Access Rewards
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-16 space-y-12">
        {/* Points Balance Card */}
        {isLoggedIn && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border overflow-hidden">
              <div className="bg-[var(--gradient-rose)] p-6 text-cream">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-cream/70 text-sm font-body mb-1">Your Reward Points</p>
                    <h2 className="text-4xl font-display font-bold">
                      {pointsLoading ? "..." : (balance?.total_points || 0).toLocaleString()}
                    </h2>
                    <p className="text-cream/60 text-sm font-body mt-1">
                      Lifetime earned: {balance?.lifetime_points || 0} pts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-8 h-8 text-gold" />
                    <div>
                      <p className="text-sm font-body font-semibold text-cream">
                        {(balance?.total_points || 0) >= 200 ? "Gold" : (balance?.total_points || 0) >= 100 ? "Silver" : "Bronze"} Member
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {!hasBookingThisMonth && (
                <div className="p-4 bg-primary/5 border-t border-primary/10 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm font-body text-foreground">
                    <span className="font-semibold">Book a service this month</span> to unlock GlowUp Monday promotions!
                  </p>
                  <Button variant="hero" size="sm" className="ml-auto flex-shrink-0" onClick={() => navigate("/stylists")}>
                    Book Now
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Points Earning Tiers */}
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> How You Earn Points
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POINTS_TIERS.map((tier, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{tier.points} pts</p>
                    <p className="text-sm text-muted-foreground font-body mt-1">Spend {tier.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Promotions Grid */}
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" /> This Week's GlowUp Monday Deals
          </h2>

          {rewards.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-body text-lg">No promotions available right now.</p>
                <p className="text-muted-foreground/60 font-body text-sm mt-2">Check back every Monday for new deals!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, i) => (
                <motion.div key={reward.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className={`bg-card border-border h-full relative overflow-hidden transition-all hover:shadow-[var(--shadow-card)] ${!canAccessPromos ? "opacity-70" : ""}`}>
                    {!canAccessPromos && (
                      <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center px-4">
                          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-body font-semibold text-foreground">Book a service to unlock</p>
                        </div>
                      </div>
                    )}
                    {reward.image_url && (
                      <div className="h-40 overflow-hidden">
                        <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-bold text-foreground text-lg">{reward.title}</h3>
                        {reward.discount_percent && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-body flex-shrink-0">
                            {reward.discount_percent}% OFF
                          </Badge>
                        )}
                        {reward.discount_amount && !reward.discount_percent && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-body flex-shrink-0">
                            ${reward.discount_amount} OFF
                          </Badge>
                        )}
                      </div>
                      {reward.description && (
                        <p className="text-sm text-muted-foreground font-body mb-3">{reward.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {reward.points_cost > 0 && (
                          <span className="text-xs font-body font-semibold text-primary">{reward.points_cost} points to redeem</span>
                        )}
                        {reward.valid_until && (
                          <span className="text-xs text-muted-foreground font-body">
                            Expires {format(new Date(reward.valid_until), "MMM d")}
                          </span>
                        )}
                      </div>
                      {canAccessPromos && (
                        <Button variant="hero" size="sm" className="w-full mt-4" onClick={() => navigate("/stylists")}>
                          Redeem <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Points History */}
        {isLoggedIn && transactions.length > 0 && (
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Points History</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.points > 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                          {tx.points > 0 ? (
                            <TrendingUp className="w-4 h-4 text-primary" />
                          ) : (
                            <Gift className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-body font-medium text-foreground">{tx.description || tx.transaction_type}</p>
                          <p className="text-xs text-muted-foreground font-body">{format(new Date(tx.created_at), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <span className={`font-body font-bold ${tx.points > 0 ? "text-primary" : "text-destructive"}`}>
                        {tx.points > 0 ? "+" : ""}{tx.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default GlowUpMondayPage;
