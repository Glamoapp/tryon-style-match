import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Truck, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import mirrorProduct from "@/assets/mirror-product.jpg";

const MirrorPreorderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  useEffect(() => {
    document.title = "Pre-order NextLook Smart Mirror — $2,000";
    const status = searchParams.get("status");
    if (status === "success") {
      toast.success("Pre-order confirmed!", {
        description: "We'll email you tracking when your mirror ships (~20 days).",
      });
    } else if (status === "canceled") {
      toast.info("Payment canceled", { description: "Your pre-order was not charged." });
    }
  }, [searchParams]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.line1 || !form.city || !form.state || !form.postal_code) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-mirror-preorder", {
        body: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            country: form.country,
          },
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Could not start checkout");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error("Couldn't start checkout", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/mirror")}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Mirror
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16"
          >
            {/* Product summary */}
            <div>
              <div className="rounded-3xl overflow-hidden ring-1 ring-white/10 bg-zinc-950">
                <img
                  src={mirrorProduct}
                  alt="NextLook Smart Mirror"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.3em] text-pink-400 mb-3">Pre-order</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                  NextLook Smart Mirror
                </h1>
                <p className="mt-4 text-white/70 font-body leading-relaxed">
                  A 43-inch AI-powered smart mirror. Scan your face, try on hairstyles in real time,
                  and book a NEXTLOOK stylist — without ever picking up your phone.
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold">$2,000</span>
                  <span className="text-white/50">USD</span>
                </div>

                <ul className="mt-8 space-y-3 text-white/80 font-body">
                  {[
                    "43\" 4K edge-to-edge mirror display",
                    "On-device neural face tracking (468 points)",
                    "Wi-Fi 6E · Voice control · Touchscreen",
                    "Free white-glove delivery",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                    <Truck className="w-5 h-5 text-pink-400 mb-2" />
                    <div className="font-semibold">Ships in ~20 days</div>
                    <div className="text-white/55 text-xs mt-1">From order confirmation</div>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                    <ShieldCheck className="w-5 h-5 text-pink-400 mb-2" />
                    <div className="font-semibold">Secure checkout</div>
                    <div className="text-white/55 text-xs mt-1">Powered by Stripe</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 p-6 md:p-10 backdrop-blur-sm h-fit"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h2 className="font-display text-2xl font-semibold">Reserve your mirror</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-white/80">Full name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={update("name")}
                    required
                    className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-white/80">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      required
                      className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white/80">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      required
                      className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      placeholder="(555) 555-5555"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Shipping address</p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="line1" className="text-white/80">Street address *</Label>
                      <Input
                        id="line1"
                        value={form.line1}
                        onChange={update("line1")}
                        required
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        placeholder="123 Beauty Ave"
                      />
                    </div>
                    <div>
                      <Label htmlFor="line2" className="text-white/80">Apt, suite (optional)</Label>
                      <Input
                        id="line2"
                        value={form.line2}
                        onChange={update("line2")}
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        placeholder="Unit 4B"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-white/80">City *</Label>
                        <Input
                          id="city"
                          value={form.city}
                          onChange={update("city")}
                          required
                          className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                          placeholder="Atlanta"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-white/80">State *</Label>
                        <Input
                          id="state"
                          value={form.state}
                          onChange={update("state")}
                          required
                          className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                          placeholder="GA"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code" className="text-white/80">ZIP *</Label>
                        <Input
                          id="postal_code"
                          value={form.postal_code}
                          onChange={update("postal_code")}
                          required
                          className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                          placeholder="30301"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-white/80">Country</Label>
                        <Input
                          id="country"
                          value={form.country}
                          onChange={update("country")}
                          className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                          placeholder="US"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between text-white/70 mb-2">
                  <span>NextLook Smart Mirror</span>
                  <span>$2,000.00</span>
                </div>
                <div className="flex justify-between text-white/70 mb-4">
                  <span>White-glove shipping</span>
                  <span className="text-pink-400">Free</span>
                </div>
                <div className="flex justify-between font-display text-2xl font-bold">
                  <span>Total</span>
                  <span>$2,000.00</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 rounded-full bg-white text-black hover:bg-white/90 h-14 font-semibold text-base"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</>
                ) : (
                  <>Pay $2,000 & Pre-order</>
                )}
              </Button>

              <p className="mt-4 text-center text-white/40 text-xs">
                Secure payment via Stripe. By placing your pre-order you agree to our{" "}
                <Link to="/terms" className="underline hover:text-white/70">terms</Link>.
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MirrorPreorderPage;
