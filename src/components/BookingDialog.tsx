import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Clock, ChevronRight, User, Mail, Phone, MapPin, Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore, type ServiceCartItem } from "@/stores/cartStore";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

interface BookingDialogProps {
  trigger: React.ReactNode;
  stylistName?: string;
  styleName?: string;
  servicePrice?: number;
  stylistPhone?: string | null;
  providerId?: string;
  serviceId?: string;
}

const toDbTime = (slot: string) => {
  const [time, period] = slot.split(" ");
  const [rawHour, minute] = time.split(":").map(Number);
  let hour = rawHour;

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
};

const generateCompletionCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const BookingDialog = ({ trigger, stylistName, styleName, servicePrice, stylistPhone, providerId, serviceId }: BookingDialogProps) => {
  const navigate = useNavigate();
  const addServiceItem = useCartStore((s) => s.addServiceItem);
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const resetForm = () => {
    setStep(1);
    setDate(undefined);
    setTime(undefined);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!date || !time || !name || !email || !phone || !address) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to complete your booking");
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);

    let bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;

    if (providerId && serviceId) {
      const bookingDate = format(date, "yyyy-MM-dd");
      const bookingTime = toDbTime(time);

      // Check for existing booking in this time slot
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("provider_id", providerId)
        .eq("booking_date", bookingDate)
        .eq("booking_time", bookingTime)
        .not("status", "in", '("rejected","cancelled")')
        .limit(1);

      if (existing && existing.length > 0) {
        toast.error("This time slot is already booked. Please choose a different time.");
        setStep(1);
        setLoading(false);
        return;
      }

      const { data: createdBooking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          provider_id: providerId,
          service_id: serviceId,
          booking_date: bookingDate,
          booking_time: bookingTime,
          total_price: servicePrice ?? 0,
          customer_address: address,
          completion_code: generateCompletionCode(),
          status: "pending",
        })
        .select("id")
        .single();

      if (bookingError || !createdBooking) {
        toast.error("Couldn't create your booking. Please try again.");
        setLoading(false);
        return;
      }

      bookingId = createdBooking.id;
    }

    // Add to unified cart
    const serviceItem: ServiceCartItem = {
      id: bookingId,
      type: 'service',
      serviceName: styleName || "Hair Service",
      serviceId: serviceId || "",
      providerId: providerId || "",
      providerName: stylistName || "Assigned Stylist",
      price: servicePrice ?? 0,
      date: format(date, "PPP"),
      time,
      customerName: name,
      email,
      phone,
      address,
    };

    addServiceItem(serviceItem);

    // Save booking data for tracker page
    localStorage.setItem("currentBooking", JSON.stringify({
      id: bookingId,
      date: format(date, "PPP"),
      time,
      stylistName: stylistName || "Assigned Stylist",
      styleName: styleName || "Hair Service",
      stylistPhone: stylistPhone || null,
      customerName: name,
      email,
      phone,
      address,
    }));

    setOpen(false);
    resetForm();
    toast.success("Service added to cart! Open your cart to checkout.", { position: "top-center" });
  };

  const canProceedStep1 = date && time;
  const canConfirm = canProceedStep1 && name.trim() && email.trim() && phone.trim() && address.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            {step === 1 && "Select Date & Time"}
            {step === 2 && "Your Information"}
          </DialogTitle>
          {(stylistName || styleName) && (
            <p className="text-sm text-muted-foreground font-body">
              {styleName && <span className="text-primary font-semibold">{styleName}</span>}
              {styleName && stylistName && " with "}
              {stylistName && <span className="font-semibold">{stylistName}</span>}
              {servicePrice != null && <span className="ml-2 font-bold">${servicePrice.toFixed(2)}</span>}
            </p>
          )}
          <div className="flex items-center gap-2 pt-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-body transition-colors",
                  step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {s}
                </div>
                {s < 2 && <div className={cn("w-8 h-0.5", step > s ? "bg-primary" : "bg-border")} />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-primary" /> Select Date
                </label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-xl border border-border pointer-events-auto mx-auto"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" /> Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-body font-medium transition-all",
                        time === slot
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="hero" className="w-full" disabled={!canProceedStep1} onClick={() => setStep(2)}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                    <User className="w-4 h-4 text-primary" /> Full Name
                  </label>
                  <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                    <Mail className="w-4 h-4 text-primary" /> Email
                  </label>
                  <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                    <Phone className="w-4 h-4 text-primary" /> Phone Number
                  </label>
                  <Input type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> Service Address
                  </label>
                  <Input placeholder="123 Main St, City, State ZIP" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border" />
                </div>
              </div>

              {date && time && (
                <div className="bg-secondary/50 rounded-xl p-4 text-sm font-body text-foreground space-y-1">
                  <p><span className="font-semibold">Date:</span> {format(date, "EEEE, MMMM d, yyyy")}</p>
                  <p><span className="font-semibold">Time:</span> {time}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button variant="hero" className="flex-1" disabled={!canConfirm || loading} onClick={handleAddToCart}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4 mr-1" /> Add to Cart</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
