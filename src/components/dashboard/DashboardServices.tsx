import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, X, Save, Scissors, Upload, ImageIcon, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Service = {
  id: string;
  service_name: string;
  price: number;
  duration_minutes: number;
  description: string | null;
  is_active: boolean;
};

type ServicePhoto = {
  id: string;
  photo_url: string;
  service_id: string;
  display_order: number;
};

type ServiceForm = {
  service_name: string;
  price: string;
  duration_minutes: string;
  description: string;
  discount_price: string;
  discount_badge: string;
};

const emptyForm: ServiceForm = { service_name: "", price: "", duration_minutes: "", description: "", discount_price: "", discount_badge: "" };
const MAX_PHOTOS_PER_SERVICE = 5;

export const DashboardServices = ({ userId }: { userId: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [photos, setPhotos] = useState<Record<string, ServicePhoto[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchServices(); }, [userId]);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("provider_services")
      .select("*")
      .eq("provider_id", userId)
      .order("created_at", { ascending: true });
    setServices(data || []);

    // Fetch all photos for this provider's services
    const { data: allPhotos } = await supabase
      .from("service_photos")
      .select("*")
      .eq("provider_id", userId)
      .order("display_order", { ascending: true });

    const grouped: Record<string, ServicePhoto[]> = {};
    (allPhotos || []).forEach((p) => {
      if (!grouped[p.service_id]) grouped[p.service_id] = [];
      grouped[p.service_id].push(p);
    });
    setPhotos(grouped);
  };

  const startEdit = (svc: Service) => {
    setEditingId(svc.id);
    setShowAdd(false);
    setPendingPhotos([]);
    setForm({
      service_name: svc.service_name,
      price: String(svc.price),
      duration_minutes: String(svc.duration_minutes),
      description: svc.description || "",
      discount_price: (svc as any).discount_price ? String((svc as any).discount_price) : "",
      discount_badge: (svc as any).discount_badge || "",
    });
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const startAdd = () => {
    setEditingId(null);
    setShowAdd(true);
    setPendingPhotos([]);
    setForm(emptyForm);
  };

  const cancel = () => {
    setEditingId(null);
    setShowAdd(false);
    setForm(emptyForm);
    setPendingPhotos([]);
  };

  const uploadPhotosForService = async (serviceId: string, files: File[]) => {
    const existingCount = (photos[serviceId] || []).length;
    const allowed = MAX_PHOTOS_PER_SERVICE - existingCount;
    const toUpload = files.slice(0, allowed);

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const ext = file.name.split(".").pop();
      const path = `${userId}/${serviceId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("service-photos")
        .upload(path, file, { upsert: true });

      if (uploadErr) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("service-photos").getPublicUrl(path);

      await supabase.from("service_photos").insert({
        provider_id: userId,
        service_id: serviceId,
        photo_url: urlData.publicUrl,
        display_order: existingCount + i,
      });
    }
  };

  const handleSave = async () => {
    if (!form.service_name.trim() || !form.price || !form.duration_minutes) {
      toast.error("Please fill in service name, price, and duration");
      return;
    }
    setSaving(true);
    try {
      await supabase.auth.refreshSession();
      let serviceId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from("provider_services")
          .update({
            service_name: form.service_name.trim(),
            price: parseFloat(form.price),
            duration_minutes: parseInt(form.duration_minutes),
            description: form.description.trim() || null,
            discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
            discount_badge: form.discount_badge.trim() || null,
            updated_at: new Date().toISOString(),
          } as any)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Service updated!");
      } else {
        const { data, error } = await supabase
          .from("provider_services")
          .insert({
            provider_id: userId,
            service_name: form.service_name.trim(),
            price: parseFloat(form.price),
            duration_minutes: parseInt(form.duration_minutes),
            description: form.description.trim() || null,
            discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
            discount_badge: form.discount_badge.trim() || null,
          } as any)
          .select("id")
          .single();
        if (error) throw error;
        serviceId = data.id;
        toast.success("Service added!");
      }

      // Upload pending photos
      if (pendingPhotos.length > 0 && serviceId) {
        setUploadingPhotos(true);
        await uploadPhotosForService(serviceId, pendingPhotos);
        setUploadingPhotos(false);
      }

      cancel();
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Failed to save service");
    } finally {
      setSaving(false);
      setUploadingPhotos(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await supabase.auth.refreshSession();
      const id = deleteId;
      const servicePhotos = photos[id] || [];
      for (const photo of servicePhotos) {
        const path = photo.photo_url.split("/service-photos/")[1];
        if (path) await supabase.storage.from("service-photos").remove([path]);
        await supabase.from("service_photos").delete().eq("id", photo.id);
      }
      const { error } = await supabase.from("provider_services").delete().eq("id", id);
      if (error) throw error;
      toast.success("Service deleted");
      setDeleteId(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (svc: Service) => {
    const { error } = await supabase
      .from("provider_services")
      .update({ is_active: !svc.is_active, updated_at: new Date().toISOString() })
      .eq("id", svc.id);
    if (error) toast.error("Failed to update service");
    else fetchServices();
  };

  const handleDeletePhoto = async (photo: ServicePhoto) => {
    const path = photo.photo_url.split("/service-photos/")[1];
    if (path) await supabase.storage.from("service-photos").remove([path]);
    const { error } = await supabase.from("service_photos").delete().eq("id", photo.id);
    if (error) toast.error("Failed to delete photo");
    else { toast.success("Photo removed"); fetchServices(); }
  };

  const handleAddPhotosToExisting = async (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const existing = (photos[serviceId] || []).length;
    if (existing >= MAX_PHOTOS_PER_SERVICE) {
      toast.error(`Maximum ${MAX_PHOTOS_PER_SERVICE} photos per service`);
      return;
    }
    setUploadingPhotos(true);
    await uploadPhotosForService(serviceId, files);
    setUploadingPhotos(false);
    toast.success("Photos uploaded!");
    fetchServices();
  };

  const handlePendingFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingCount = editingId ? (photos[editingId] || []).length : 0;
    const allowed = MAX_PHOTOS_PER_SERVICE - existingCount - pendingPhotos.length;
    if (files.length > allowed) {
      toast.error(`You can add ${allowed} more photo(s)`);
    }
    setPendingPhotos((prev) => [...prev, ...files.slice(0, Math.max(0, allowed))]);
  };

  const removePending = (idx: number) => {
    setPendingPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const isEditing = editingId !== null || showAdd;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">My Services</h2>
        {!isEditing && (
          <Button variant="hero" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        )}
      </div>

      {/* Add / Edit form */}
      {isEditing && (
        <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
          <h3 className="font-display font-bold text-lg">
            {editingId ? "Edit Service" : "New Service"}
          </h3>
          <div>
            <Label>Service Name *</Label>
            <Input
              value={form.service_name}
              onChange={(e) => setForm((f) => ({ ...f, service_name: e.target.value }))}
              placeholder="e.g. Knotless Braids, Silk Press"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price ($) *</Label>
              <Input
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="120"
              />
            </div>
            <div>
              <Label>Duration (minutes) *</Label>
              <Input
                type="number"
                min="15"
                step="15"
                value={form.duration_minutes}
                onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                placeholder="120"
              />
            </div>
          </div>

          {/* Discount / Deal section */}
          <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-3">
            <Label className="flex items-center gap-1.5 text-primary font-semibold">
              <Tag className="w-4 h-4" /> Set a Deal (optional)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.discount_price}
                  onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))}
                  placeholder="e.g. 85"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Leave empty = no deal</p>
              </div>
              <div>
                <Label>Deal Badge</Label>
                <Input
                  value={form.discount_badge}
                  onChange={(e) => setForm((f) => ({ ...f, discount_badge: e.target.value }))}
                  placeholder="e.g. 30% OFF, HOT DEAL"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Auto-calculated if empty</p>
              </div>
            </div>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe this service..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Photo section */}
          <div>
            <Label className="flex items-center gap-1.5 mb-2">
              <ImageIcon className="w-4 h-4" /> Service Photos (up to {MAX_PHOTOS_PER_SERVICE})
            </Label>

            {/* Existing photos when editing */}
            {editingId && (photos[editingId] || []).length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {(photos[editingId] || []).map((photo) => (
                  <div key={photo.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending photos preview */}
            {pendingPhotos.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {pendingPhotos.map((file, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-dashed border-primary/40">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePending(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors">
              <Upload className="w-4 h-4" /> Add Photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePendingFiles}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="hero" onClick={handleSave} disabled={saving || uploadingPhotos}>
              <Save className="w-4 h-4 mr-1" /> {saving || uploadingPhotos ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={cancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Service list */}
      {services.length === 0 && !isEditing ? (
        <div className="text-center py-16 text-muted-foreground">
          <Scissors className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No services added yet</p>
          <p className="text-sm">Add your first service to start getting bookings</p>
        </div>
      ) : (
        services.map((svc) => {
          const svcPhotos = photos[svc.id] || [];
          return (
            <div
              key={svc.id}
              className={`p-4 rounded-xl border bg-card ${
                svc.is_active ? "border-border" : "border-border opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{svc.service_name}</p>
                    {!svc.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(svc as any).discount_price ? (
                      <>
                        <span className="text-primary font-semibold">${Number((svc as any).discount_price).toFixed(0)}</span>
                        <span className="line-through ml-1">${Number(svc.price).toFixed(0)}</span>
                        {(svc as any).discount_badge && (
                          <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">{(svc as any).discount_badge}</span>
                        )}
                      </>
                    ) : (
                      <>${Number(svc.price).toFixed(0)}</>
                    )}
                    {" · "}{svc.duration_minutes} min
                  </p>
                  {svc.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{svc.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleToggleActive(svc)} title={svc.is_active ? "Hide" : "Show"}>
                    <span className="text-xs">{svc.is_active ? "🟢" : "⚪"}</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(svc)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(svc.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Photo thumbnails */}
              {svcPhotos.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {svcPhotos.map((photo) => (
                    <div key={photo.id} className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Quick add photo button */}
              {svcPhotos.length < MAX_PHOTOS_PER_SERVICE && !isEditing && (
                <label className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                  <Upload className="w-3 h-3" /> Add photo
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleAddPhotosToExisting(svc.id, e)}
                  />
                </label>
              )}
            </div>
          );
        })
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && !deleting && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the service and its photos from your profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
