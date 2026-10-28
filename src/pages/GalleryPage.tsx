import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { SEO } from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type GalleryItem = {
  id: string;
  url: string;
  providerId: string;
  stylistName: string;
  serviceName: string;
  categories: string[];
};

const isVideo = (url: string) => /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");

  useEffect(() => {
    (async () => {
      const { data: photos } = await supabase
        .from("service_photos")
        .select("id, photo_url, provider_id, service_id, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (!photos?.length) { setLoading(false); return; }
      const providerIds = [...new Set(photos.map((p) => p.provider_id))];
      const serviceIds = [...new Set(photos.map((p) => p.service_id))];
      const [{ data: profiles }, { data: services }] = await Promise.all([
        supabase.from("public_profiles").select("id, full_name, service_category").in("id", providerIds),
        supabase.from("provider_services").select("id, service_name").in("id", serviceIds),
      ]);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      const serviceMap = new Map((services ?? []).map((s) => [s.id, s.service_name]));
      setItems(
        photos
          .filter((p) => profileMap.has(p.provider_id))
          .map((p) => {
            const prof = profileMap.get(p.provider_id)!;
            return {
              id: p.id,
              url: p.photo_url,
              providerId: p.provider_id,
              stylistName: prof.full_name ?? "NEXTLOOK Stylist",
              serviceName: serviceMap.get(p.service_id) ?? "",
              categories: (prof.service_category ?? "").split(",").map((c) => c.trim()).filter(Boolean),
            };
          }),
      );
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => i.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)));
    return ["All", ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)];
  }, [items]);

  const visible = active === "All" ? items : items.filter((i) => i.categories.includes(active));

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Stylist Gallery | NEXTLOOK" description="Browse real work from NEXTLOOK stylists and tap any look to book." path="/gallery" />
      <Navbar />
      <main className="pt-20 lg:pt-16">
        <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none]">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-body transition-colors ${
                  active === c ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {c === "All" ? "For you" : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-px">
            {Array.from({ length: 15 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-24 text-center font-body text-muted-foreground">No looks in this category yet.</p>
        ) : (
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-px">
            {visible.map((item) => (
              <Link
                key={item.id}
                to={`/stylist/${item.providerId}`}
                className="relative block aspect-[3/4] overflow-hidden bg-muted"
                aria-label={`View ${item.stylistName}'s profile`}
              >
                {isVideo(item.url) ? (
                  <>
                    <video src={item.url} muted playsInline loop autoPlay preload="metadata" className="h-full w-full object-cover" />
                    <Play className="absolute right-2 top-2 h-4 w-4 fill-background text-background drop-shadow" />
                  </>
                ) : (
                  <img src={item.url} alt={`${item.serviceName || "Work"} by ${item.stylistName}`} loading="lazy" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent px-2 pb-1.5 pt-6">
                  <p className="truncate text-xs font-body font-medium text-background">{item.stylistName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GalleryPage;
