import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Save, Scissors } from "lucide-react";
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

type ServiceForm = {
  service_name: string;
  price: string;
  duration_minutes: string;
  description: string;
};

const emptyForm: ServiceForm = { service_name: "", price: "", duration_minutes: "", description: "" };

export const DashboardServices = ({ userId }: { userId: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchServices(); }, [userId]);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("provider_services")
      .select("*")
      .eq("provider_id", userId)
      .order("created_at", { ascending: true });
    setServices(data || []);
  };

  const startEdit = (svc: Service) => {
    setEditingId(svc.id);
    setShowAdd(false);
    setForm({
      service_name: svc.service_name,
      price: String(svc.price),
      duration_minutes: String(svc.duration_minutes),
      description: svc.description || "",
    });
  };

  const startAdd = () => {
    setEditingId(null);
    setShowAdd(true);
    setForm(emptyForm);
  };

  const cancel = () => {
    setEditingId(null);
    setShowAdd(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.service_name.trim() || !form.price || !form.duration_minutes) {
      toast.error("Please fill in service name, price, and duration");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("provider_services")
          .update({
            service_name: form.service_name.trim(),
            price: parseFloat(form.price),
            duration_minutes: parseInt(form.duration_minutes),
            description: form.description.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Service updated!");
      } else {
        const { error } = await supabase
          .from("provider_services")
          .insert({
            provider_id: userId,
            service_name: form.service_name.trim(),
            price: parseFloat(form.price),
            duration_minutes: parseInt(form.duration_minutes),
            description: form.description.trim() || null,
          });
        if (error) throw error;
        toast.success("Service added!");
      }
      cancel();
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service? It will be removed from your profile.")) return;
    const { error } = await supabase.from("provider_services").delete().eq("id", id);
    if (error) toast.error("Failed to delete service");
    else { toast.success("Service deleted"); fetchServices(); }
  };

  const handleToggleActive = async (svc: Service) => {
    const { error } = await supabase
      .from("provider_services")
      .update({ is_active: !svc.is_active, updated_at: new Date().toISOString() })
      .eq("id", svc.id);
    if (error) toast.error("Failed to update service");
    else fetchServices();
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
          <div className="flex gap-2">
            <Button variant="hero" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
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
        services.map((svc) => (
          <div
            key={svc.id}
            className={`p-4 rounded-xl border bg-card flex items-center justify-between ${
              svc.is_active ? "border-border" : "border-border opacity-50"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{svc.service_name}</p>
                {!svc.is_active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                ${Number(svc.price).toFixed(0)} · {svc.duration_minutes} min
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
              <Button variant="ghost" size="icon" onClick={() => handleDelete(svc.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
