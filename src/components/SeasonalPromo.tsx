import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * Seasonal / holiday promo strip with themed colors that shift by date.
 * Detects the closest US holiday or season and paints the banner accordingly.
 */
type Theme = {
  key: string;
  label: string;
  headline: string;
  sub: string;
  cta: string;
  href: string;
  gradient: string; // tailwind gradient classes
  accent: string; // hex-ish tw color for chip
  emoji: string;
};

const getTheme = (): Theme => {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  // GlowUp Monday — always featured. Sign up to unlock 10%–40% off services
  // and products (40% off products $100 or less).
  return {
    key: "glowup-monday",
    label: "GlowUp Monday",
    headline: "Unlock 10–40% Off This Week",
    sub: "Exclusive deals on services & products — 40% off any product $100 or less. Sign up to reveal the codes.",
    cta: "Sign Up to Unlock Deals",
    href: "/glowup-monday",
    gradient: "from-[#8A6A1F] via-[#E8CF7A] to-[#B8892E]",
    accent: "bg-[#1A0736] text-[#E8CF7A]",
    emoji: "✨",
  };

  // Independence Day window (kept for future re-enable)
  if (m === 7 && d <= 7) {
    return {
      key: "july4",
      label: "Independence Day",
      headline: "Star-Spangled Glow-Up",
      sub: "Red, white & blue looks — 20% off all bookings this week.",
      cta: "Shop the July 4 Deals",
      href: "/glowup-monday",
      gradient: "from-[#B31942] via-white to-[#0A3161]",
      accent: "bg-white/85 text-[#0A3161]",
      emoji: "🎆",
    };
  }
  // Summer (June–Aug)
  if (m >= 6 && m <= 8) {
    return {
      key: "summer",
      label: "Summer Edit",
      headline: "Sun-Kissed Summer Looks",
      sub: "Beach waves, glow makeup & lightweight extensions.",
      cta: "Explore Summer Styles",
      href: "/discover",
      gradient: "from-[#FFD27A] via-[#FFF3D9] to-[#F5B85B]",
      accent: "bg-white/85 text-[#8A5A00]",
      emoji: "☀️",
    };
  }
  // Fall (Sep–Oct)
  if (m === 9 || m === 10) {
    return {
      key: "fall",
      label: "Autumn Edit",
      headline: "Fall Into Your Next Look",
      sub: "Warm tones, copper hair & sculpted glam.",
      cta: "Book Fall Services",
      href: "/discover",
      gradient: "from-[#8B3A1E] via-[#E9B26B] to-[#5C2018]",
      accent: "bg-white/85 text-[#5C2018]",
      emoji: "🍂",
    };
  }
  // Halloween window
  if (m === 10 && d >= 20) {
    return {
      key: "halloween",
      label: "Halloween",
      headline: "Bold Looks for Spooky Season",
      sub: "Dramatic wigs, glam SFX makeup & costume-ready styles.",
      cta: "Book Halloween Looks",
      href: "/discover",
      gradient: "from-[#0D0D0D] via-[#3D1A6E] to-[#F26B1F]",
      accent: "bg-white/90 text-[#3D1A6E]",
      emoji: "🎃",
    };
  }
  // Thanksgiving (Nov)
  if (m === 11) {
    return {
      key: "thanksgiving",
      label: "Thanksgiving",
      headline: "Grateful. Glowing. Gorgeous.",
      sub: "Family-photo-ready glam & holiday hair.",
      cta: "Reserve Your Slot",
      href: "/discover",
      gradient: "from-[#6B3A2A] via-[#D4A574] to-[#8B4513]",
      accent: "bg-white/85 text-[#6B3A2A]",
      emoji: "🦃",
    };
  }
  // Christmas (Dec)
  if (m === 12) {
    return {
      key: "christmas",
      label: "Holiday Season",
      headline: "Sleigh the Holidays",
      sub: "Party-ready hair & makeup for every event on your calendar.",
      cta: "Book Holiday Glam",
      href: "/discover",
      gradient: "from-[#8B0000] via-[#C5A55A] to-[#0B3D2E]",
      accent: "bg-white/90 text-[#8B0000]",
      emoji: "🎄",
    };
  }
  // New Year (Jan)
  if (m === 1) {
    return {
      key: "newyear",
      label: "New Year",
      headline: "New Year, Next Look",
      sub: "Kick off the year with a signature glow-up.",
      cta: "Start the Year Right",
      href: "/discover",
      gradient: "from-[#0A0A1A] via-[#C5A55A] to-[#3D1A6E]",
      accent: "bg-white/90 text-[#0A0A1A]",
      emoji: "✨",
    };
  }
  // Valentine's Day (Feb)
  if (m === 2) {
    return {
      key: "valentines",
      label: "Valentine's",
      headline: "Date-Night Ready",
      sub: "Romantic waves, soft glam & rose-gold looks.",
      cta: "Book the Date-Night Package",
      href: "/discover",
      gradient: "from-[#F8C8D8] via-[#E88AAB] to-[#C45C7C]",
      accent: "bg-white/90 text-[#C45C7C]",
      emoji: "💖",
    };
  }
  // Spring (Mar–May)
  return {
    key: "spring",
    label: "Spring Edit",
    headline: "Fresh Spring Looks",
    sub: "Lightweight styles, dewy skin & pastel color drops.",
    cta: "Explore Spring Services",
    href: "/discover",
    gradient: "from-[#FDE7F1] via-[#E8D5F2] to-[#C9E4DE]",
    accent: "bg-white/90 text-[#6B3A8A]",
    emoji: "🌸",
  };
};

const SeasonalPromo = () => {
  const theme = getTheme();

  return (
    <section className="py-8">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${theme.gradient} shadow-elevated`}
        >
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative p-6 sm:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${theme.accent} font-body`}>
                <Sparkles className="w-3 h-3" />
                {theme.label} · Limited
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-md">
                {theme.emoji} {theme.headline}
              </h2>
              <p className="mt-2 text-white/90 font-body max-w-xl drop-shadow">
                {theme.sub}
              </p>
            </div>
            <Link to={theme.href}>
              <button className="inline-flex items-center gap-2 bg-[#3D1A6E] hover:bg-[#2A0F52] text-[#E8CF7A] font-body font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all ring-1 ring-[#C5A55A]/60">
                {theme.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SeasonalPromo;
