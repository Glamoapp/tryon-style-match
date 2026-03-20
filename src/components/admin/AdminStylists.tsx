import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UserCheck, UserX, ShieldCheck, ShieldX, Eye, Star, MapPin, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StylistProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  service_category: string | null;
  is_onboarded: boolean;
  is_approved: boolean;
  avatar_url: string | null;
  created_at: string;
  bio: string | null;
}

interface ServiceWithPhotos {
  id: string;
  service_name: string;
  price: number;
  duration_minutes: number;
  description: string | null;
  discount_price: number | null;
  discount_badge: string | null;
  photos: string[];
}

interface ReviewData {
  rating: number;
  comment: string | null;
  created_at: string;
}

const AdminStylists = () => {
  const [stylists, setStylists] = useState<StylistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewStylist, setPreviewStylist] = useState<StylistProfile | null>(null);
  const [previewServices, setPreviewServices] = useState<ServiceWithPhotos[]>([]);
  const [previewReviews, setPreviewReviews] = useState<ReviewData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchStylists = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "provider")
      .order("created_at", { ascending: false });
    setStylists((data as StylistProfile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchStylists(); }, []);

  const openPreview = async (stylist: StylistProfile) => {
    setPreviewStylist(stylist);
    setPreviewLoading(true);
    setPreviewServices([]);
    setPreviewReviews([]);

    const [servicesRes, photosRes, reviewsRes] = await Promise.all([
      supabase
        .from("provider_services")
        .select("id, service_name, price, duration_minutes, description, discount_price, discount_badge")
        .eq("provider_id", stylist.id)
        .eq("is_active", true),
      supabase
        .from("service_photos")
        .select("service_id, photo_url, display_order")
        .eq("provider_id", stylist.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("reviews")
        .select("rating, comment, created_at")
        .eq("provider_id", stylist.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const services = servicesRes.data || [];
    const photos = photosRes.data || [];

    const servicesWithPhotos: ServiceWithPhotos[] = services.map((svc) => ({
      ...svc,
      photos: photos.filter((p) => p.service_id === svc.id).map((p) => p.photo_url),
    }));

    setPreviewServices(servicesWithPhotos);
    setPreviewReviews((reviewsRes.data as ReviewData[]) || []);
    setPreviewLoading(false);
  };

  const toggleApproval = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: !current } as any)
      .eq("id", id);
    if (error) {
      console.error("Approval error:", error);
      toast({ title: "Failed to update approval", description: error.message, variant: "destructive" });
    } else {
      toast({ title: current ? "Provider approval revoked" : "Provider approved & live!" });
      fetchStylists();
      if (previewStylist?.id === id) {
        setPreviewStylist((prev) => prev ? { ...prev, is_approved: !current } : null);
      }

      // Send welcome email when approving (not revoking)
      if (!current) {
        const stylist = stylists.find((s) => s.id === id) || previewStylist;
        if (stylist?.email) {
          try {
            await supabase.functions.invoke("send-welcome-email", {
              body: {
                stylistId: id,
                stylistName: stylist.full_name,
                stylistEmail: stylist.email,
              },
            });
            toast({ title: "Welcome email sent!", description: `Handbook sent to ${stylist.email}` });
          } catch (emailErr) {
            console.error("Welcome email error:", emailErr);
            toast({ title: "Approved, but email failed", description: "Stylist was approved but the welcome email could not be sent.", variant: "destructive" });
          }
        }
      }
    }
  };

  const toggleOnboarded = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_onboarded: !current } as any)
      .eq("id", id);
    if (error) {
      console.error("Status error:", error);
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: current ? "Stylist suspended" : "Stylist activated" });
      fetchStylists();
    }
  };

  const avgRating = previewReviews.length
    ? +(previewReviews.reduce((sum, r) => sum + r.rating, 0) / previewReviews.length).toFixed(1)
    : 0;

  const pendingCount = stylists.filter(s => !s.is_approved && s.is_onboarded).length;

  return (
    <div className="space-y-6">
      {/* Preview Dialog */}
      <Dialog open={!!previewStylist} onOpenChange={(open) => !open && setPreviewStylist(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Stylist Preview</DialogTitle>
          </DialogHeader>

          {previewStylist && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary/20">
                  <AvatarImage src={previewStylist.avatar_url || ""} alt={previewStylist.full_name} />
                  <AvatarFallback className="text-lg font-display bg-primary/10 text-primary">
                    {previewStylist.full_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-display font-bold text-foreground">{previewStylist.full_name}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground font-body">
                    {previewStylist.city && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {previewStylist.city}</span>
                    )}
                    {previewStylist.service_category && (
                      <Badge variant="secondary" className="text-xs">{previewStylist.service_category}</Badge>
                    )}
                    {previewReviews.length > 0 && (
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {avgRating} ({previewReviews.length})</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground font-body">
                    <span>{previewStylist.email || "No email"}</span>
                    {previewStylist.phone && <span>· {previewStylist.phone}</span>}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={previewStylist.is_approved ? "default" : "secondary"}>
                      {previewStylist.is_approved ? "Approved" : "Pending Approval"}
                    </Badge>
                    <Badge variant={previewStylist.is_onboarded ? "default" : "destructive"}>
                      {previewStylist.is_onboarded ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {previewStylist.bio && (
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">About</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{previewStylist.bio}</p>
                </div>
              )}

              {/* Services */}
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">
                  Services ({previewServices.length})
                </h3>
                {previewLoading ? (
                  <p className="text-sm text-muted-foreground font-body">Loading...</p>
                ) : previewServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body">No services added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {previewServices.map((svc) => (
                      <Card key={svc.id} className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-body font-semibold text-foreground">{svc.service_name}</p>
                              {svc.description && (
                                <p className="text-xs text-muted-foreground font-body mt-0.5">{svc.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-body">{svc.duration_minutes} min</span>
                              </div>
                            </div>
                            <div className="text-right">
                              {svc.discount_price ? (
                                <div>
                                  <span className="text-xs line-through text-muted-foreground font-body">${svc.price}</span>
                                  <span className="ml-1 font-semibold text-primary font-body">${svc.discount_price}</span>
                                  {svc.discount_badge && (
                                    <Badge variant="destructive" className="ml-1 text-[10px]">{svc.discount_badge}</Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="font-semibold text-foreground font-body">${svc.price}</span>
                              )}
                            </div>
                          </div>
                          {/* Service Photos */}
                          {svc.photos.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto">
                              {svc.photos.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`${svc.service_name} photo`}
                                  className="w-20 h-20 rounded-lg object-cover border border-border flex-shrink-0"
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews */}
              {previewReviews.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">
                    Recent Reviews ({previewReviews.length})
                  </h3>
                  <div className="space-y-2">
                    {previewReviews.map((r, i) => (
                      <div key={i} className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} className={`w-3 h-3 ${si < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                          ))}
                          <span className="text-[10px] text-muted-foreground font-body ml-2">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comment && <p className="text-xs text-muted-foreground font-body">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-border">
                {!previewStylist.is_approved ? (
                  <Button variant="hero" onClick={() => toggleApproval(previewStylist.id, false)} className="flex-1">
                    <ShieldCheck className="w-4 h-4 mr-1" /> Approve Provider
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => toggleApproval(previewStylist.id, true)} className="flex-1">
                    <ShieldX className="w-4 h-4 mr-1" /> Revoke Approval
                  </Button>
                )}
                <Button variant="outline" onClick={() => setPreviewStylist(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pending Approval */}
      {pendingCount > 0 && (
        <Card className="bg-card border-primary/30">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Pending Approval ({pendingCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Name</TableHead>
                  <TableHead className="font-body">Email</TableHead>
                  <TableHead className="font-body">City</TableHead>
                  <TableHead className="font-body">Category</TableHead>
                  <TableHead className="font-body">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stylists.filter(s => !s.is_approved && s.is_onboarded).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-body text-sm font-medium">{s.full_name}</TableCell>
                    <TableCell className="font-body text-sm">{s.email || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{s.city || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{s.service_category || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => openPreview(s)}>
                          <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>
                        <Button variant="hero" size="sm" onClick={() => toggleApproval(s.id, false)}>
                          <ShieldCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Stylists */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            All Stylists ({stylists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">Loading...</p>
          ) : stylists.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No stylists registered.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Name</TableHead>
                  <TableHead className="font-body">Email</TableHead>
                  <TableHead className="font-body">Phone</TableHead>
                  <TableHead className="font-body">City</TableHead>
                  <TableHead className="font-body">Category</TableHead>
                  <TableHead className="font-body">Approval</TableHead>
                  <TableHead className="font-body">Status</TableHead>
                  <TableHead className="font-body">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stylists.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-body text-sm font-medium">{s.full_name}</TableCell>
                    <TableCell className="font-body text-sm">{s.email || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{s.phone || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{s.city || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{s.service_category || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={s.is_approved ? "default" : "secondary"} className="text-xs">
                        {s.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.is_onboarded ? "default" : "destructive"} className="text-xs">
                        {s.is_onboarded ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPreview(s)}
                          title="Preview Profile"
                        >
                          <Eye className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleApproval(s.id, s.is_approved)}
                          title={s.is_approved ? "Revoke Approval" : "Approve"}
                        >
                          {s.is_approved ? <ShieldX className="w-4 h-4 text-destructive" /> : <ShieldCheck className="w-4 h-4 text-primary" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleOnboarded(s.id, s.is_onboarded)}
                          title={s.is_onboarded ? "Suspend" : "Activate"}
                        >
                          {s.is_onboarded ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-primary" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStylists;
