import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const StylistInvitePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get("ref") || "";
  const [opened, setOpened] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    if (ref) {
      try {
        localStorage.setItem("nl_stylist_ref", ref);
      } catch {}
      (async () => {
        const { data } = await (supabase as any)
          .from("public_profiles")
          .select("full_name")
          .eq("referral_code", ref)
          .maybeSingle();
        if (data?.full_name) setReferrerName(data.full_name);
      })();
    }
  }, [ref]);

  const proceed = () => navigate(`/join-stylist/signup${ref ? `?ref=${ref}` : ""}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#2a1845] to-[#0f0820] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#C5A55A] rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            className="relative z-10 text-center"
          >
            <p className="text-[#C5A55A]/80 font-body text-sm tracking-[0.3em] uppercase mb-6">
              You've received an invitation
            </p>

            {/* Golden Envelope */}
            <motion.button
              onClick={() => setOpened(true)}
              whileHover={{ scale: 1.03, rotate: -1 }}
              whileTap={{ scale: 0.98 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              className="relative mx-auto block group"
              style={{ width: "min(90vw, 420px)", aspectRatio: "3/2" }}
            >
              {/* Envelope body */}
              <div
                className="absolute inset-0 rounded-lg shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #E8C878 0%, #C5A55A 45%, #8B6F2E 100%)",
                  boxShadow: "0 30px 60px -15px rgba(197,165,90,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              />
              {/* Envelope flap */}
              <div
                className="absolute inset-x-0 top-0 h-1/2"
                style={{
                  background: "linear-gradient(180deg, #D4B36A 0%, #A88742 100%)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
                }}
              />
              {/* Wax seal with crown + logo */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative w-24 h-24 rounded-full flex flex-col items-center justify-center"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #F4D98A, #8B6F2E 80%)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)",
                  }}
                >
                  <Crown className="w-6 h-6 text-[#3D1A6E]" strokeWidth={2.5} fill="#3D1A6E" />
                  <img src={logoImg} alt="NEXTLOOK" className="w-8 h-8 object-contain mt-0.5" />
                </motion.div>
              </div>
              <p className="absolute -bottom-10 inset-x-0 text-[#C5A55A] text-xs tracking-[0.3em] uppercase font-body opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to open
              </p>
            </motion.button>

            {referrerName && (
              <p className="mt-16 text-white/70 font-body text-sm">
                Sent by <span className="text-[#C5A55A] font-semibold">{referrerName}</span>
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-2xl w-full"
          >
            <div
              className="rounded-2xl p-8 md:p-12 text-center"
              style={{
                background: "linear-gradient(180deg, #FAF7F2 0%, #F0E9DA 100%)",
                boxShadow: "0 40px 80px -20px rgba(197,165,90,0.4), 0 0 0 1px rgba(197,165,90,0.3)",
              }}
            >
              <div className="flex flex-col items-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg, #E8C878, #8B6F2E)" }}
                >
                  <Crown className="w-8 h-8 text-white" fill="white" />
                </div>
                <img src={logoImg} alt="NEXTLOOK" className="w-14 h-14 object-contain" />
              </div>

              <motion.h1
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="font-display text-3xl md:text-5xl text-[#3D1A6E] mb-3"
                style={{ fontFamily: "'Italiana', serif" }}
              >
                Congratulations
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-[#3D1A6E]/80 font-body text-base md:text-lg leading-relaxed max-w-lg mx-auto"
                style={{ fontFamily: "'Lora', serif" }}
              >
                You have been selected to join the{" "}
                <span className="font-semibold text-[#3D1A6E]">NEXTLOOK Luxury Beauty Professional Stylist Team</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="mt-8 p-5 rounded-xl border border-[#C5A55A]/40 bg-white/60"
              >
                <div className="flex items-center justify-center gap-2 text-[#8B6F2E] mb-2">
                  <Sparkles className="w-4 h-4" />
                  <p className="font-display font-semibold tracking-wide">Welcome Gift</p>
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="font-body text-sm text-[#3D1A6E]/80">
                  <span className="text-2xl font-bold text-[#3D1A6E]">$5</span> signup credit added to your account when you complete signup.
                </p>
                <p className="text-xs text-[#3D1A6E]/60 mt-1">
                  Cashable after 60 days with NEXTLOOK · Plus 0% commission for your first 90 days.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="mt-8 space-y-2 text-left max-w-md mx-auto"
              >
                <p className="text-xs text-[#3D1A6E]/60 uppercase tracking-widest font-body mb-3 text-center">Your next steps</p>
                {[
                  "Create your stylist account",
                  "Complete your profile & portfolio",
                  "Get verified by our team",
                  "Start receiving bookings",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C5A55A]/20 flex items-center justify-center text-[#8B6F2E] text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-sm text-[#3D1A6E] font-body">{step}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="mt-8"
              >
                <Button
                  onClick={proceed}
                  size="lg"
                  className="w-full sm:w-auto text-white font-body tracking-wide"
                  style={{ background: "linear-gradient(135deg, #C5A55A, #8B6F2E)" }}
                >
                  Accept & Sign Up <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-[#3D1A6E]/50 mt-3">Verification required to activate your account</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StylistInvitePage;
