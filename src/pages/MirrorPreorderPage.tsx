import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
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
import genesisImg from "@/assets/mirror-genesis.jpg";
import genesisProImg from "@/assets/mirror-genesis-pro.jpg";
import genesisMaxImg from "@/assets/mirror-genesis-max.jpg";

type ModelId = "genesis" | "genesis_pro" | "genesis_pro_2";
const MODELS: { id: ModelId; name: string; size: string; price: number | null; tag: string; image: string; features: string[] }[] = [
  { id: "genesis", name: "NEXTLOOK Genesis", size: '32" smart mirror', price: 2500, tag: "", image: genesisImg,
    features: ["Hair try-on with face scan", "Music, time, weather & daily affirmation", "Gwen voice assistant"] },
  { id: "genesis_pro", name: "NEXTLOOK Genesis Pro", size: '43" full-length smart mirror', price: 3500, tag: "Most popular", image: genesisProImg,
    features: ["Everything in Genesis", "Full-length hair & apparel try-on", "4K edge-to-edge display"] },
  { id: "genesis_pro_2", name: "NEXTLOOK Genesis Pro 2", size: '55" salon smart mirror', price: 5000, tag: "Largest", image: genesisMaxImg,
    features: ["Everything in Genesis Pro", "Salon & showroom size", "Built for stylists and stores"] },
];

const MirrorPreorderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ModelId>("genesis_pro");
  const model = MODELS.find((m) => m.id === selected)!;
  const priceLabel = `$${(model.price ?? 0).toLocaleString()}`;
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
    document.title = "Pre-order NEXTLOOK Genesis Smart Mirrors";
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
          model: selected,
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
      <SEO title="Pre-Order the NEXTLOOK Smart Mirror" description="Reserve your NEXTLOOK Smart Mirror today. Secure your spot for the next generation of at-home beauty technology." path="/mirror/preorder" />
      <Navbar />

      <div className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/mirror")}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Mirror
          </button>

          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-10">
            All mirrors. <span className="text-white/50">Take your pick.</span>
          </h1>

          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {MODELS.map((m) => {
              const active = m.id === selected;
              return (
                <div
                  key={m.id}
                  className={`rounded-3xl bg-white text-zinc-900 p-6 flex flex-col transition-shadow ${active ? "ring-4 ring-amber-400 shadow-2xl" : "ring-1 ring-black/5"}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 h-4">{m.tag}</p>
                  <h2 className="font-display text-3xl font-bold mt-2">{m.name}</h2>
                  <p className="text-sm text-zinc-500 mt-1">{m.size}</p>
                  <div className="relative my-6">
                    <img src={m.image} alt={`${m.name} smart mirror`} width={768} height={1024} loading="lazy" className="w-full aspect-[3/4] object-contain" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <span className="font-display text-2xl font-bold tracking-[0.18em] uppercase text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] text-center px-4">
                        NEXTLOOK
                      </span>
                      <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] text-center px-4">
                        {m.name.replace("NEXTLOOK ", "")}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-sm text-zinc-600 mb-6 flex-1">
                    {m.features.map((f) => (
                      <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base">{m.price ? <>Buy for <strong>${m.price.toLocaleString()}</strong></> : "Price coming soon"}</span>
                    <Button
                      type="button"
                      disabled={!m.price}
                      onClick={() => { setSelected(m.id); document.getElementById("reserve")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="rounded-full bg-purple-700 hover:bg-purple-800 text-white px-6"
                    >
                      {m.price ? (active ? "Selected" : "Buy") : "Notify me"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <motion.div
            id="reserve"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16 scroll-mt-28"
          >
            <div>
              <div className="rounded-3xl overflow-hidden bg-white p-6">
                <div className="relative">
                  <img src={model.image} alt={model.name} className="w-full max-h-[520px] object-contain" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="font-display text-3xl font-bold tracking-[0.18em] uppercase text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] text-center px-4">
                      NEXTLOOK
                    </span>
                    <span className="text-sm font-semibold tracking-[0.3em] uppercase text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] text-center px-4">
                      {model.name.replace("NEXTLOOK ", "")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-amber-400 mb-2">Pre-order</p>
              <h2 className="font-display text-4xl font-bold">{model.name}</h2>
              <p className="text-white/60 mt-1">{model.size} · Ships in ~20 days · Free white-glove delivery</p>
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                  <Truck className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="font-semibold">Ships in ~20 days</div>
                </div>
                <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                  <ShieldCheck className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="font-semibold">Secure checkout</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 p-6 md:p-10 backdrop-blur-sm h-fit"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-400" />
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
                  <span>{model.name}</span>
                  <span>{priceLabel}.00</span>
                </div>
                <div className="flex justify-between text-white/70 mb-4">
                  <span>White-glove shipping</span>
                  <span className="text-amber-400">Free</span>
                </div>
                <div className="flex justify-between font-display text-2xl font-bold">
                  <span>Total</span>
                  <span>{priceLabel}.00</span>
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
                  <>Pay {priceLabel} & Pre-order</>
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
