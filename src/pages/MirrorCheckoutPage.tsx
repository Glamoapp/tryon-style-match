import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getModel, isModelId, getMirrorColor, CUSTOMIZATION_PRICE, STAND_PRICE } from "@/lib/mirrorModels";

const MirrorCheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modelParam = searchParams.get("model");
  const [loading, setLoading] = useState(false);
  const model = getModel(modelParam);
  const personalizeParam = searchParams.get("personalize") === "1";
  const engravingParam = (searchParams.get("engraving") || "").trim();
  const personalized = personalizeParam && engravingParam.length > 0;
  const mirrorColor = getMirrorColor(searchParams.get("color"));
  const standParam = searchParams.get("stand") === "1";
  const totalPrice =
    (model.price ?? 0) + (personalized ? CUSTOMIZATION_PRICE : 0) + (standParam ? STAND_PRICE : 0);
  const priceLabel = `$${(model.price ?? 0).toLocaleString()}`;
  const totalLabel = `$${totalPrice.toLocaleString()}`;
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
    document.title = "Reserve your NEXTLOOK Smart Mirror";
    if (!isModelId(modelParam)) {
      navigate("/mirror/preorder", { replace: true });
    }
  }, [modelParam, navigate]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModelId(modelParam)) {
      navigate("/mirror/preorder", { replace: true });
      return;
    }
    if (!form.name || !form.email || !form.phone || !form.line1 || !form.city || !form.state || !form.postal_code) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    // Open the tab synchronously (on the user gesture) so popup blockers allow it,
    // and so Stripe Checkout — which refuses to load inside an iframe — works in preview.
    const checkoutWindow = window.open("about:blank", "_blank");
    try {
      if (checkoutWindow) {
        checkoutWindow.document.write("Preparing secure checkout…");
      }
      const { data, error } = await supabase.functions.invoke("create-mirror-preorder", {
        body: {
          model: modelParam,
          personalization: personalized
            ? { engraving: engravingParam, color: mirrorColor.id }
            : undefined,
          stand: standParam,
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
      if (checkoutWindow) {
        checkoutWindow.location.href = data.url;
        setLoading(false);
      } else {
        window.location.href = data.url;
      }
    } catch (err) {
      checkoutWindow?.close();
      console.error(err);
      toast.error("Couldn't start checkout", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <SEO
        title="Reserve your NEXTLOOK Smart Mirror"
        description="Enter your shipping details to reserve your NEXTLOOK Genesis Smart Mirror. Secure checkout, free white-glove delivery."
        path="/mirror/checkout"
      />
      <Navbar />

      <div className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/mirror/preorder")}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to mirrors
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16"
          >
            <div>
              <div className="rounded-3xl overflow-hidden bg-white p-6">
                <div className="relative">
                  <img src={model.image} alt={model.name} className="w-full max-h-[520px] object-contain" />
                </div>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-amber-600 mb-2">Pre-order</p>
              <h1 className="font-display text-4xl font-bold">{model.name}</h1>
              <p className="text-zinc-500 mt-1">{model.size} · Ships in ~20 days · Free white-glove delivery</p>
              {personalized && (
                <p className="mt-2 text-sm text-amber-700">
                  Engraved “{engravingParam}” · {mirrorColor.label} finish (+${CUSTOMIZATION_PRICE})
                </p>
              )}
              {standParam && (
                <p className="mt-2 text-sm text-amber-700">Floor stand included (+${STAND_PRICE})</p>
              )}
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 p-4">
                  <Truck className="w-5 h-5 text-amber-600 mb-2" />
                  <div className="font-semibold">Ships in ~20 days</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 p-4">
                  <ShieldCheck className="w-5 h-5 text-amber-600 mb-2" />
                  <div className="font-semibold">Secure checkout</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-gradient-to-b from-zinc-50 to-white ring-1 ring-zinc-200 p-6 md:p-10 backdrop-blur-sm h-fit"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h2 className="font-display text-2xl font-semibold">Reserve your mirror</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-zinc-700">Full name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={update("name")}
                    required
                    className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-zinc-700">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      required
                      className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-zinc-700">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      required
                      className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                      placeholder="(555) 555-5555"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Shipping address</p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="line1" className="text-zinc-700">Street address *</Label>
                      <Input
                        id="line1"
                        value={form.line1}
                        onChange={update("line1")}
                        required
                        className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                        placeholder="123 Beauty Ave"
                      />
                    </div>
                    <div>
                      <Label htmlFor="line2" className="text-zinc-700">Apt, suite (optional)</Label>
                      <Input
                        id="line2"
                        value={form.line2}
                        onChange={update("line2")}
                        className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                        placeholder="Unit 4B"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-zinc-700">City *</Label>
                        <Input
                          id="city"
                          value={form.city}
                          onChange={update("city")}
                          required
                          className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                          placeholder="Atlanta"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-zinc-700">State *</Label>
                        <Input
                          id="state"
                          value={form.state}
                          onChange={update("state")}
                          required
                          className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                          placeholder="GA"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code" className="text-zinc-700">ZIP *</Label>
                        <Input
                          id="postal_code"
                          value={form.postal_code}
                          onChange={update("postal_code")}
                          required
                          className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                          placeholder="30301"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-zinc-700">Country</Label>
                        <Input
                          id="country"
                          value={form.country}
                          onChange={update("country")}
                          className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                          placeholder="US"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-200">
                <div className="flex justify-between text-zinc-600 mb-2">
                  <span>{model.name}</span>
                  <span>{priceLabel}.00</span>
                </div>
                {personalized && (
                  <div className="flex justify-between text-zinc-600 mb-2">
                    <span>
                      Personalization · {mirrorColor.label} finish
                      <span className="block text-xs text-zinc-400">Engraved: “{engravingParam}”</span>
                    </span>
                    <span>${CUSTOMIZATION_PRICE}.00</span>
                  </div>
                )}
                {standParam && (
                  <div className="flex justify-between text-zinc-600 mb-2">
                    <span>Floor stand</span>
                    <span>${STAND_PRICE}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600 mb-4">
                  <span>White-glove shipping</span>
                  <span className="text-amber-600">Free</span>
                </div>
                <div className="flex justify-between font-display text-2xl font-bold">
                  <span>Total</span>
                  <span>{totalLabel}.00</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 rounded-full bg-mirror-action text-mirror-action-foreground hover:bg-mirror-action-hover h-14 font-semibold text-base"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</>
                ) : (
                  <>Pay {totalLabel} &amp; Pre-order</>
                )}
              </Button>

              <p className="mt-4 text-center text-zinc-400 text-xs">
                Secure payment via Stripe. By placing your pre-order you agree to our{" "}
                <Link to="/terms" className="underline hover:text-zinc-600">terms</Link>.
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MirrorCheckoutPage;
