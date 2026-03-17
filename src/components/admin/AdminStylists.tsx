import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UserCheck, UserX, ShieldCheck, ShieldX } from "lucide-react";

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

const AdminStylists = () => {
  const [stylists, setStylists] = useState<StylistProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  };

  const toggleOnboarded = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_onboarded: !current })
      .eq("id", id);
    if (!error) {
      toast({ title: current ? "Stylist suspended" : "Stylist activated" });
      fetchStylists();
    }
  };

  const pendingCount = stylists.filter(s => !s.is_approved && s.is_onboarded).length;

  return (
    <div className="space-y-6">
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
                      <Button variant="hero" size="sm" onClick={() => toggleApproval(s.id, false)}>
                        <ShieldCheck className="w-4 h-4 mr-1" /> Approve
                      </Button>
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
