import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PointBalance {
  total_points: number;
  lifetime_points: number;
}

export interface PointTransaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

// Points tiers based on spending
export function calculatePoints(amount: number): number {
  if (amount >= 2000) return 100;
  if (amount >= 1000) return 50;
  if (amount >= 500) return 20;
  return 10;
}

export function useCustomerPoints() {
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // Get or create points balance
      const { data: pts } = await supabase
        .from("customer_points")
        .select("total_points, lifetime_points")
        .eq("user_id", user.id)
        .maybeSingle();

      if (pts) {
        setBalance(pts);
      } else {
        // Create initial record
        await supabase.from("customer_points").insert({ user_id: user.id, total_points: 0, lifetime_points: 0 });
        setBalance({ total_points: 0, lifetime_points: 0 });
      }

      // Get transaction history
      const { data: txns } = await supabase
        .from("point_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setTransactions((txns as PointTransaction[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const awardPoints = useCallback(async (amount: number, description: string, bookingId?: string) => {
    if (!userId) return;
    const points = calculatePoints(amount);

    await supabase.from("point_transactions").insert({
      user_id: userId,
      points,
      transaction_type: "earned",
      description,
      booking_id: bookingId || null,
    });

    const newTotal = (balance?.total_points || 0) + points;
    const newLifetime = (balance?.lifetime_points || 0) + points;

    await supabase
      .from("customer_points")
      .update({ total_points: newTotal, lifetime_points: newLifetime, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    setBalance({ total_points: newTotal, lifetime_points: newLifetime });
  }, [userId, balance]);

  const redeemPoints = useCallback(async (points: number, description: string) => {
    if (!userId || !balance || balance.total_points < points) return false;

    await supabase.from("point_transactions").insert({
      user_id: userId,
      points: -points,
      transaction_type: "redeemed",
      description,
    });

    const newTotal = balance.total_points - points;
    await supabase
      .from("customer_points")
      .update({ total_points: newTotal, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    setBalance({ ...balance, total_points: newTotal });
    return true;
  }, [userId, balance]);

  return { balance, transactions, loading, awardPoints, redeemPoints, userId };
}
