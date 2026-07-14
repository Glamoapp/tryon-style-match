import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Crown, Users, DollarSign, Share2, Check, Clock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo.png";

type Props = { userId: string };

type Referral = {
  id: string;
  referred_id: string;
  status: string;
  reward_amount: number;
  paid_at: string | null;
  created_at: string;
  referred?: { full_name: string | null; is_approved: boolean | null } | null;
};

export const DashboardReferrals = ({ userId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    referral_code: string | null;
    is_founding_stylist: boolean | null;
    commission_free_until: string | null;
    signup_credit: number | null;
    signup_credit_unlocks_at: string | null;
  } | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase
          .from("profiles")
          .select("referral_code, is_founding_stylist, commission_free_until, signup_credit, signup_credit_unlocks_at")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("stylist_referrals")
          .select("*, referred:profiles!stylist_referrals_referred_id_fkey(full_name, is_approved)")
          .eq("referrer_id", userId)
          .order("created_at", { ascending: false }),
      ]);
      setProfile(p as any);
      setReferrals((r as any) || []);
      setLoading(false);
    })();
  }, [userId]);

  const shareLink = profile?.referral_code
    ? `${window.location.origin}/join-stylist/signup?ref=${profile.referral_code}`
    : "";

  const copyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (!shareLink) return;
    const text = `Join me on NEXTLOOK — 0% commission for 90 days if you sign up with my link: ${shareLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Join NEXTLOOK", text, url: shareLink }); } catch {}
    } else {
      copyLink();
    }
  };

  const inviteLink = profile?.referral_code
    ? `${window.location.origin}/stylist/invite?ref=${profile.referral_code}`
    : "";

  const copyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    toast.success("Golden invitation link copied!");
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const shareInvite = async () => {
    if (!inviteLink) return;
    const text = `You've been selected — a golden invitation to join the NEXTLOOK Luxury Beauty Professional Stylist Team. Open it: ${inviteLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: "You're invited to NEXTLOOK", text, url: inviteLink }); } catch {}
    } else {
      copyInvite();
    }
  };

  const earned = referrals.reduce((sum, r) => sum + Number(r.reward_amount || 0), 0);
  const paid = referrals.filter((r) => r.paid_at).reduce((s, r) => s + Number(r.reward_amount), 0);
  const pending = earned - paid;

  const commissionDaysLeft = profile?.commission_free_until
    ? Math.max(0, Math.ceil((new Date(profile.commission_free_until).getTime() - Date.now()) / 86400000))
    : 0;

  const signupCredit = Number(profile?.signup_credit || 0);
  const creditUnlockDays = profile?.signup_credit_unlocks_at
    ? Math.max(0, Math.ceil((new Date(profile.signup_credit_unlocks_at).getTime() - Date.now()) / 86400000))
    : 0;

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Perks banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile?.is_founding_stylist && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">Founding Stylist</p>
                <p className="text-xs text-muted-foreground font-body">Permanent badge · Priority placement in discovery</p>
              </div>
            </div>
          </motion.div>
        )}
        {commissionDaysLeft > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">0% commission active</p>
                <p className="text-xs text-muted-foreground font-body">
                  {commissionDaysLeft} {commissionDaysLeft === 1 ? "day" : "days"} left · You keep 100% of every booking
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Referral hero */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Refer a stylist, earn $25</h2>
            <p className="text-sm text-muted-foreground font-body">
              We'll pay you $25 as soon as any stylist you refer completes their first booking.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="flex-1 px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-mono truncate">
            {shareLink || "—"}
          </div>
          <Button variant="outline" onClick={copyLink} disabled={!shareLink}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="hero" onClick={share} disabled={!shareLink}>
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>

        {profile?.referral_code && (
          <p className="mt-3 text-xs text-muted-foreground font-body">
            Your code: <span className="font-mono font-semibold text-foreground">{profile.referral_code}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Referrals", value: referrals.length, icon: Users },
          { label: "Pending", value: `$${pending.toFixed(0)}`, icon: Clock },
          { label: "Paid out", value: `$${paid.toFixed(0)}`, icon: DollarSign },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral list */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Your referrals</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-border text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-body text-sm">No referrals yet — share your link to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="p-4 rounded-lg border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="font-body font-medium text-foreground">{r.referred?.full_name || "New stylist"}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(r.created_at).toLocaleDateString()} · {r.status.replace("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${Number(r.reward_amount).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{r.paid_at ? "Paid" : "Pending"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
