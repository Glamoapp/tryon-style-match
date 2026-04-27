import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScanFace, Sparkles, CalendarCheck, Cpu, Wifi, Mic, ShieldCheck, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import mirrorHero from "@/assets/mirror-lifestyle.jpg";
import mirrorProduct from "@/assets/mirror-product.jpg";
import mirrorScan from "@/assets/mirror-scan.jpg";
import mirrorVideo from "@/assets/videos/mirror-demo.mp4.asset.json";

const SEO = () => {
  useEffect(() => {
    document.title = "NextLook Smart Mirror — 43\" Smart Beauty Mirror | Pre-Order $2000";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "NextLook Smart Mirror: a 43-inch AI smart mirror. Scan your face, try on hairstyles, and book a stylist — right from the mirror. Pre-order today for $2000."
    );
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + "/mirror";
  }, []);
  return null;
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const MirrorPage = () => {
  const navigate = useNavigate();
  const handlePreorder = () => navigate("/mirror/preorder");

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <SEO />
      <Navbar />

      {/* HERO — Apple style: tight headline, two text links, then product image */}
      <section className="pt-28 pb-10 text-center px-6">
        <motion.p
          {...fadeUp}
          className="text-sm md:text-base text-white/60 font-body mb-3"
        >
          New
        </motion.p>
        <motion.h1
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="font-display text-5xl md:text-7xl font-semibold tracking-tight"
        >
          NextLook Smart Mirror
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="mt-4 font-display text-2xl md:text-3xl text-white/80 font-medium tracking-tight"
        >
          Mirror, mirror. Reimagined.
        </motion.p>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="mt-6 text-base md:text-lg text-white/70 max-w-xl mx-auto"
        >
          A 43-inch smart mirror with on-device AI. Scan, try on, and book — all from the glass.
        </motion.p>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="mt-7 flex items-center justify-center gap-6 text-base"
        >
          <button
            onClick={handlePreorder}
            className="text-sky-400 hover:underline font-medium"
          >
            Pre-order &gt;
          </button>
          <a href="#video" className="text-sky-400 hover:underline font-medium">
            Watch the film &gt;
          </a>
        </motion.div>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.25 }}
          className="mt-4 text-sm text-white/60"
        >
          From $2,000. Ships in ~20 days.
        </motion.p>

        {/* Hero product image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 max-w-5xl mx-auto"
        >
          <img
            src={mirrorHero}
            alt="NextLook 43 inch smart mirror in a modern living space"
            className="w-full h-auto rounded-2xl"
            width={1920}
            height={1080}
          />
        </motion.div>
      </section>

      {/* TAGLINE — generous whitespace */}
      <section className="py-32 md:py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            {...fadeUp}
            className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-white"
          >
            Your beauty studio.
            <br />
            <span className="text-white/40">Reimagined as a mirror.</span>
          </motion.h2>
        </div>
      </section>

      {/* VIDEO DEMO — clean, no gradient overlay */}
      <section id="video" className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeUp}
            className="rounded-3xl overflow-hidden bg-neutral-900"
          >
            <video
              src={(mirrorVideo as { url: string }).url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block"
            />
          </motion.div>
          <motion.div {...fadeUp} className="mt-8 text-center">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-2">Live Demo</p>
            <h3 className="font-display text-2xl md:text-4xl font-semibold tracking-tight text-white">
              Stand. Scan. See a brand new look.
            </h3>
          </motion.div>
        </div>
      </section>

      {/* THREE STEPS — light cards */}
      <section className="py-32 px-6 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-3">How it works</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
              From reflection to booking in seconds.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: ScanFace, title: "Scan", desc: "Step in front of the mirror. Face tracking maps your features in real time." },
              { icon: Sparkles, title: "Try on", desc: "Browse weaves, braids, color and cuts — see them on your real face, instantly." },
              { icon: CalendarCheck, title: "Book", desc: "Love the look? Tap the mirror to book a nearby NEXTLOOK stylist." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="rounded-3xl bg-neutral-900 p-10"
              >
                <div className="text-white/40 text-sm font-mono mb-6">0{i + 1}</div>
                <step.icon className="w-9 h-9 text-white mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-2xl font-semibold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-white/70 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCAN — split layout, clean */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <p className="text-sm uppercase tracking-widest text-white/60 mb-3">Precision AI</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
              468 facial points.
              <br />
              <span className="text-white/40">60 frames per second.</span>
            </h2>
            <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-md">
              On-device neural rendering moves every hairstyle with you in real time. No lag. Just you, with a new look.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            className="rounded-3xl overflow-hidden bg-neutral-900"
          >
            <img
              src={mirrorScan}
              alt="Face scanning AR interface on the NextLook Smart Mirror"
              className="w-full h-auto"
              loading="lazy"
              width={1024}
              height={1024}
            />
          </motion.div>
        </div>
      </section>

      {/* SPECS — simple grid, no colored accents */}
      <section className="py-32 px-6 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-3">The details</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Engineered to belong in your space.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.img
              {...fadeUp}
              src={mirrorProduct}
              alt="NextLook 43 inch smart mirror product shot"
              className="w-full rounded-3xl"
              loading="lazy"
              width={1280}
              height={1280}
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ScanFace, label: "43\" 4K", sub: "Edge-to-edge mirror display" },
                { icon: Cpu, label: "Neural Chip", sub: "On-device AI face tracking" },
                { icon: Wifi, label: "Wi-Fi 6E", sub: "Always-on cloud styles" },
                { icon: Mic, label: "Voice", sub: "“Mirror, try a wig.”" },
                { icon: ShieldCheck, label: "Private", sub: "Your face never leaves the device" },
                { icon: Truck, label: "20 days", sub: "Free white-glove delivery" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                  className="rounded-2xl bg-neutral-900 p-5"
                >
                  <s.icon className="w-6 h-6 text-white mb-3" strokeWidth={1.5} />
                  <div className="font-display text-lg font-semibold tracking-tight">{s.label}</div>
                  <div className="text-white/60 text-sm mt-1">{s.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRE-ORDER CTA — minimal, centered */}
      <section className="py-32 px-6">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
            Pre-order yours today.
          </h2>
          <p className="mt-5 text-white/70 text-lg max-w-xl mx-auto">
            Reserve your NextLook Smart Mirror. Estimated delivery in 20 days from order.
          </p>

          <div className="mt-10 inline-flex items-baseline gap-2">
            <span className="font-display text-5xl md:text-6xl font-semibold tracking-tight">$2,000</span>
            <span className="text-white/60">USD</span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handlePreorder}
              className="rounded-full bg-white text-black hover:bg-white/90 px-8 h-12 text-base font-medium"
            >
              Pre-order Mirror
            </Button>
            <a
              href="#video"
              className="text-sky-400 hover:underline font-medium"
            >
              Learn more &gt;
            </a>
          </div>

          <p className="mt-6 text-white/40 text-xs">
            No charge today. We'll confirm payment when your mirror is ready to ship.
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default MirrorPage;
