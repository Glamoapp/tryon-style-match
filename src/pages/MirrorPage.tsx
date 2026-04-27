import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScanFace, Sparkles, CalendarCheck, Cpu, Wifi, Mic, ShieldCheck, Truck, ArrowRight, Check } from "lucide-react";
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

const MirrorPage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.4]);

  const handlePreorder = () => navigate("/mirror/preorder");

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <SEO />
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <img
            src={mirrorHero}
            alt="Woman trying on a curly weave on the NextLook 43 inch smart mirror"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/70 font-body mb-6"
          >
            Introducing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight"
          >
            NextLook<span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400"> Smart Mirror</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-6 text-lg md:text-2xl text-white/80 font-body max-w-2xl mx-auto"
          >
            A 43-inch smart mirror. Scan your face. Try on hairstyles. Book your stylist — without ever picking up your phone.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="text-white/70 text-sm">
              From <span className="text-white font-semibold text-base">$2,000</span> · Ships in ~20 days
            </div>
            <Button
              onClick={handlePreorder}
              disabled={preordering}
              className="rounded-full bg-white text-black hover:bg-white/90 px-8 h-12 font-semibold"
            >
              {preordering ? "Reserving…" : "Pre-order"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <a href="#video" className="text-white/80 hover:text-white text-sm underline-offset-4 hover:underline">
              Watch the film →
            </a>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest"
        >
          SCROLL
        </motion.div>
      </section>

      {/* TAGLINE */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl md:text-7xl font-semibold tracking-tight leading-tight"
          >
            Your beauty studio.
            <br />
            <span className="text-white/40">Reimagined as a mirror.</span>
          </motion.h2>
        </div>
      </section>

      {/* VIDEO DEMO */}
      <section id="video" className="px-4 md:px-8 pb-32 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[2rem] overflow-hidden bg-zinc-900 ring-1 ring-white/10 shadow-[0_30px_120px_-20px_rgba(236,72,153,0.4)]"
          >
            <video
              src={(mirrorVideo as { url: string }).url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-300/90 mb-2">Live Demo</p>
              <h3 className="font-display text-2xl md:text-4xl font-semibold">
                Stand. Scan. See yourself with a brand new look.
              </h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THREE STEPS */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-pink-400 mb-4">How it works</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              From reflection to booking in seconds.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: ScanFace, title: "Scan", desc: "Step in front of the mirror. Face tracking maps your features in real time." },
              { icon: Sparkles, title: "Try on", desc: "Browse weaves, braids, color, cuts and more — see them on your real face, instantly." },
              { icon: CalendarCheck, title: "Book", desc: "Love the look? Tap the mirror to book a nearby NEXTLOOK stylist on the spot." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 p-10 backdrop-blur-sm"
              >
                <div className="text-white/30 text-sm font-mono mb-6">0{i + 1}</div>
                <step.icon className="w-10 h-10 text-pink-400 mb-6" />
                <h3 className="font-display text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/60 font-body leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCAN CLOSEUP */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-pink-400 mb-4">Precision AI</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              468 facial points.
              <br />
              <span className="text-white/40">60 frames per second.</span>
            </h2>
            <p className="mt-6 text-white/70 text-lg font-body leading-relaxed">
              Powered by on-device neural rendering, every hairstyle moves with you in real time — no lag, no awkward overlay. Just you, with a new look.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Real-time face tracking, no internet required for scan",
                "Hundreds of weaves, braids, cuts and colors",
                "Skin-tone aware lighting & shadow rendering",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                  <span className="font-body">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-[0_30px_120px_-20px_rgba(168,85,247,0.4)]"
          >
            <img src={mirrorScan} alt="Face scanning AR interface on the NextLook Smart Mirror" className="w-full h-auto" loading="lazy" width={1024} height={1024} />
          </motion.div>
        </div>
      </section>

      {/* SPECS */}
      <section className="py-32 px-6 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-pink-400 mb-4">Built different</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">Engineered to belong in your space.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              src={mirrorProduct}
              alt="NextLook 43 inch smart mirror product shot"
              className="w-full rounded-3xl"
              loading="lazy"
              width={1280}
              height={1280}
            />
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ScanFace, label: "43\" 4K", sub: "Edge-to-edge mirror display" },
                { icon: Cpu, label: "Neural Chip", sub: "On-device AI face tracking" },
                { icon: Wifi, label: "Wi-Fi 6E", sub: "Always-on cloud styles" },
                { icon: Mic, label: "Voice", sub: "“Mirror, try a wig.”" },
                { icon: ShieldCheck, label: "Private", sub: "Your face never leaves the device" },
                { icon: Truck, label: "Ships in 20 days", sub: "Free white-glove delivery" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5"
                >
                  <s.icon className="w-6 h-6 text-pink-400 mb-3" />
                  <div className="font-display text-lg font-semibold">{s.label}</div>
                  <div className="text-white/55 text-sm font-body mt-1">{s.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRE-ORDER CTA */}
      <section className="py-32 px-6 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto rounded-[2.5rem] p-10 md:p-16 text-center bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-purple-600/20 ring-1 ring-white/10 backdrop-blur-sm"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-pink-300 mb-4">Limited first run</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Pre-order yours today.
          </h2>
          <p className="mt-5 text-white/70 text-lg font-body max-w-xl mx-auto">
            Reserve your NextLook Smart Mirror now. Estimated delivery in 20 days from order.
          </p>

          <div className="mt-10 inline-flex items-baseline gap-2">
            <span className="font-display text-6xl md:text-7xl font-bold">$2,000</span>
            <span className="text-white/50">USD</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handlePreorder}
              disabled={preordering}
              className="rounded-full bg-white text-black hover:bg-white/90 px-10 h-14 text-base font-semibold"
            >
              {preordering ? "Reserving…" : "Pre-order Mirror"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Truck className="w-4 h-4" /> Free white-glove delivery · ~20 days
            </div>
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
