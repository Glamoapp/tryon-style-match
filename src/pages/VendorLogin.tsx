import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VendorLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_approved")
        .eq("id", data.user.id)
        .single();

      if (profile?.role !== "vendor") {
        toast.error("This login is for vendors only");
        await supabase.auth.signOut();
        return;
      }

      navigate("/vendor/dashboard");
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img src={logoImg} alt="NEXTLOOK" className="w-20 h-20 object-contain mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-white mb-4">Vendor Portal</h1>
          <p className="text-white/80 text-lg">Manage your products, track sales, and grow your brand.</p>

        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <img src={logoImg} alt="NEXTLOOK" className="w-10 h-10 object-contain" />
            <span className="font-display text-2xl font-bold text-foreground">NEXTLOOK</span>
          </div>

          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Vendor Login</h2>
            <p className="text-muted-foreground">Sign in to manage your products</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    toast.error("Enter your email above first");
                    return;
                  }
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) toast.error(error.message);
                  else toast.success("Password reset email sent. Check your inbox.");
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/vendor/signup" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
