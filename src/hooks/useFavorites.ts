import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        fetchFavorites(data.user.id);
      }
    });
  }, []);

  const fetchFavorites = async (uid: string) => {
    const { data } = await supabase
      .from("favorites")
      .select("provider_id")
      .eq("user_id", uid);
    if (data) setFavoriteIds(new Set(data.map((f: any) => f.provider_id)));
  };

  const toggleFavorite = useCallback(async (providerId: string) => {
    if (!userId) {
      toast.error("Sign in to save favorites");
      return;
    }

    const isFav = favoriteIds.has(providerId);

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(providerId);
      else next.add(providerId);
      return next;
    });

    if (isFav) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("provider_id", providerId);
      if (error) {
        setFavoriteIds((prev) => new Set(prev).add(providerId));
        toast.error("Failed to remove favorite");
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, provider_id: providerId });
      if (error) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(providerId);
          return next;
        });
        toast.error("Failed to save favorite");
      } else {
        toast.success("Added to favorites!");
      }
    }
  }, [userId, favoriteIds]);

  const isFavorite = useCallback((providerId: string) => favoriteIds.has(providerId), [favoriteIds]);

  return { isFavorite, toggleFavorite };
}
