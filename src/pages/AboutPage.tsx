import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, ChevronDown, Sparkles, MapPin, Calendar, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import scene1 from "@/assets/videos/scene1-future.mp4.asset.json";
import scene2 from "@/assets/videos/scene2-delivery.mp4.asset.json";
import scene3 from "@/assets/videos/scene3-products.mp4.asset.json";
import scene4 from "@/assets/videos/scene4-stylist.mp4.asset.json";
import scene5 from "@/assets/videos/scene5-reveal.mp4.asset.json";

const scenes = [
  { src: scene1.url, label: "The Future", tagline: "Welcome to the future of beauty…" },
  { src: scene2.url, label: "Delivery in Motion", tagline: "Where luxury comes to you…" },
  { src: scene3.url, label: "Product Delivery", tagline: "Premium products, effortlessly delivered." },
  { src: scene4.url, label: "Service Experience", tagline: "Expert stylists come directly to you…" },
  { src: scene5.url, label: "The Reveal", tagline: "All powered by one app…" },
];

const AboutPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene((prev) => prev + 1);
      } else {
        setCurrentScene(0);
      }
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [currentScene]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.src = scenes[currentScene].src;
    video.load();
    if (isPlaying) video.play().catch(() => {});
  }, [currentScene]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Video Section */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3D1A6E]/30 to-transparent" />

        {/* Scene indicator dots */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentScene(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentScene
                  ? "bg-[#C5A55A] w-8"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end pb-24 px-6 md:px-16 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[#C5A55A] font-body text-sm tracking-[0.3em] uppercase mb-2">
                Scene {currentScene + 1} — {scenes[currentScene].label}
              </p>
              <h1
                className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-bold mb-4 leading-tight"
                style={{ fontFamily: "Italiana, serif" }}
              >
                {scenes[currentScene].tagline}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Brand Story */}
      <section className="py-24 px-6 md:px-16 bg-gradient-to-b from-background to-[#FAF7F2]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#C5A55A] tracking-[0.3em] uppercase text-sm font-body mb-4"
          >
            Our Story
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground mb-8"
            style={{ fontFamily: "Italiana, serif" }}
          >
            Beauty, On Demand
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed font-body"
          >
            NEXTLOOK is reimagining how beauty reaches you. We connect you with top-tier
            stylists who come directly to your door, and deliver premium hair extensions
            and beauty products with same-day speed. No salon visits. No waiting.
            Just luxury beauty — on your terms.
          </motion.p>
        </div>
      </section>

      {/* How It Works — Visual Cards */}
      <section className="py-24 px-6 md:px-16 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-16"
            style={{ fontFamily: "Italiana, serif" }}
          >
            Book. Shop. Glow.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Book a Stylist",
                desc: "Browse top-rated stylists near you. Book same-day or schedule ahead. They come to you.",
                gradient: "from-[#3D1A6E] to-[#6B3FA0]",
              },
              {
                icon: ShoppingBag,
                title: "Shop Products",
                desc: "Premium hair extensions and beauty products from verified vendors, delivered fast.",
                gradient: "from-[#C5A55A] to-[#D4B96A]",
              },
              {
                icon: Sparkles,
                title: "Glow Up",
                desc: "Earn rewards with every booking. Join GlowUp Monday for exclusive points and perks.",
                gradient: "from-[#E8336D] to-[#FF6B9D]",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-border/30 hover:shadow-xl transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6`}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scene Gallery */}
      <section className="py-24 px-6 md:px-16 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-4"
            style={{ fontFamily: "Italiana, serif" }}
          >
            The NEXTLOOK Experience
          </h2>
          <p className="text-center text-muted-foreground font-body mb-12 max-w-2xl mx-auto">
            From futuristic delivery to flawless styling — every moment is designed for you.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer"
                onClick={() => {
                  setCurrentScene(i);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <video
                  src={scene.src}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => {
                    const v = e.target as HTMLVideoElement;
                    v.pause();
                    v.currentTime = 0;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-body">
                    Scene {i + 1}
                  </p>
                  <p className="text-white font-display font-bold text-lg">{scene.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-16 bg-gradient-to-br from-[#3D1A6E] to-[#1a0a30] text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2
            className="font-display text-4xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "Italiana, serif" }}
          >
            NEXTLOOK
          </h2>
          <p className="text-2xl md:text-3xl text-[#C5A55A] font-display font-bold mb-4">
            Beauty, On Demand.
          </p>
          <p className="text-white/70 font-body text-lg mb-10 max-w-xl mx-auto">
            Book top-rated stylists. Shop premium extensions. Earn rewards.
            All in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/discover">
              <Button variant="hero" size="lg" className="text-lg px-10">
                Book a Stylist
              </Button>
            </Link>
            <Link to="/extensions">
              <Button variant="gold" size="lg" className="text-lg px-10">
                Shop Extensions
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
