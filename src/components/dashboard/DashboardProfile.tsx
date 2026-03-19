import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Save, User, MapPin, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Profile = {
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  service_category: string | null;
  show_location: boolean;
};

export const DashboardProfile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone, city, bio, avatar_url, service_category, show_location")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Check if bucket exists, upload to service-photos bucket under avatars folder
      const { error: uploadError } = await supabase.storage
        .from("service-photos")
        .upload(`avatars/${filePath}`, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("service-photos")
        .getPublicUrl(`avatars/${filePath}`);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : prev);
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const SERVICE_CATEGORIES = [
    "Weave", "Braids", "K-Tips", "Wigs", "Updo", "Makeup", "Locs", "Natural Hair", "Haircut"
  ];

  const selectedCategories = profile?.service_category
    ? profile.service_category.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleCategory = (cat: string) => {
    const updated = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setProfile((p) => p ? { ...p, service_category: updated.join(", ") } : p);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          city: profile.city,
          bio: profile.bio,
          service_category: profile.service_category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Edit Profile</h2>

      {/* Avatar section */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {profile.full_name?.charAt(0) || <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="font-medium text-lg">{profile.full_name}</p>
          <p className="text-sm text-muted-foreground">{profile.service_category}</p>
          {uploading && <p className="text-xs text-primary mt-1">Uploading...</p>}
        </div>
      </div>

      {/* Location visibility toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card max-w-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Show on Discovery Map</p>
            <p className="text-xs text-muted-foreground">When off, your profile won't appear in location-based searches</p>
          </div>
        </div>
        <Switch
          checked={profile.show_location}
          onCheckedChange={async (checked) => {
            setProfile((p) => p ? { ...p, show_location: checked } : p);
            const { error } = await supabase
              .from("profiles")
              .update({ show_location: checked, updated_at: new Date().toISOString() } as any)
              .eq("id", userId);
            if (error) {
              setProfile((p) => p ? { ...p, show_location: !checked } : p);
              toast.error("Failed to update location visibility");
            } else {
              toast.success(checked ? "You're now visible on the map" : "Hidden from the map");
            }
          }}
        />
      </div>

      {/* Form */}
      <div className="space-y-4 max-w-lg">
        <div>
          <Label>Full Name</Label>
          <Input
            value={profile.full_name}
            onChange={(e) => setProfile((p) => p ? { ...p, full_name: e.target.value } : p)}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={profile.email || ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={profile.phone || ""}
            onChange={(e) => setProfile((p) => p ? { ...p, phone: e.target.value } : p)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <Label>City</Label>
          <Input
            value={profile.city || ""}
            onChange={(e) => setProfile((p) => p ? { ...p, city: e.target.value } : p)}
          />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile((p) => p ? { ...p, bio: e.target.value } : p)}
            placeholder="Tell clients about yourself, your experience, and what makes your services special..."
            rows={4}
            className="resize-none"
          />
        </div>

        <Button onClick={handleSave} variant="hero" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
