import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface GoldenCrownBadgeProps {
  size?: number;
  animate?: boolean;
}

// Golden crown with a checkmark inside — awarded to $50/month verified stylists.
const GoldenCrownBadge = ({ size = 120, animate = true }: GoldenCrownBadgeProps) => {
  const Wrapper: any = animate ? motion.div : "div";
  const wrapperProps = animate
    ? {
        initial: { scale: 0, rotate: -20 },
        animate: { scale: 1, rotate: 0 },
        transition: { type: "spring", stiffness: 180, damping: 14 },
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      style={{ width: size, height: size }}
      className="relative inline-flex items-center justify-center"
      aria-label="NEXTLOOK Verified Stylist — Golden Crown badge"
    >
      <svg viewBox="0 0 120 120" width={size} height={size} className="drop-shadow-[0_8px_24px_rgba(197,165,90,0.45)]">
        <defs>
          <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4E29A" />
            <stop offset="45%" stopColor="#C5A55A" />
            <stop offset="100%" stopColor="#8A6E2A" />
          </linearGradient>
          <linearGradient id="gold-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF6D1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFF6D1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Crown */}
        <path
          d="M20 42 L36 60 L48 30 L60 62 L72 30 L84 60 L100 42 L94 84 L26 84 Z"
          fill="url(#gold-grad)"
          stroke="#7A5A20"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Crown base */}
        <rect x="24" y="86" width="72" height="8" rx="2" fill="url(#gold-grad)" stroke="#7A5A20" strokeWidth="1.2" />
        {/* Jewels */}
        <circle cx="36" cy="60" r="3.2" fill="#3D1A6E" stroke="#F4E29A" strokeWidth="0.8" />
        <circle cx="60" cy="62" r="3.6" fill="#B33951" stroke="#F4E29A" strokeWidth="0.8" />
        <circle cx="84" cy="60" r="3.2" fill="#3D1A6E" stroke="#F4E29A" strokeWidth="0.8" />
        {/* Shine */}
        <path d="M20 42 L36 60 L48 30 L60 62 L72 30 L84 60 L100 42 L94 60 L26 60 Z" fill="url(#gold-shine)" />
      </svg>

      {/* Checkmark circle centered on crown base */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-[#F4E29A] via-[#C5A55A] to-[#8A6E2A] flex items-center justify-center ring-2 ring-[#FFF6D1]/70 shadow-lg"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          bottom: size * 0.06,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Check className="text-white" style={{ width: size * 0.24, height: size * 0.24 }} strokeWidth={3.5} />
      </div>
    </Wrapper>
  );
};

export default GoldenCrownBadge;
