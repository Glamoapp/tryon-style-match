import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Deal = {
  id: string;
  deal_title: string;
  discount_percent: number | null;
  discount_amount: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  product_id: string;
  product?: { title: string };
};

type Product = { id: string; title: string };

export const VendorDeals = ({ vendorId, isApproved }: { vendorId: string; isApproved: boolean }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    deal_title: "", product_id: "", discount_percent: "", discount_amount: "", valid_from: "", valid_until: "",
  });

  const fetchDeals = async () => {
    const { data } = await supabase
      .from("vendor_deals")
      .select("*, product:vendor_products(title)")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });
    setDeals((data as any) || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("vendor_products").select("id, title").eq("vendor_id", vendorId);
    setProducts((data as any) || []);
  };

  useEffect(() => { fetchDeals(); fetchProducts(); }, [vendorId]);

  const handleSave = async () => {
    if (!form.deal_title || !form.product_id) { toast.error("Title and product are required"); return; }
    setSaving(true);
    const { error } = await supabase.from("vendor_deals").insert({
      vendor_id: vendorId,
      deal_title: form.deal_title,
      product_id: form.product_id,
      discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
      discount_amount: form.discount_amount ? parseFloat(form.discount_amount) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
    });
    if (error) toast.error(error.message);
    else toast.success("Deal created");
    setSaving(false);
    setDialogOpen(false);
    setForm({ deal_title: "", product_id: "", discount_percent: "", discount_amount: "", valid_from: "", valid_until: "" });
    fetchDeals();
  };

  const deleteDeal = async (id: string) => {
    if (!confirm("Delete this deal?")) return;
    await supabase.from("vendor_deals").delete().eq("id", id);
    toast.success("Deal deleted");
    fetchDeals();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Deals & Discounts</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm" disabled={!isApproved || products.length === 0}>
              <Plus className="w-4 h-4 mr-1" /> Create Deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a Deal</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Deal Title *</Label>
                <Input value={form.deal_title} onChange={(e) => setForm(p => ({ ...p, deal_title: e.target.value }))} placeholder="e.g. Summer Sale 20% Off" />
              </div>
              <div>
                <Label>Product *</Label>
                <Select value={form.product_id} onValueChange={(v) => setForm(p => ({ ...p, product_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Discount %</Label>
                  <Input type="number" value={form.discount_percent} onChange={(e) => setForm(p => ({ ...p, discount_percent: e.target.value }))} />
                </div>
                <div>
                  <Label>Discount $ Off</Label>
                  <Input type="number" step="0.01" value={form.discount_amount} onChange={(e) => setForm(p => ({ ...p, discount_amount: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valid From</Label>
                  <Input type="date" value={form.valid_from} onChange={(e) => setForm(p => ({ ...p, valid_from: e.target.value }))} />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input type="date" value={form.valid_until} onChange={(e) => setForm(p => ({ ...p, valid_until: e.target.value }))} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? "Creating..." : "Create Deal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground">No deals yet</p>
          <p className="text-sm text-muted-foreground">{products.length === 0 ? "Add products first, then create deals" : "Create a deal to attract more customers"}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {deals.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div>
                <p className="font-medium text-foreground">{d.deal_title}</p>
                <p className="text-sm text-muted-foreground">
                  {(d as any).product?.title} · {d.discount_percent ? `${d.discount_percent}% off` : d.discount_amount ? `$${d.discount_amount} off` : ""}
                </p>
                {d.valid_until && <p className="text-xs text-muted-foreground">Expires: {new Date(d.valid_until).toLocaleDateString()}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteDeal(d.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
