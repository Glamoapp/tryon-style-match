import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UserCheck, UserX, Eye } from "lucide-react";

interface StylistProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  service_category: string | null;
  is_onboarded: boolean;
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
    setStylists(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStylists(); }, []);

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

  return (
    <div className="space-y-6">
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
                      <Badge variant={s.is_onboarded ? "default" : "destructive"} className="text-xs">
                        {s.is_onboarded ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleOnboarded(s.id, s.is_onboarded)}
                          title={s.is_onboarded ? "Suspend" : "Activate"}
                        >
                          {s.is_onboarded ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
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
