import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  phone: string | null;
  city: string | null;
  is_onboarded: boolean;
  created_at: string;
}

const AdminProviders = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setProfiles(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

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
                  <TableHead className="font-body">Status</TableHead>
                  <TableHead className="font-body">Joined</TableHead>
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
                      <Badge variant={p.role === "provider" ? "default" : "secondary"} className="text-xs capitalize">
                        {p.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.is_onboarded ? "default" : "outline"} className="text-xs">
                        {p.is_onboarded ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
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
