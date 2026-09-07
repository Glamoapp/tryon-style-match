import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Package, Loader2, ImagePlus, X, Eye, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Variant = {
  id?: string;
  length: string;
  size: string;
  color: string;
  price: string;
  compare_at_price: string;
  inventory_count: string;
};

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  hair_type: string | null;
  image_urls: string[];
  is_active: boolean;
  inventory_count: number;
};

const HAIR_TYPES = ["Raw Human Hair", "Virgin Brazilian", "Virgin Peruvian", "Virgin Malaysian", "Body Wave", "Deep Wave", "Loose Wave", "Straight", "Curly", "Kinky Curly", "Synthetic", "Blend"];

const emptyForm = () => ({
  title: "", description: "", price: "", compare_at_price: "", category: "Hair Extensions", hair_type: "", inventory_count: "0", image_urls: [] as string[],
});

const emptyVariant = (): Variant => ({ length: "", size: "", color: "", price: "", compare_at_price: "", inventory_count: "0" });

export const VendorProducts = ({ vendorId, isApproved }: { vendorId: string; isApproved: boolean }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("vendor_products")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });
    const prods = (data as any) || [];
    setProducts(prods);

    // Fetch variants for all products
    if (prods.length > 0) {
      const ids = prods.map((p: any) => p.id);
      const { data: varData } = await supabase
        .from("vendor_product_variants" as any)
        .select("*")
        .in("product_id", ids);
      const grouped: Record<string, any[]> = {};
      (varData || []).forEach((v: any) => {
        if (!grouped[v.product_id]) grouped[v.product_id] = [];
        grouped[v.product_id].push(v);
      });
      setProductVariants(grouped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [vendorId]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingProduct(null);
    setVariants([]);
    setPreviewMode(false);
  };

  const openEdit = async (p: Product) => {
    setEditingProduct(p);
    setForm({
      title: p.title,
      description: p.description || "",
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      category: p.category || "Hair Extensions",
      hair_type: p.hair_type || "",
      inventory_count: String(p.inventory_count),
      image_urls: p.image_urls || [],
    });
    // Load existing variants
    const { data } = await supabase
      .from("vendor_product_variants" as any)
      .select("*")
      .eq("product_id", p.id);
    setVariants(
      (data || []).map((v: any) => ({
        id: v.id,
        length: v.length || "",
        size: v.size || "",
        color: v.color || "",
        price: String(v.price),
        compare_at_price: v.compare_at_price ? String(v.compare_at_price) : "",
        inventory_count: String(v.inventory_count),
      }))
    );
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("vendor-products").upload(path, file);
      if (error) { toast.error("Upload failed"); continue; }
      const { data: urlData } = supabase.storage.from("vendor-products").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    setForm(prev => ({ ...prev, image_urls: [...prev.image_urls, ...newUrls] }));
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== idx) }));
  };

  const addVariant = () => setVariants(prev => [...prev, emptyVariant()]);

  const updateVariant = (idx: number, field: keyof Variant, value: string) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const removeVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form.title || !form.price) { toast.error("Title and base price are required"); return; }
    setSaving(true);
    const payload = {
      vendor_id: vendorId,
      title: form.title,
      description: form.description || null,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      category: form.category,
      hair_type: form.hair_type || null,
      inventory_count: parseInt(form.inventory_count) || 0,
      image_urls: form.image_urls,
    } as any;

    let productId = editingProduct?.id;

    if (editingProduct) {
      const { error } = await supabase.from("vendor_products").update(payload).eq("id", editingProduct.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("vendor_products").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      productId = data.id;
    }

    // Save variants — delete old, insert new
    if (productId) {
      await supabase.from("vendor_product_variants" as any).delete().eq("product_id", productId);

      const validVariants = variants.filter(v => v.price);
      if (validVariants.length > 0) {
        const varPayload = validVariants.map(v => ({
          product_id: productId,
          vendor_id: vendorId,
          length: v.length || null,
          size: v.size || null,
          color: v.color || null,
          price: parseFloat(v.price),
          compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
          inventory_count: parseInt(v.inventory_count) || 0,
        }));
        const { error: varErr } = await supabase.from("vendor_product_variants" as any).insert(varPayload);
        if (varErr) toast.error("Error saving variants: " + varErr.message);
      }
    }

    toast.success(editingProduct ? "Product updated" : "Product added");
    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("vendor_products").update({ is_active: !p.is_active }).eq("id", p.id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("vendor_products").delete().eq("id", id);
    toast.success("Product deleted");
    fetchProducts();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">My Products</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm" disabled={!isApproved}>
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {previewMode ? "Preview — as customers will see it" : editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>

            {previewMode ? (
              <div className="space-y-4 mt-4">
                {/* Customer-facing preview card */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="aspect-square bg-muted relative">
                    {form.image_urls[0] ? (
                      <img src={form.image_urls[0]} alt={form.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                    {form.compare_at_price && Number(form.compare_at_price) > Number(form.price) && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Sale</Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    {form.hair_type && (
                      <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-body">{form.hair_type}</p>
                    )}
                    <p className="font-body font-semibold text-foreground">{form.title || "Product title"}</p>
                    {form.description && (
                      <p className="text-xs text-muted-foreground font-body line-clamp-2">{form.description}</p>
                    )}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-bold text-foreground">${Number(form.price || 0).toFixed(2)}</span>
                      {form.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through">${Number(form.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                    {variants.filter(v => v.price).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {variants.filter(v => v.price).slice(0, 5).map((v, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {[v.length, v.color, v.size].filter(Boolean).join(" / ")} — ${Number(v.price).toFixed(2)}
                          </Badge>
                        ))}
                        {variants.filter(v => v.price).length > 5 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{variants.filter(v => v.price).length - 5} more</Badge>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground font-body pt-1">
                      {Number(form.inventory_count) > 0 ? `${form.inventory_count} in stock` : "Out of stock"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="hero" size="sm" className="w-full" type="button">Buy Now</Button>
                      <Button variant="outline" size="sm" className="w-full" type="button">Add to Cart</Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setPreviewMode(false)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Edit
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={handleSave} disabled={saving}>
                    {saving ? "Publishing..." : editingProduct ? "Update Product" : "Publish Product"}
                  </Button>
                </div>
              </div>
            ) : (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Brazilian Body Wave Bundle" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your product..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Base Price ($) *</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <Label>Compare At Price ($)</Label>
                  <Input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm(p => ({ ...p, compare_at_price: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <Label>Base Inventory</Label>
                  <Input type="number" value={form.inventory_count} onChange={(e) => setForm(p => ({ ...p, inventory_count: e.target.value }))} />
                </div>
              </div>

              {/* Images */}
              <div>
                <Label>Images</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.image_urls.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5 text-muted-foreground" />}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Variants (Length / Size / Color)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant
                  </Button>
                </div>
                {variants.length === 0 && (
                  <p className="text-xs text-muted-foreground">No variants — the base price will be used. Add variants to offer different lengths, sizes, or colors at different prices.</p>
                )}
                {variants.map((v, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Variant {idx + 1}</span>
                      <button onClick={() => removeVariant(idx)} className="text-destructive hover:text-destructive/80">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Length</Label>
                        <Input placeholder='e.g. 18"' value={v.length} onChange={(e) => updateVariant(idx, "length", e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Size</Label>
                        <Input placeholder="e.g. 4x4" value={v.size} onChange={(e) => updateVariant(idx, "size", e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Color</Label>
                        <Input placeholder="e.g. #1B" value={v.color} onChange={(e) => updateVariant(idx, "color", e.target.value)} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Price ($) *</Label>
                        <Input type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(idx, "price", e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Compare At</Label>
                        <Input type="number" step="0.01" value={v.compare_at_price} onChange={(e) => updateVariant(idx, "compare_at_price", e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Stock</Label>
                        <Input type="number" value={v.inventory_count} onChange={(e) => updateVariant(idx, "inventory_count", e.target.value)} className="h-8 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!isApproved && (
        <p className="text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-muted">
          Your account needs approval before you can add products.
        </p>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground">No products yet</p>
          <p className="text-sm text-muted-foreground">Add your first product to start selling</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => {
            const pVariants = productVariants[p.id] || [];
            return (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {p.image_urls?.[0] ? (
                    <img src={p.image_urls[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    ${Number(p.price).toFixed(2)} · {p.inventory_count} in stock
                  </p>
                  {pVariants.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pVariants.slice(0, 4).map((v: any) => (
                        <Badge key={v.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {[v.length, v.color, v.size].filter(Boolean).join(" / ")} — ${Number(v.price).toFixed(2)}
                        </Badge>
                      ))}
                      {pVariants.length > 4 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{pVariants.length - 4} more</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};