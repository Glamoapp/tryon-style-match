import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Users, MapPin, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Booking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  completion_code: string | null;
  customer_address: string | null;
  notes: string | null;
  customer_id: string;
  customer: { full_name: string } | null;
  service: { service_name: string; duration_minutes: number } | null;
};

const statusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-gold/20 text-gold border-gold/30";
    case "confirmed": return "bg-primary/10 text-primary border-primary/20";
    case "completed": return "bg-green-100 text-green-700 border-green-200";
    case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

export const DashboardBookings = ({
  bookings,
  onUpdate,
}: {
  bookings: Booking[];
  onUpdate: () => void;
}) => {
  const handleBookingAction = async (booking: Booking, action: "confirmed" | "rejected") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq("id", booking.id);

    if (error) {
      toast.error("Failed to update booking");
      return;
    }

    // Get current provider's name
    const { data: { user } } = await supabase.auth.getUser();
    let providerName = "Your stylist";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile) providerName = profile.full_name;
    }

    const serviceName = (booking.service as any)?.service_name || "your service";

    // Send notification to customer
    if (action === "confirmed") {
      await supabase.from("notifications").insert({
        user_id: booking.customer_id,
        title: "Booking Confirmed! 🎉",
        message: `${providerName} has confirmed your ${serviceName} appointment on ${booking.booking_date} at ${booking.booking_time}. See you soon!`,
        type: "booking_confirmed",
        related_booking_id: booking.id,
      });
      toast.success("Booking confirmed — customer has been notified");
    } else {
      await supabase.from("notifications").insert({
        user_id: booking.customer_id,
        title: "Booking Declined",
        message: `${providerName} was unable to accept your ${serviceName} request for ${booking.booking_date} at ${booking.booking_time}. Please try booking another stylist.`,
        type: "booking_rejected",
        related_booking_id: booking.id,
      });
      toast.success("Booking declined — customer has been notified");
    }

    onUpdate();
  };

  const handleVerifyCode = async (bookingId: string) => {
    const code = prompt("Enter the customer's completion code:");
    if (!code) return;
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking?.completion_code === code) {
      await supabase.from("bookings").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", bookingId);
      toast.success("Service completed! Earnings added.");
      onUpdate();
    } else {
      toast.error("Invalid completion code");
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl font-bold mb-4">Bookings</h2>
      {bookings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No bookings yet</p>
          <p className="text-sm">New bookings from customers will appear here</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <motion.div key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium">{(booking.customer as any)?.full_name || "Customer"}</p>
                <p className="text-sm text-muted-foreground">{(booking.service as any)?.service_name || "Service"}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{booking.booking_date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.booking_time}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${Number(booking.total_price).toFixed(0)}</span>
              {(booking.service as any)?.duration_minutes && (
                <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{(booking.service as any).duration_minutes} min</span>
              )}
            </div>
            {booking.customer_address && (
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {booking.customer_address}
              </p>
            )}
            {booking.notes && (
              <p className="text-xs text-muted-foreground mb-3 italic">Note: {booking.notes}</p>
            )}
            {booking.status === "pending" && (
              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Button size="sm" variant="hero" onClick={() => handleBookingAction(booking, "confirmed")}>
                  Confirm Booking
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBookingAction(booking, "rejected")}>
                  Pass
                </Button>
              </div>
            )}
            {booking.status === "confirmed" && (
              <div className="pt-2 border-t border-border/50">
                <Button size="sm" variant="gold" onClick={() => handleVerifyCode(booking.id)}>Enter Completion Code</Button>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};
