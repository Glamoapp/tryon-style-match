import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Users, Percent } from "lucide-react";

interface BookingWithDetails {
  id: string;
  total_price: number;
  status: string;
  booking_date: string;
  booking_time: string;
  created_at: string;
  customer: { full_name: string } | null;
  provider: { full_name: string } | null;
}

const COMMISSION_RATE = 0.20;

const AdminCommissions = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, total_price, status, booking_date, booking_time, created_at, customer:profiles!bookings_customer_id_fkey(full_name), provider:profiles!bookings_provider_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      setBookings((data as unknown as BookingWithDetails[]) || []);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
  const platformEarnings = totalRevenue * COMMISSION_RATE;
  const stylistPayouts = totalRevenue * (1 - COMMISSION_RATE);

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
    { label: "Platform Earnings (20%)", value: `$${platformEarnings.toFixed(2)}`, icon: Percent, color: "text-primary" },
    { label: "Stylist Payouts (80%)", value: `$${stylistPayouts.toFixed(2)}`, icon: TrendingUp, color: "text-accent" },
    { label: "Total Bookings", value: bookings.length.toString(), icon: Users, color: "text-gold" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                  <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">Loading transactions...</p>
          ) : bookings.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No bookings yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Date</TableHead>
                  <TableHead className="font-body">Customer</TableHead>
                  <TableHead className="font-body">Stylist</TableHead>
                  <TableHead className="font-body">Total</TableHead>
                  <TableHead className="font-body">Platform (20%)</TableHead>
                  <TableHead className="font-body">Stylist (80%)</TableHead>
                  <TableHead className="font-body">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-body text-sm">{b.booking_date}</TableCell>
                    <TableCell className="font-body text-sm">{b.customer?.full_name || "—"}</TableCell>
                    <TableCell className="font-body text-sm">{b.provider?.full_name || "—"}</TableCell>
                    <TableCell className="font-body text-sm font-semibold">${b.total_price.toFixed(2)}</TableCell>
                    <TableCell className="font-body text-sm text-primary">${(b.total_price * COMMISSION_RATE).toFixed(2)}</TableCell>
                    <TableCell className="font-body text-sm text-accent">${(b.total_price * (1 - COMMISSION_RATE)).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-body px-2 py-1 rounded-full ${
                        b.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                        b.status === "confirmed" ? "bg-blue-500/10 text-blue-500" :
                        b.status === "pending" ? "bg-gold/10 text-gold" :
                        "bg-destructive/10 text-destructive"
                      }`}>{b.status}</span>
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

export default AdminCommissions;
