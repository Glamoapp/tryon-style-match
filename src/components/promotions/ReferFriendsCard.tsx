import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Copy, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { REFERRALS_FOR_FREE_SERVICE } from "@/lib/promotions";

/** "Refer 5 friends, get your next service free" — personal link, progress and earned rewards. */
const ReferFriendsCard = () => {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [friends, setFriends] = useState(0);
  const [joined, setJoined] = useState(0);
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSignedIn(false); return; }
      setSignedIn(true);
      const uid = session.user.id;
      const [{ data: myCode }, { count: friendCount }, { count: joinedCount }, { count: rewardCount }] = await Promise.all([
        supabase.rpc("get_my_referral_code"),
        supabase.from("customer_referrals").select("id", { count: "exact", head: true }).eq("referrer_id", uid).not("qualified_at", "is", null),
        supabase.from("customer_referrals").select("id", { count: "exact", head: true }).eq("referrer_id", uid),
        supabase.from("referral_rewards").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "available"),
      ]);
      setCode((myCode as string) || null);
      setFriends(friendCount || 0);
      setJoined(joinedCount || 0);
      setAvailable(rewardCount || 0);
    };
    load();
  }, []);

  const link = code ? `${window.location.origin}/auth?ref=${code}` : "";
  const towardNext = friends % REFERRALS_FOR_FREE_SERVICE;

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied!");
    } catch {
      toast.error("Couldn't copy — press and hold the link to copy it");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-logo uppercase tracking-wide text-2xl text-foreground">Refer 5 friends, next service free</h3>
      </div>
      <p className="font-body text-sm text-muted-foreground mb-4">
        Share your link. When {REFERRALS_FOR_FREE_SERVICE} friends sign up and book their first service, your next service is on us.
      </p>

      {signedIn === false && (
        <Button asChild variant="hero" size="sm">
          <Link to="/auth?mode=signup">Sign up to get your invite link</Link>
        </Button>
      )}

      {signedIn && (
        <>
          <div className="flex gap-2 mb-4">
            <input
              readOnly
              value={link || "Loading your link…"}
              aria-label="Your invite link"
              className="flex-1 min-w-0 h-9 rounded-md border border-input bg-background px-3 text-xs font-body text-foreground"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button type="button" size="sm" variant="outline" onClick={copy} disabled={!link}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
          <div className="flex justify-between text-xs font-body text-muted-foreground mb-1.5">
            <span>{towardNext} of {REFERRALS_FOR_FREE_SERVICE} friends booked toward your next free service</span>
            <span>{joined} joined</span>
          </div>
          <Progress value={(towardNext / REFERRALS_FOR_FREE_SERVICE) * 100} className="h-2" />
          {available > 0 && (
            <p className="mt-4 flex items-center gap-2 text-sm font-body font-semibold text-primary">
              <Gift className="h-4 w-4" />
              You have {available} free service{available > 1 ? "s" : ""} — it's ready at checkout.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ReferFriendsCard;
