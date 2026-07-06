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

// Points tiers based on spending (kept for UI previews only; server is source of truth)
export function calculatePoints(amount: number): number {
  if (amount >= 2000) return 100;
  if (amount >= 1000) return 50;
  if (amount >= 500) return 20;
  return 10;
}

async function refreshBalanceAndTxns(userId: string) {
  const [{ data: pts }, { data: txns }] = await Promise.all([
    supabase
      .from("customer_points")
      .select("total_points, lifetime_points")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("point_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  return {
    balance: (pts as PointBalance) || { total_points: 0, lifetime_points: 0 },
    transactions: (txns as PointTransaction[]) || [],
  };
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

      // Ensure a balance row exists (server-side, service role)
      await supabase.functions.invoke("award-customer-points", {
        body: { action: "ensure_balance" },
      });

      const { balance, transactions } = await refreshBalanceAndTxns(user.id);
      setBalance(balance);
      setTransactions(transactions);
      setLoading(false);
    };
    load();
  }, []);

  const awardPoints = useCallback(async (amount: number, description: string, bookingId?: string) => {
    if (!userId) return;
    const { error } = await supabase.functions.invoke("award-customer-points", {
      body: { action: "award", amount, description, bookingId: bookingId || null },
    });
    if (error) return;
    const refreshed = await refreshBalanceAndTxns(userId);
    setBalance(refreshed.balance);
    setTransactions(refreshed.transactions);
  }, [userId]);

  const redeemPoints = useCallback(async (points: number, description: string) => {
    if (!userId) return false;
    const { data, error } = await supabase.functions.invoke("award-customer-points", {
      body: { action: "redeem", points, description },
    });
    if (error || !data?.ok) return false;
    const refreshed = await refreshBalanceAndTxns(userId);
    setBalance(refreshed.balance);
    setTransactions(refreshed.transactions);
    return true;
  }, [userId]);

  return { balance, transactions, loading, awardPoints, redeemPoints, userId };
}
