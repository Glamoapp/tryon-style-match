import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MIRROR_MODELS,
  MIRROR_COLORS,
  CUSTOMIZATION_PRICE,
  isMirrorColorId,
  type ModelId,
} from "@/lib/mirrorModels";
import personalizationImg from "@/assets/mirror-personalization.jpg";

const MirrorPreorderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [personalize, setPersonalize] = useState(false);
  const [engraving, setEngraving] = useState("");
  const [color, setColor] = useState<string>("silver");

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

  const goCheckout = (id: ModelId) => {
    if (personalize && !engraving.trim()) {
      toast.error("Enter the name to engrave, or turn personalization off.");
      return;
    }
    const params = new URLSearchParams({ model: id });
    if (personalize) {
      params.set("personalize", "1");
      params.set("engraving", engraving.trim());
      params.set("color", isMirrorColorId(color) ? color : "silver");
    }
    navigate(`/mirror/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <SEO title="Pre-Order the NEXTLOOK Smart Mirror" description="Reserve your NEXTLOOK Smart Mirror today. Secure your spot for the next generation of at-home beauty technology." path="/mirror/preorder" />
      <Navbar />

      <div className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/mirror")}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Mirror
          </button>

          {/* Heading words removed; the space they took is kept so the layout stays put. */}
          <h1 aria-hidden="true" className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-10 invisible">
            All mirrors. <span className="text-zinc-400">Take your pick.</span>
          </h1>

          <div className="grid md:grid-cols-3 gap-5">
            {MIRROR_MODELS.map((m) => (
              <div
                key={m.id}
                className="rounded-3xl bg-white text-zinc-900 p-6 flex flex-col ring-1 ring-black/5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 h-4">{m.tag}</p>
                <h2 className="mt-2 leading-tight">
                  <span className="block font-display text-2xl md:text-[1.75rem] font-bold tracking-tight">NEXTLOOK</span>
                  <span className="block font-display text-lg md:text-xl font-bold tracking-tight mt-0.5 text-zinc-800">
                    {m.name.replace(/^NEXTLOOK\s+/, "")}
                  </span>
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{m.size}</p>
                <div className="relative my-6">
                  <img src={m.image} alt={`${m.name} smart mirror`} width={768} height={1024} loading="lazy" className="w-full aspect-[3/4] object-contain" />
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
                    onClick={() => goCheckout(m.id)}
                    className="rounded-full bg-mirror-action hover:bg-mirror-action-hover text-mirror-action-foreground px-6"
                  >
                    {m.price ? "Buy" : "Notify me"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Personalization section */}
          <section className="mt-14 rounded-3xl bg-zinc-50 ring-1 ring-black/5 overflow-hidden">
            <div className="pt-10 px-6 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Personalize your mirror.
              </h2>
              <p className="text-zinc-500 mt-2 text-sm md:text-base">
                Engrave your name and even choose your color — for ${CUSTOMIZATION_PRICE} more.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center p-6 md:p-10">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <img
                  src={personalizationImg}
                  alt="NEXTLOOK mirrors in Silver, Gold, Amethyst and Black finishes with a name engraved on the glass"
                  width={1440}
                  height={1080}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover rounded-xl"
                />
              </div>
              <div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={personalize}
                  onClick={() => setPersonalize((p) => !p)}
                  className="flex items-center gap-3 text-left"
                >
                  <span
                    className={`relative h-7 w-12 rounded-full transition-colors shrink-0 ${personalize ? "bg-mirror-action" : "bg-zinc-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${personalize ? "translate-x-5" : ""}`}
                    />
                  </span>
                  <span>
                    <span className="block font-semibold">Add personalization</span>
                    <span className="block text-sm text-zinc-500">Engraved name + custom color · +${CUSTOMIZATION_PRICE}.00</span>
                  </span>
                </button>

                {personalize && (
                  <div className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="engraving" className="text-sm font-medium text-zinc-700">
                        Name to engrave *
                      </label>
                      <Input
                        id="engraving"
                        value={engraving}
                        onChange={(e) => setEngraving(e.target.value.slice(0, 25))}
                        maxLength={25}
                        className="mt-1.5 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                        placeholder="e.g. Rishielle"
                      />
                      <p className="mt-1 text-xs text-zinc-400">{engraving.trim().length}/25 characters · engraved near the bottom of the glass</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-700 mb-2">Frame color</p>
                      <div className="flex flex-wrap gap-3">
                        {MIRROR_COLORS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setColor(c.id)}
                            aria-pressed={color === c.id}
                            className={`flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 ring-1 transition-colors ${
                              color === c.id
                                ? "ring-mirror-action bg-white"
                                : "ring-zinc-200 bg-white hover:ring-zinc-400"
                            }`}
                          >
                            <span
                              className="h-6 w-6 rounded-full ring-1 ring-black/10 shrink-0"
                              style={{ backgroundColor: c.swatch }}
                            />
                            <span className="text-sm">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      Applied to any mirror you buy below — you'll see the $500 added at checkout.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Tap Buy to continue to secure checkout, where you'll enter your shipping details.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MirrorPreorderPage;
