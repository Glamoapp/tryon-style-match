import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MIRROR_MODELS } from "@/lib/mirrorModels";

const MirrorPreorderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
                <h2 className="font-display text-3xl font-bold mt-2">{m.name}</h2>
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
                    onClick={() => navigate(`/mirror/checkout?model=${m.id}`)}
                    className="rounded-full bg-mirror-action hover:bg-mirror-action-hover text-mirror-action-foreground px-6"
                  >
                    {m.price ? "Buy" : "Notify me"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
