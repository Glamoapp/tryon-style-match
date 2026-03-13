import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProviderListing {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  rating: number;
  reviewCount: number;
  services: {
    id: string;
    service_name: string;
    price: number;
    duration_minutes: number;
    description: string | null;
    photos: string[];
  }[];
  specialties: string[];
  coverPhoto: string | null;
}

export function useProviders() {
  const [providers, setProviders] = useState<ProviderListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      // Fetch onboarded providers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, city")
        .eq("role", "provider")
        .eq("is_onboarded", true);

      if (profilesError || !profiles?.length) {
        setProviders([]);
        setLoading(false);
        return;
      }

      const providerIds = profiles.map((p) => p.id);

      // Fetch services, photos, and reviews in parallel
      const [servicesRes, photosRes, reviewsRes] = await Promise.all([
        supabase
          .from("provider_services")
          .select("id, provider_id, service_name, price, duration_minutes, description")
          .in("provider_id", providerIds)
          .eq("is_active", true),
        supabase
          .from("service_photos")
          .select("service_id, provider_id, photo_url, display_order")
          .in("provider_id", providerIds)
          .order("display_order", { ascending: true }),
        supabase
          .from("reviews")
          .select("provider_id, rating")
          .in("provider_id", providerIds),
      ]);

      const services = servicesRes.data || [];
      const photos = photosRes.data || [];
      const reviews = reviewsRes.data || [];

      const result: ProviderListing[] = profiles.map((profile) => {
        const providerServices = services.filter((s) => s.provider_id === profile.id);
        const providerReviews = reviews.filter((r) => r.provider_id === profile.id);
        const avgRating = providerReviews.length
          ? +(providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length).toFixed(1)
          : 0;

        const servicesWithPhotos = providerServices.map((svc) => ({
          ...svc,
          photos: photos
            .filter((p) => p.service_id === svc.id)
            .map((p) => p.photo_url),
        }));

        const allPhotos = photos.filter((p) => p.provider_id === profile.id);
        const specialties = [...new Set(providerServices.map((s) => s.service_name))];

        return {
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          city: profile.city,
          rating: avgRating,
          reviewCount: providerReviews.length,
          services: servicesWithPhotos,
          specialties,
          coverPhoto: allPhotos[0]?.photo_url || null,
        };
      });

      // Only show providers that have at least one service
      setProviders(result.filter((p) => p.services.length > 0));
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  return { providers, loading, refetch: fetchProviders };
}
