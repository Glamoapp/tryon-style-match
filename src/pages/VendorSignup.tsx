import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ArrowLeft, Eye, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VendorSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            city: form.city,
            role: "vendor",
          },
          emailRedirectTo: window.location.origin + "/vendor/login",
        },
      });

      if (error) throw error;
      toast.success("Account created! Please check your email to verify your account.");
      navigate("/vendor/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Store className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4">
            Sell on NEXTLOOK
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            List your hair extensions & beauty products. Reach thousands of customers and grow your brand.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <img src={logoImg} alt="NEXTLOOK" className="w-10 h-10 object-contain" />
            <span className="font-display text-2xl font-bold text-foreground">NEXTLOOK</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Create Vendor Account</h2>
            <p className="text-muted-foreground">Start selling hair extensions & beauty products</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" placeholder="Your full name" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" placeholder="Your brand or business name" value={form.businessName} onChange={(e) => handleChange("businessName", e.target.value)} />
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

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating Account..." : "Create Vendor Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/vendor/login" className="text-primary hover:underline font-medium">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;
