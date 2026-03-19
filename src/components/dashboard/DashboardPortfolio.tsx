import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Camera, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PortfolioItem = {
  id: string;
  photo_url: string;
  display_order: number;
  service_id: string;
  is_video?: boolean;
};

const MAX_PORTFOLIO = 20;

export const DashboardPortfolio = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [defaultServiceId, setDefaultServiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    fetchDefaultService();
  }, [userId]);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("service_photos")
      .select("*")
      .eq("provider_id", userId)
      .order("display_order", { ascending: true });
    setItems(data || []);
  };

  const fetchDefaultService = async () => {
    const { data } = await supabase
      .from("provider_services")
      .select("id")
      .eq("provider_id", userId)
      .limit(1)
      .single();
    setDefaultServiceId(data?.id || null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (items.length + files.length > MAX_PORTFOLIO) {
      toast.error(`Maximum ${MAX_PORTFOLIO} portfolio items allowed`);
      return;
    }

    if (!defaultServiceId) {
      toast.error("Please add at least one service first");
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const fileExt = file.name.split(".").pop();
        const filePath = `${userId}/portfolio/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("service-photos")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("service-photos")
          .getPublicUrl(filePath);

        await supabase.from("service_photos").insert({
          service_id: defaultServiceId,
          provider_id: userId,
          photo_url: urlData.publicUrl,
          display_order: items.length + i,
        });
      }
      toast.success("Portfolio updated!");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (item: PortfolioItem) => {
    if (!confirm("Remove this from your portfolio?")) return;
    try {
      // Try to delete from storage
      const url = new URL(item.photo_url);
      const storagePath = url.pathname.split("/service-photos/")[1];
      if (storagePath) {
        await supabase.storage.from("service-photos").remove([decodeURIComponent(storagePath)]);
      }

      const { error } = await supabase.from("service_photos").delete().eq("id", item.id);
      if (error) throw error;
      toast.success("Removed from portfolio");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const isVideo = (url: string) => {
    return /\.(mp4|mov|webm|avi)$/i.test(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Portfolio</h2>
        <span className="text-sm text-muted-foreground font-body">{items.length}/{MAX_PORTFOLIO}</span>
      </div>
      <p className="text-sm text-muted-foreground font-body">
        Showcase your best work. Upload up to {MAX_PORTFOLIO} photos or videos to attract more clients.
      </p>

      {/* Upload buttons */}
      {items.length < MAX_PORTFOLIO && (
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span>
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Add Photos"}
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              multiple
              disabled={uploading}
            />
          </label>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span>
                <Film className="w-4 h-4 mr-2" />
                Add Videos
              </span>
            </Button>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
              multiple
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
            {isVideo(item.photo_url) ? (
              <video src={item.photo_url} className="w-full h-full object-cover" muted playsInline>
                <source src={item.photo_url} />
              </video>
            ) : (
              <img src={item.photo_url} alt="Portfolio" className="w-full h-full object-cover" />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(item)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {isVideo(item.photo_url) && (
              <div className="absolute top-2 left-2 bg-black/50 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Film className="w-3 h-3 text-white" />
                <span className="text-[10px] text-white font-medium">Video</span>
              </div>
            )}
          </div>
        ))}

        {/* Drop zone tile */}
        {items.length < MAX_PORTFOLIO && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-body">Drop files here</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleUpload}
              multiple
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No portfolio items yet</p>
          <p className="text-sm">Upload photos and videos to showcase your work</p>
        </div>
      )}
    </div>
  );
};
