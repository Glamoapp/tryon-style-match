import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Scissors, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICE_CATEGORIES = [
  "Hair Styling",
  "Braids & Locs",
  "Wigs & Extensions",
  "Makeup",
  "Nails",
  "Skincare & Facials",
  "Barbering",
];

const ProviderSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    serviceCategories: [] as string[],
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.city || form.serviceCategories.length === 0) {
      toast.error("Please fill in all required fields and select at least one category");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
          },
          emailRedirectTo: window.location.origin + "/provider/onboarding",
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update profile with provider details
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: form.fullName,
            phone: form.phone,
            city: form.city,
            role: "provider",
            service_category: form.serviceCategories.join(", "),
          })
          .eq("id", data.user.id);

        if (profileError) throw profileError;

        toast.success("Account created! Please check your email to verify your account.");
        navigate("/provider/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Scissors className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4">
            Join NEXTLOOK
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Grow your beauty business. Set your schedule, list your services, and connect with clients in your area.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Create Provider Account</h2>
            <p className="text-muted-foreground">Start accepting bookings from customers near you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" placeholder="Your full name" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>

            <div className="relative">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={(e) => handleChange("password", e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="Your city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
            </div>

            <div>
              <Label>Service Categories * <span className="text-muted-foreground font-normal">(select all that apply)</span></Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <label key={cat} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.serviceCategories.includes(cat) ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:border-primary/30"
                  }`}>
                    <Checkbox
                      checked={form.serviceCategories.includes(cat)}
                      onCheckedChange={(checked) => {
                        setForm((prev) => ({
                          ...prev,
                          serviceCategories: checked
                            ? [...prev.serviceCategories, cat]
                            : prev.serviceCategories.filter((c) => c !== cat),
                        }));
                      }}
                    />
                    <span className="text-sm font-medium">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/provider/login" className="text-primary hover:underline font-medium">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignup;
