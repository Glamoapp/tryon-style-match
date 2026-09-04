import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import logoImg from "@/assets/logo.png";

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/stylists";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) { toast.error("Please enter your name"); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: "customer" },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // Send welcome email (fire-and-forget)
        if (data?.user) {
          supabase.functions.invoke("send-signup-welcome-email", {
            body: {
                            recipientEmail: email,
              idempotencyKey: `signup-welcome-${data.user.id}`,
              templateData: { name: fullName },
            },
          }).catch((err) => console.error("Welcome email failed:", err));
        }

        toast.success("Account created! Please check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate(redirectTo);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="NEXTLOOK" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold">NEXTLOOK</span>
          </Link>
          <Link to={redirectTo} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              {mode === "login" ? "Sign in to message stylists and book services" : "Sign up to connect with stylists"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="flex items-center gap-2 mb-1.5">
                  <User className="w-4 h-4 text-primary" /> Full Name
                </Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            )}
            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <Mail className="w-4 h-4 text-primary" /> Email
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-primary" /> Password
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>


          <p className="text-center text-sm text-muted-foreground font-body">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
