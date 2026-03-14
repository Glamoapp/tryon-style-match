import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Clock, CheckCircle } from "lucide-react";

interface BookingPayout {
  id: string;
  total_price: number;
  status: string;
  booking_date: string;
  provider: { full_name: string } | null;
}

const COMMISSION_RATE = 0.20;

const AdminPayments = () => {
  const [bookings, setBookings] = useState<BookingPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, total_price, status, booking_date, provider:profiles!bookings_provider_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      setBookings((data as unknown as BookingPayout[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const completed = bookings.filter((b) => b.status === "completed");
  const pending = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const totalPaid = completed.reduce((s, b) => s + b.total_price * (1 - COMMISSION_RATE), 0);
  const totalPending = pending.reduce((s, b) => s + b.total_price * (1 - COMMISSION_RATE), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">Completed Payouts</p>
                <p className="text-xl font-display font-bold text-foreground">${totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">Pending Payouts</p>
                <p className="text-xl font-display font-bold text-foreground">${totalPending.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">Total Bookings</p>
                <p className="text-xl font-display font-bold text-foreground">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Stylist Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Date</TableHead>
                  <TableHead className="font-body">Stylist</TableHead>
                  <TableHead className="font-body">Booking Total</TableHead>
                  <TableHead className="font-body">Stylist Payout (80%)</TableHead>
                  <TableHead className="font-body">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-body text-sm">{b.booking_date}</TableCell>
                    <TableCell className="font-body text-sm">{b.provider?.full_name || "—"}</TableCell>
                    <TableCell className="font-body text-sm">${b.total_price.toFixed(2)}</TableCell>
                    <TableCell className="font-body text-sm font-semibold">${(b.total_price * (1 - COMMISSION_RATE)).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-body px-2 py-1 rounded-full ${
                        b.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                        b.status === "confirmed" ? "bg-blue-500/10 text-blue-500" :
                        "bg-gold/10 text-gold"
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

export default AdminPayments;
