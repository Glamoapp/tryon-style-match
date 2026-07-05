import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Crown, Sparkles, Check } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SPECIALTIES = ["Hair", "Braids", "Lashes", "Nails", "Makeup", "Barber", "Skin", "Other"];

const QuickStylistSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref")?.toUpperCase().trim() || "";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    specialty: "",
  });

  // Persist referral code so it survives the auth redirect
  useEffect(() => {
    if (refCode) localStorage.setItem("nl_ref_code", refCode);
  }, [refCode]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.city || !form.specialty) {
      toast.error("Please fill in every field — takes 60 seconds.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const storedRef = refCode || localStorage.getItem("nl_ref_code") || "";
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim(),
            city: form.city.trim(),
            role: "provider",
            service_category: form.specialty,
          },
          emailRedirectTo: window.location.origin + "/provider/dashboard",
        },
      });
      if (error) throw error;

      // Try to link referral (best-effort; profile row is created by DB trigger)
      if (storedRef && data.user?.id) {
        // Give the profile trigger a moment, then attach referral
        setTimeout(async () => {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id, referral_code")
            .eq("referral_code", storedRef)
            .maybeSingle();
          if (referrer?.id && referrer.id !== data.user!.id) {
            await supabase.from("profiles").update({ referred_by_code: storedRef }).eq("id", data.user!.id);
            await supabase.from("stylist_referrals").insert({
              referrer_id: referrer.id,
              referred_id: data.user!.id,
              referral_code: storedRef,
            });
          }
          localStorage.removeItem("nl_ref_code");
        }, 1500);
      }

      toast.success("You're in! Check your email to confirm, then jump into your dashboard.");
      navigate("/provider/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left promo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 mb-6">
            <Crown className="w-3.5 h-3.5 text-primary-foreground" />
            <span className="text-xs font-body font-semibold text-primary-foreground uppercase tracking-wider">Founding Stylist Program</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4 leading-tight">
            60 seconds to your first booking.
          </h1>
          <p className="text-primary-foreground/80 font-body mb-8">
            Just the basics — you can finish your full profile from your dashboard whenever you're ready.
          </p>
          <ul className="space-y-3">
            {[
              "0% commission for your first 90 days",
              "Founding Stylist badge + priority placement",
              "$25 for every stylist you refer",
              "Cancel anytime, keep your clients",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-primary-foreground/90">
                <Check className="w-5 h-5 text-primary-foreground shrink-0 mt-0.5" />
                <span className="text-sm font-body">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/join-stylist" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <img src={logoImg} alt="NEXTLOOK" className="w-10 h-10 object-contain" />
            <span className="font-display text-2xl font-bold text-foreground">NEXTLOOK</span>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">60-second signup</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Claim your spot</h2>
            <p className="text-muted-foreground font-body mt-1">You can polish your profile later from the dashboard.</p>
            {refCode && (
              <p className="mt-3 text-xs font-body text-primary bg-primary/5 border border-primary/20 rounded-md px-2 py-1 inline-block">
                Referred by <span className="font-semibold">{refCode}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="fullName">Your name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="Jasmine Carter" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="Atlanta" />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <select
                  id="specialty"
                  value={form.specialty}
                  onChange={(e) => handleChange("specialty", e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Choose one</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Min. 6 characters" />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating your account..." : "Claim my founding spot"}
            </Button>

            <p className="text-center text-xs text-muted-foreground font-body">
              By signing up you agree to our <Link to="/terms" className="underline">terms</Link>.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Already a stylist?{" "}
              <Link to="/provider/login" className="text-primary hover:underline font-medium">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickStylistSignup;
