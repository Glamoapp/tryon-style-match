import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  phone: string | null;
  city: string | null;
  is_onboarded: boolean;
  is_approved: boolean;
  created_at: string;
}

const AdminProviders = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const toggleApproval = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: approve })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update approval status");
    } else {
      toast.success(approve ? "User approved!" : "User approval revoked");
      fetchProfiles();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            All Users & Providers ({profiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Name</TableHead>
                  <TableHead className="font-body">Email</TableHead>
                  <TableHead className="font-body">Phone</TableHead>
                  <TableHead className="font-body">City</TableHead>
                  <TableHead className="font-body">Role</TableHead>
                  <TableHead className="font-body">Approved</TableHead>
                  <TableHead className="font-body">Joined</TableHead>
                  <TableHead className="font-body">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-body text-sm font-medium">{p.full_name}</TableCell>
                    <TableCell className="font-body text-sm">{p.email || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{p.phone || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{p.city || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.role === "provider" ? "default" : p.role === "vendor" ? "default" : "secondary"} className="text-xs capitalize">
                        {p.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.is_approved ? "default" : "outline"} className="text-xs">
                        {p.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(p.role === "vendor" || p.role === "provider") && (
                        p.is_approved ? (
                          <Button variant="outline" size="sm" onClick={() => toggleApproval(p.id, false)}>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Revoke
                          </Button>
                        ) : (
                          <Button variant="hero" size="sm" onClick={() => toggleApproval(p.id, true)}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                        )
                      )}
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

export default AdminProviders;
