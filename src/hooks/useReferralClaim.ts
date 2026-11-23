import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "nextlook_customer_ref";

/** Remember a friend's referral code until the new account is signed in. */
export const rememberReferralCode = (code: string) => {
  const clean = code.trim().toUpperCase();
  if (clean) localStorage.setItem(KEY, clean);
};

export const pendingReferralCode = () => localStorage.getItem(KEY);

/** Once a new customer is signed in, credit the friend who invited them. */
export const useReferralClaim = () => {
  useEffect(() => {
    const claim = async () => {
      const code = localStorage.getItem(KEY);
      if (!code) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.rpc("claim_customer_referral", { _code: code });
      if (!error) localStorage.removeItem(KEY);
    };
    claim();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setTimeout(claim, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
};
