import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Clock, ChevronRight, User, Mail, Phone, MapPin, Loader2, ShoppingBag, Package, Scissors, ArrowRight } from "lucide-react";
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

const ALL_TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const getAvailableSlots = (selectedDate: Date | undefined) => {
  if (!selectedDate) return ALL_TIME_SLOTS;
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();
  if (!isToday) return ALL_TIME_SLOTS;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  return ALL_TIME_SLOTS.filter((slot) => {
    const [time, period] = slot.split(" ");
    const [rawHour, minute] = time.split(":").map(Number);
    let hour = rawHour;
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour > currentHour || (hour === currentHour && minute > currentMinute);
  });
};

interface BookingDialogProps {
  trigger: React.ReactNode;
  stylistName?: string;
  styleName?: string;
  servicePrice?: number;
  stylistPhone?: string | null;
  providerId?: string;
  serviceId?: string;
  providerAvatarUrl?: string | null;
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

/** Map service names to product search queries for the extensions page */
const getProductQueryForService = (serviceName: string): string => {
  const lower = serviceName.toLowerCase();
  if (lower.includes("sew") || lower.includes("weave") || lower.includes("install")) return "weave";
  if (lower.includes("braid") || lower.includes("cornrow") || lower.includes("twist")) return "braid";
  if (lower.includes("wig")) return "wig";
  if (lower.includes("loc") || lower.includes("dread")) return "loc";
  if (lower.includes("clip")) return "clip";
  if (lower.includes("frontal") || lower.includes("closure")) return "frontal";
  return "extensions";
};

const BookingDialog = ({ trigger, stylistName, styleName, servicePrice, stylistPhone, providerId, serviceId, providerAvatarUrl }: BookingDialogProps) => {
  const navigate = useNavigate();
  const addServiceItem = useCartStore((s) => s.addServiceItem);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

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
    setBookingId(null);
  };

  const handleNext = async () => {
    if (!date || !time || !name || !email || !phone || !address) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to complete your booking");
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);

    let createdId = `BK-${Date.now().toString(36).toUpperCase()}`;

    if (providerId && serviceId) {
      const bookingDate = format(date, "yyyy-MM-dd");
      const bookingTime = toDbTime(time);

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
        if ((bookingError as any)?.code === "23505") {
          toast.error("That time slot is already booked. Please choose a different time.");
          setStep(1);
        } else {
          toast.error("Couldn't create your booking. Please try again.");
        }
        setLoading(false);
        return;
      }

      createdId = createdBooking.id;

      supabase.functions.invoke("notify-booking", {
        body: { booking_id: createdId },
      }).catch((err) => console.error("Booking notification failed:", err));
    }

    // Add to unified cart
    const serviceItem: ServiceCartItem = {
      id: createdId,
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
      id: createdId,
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

    setBookingId(createdId);
    setLoading(false);
    setStep(3); // Go to upsell step
  };

  const handleSkipToCheckout = () => {
    setOpen(false);
    resetForm();
    navigate("/checkout", {
      state: {
        fromCart: true,
      },
    });
  };

  const handleShopProducts = () => {
    setOpen(false);
    resetForm();
    const query = getProductQueryForService(styleName || "");
    navigate(`/extensions?q=${encodeURIComponent(query)}`);
  };

  const totalSteps = 3;
  const canProceedStep1 = date && time;
  const canProceedStep2 = canProceedStep1 && name.trim() && email.trim() && phone.trim() && address.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            {step === 1 && "Select Date & Time"}
            {step === 2 && "Your Information"}
            {step === 3 && "Add Hair Extensions?"}
          </DialogTitle>
          {(stylistName || styleName) && step < 3 && (
            <p className="text-sm text-muted-foreground font-body">
              {styleName && <span className="text-primary font-semibold">{styleName}</span>}
              {styleName && stylistName && " with "}
              {stylistName && <span className="font-semibold">{stylistName}</span>}
              {servicePrice != null && <span className="ml-2 font-bold">${servicePrice.toFixed(2)}</span>}
            </p>
          )}
          <div className="flex items-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-body transition-colors",
                  step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {s}
                </div>
                {s < totalSteps && <div className={cn("w-8 h-0.5", step > s ? "bg-primary" : "bg-border")} />}
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
                <Button variant="hero" className="flex-1" disabled={!canProceedStep2 || loading} onClick={handleNext}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-2xl p-5 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Scissors className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">Booking Confirmed!</h3>
                  <p className="text-sm text-muted-foreground font-body mt-1">
                    <span className="text-primary font-semibold">{styleName}</span> with <span className="font-semibold">{stylistName}</span>
                  </p>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground font-body">
                Would you like to purchase hair extensions for your{" "}
                <span className="font-semibold text-foreground">{styleName?.toLowerCase()}</span> service?
              </p>

              <div className="grid gap-3">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleShopProducts}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Shop {getProductQueryForService(styleName || "").charAt(0).toUpperCase() + getProductQueryForService(styleName || "").slice(1)} Products
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSkipToCheckout}
                >
                  No Thanks — Go to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
