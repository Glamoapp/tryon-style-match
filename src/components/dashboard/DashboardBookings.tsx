import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Users, MapPin, Timer, Loader2, CheckCircle } from "lucide-react";
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
  payment_intent_id: string | null;
  customer: { full_name: string } | null;
  service: { service_name: string; duration_minutes: number } | null;
};

const statusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-gold/20 text-gold border-gold/30";
    case "confirmed": return "bg-primary/10 text-primary border-primary/20";
    case "payment_captured": return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed": return "bg-green-100 text-green-700 border-green-200";
    case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "payment_captured": return "Payment Captured";
    default: return status;
  }
};

export const DashboardBookings = ({
  bookings,
  onUpdate,
}: {
  bookings: Booking[];
  onUpdate: () => void;
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

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
        type: "booking",
        related_booking_id: booking.id,
      });

      // Send confirmation email to customer
      const { data: customerProfile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", booking.customer_id)
        .single();

      if (customerProfile?.email) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "booking-confirmed",
            recipientEmail: customerProfile.email,
            idempotencyKey: `booking-confirmed-${booking.id}`,
            templateData: {
              customerName: customerProfile.full_name,
              serviceName,
              stylistName: providerName,
              bookingDate: booking.booking_date,
              bookingTime: booking.booking_time,
              totalPrice: Number(booking.total_price).toFixed(2),
            },
          },
        });
      }

      toast.success("Booking confirmed — customer has been notified via email");
    } else {
      await supabase.from("notifications").insert({
        user_id: booking.customer_id,
        title: "Booking Declined",
        message: `${providerName} was unable to accept your ${serviceName} request for ${booking.booking_date} at ${booking.booking_time}. Please try booking another stylist.`,
        type: "booking",
        related_booking_id: booking.id,
      });
      toast.success("Booking declined — customer has been notified");
    }

    onUpdate();
  };

  // Step 1: Verify completion code → Capture payment (pull money from customer)
  const handleVerifyCode = async (bookingId: string) => {
    const code = prompt("Enter the customer's completion code:");
    if (!code) return;

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (booking.completion_code !== code) {
      toast.error("Invalid completion code");
      return;
    }

    setLoadingAction(bookingId + "-capture");

    try {
      const { data, error } = await supabase.functions.invoke("capture-booking-payment", {
        body: { bookingId, completionCode: code },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Payment captured! Customer has been charged. You can now complete the service.");
      onUpdate();
    } catch (err) {
      console.error("Capture error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to capture payment");
    } finally {
      setLoadingAction(null);
    }
  };

  // Step 2: Mark service as completed → Transfer money to stylist
  const handleCompleteService = async (bookingId: string) => {
    setLoadingAction(bookingId + "-complete");

    try {
      const { data, error } = await supabase.functions.invoke("complete-booking-payout", {
        body: { bookingId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Send service-completed email to customer
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const { data: customerProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", booking.customer_id)
          .single();

        const { data: { user } } = await supabase.auth.getUser();
        let provName = "Your stylist";
        if (user) {
          const { data: pProfile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
          if (pProfile) provName = pProfile.full_name;
        }

        if (customerProfile?.email) {
          // Fetch customer points for the email
          let pointsEarned = 0;
          let totalPoints = 0;
          const price = Number(booking.total_price);
          if (price >= 2000) pointsEarned = 100;
          else if (price >= 1000) pointsEarned = 50;
          else if (price >= 500) pointsEarned = 20;
          else pointsEarned = 10;

          const { data: pointsData } = await supabase
            .from("customer_points")
            .select("total_points")
            .eq("user_id", booking.customer_id)
            .single();
          if (pointsData) totalPoints = pointsData.total_points;

          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "service-completed",
              recipientEmail: customerProfile.email,
              idempotencyKey: `service-completed-${bookingId}`,
              templateData: {
                customerName: customerProfile.full_name,
                serviceName: (booking.service as any)?.service_name || "Hair Service",
                stylistName: provName,
                bookingDate: booking.booking_date,
                totalPrice: price.toFixed(2),
                pointsEarned,
                totalPoints,
              },
            },
          });
        }
      }

      const payoutAmount = data?.payout ? `$${data.payout.toFixed(2)}` : "";
      toast.success(`Service completed! ${payoutAmount ? `${payoutAmount} has been transferred to your account.` : "Earnings added."}`);
      onUpdate();
    } catch (err) {
      console.error("Payout error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to complete payout");
    } finally {
      setLoadingAction(null);
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
                {statusLabel(booking.status)}
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

            {/* Payment status indicator */}
            {booking.payment_intent_id && booking.status !== "completed" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-green-50 rounded-lg px-3 py-2">
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                <span>Customer paid upfront — ${Number(booking.total_price).toFixed(0)}</span>
              </div>
            )}

            {/* Pending: Confirm or Pass */}
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

            {/* Confirmed: Complete service to trigger payout */}
            {booking.status === "confirmed" && (
              <div className="pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  variant="hero"
                  onClick={() => handleCompleteService(booking.id)}
                  disabled={loadingAction === booking.id + "-complete"}
                >
                  {loadingAction === booking.id + "-complete" ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Processing Payout...</>
                  ) : (
                    "Mark Service Completed"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Click when the service is done — your 80% payout will be transferred
                </p>
              </div>
            )}

            {/* Payment Captured (legacy) — also allow completing */}
            {booking.status === "payment_captured" && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Payment charged — ${Number(booking.total_price).toFixed(0)}</span>
                </div>
                <Button
                  size="sm"
                  variant="hero"
                  onClick={() => handleCompleteService(booking.id)}
                  disabled={loadingAction === booking.id + "-complete"}
                >
                  {loadingAction === booking.id + "-complete" ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Processing Payout...</>
                  ) : (
                    "Mark Service Completed"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Click when the service is done — your 80% payout will be transferred
                </p>
              </div>
            )}

            {/* Completed */}
            {booking.status === "completed" && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Service completed & paid out</span>
                </div>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};
