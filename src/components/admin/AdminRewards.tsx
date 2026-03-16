import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Gift, Pencil, Sparkles, Upload, X, Loader2, ImageIcon } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  reward_type: string;
  discount_percent: number | null;
  discount_amount: number | null;
  points_cost: number;
  image_url: string | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

const AdminRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [pointsCost, setPointsCost] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rewardType, setRewardType] = useState("promotion");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRewards = async () => {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .order("created_at", { ascending: false });
    setRewards((data as Reward[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRewards(); }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setDiscountPercent(""); setDiscountAmount("");
    setPointsCost(""); setImageUrl(""); setImageFile(null); setImagePreview(null); setRewardType("promotion");
    setValidFrom(""); setValidUntil(""); setEditingId(null);
  };

  const handleSave = async () => {
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setUploading(true);
    let finalImageUrl = imageUrl || null;

    // Upload image file if selected
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("reward-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({ title: "Image upload failed", variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("reward-images").getPublicUrl(filePath);
      finalImageUrl = urlData.publicUrl;
    }

    const payload = {
      title,
      description: description || null,
      reward_type: rewardType,
      discount_percent: discountPercent ? Number(discountPercent) : null,
      discount_amount: discountAmount ? Number(discountAmount) : null,
      points_cost: pointsCost ? Number(pointsCost) : 0,
      image_url: finalImageUrl,
      valid_from: validFrom || null,
      valid_until: validUntil || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from("rewards").update(payload).eq("id", editingId);
      toast({ title: "Reward updated" });
    } else {
      await supabase.from("rewards").insert({ ...payload, is_active: true });
      toast({ title: "Reward created" });
    }

    setUploading(false);
    resetForm();
    fetchRewards();
  };

  const handleEdit = (r: Reward) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description || "");
    setDiscountPercent(r.discount_percent?.toString() || "");
    setDiscountAmount(r.discount_amount?.toString() || "");
    setPointsCost(r.points_cost?.toString() || "");
    setImageUrl(r.image_url || "");
    setImagePreview(r.image_url || null);
    setImageFile(null);
    setRewardType(r.reward_type);
    setValidFrom(r.valid_from || "");
    setValidUntil(r.valid_until || "");
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("rewards").update({ is_active: !current }).eq("id", id);
    fetchRewards();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("rewards").delete().eq("id", id);
    toast({ title: "Reward deleted" });
    fetchRewards();
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {editingId ? "Edit Reward" : "Create GlowUp Monday Reward"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(["promotion", "reward", "special_offer"] as const).map((val) => (
              <button
                key={val}
                onClick={() => setRewardType(val)}
                className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                  rewardType === val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {val === "promotion" ? "Promotion" : val === "reward" ? "Reward" : "Special Offer"}
              </button>
            ))}
          </div>

          <Input placeholder="Reward title" value={title} onChange={(e) => setTitle(e.target.value)} className="font-body" />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="font-body" />

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Discount %" type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="font-body" />
            <Input placeholder="Discount $ amount" type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="font-body" />
          </div>

          <Input placeholder="Points cost to redeem (0 = free)" type="number" value={pointsCost} onChange={(e) => setPointsCost(e.target.value)} className="font-body" />
          {/* Image Upload */}
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Promotion Image (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border bg-secondary">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); setImageUrl(""); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm font-body text-muted-foreground">Click to upload an image</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Valid from</label>
              <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="font-body" />
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Valid until</label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="font-body" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="hero" onClick={handleSave}>
              <Gift className="w-4 h-4 mr-1" /> {editingId ? "Update Reward" : "Create Reward"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Rewards & Promotions ({rewards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">Loading...</p>
          ) : rewards.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No rewards created yet.</p>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${reward.is_active ? "bg-card border-primary/20" : "bg-muted/50 border-border opacity-60"}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm truncate">{reward.title}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {reward.reward_type}
                        {reward.discount_percent ? ` • ${reward.discount_percent}% off` : ""}
                        {reward.discount_amount ? ` • $${reward.discount_amount} off` : ""}
                        {reward.points_cost > 0 ? ` • ${reward.points_cost} pts` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch checked={reward.is_active} onCheckedChange={() => toggleActive(reward.id, reward.is_active)} />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(reward)}>
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(reward.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRewards;
