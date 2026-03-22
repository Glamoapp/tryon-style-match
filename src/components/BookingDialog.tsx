import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Clock, ChevronRight, User, Mail, Phone, MapPin, Loader2, ShoppingBag, Package, Scissors, ArrowRight, Plus, Check, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore, type ServiceCartItem, type VendorCartItem } from "@/stores/cartStore";
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
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";

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

type VendorProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_urls: string[];
  vendor_id: string;
  vendor?: { full_name: string };
};

const BookingDialog = ({ trigger, stylistName, styleName, servicePrice, stylistPhone, providerId, serviceId, providerAvatarUrl }: BookingDialogProps) => {
  const navigate = useNavigate();
  const addServiceItem = useCartStore((s) => s.addServiceItem);
  const addItem = useCartStore((s) => s.addItem);
  const addVendorItem = useCartStore((s) => s.addVendorItem);
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

  // Step 3 — inline products
  const [productsLoading, setProductsLoading] = useState(false);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

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
    setShopifyProducts([]);
    setVendorProducts([]);
    setAddedProductIds(new Set());
  };

  // Fetch products when step 3 is reached
  useEffect(() => {
    if (step !== 3) return;
    const query = getProductQueryForService(styleName || "");
    setProductsLoading(true);

    Promise.all([
      storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 20, query }).then((data) => {
        const all = data?.data?.products?.edges || [];
        // Filter by query keyword
        const filtered = all.filter((p: ShopifyProduct) =>
          `${p.node.title} ${p.node.description}`.toLowerCase().includes(query)
        );
        setShopifyProducts(filtered.length > 0 ? filtered.slice(0, 6) : all.slice(0, 6));
      }).catch(() => {}),
      supabase
        .from("vendor_products")
        .select("*, vendor:profiles!vendor_products_vendor_id_fkey(full_name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6)
        .then(({ data }) => {
          if (data) {
            const filtered = data.filter((p: any) =>
              `${p.title} ${p.description || ""} ${p.category || ""}`.toLowerCase().includes(query)
            );
            setVendorProducts(filtered.length > 0 ? filtered.slice(0, 4) : data.slice(0, 4));
          }
        }),
    ]).finally(() => setProductsLoading(false));
  }, [step, styleName]);

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

      // Check if this is the customer's first booking — send welcome email
      (async () => {
        try {
          const { data: allBookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("customer_id", user.id)
            .limit(2);
          if (allBookings && allBookings.length === 1) {
            await supabase.functions.invoke("send-transactional-email", {
              body: {
                templateName: "first-booking-welcome",
                recipientEmail: email,
                idempotencyKey: `first-booking-welcome-${user.id}`,
                templateData: {
                  customerName: name,
                  serviceName: styleName || "Hair Service",
                  stylistName: stylistName || "Assigned Stylist",
                  bookingDate: format(date, "EEE, MMM d"),
                  bookingTime: time,
                },
              },
            });
          }
        } catch (err) {
          console.error("First booking welcome email failed:", err);
        }
      })();
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

  const handleGoToCheckout = () => {
    setOpen(false);
    resetForm();
    navigate("/checkout", {
      state: { fromCart: true },
    });
  };

  const handleAddShopifyProduct = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    setAddedProductIds((prev) => new Set(prev).add(product.node.id));
    toast.success(`${product.node.title} added!`, { position: "top-center" });
  };

  const handleAddVendorProduct = (product: VendorProduct) => {
    const item: VendorCartItem = {
      id: product.id,
      type: 'vendor_product',
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image_urls?.[0],
      vendor: product.vendor?.full_name,
    };
    addVendorItem(item);
    setAddedProductIds((prev) => new Set(prev).add(product.id));
    toast.success(`${product.title} added!`, { position: "top-center" });
  };

  const totalSteps = 3;
  const canProceedStep1 = date && time;
  const canProceedStep2 = canProceedStep1 && name.trim() && email.trim() && phone.trim() && address.trim();

  const totalAddedProducts = addedProductIds.size;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
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
                  {getAvailableSlots(date).map((slot) => (
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
              {/* Booking confirmed banner */}
              <div className="bg-primary/5 rounded-2xl p-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base">Booking Confirmed!</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    <span className="text-primary font-semibold">{styleName}</span> with <span className="font-semibold">{stylistName}</span> — ${servicePrice?.toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-body text-center">
                Add hair products for your appointment — everything ships together.
              </p>

              {/* Inline product grid */}
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (shopifyProducts.length === 0 && vendorProducts.length === 0) ? (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-body">No matching products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                  {/* Shopify products */}
                  {shopifyProducts.map((product) => {
                    const variant = product.node.variants.edges[0]?.node;
                    const imgUrl = product.node.images?.edges?.[0]?.node?.url;
                    const isAdded = addedProductIds.has(product.node.id);
                    return (
                      <div key={product.node.id} className="bg-secondary/50 rounded-xl overflow-hidden border border-border">
                        {imgUrl && (
                          <div className="aspect-square bg-muted">
                            <img src={imgUrl} alt={product.node.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-2.5 space-y-1.5">
                          <h4 className="text-xs font-semibold text-foreground font-body line-clamp-2 leading-tight">{product.node.title}</h4>
                          <p className="text-xs font-bold text-primary font-body">
                            ${parseFloat(variant?.price.amount || "0").toFixed(2)}
                          </p>
                          <Button
                            size="sm"
                            variant={isAdded ? "outline" : "hero"}
                            className="w-full h-7 text-xs"
                            disabled={isAdded}
                            onClick={() => handleAddShopifyProduct(product)}
                          >
                            {isAdded ? (
                              <><Check className="w-3 h-3 mr-1" /> Added</>
                            ) : (
                              <><Plus className="w-3 h-3 mr-1" /> Add</>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Vendor products */}
                  {vendorProducts.map((product) => {
                    const imgUrl = product.image_urls?.[0];
                    const isAdded = addedProductIds.has(product.id);
                    return (
                      <div key={product.id} className="bg-secondary/50 rounded-xl overflow-hidden border border-border">
                        {imgUrl && (
                          <div className="aspect-square bg-muted">
                            <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-2.5 space-y-1.5">
                          <h4 className="text-xs font-semibold text-foreground font-body line-clamp-2 leading-tight">{product.title}</h4>
                          <p className="text-xs font-bold text-primary font-body">${product.price.toFixed(2)}</p>
                          <Button
                            size="sm"
                            variant={isAdded ? "outline" : "hero"}
                            className="w-full h-7 text-xs"
                            disabled={isAdded}
                            onClick={() => handleAddVendorProduct(product)}
                          >
                            {isAdded ? (
                              <><Check className="w-3 h-3 mr-1" /> Added</>
                            ) : (
                              <><Plus className="w-3 h-3 mr-1" /> Add</>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Checkout button */}
              <div className="grid gap-2 pt-2">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleGoToCheckout}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {totalAddedProducts > 0
                    ? `Checkout — Service + ${totalAddedProducts} Product${totalAddedProducts > 1 ? "s" : ""}`
                    : "Go to Checkout"}
                </Button>

                {totalAddedProducts === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={handleGoToCheckout}
                  >
                    Skip — Just the service <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
