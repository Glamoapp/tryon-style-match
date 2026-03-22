import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Package, Minus, Plus, ShoppingCart, Tag, Scissors, ArrowRight, ArrowLeft,
  CalendarIcon, Clock, User, Mail, Phone, MapPin, Loader2, Star, CheckCircle, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore, type VendorCartItem, type ServiceCartItem } from "@/stores/cartStore";
import { toast } from "sonner";

interface Variant {
  id: string;
  length: string | null;
  color: string | null;
  size: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_count: number;
  is_active: boolean;
}

interface VendorProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  image_urls: string[];
  vendor_id: string;
  vendor?: { full_name: string };
  deals?: { deal_title: string; discount_percent: number | null; discount_amount: number | null }[];
}

interface MatchedStylist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  service_category: string | null;
  avgRating: number;
}

interface Props {
  product: VendorProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Map product categories to stylist service categories
const CATEGORY_TO_SERVICE: Record<string, string[]> = {
  "hair extensions": ["Weave", "Sew-In"],
  "weave": ["Weave", "Sew-In"],
  "extensions": ["Weave", "Sew-In"],
  "braids": ["Braids"],
  "locs": ["Locs"],
  "wigs": ["Weave", "Wigs"],
  "closures": ["Weave", "Sew-In"],
  "frontals": ["Weave", "Sew-In"],
  "bundles": ["Weave", "Sew-In"],
};

function getMatchingServiceCategories(productCategory: string | null): string[] {
  if (!productCategory) return ["Weave", "Braids", "Locs"];
  const lower = productCategory.toLowerCase();
  for (const [key, cats] of Object.entries(CATEGORY_TO_SERVICE)) {
    if (lower.includes(key)) return cats;
  }
  return ["Weave", "Braids", "Locs"];
}

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const toDbTime = (slot: string) => {
  const [time, period] = slot.split(" ");
  const [rawHour, minute] = time.split(":").map(Number);
  let hour = rawHour;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
};

const generateCompletionCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

type Step = "product" | "cross_sell" | "stylist" | "booking" | "contact";

export const VendorProductDialog = ({ product, open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const addVendorItem = useCartStore((s) => s.addVendorItem);
  const addServiceItem = useCartStore((s) => s.addServiceItem);

  // Product selection state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Cross-sell / stylist state
  const [step, setStep] = useState<Step>("product");
  const [wantsService, setWantsService] = useState(false);
  const [stylists, setStylists] = useState<MatchedStylist[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<MatchedStylist | null>(null);
  const [stylistServices, setStylistServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loadingStylists, setLoadingStylists] = useState(false);

  // Booking state
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product && open) {
      resetAll();
      fetchVariants(product.id);
    }
  }, [product, open]);

  function resetAll() {
    setStep("product");
    setQuantity(1);
    setSelectedLength("");
    setSelectedColor("");
    setSelectedSize("");
    setWantsService(false);
    setStylists([]);
    setSelectedStylist(null);
    setStylistServices([]);
    setSelectedService(null);
    setDate(undefined);
    setTime(undefined);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setSubmitting(false);
  }

  async function fetchVariants(productId: string) {
    setLoadingVariants(true);
    const { data } = await supabase
      .from("vendor_product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true);
    setVariants(data || []);
    setLoadingVariants(false);
  }

  async function fetchMatchingStylists() {
    setLoadingStylists(true);
    const categories = getMatchingServiceCategories(product?.category);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, city, service_category")
      .eq("role", "provider")
      .eq("is_approved", true)
      .eq("is_onboarded", true);

    if (data) {
      // Filter by matching category
      const matched = data.filter(p =>
        categories.some(c => p.service_category?.toLowerCase().includes(c.toLowerCase()))
      );

      // Get ratings
      const ids = matched.map(s => s.id);
      const { data: reviews } = await supabase
        .from("reviews")
        .select("provider_id, rating")
        .in("provider_id", ids);

      const ratingMap = new Map<string, number[]>();
      reviews?.forEach(r => {
        const arr = ratingMap.get(r.provider_id) || [];
        arr.push(r.rating);
        ratingMap.set(r.provider_id, arr);
      });

      const withRatings: MatchedStylist[] = matched.map(s => ({
        ...s,
        avgRating: ratingMap.has(s.id) ? ratingMap.get(s.id)!.reduce((a, b) => a + b, 0) / ratingMap.get(s.id)!.length : 0,
      }));

      setStylists(withRatings.sort((a, b) => b.avgRating - a.avgRating));
    }
    setLoadingStylists(false);
  }

  async function fetchStylistServices(stylistId: string) {
    const { data } = await supabase
      .from("provider_services")
      .select("*")
      .eq("provider_id", stylistId)
      .eq("is_active", true);
    setStylistServices(data || []);
    if (data && data.length > 0) setSelectedService(data[0]);
  }

  const hasVariants = variants.length > 0;
  const uniqueLengths = useMemo(() => [...new Set(variants.map(v => v.length).filter(Boolean))] as string[], [variants]);
  const uniqueColors = useMemo(() => [...new Set(variants.map(v => v.color).filter(Boolean))] as string[], [variants]);
  const uniqueSizes = useMemo(() => [...new Set(variants.map(v => v.size).filter(Boolean))] as string[], [variants]);

  useEffect(() => {
    if (uniqueLengths.length === 1 && !selectedLength) setSelectedLength(uniqueLengths[0]);
    if (uniqueColors.length === 1 && !selectedColor) setSelectedColor(uniqueColors[0]);
    if (uniqueSizes.length === 1 && !selectedSize) setSelectedSize(uniqueSizes[0]);
  }, [uniqueLengths, uniqueColors, uniqueSizes]);

  const matchedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(v =>
      (!uniqueLengths.length || v.length === selectedLength) &&
      (!uniqueColors.length || v.color === selectedColor) &&
      (!uniqueSizes.length || v.size === selectedSize)
    ) || null;
  }, [variants, selectedLength, selectedColor, selectedSize, uniqueLengths, uniqueColors, uniqueSizes, hasVariants]);

  if (!product) return null;

  const deal = product.deals?.[0];
  const basePrice = matchedVariant ? matchedVariant.price : product.price;
  const effectivePrice = deal
    ? deal.discount_percent
      ? basePrice * (1 - deal.discount_percent / 100)
      : deal.discount_amount
        ? Math.max(0, basePrice - deal.discount_amount)
        : basePrice
    : basePrice;

  const needsSelection = hasVariants && (
    (uniqueLengths.length > 0 && !selectedLength) ||
    (uniqueColors.length > 0 && !selectedColor) ||
    (uniqueSizes.length > 0 && !selectedSize)
  );

  const outOfStock = matchedVariant && matchedVariant.inventory_count < quantity;

  const buildVendorCartItem = (): VendorCartItem => ({
    id: matchedVariant ? `${product.id}-${matchedVariant.id}` : product.id,
    type: 'vendor_product',
    productId: product.id,
    variantId: matchedVariant?.id,
    title: product.title,
    price: effectivePrice,
    quantity,
    image: product.image_urls?.[0],
    vendor: product.vendor?.full_name,
    variantLabel: [selectedLength, selectedColor, selectedSize].filter(Boolean).join(" / ") || undefined,
  });

  const handleAddToCartOnly = () => {
    if (needsSelection) { toast.error("Please select all options", { position: "top-center" }); return; }
    addVendorItem(buildVendorCartItem());
    toast.success(`${product.title} added to cart!`, { position: "top-center" });
    onOpenChange(false);
  };

  const handleProceedToCrossSell = () => {
    if (needsSelection) { toast.error("Please select all options", { position: "top-center" }); return; }
    setStep("cross_sell");
  };

  const handleWantService = () => {
    setWantsService(true);
    setStep("stylist");
    fetchMatchingStylists();
  };

  const handleSelectStylist = (stylist: MatchedStylist) => {
    setSelectedStylist(stylist);
    fetchStylistServices(stylist.id);
    setStep("booking");
  };

  const handleSubmitBooking = async () => {
    if (!date || !time || !name || !email || !phone || !address) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to complete your booking");
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSubmitting(true);

    const bookingDate = format(date, "yyyy-MM-dd");
    const bookingTime = toDbTime(time);

    // Check for existing booking
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("provider_id", selectedStylist!.id)
      .eq("booking_date", bookingDate)
      .eq("booking_time", bookingTime)
      .not("status", "in", '("rejected","cancelled")')
      .limit(1);

    if (existing && existing.length > 0) {
      toast.error("This time slot is already booked. Please choose a different time.");
      setStep("booking");
      setSubmitting(false);
      return;
    }

    const servicePrice = selectedService?.discount_price ?? selectedService?.price ?? 0;
    const completionCode = generateCompletionCode();

    const { data: createdBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        provider_id: selectedStylist!.id,
        service_id: selectedService!.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        total_price: servicePrice,
        customer_address: address,
        completion_code: completionCode,
        status: "pending",
      })
      .select("id")
      .single();

    if (bookingError || !createdBooking) {
      console.error("Booking insert error:", bookingError);
      if (bookingError?.code === "23505") {
        toast.error("That time slot is already booked. Please choose a different time.");
      } else {
        toast.error("Couldn't create your booking. Please try again.");
      }
      setSubmitting(false);
      return;
    }

    // Notify provider
    supabase.functions.invoke("notify-booking", {
      body: { booking_id: createdBooking.id },
    }).catch(console.error);

    // Calculate reward points based on total
    const productTotal = effectivePrice * quantity;
    const totalAmount = productTotal + servicePrice;
    let rewardPoints = 10;
    if (totalAmount > 2000) rewardPoints = 100;
    else if (totalAmount > 1000) rewardPoints = 50;
    else if (totalAmount > 500) rewardPoints = 20;
    else if (totalAmount > 300) rewardPoints = 10;

    // Send booking confirmation email with receipt
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "booking-confirmation",
        recipientEmail: email,
        idempotencyKey: `booking-confirm-${createdBooking.id}`,
        templateData: {
          customerName: name,
          serviceName: selectedService?.service_name || "Hair Service",
          stylistName: selectedStylist!.full_name,
          bookingDate: format(date, "EEE, MMM d"),
          bookingTime: time,
          servicePrice: servicePrice.toFixed(2),
          productTitle: product.title,
          productPrice: (effectivePrice * quantity).toFixed(2),
          productQuantity: quantity,
          totalAmount: totalAmount.toFixed(2),
          completionCode,
          rewardPoints,
        },
      },
    }).catch(console.error);

    onOpenChange(false);

    // Navigate to checkout page for review
    navigate("/checkout", {
      state: {
        products: [
          {
            title: product.title,
            price: String(effectivePrice),
            quantity,
            imageUrl: product.image_urls?.[0] || null,
          },
        ],
        services: [
          {
            serviceName: selectedService?.service_name || "Hair Service",
            providerName: selectedStylist!.full_name,
            date: format(date, "PPP"),
            time,
            price: servicePrice,
          },
        ],
        customerName: name,
        customerEmail: email,
      },
    });

    setSubmitting(false);
  };


  const stepTitle: Record<Step, string> = {
    product: product.title,
    cross_sell: "Want Professional Installation?",
    stylist: "Choose Your Stylist",
    booking: "Book Your Appointment",
    contact: "Your Information",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{stepTitle[step]}</DialogTitle>
        </DialogHeader>

        {/* STEP 1: Product Selection */}
        {step === "product" && (
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              {product.image_urls?.[0] ? (
                <img src={product.image_urls[0]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {product.vendor?.full_name && <p className="text-xs text-muted-foreground">by {product.vendor.full_name}</p>}
            {product.description && <p className="text-sm text-muted-foreground font-body">{product.description}</p>}
            {deal && <Badge variant="destructive" className="w-fit"><Tag className="w-3 h-3 mr-1" /> {deal.deal_title}</Badge>}

            {hasVariants && (
              <div className="space-y-3">
                {uniqueLengths.length > 0 && (
                  <div>
                    <Label className="font-body text-sm mb-1.5 block">Length</Label>
                    <Select value={selectedLength} onValueChange={setSelectedLength}>
                      <SelectTrigger><SelectValue placeholder="Select length" /></SelectTrigger>
                      <SelectContent>{uniqueLengths.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {uniqueColors.length > 0 && (
                  <div>
                    <Label className="font-body text-sm mb-1.5 block">Color</Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                      <SelectContent>{uniqueColors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {uniqueSizes.length > 0 && (
                  <div>
                    <Label className="font-body text-sm mb-1.5 block">Size</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>{uniqueSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label className="font-body text-sm mb-1.5 block">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => q + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground font-body">${(effectivePrice * quantity).toFixed(2)}</span>
              {deal && effectivePrice < basePrice && (
                <span className="text-sm text-muted-foreground line-through">${(basePrice * quantity).toFixed(2)}</span>
              )}
            </div>

            {outOfStock && <p className="text-sm text-destructive font-body">Only {matchedVariant.inventory_count} in stock</p>}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleAddToCartOnly} disabled={!!outOfStock}>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleProceedToCrossSell} disabled={!!outOfStock}>
                <ArrowRight className="w-4 h-4" /> Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Cross-sell */}
        {step === "cross_sell" && (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Scissors className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Would you like a professional stylist to install your <span className="font-semibold text-foreground">{product.title}</span>?
                We'll match you with the perfect stylist for this product.
              </p>
            </div>

            <Button variant="hero" className="w-full" onClick={handleWantService}>
              <Scissors className="w-4 h-4 mr-2" /> Yes, Find Me a Stylist
            </Button>
            <Button variant="outline" className="w-full" onClick={() => {
              addVendorItem(buildVendorCartItem());
              toast.success(`${product.title} added to cart!`, { position: "top-center" });
              onOpenChange(false);
            }}>
              No thanks, just the product
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep("product")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        )}

        {/* STEP 3: Stylist Selection */}
        {step === "stylist" && (
          <div className="space-y-4">
            {loadingStylists ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : stylists.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground font-body text-sm">No matching stylists found in your area.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  addVendorItem(buildVendorCartItem());
                  toast.success(`${product.title} added to cart!`, { position: "top-center" });
                  onOpenChange(false);
                }}>Just add the product</Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {stylists.map(stylist => (
                  <div
                    key={stylist.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-all"
                  >
                    <Link
                      to={`/stylist/${stylist.id}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0 ring-2 ring-primary/20 hover:ring-primary/60 transition-all relative group"
                      title={`View ${stylist.full_name}'s profile`}
                    >
                      {stylist.avatar_url ? (
                        <img src={stylist.avatar_url} alt={stylist.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                          {stylist.full_name[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                    </Link>
                    <button
                      onClick={() => handleSelectStylist(stylist)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="font-body font-semibold text-foreground text-sm">{stylist.full_name}</p>
                      <p className="text-xs text-muted-foreground font-body">{stylist.service_category} • {stylist.city || "Mobile"}</p>
                    </button>
                    {stylist.avgRating > 0 && (
                      <div className="flex items-center gap-1 text-xs font-body">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {stylist.avgRating.toFixed(1)}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleSelectStylist(stylist)}>
                      Select <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep("cross_sell")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        )}

        {/* STEP 4: Booking (date/time + service selection) */}
        {step === "booking" && selectedStylist && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {selectedStylist.avatar_url ? (
                  <img src={selectedStylist.avatar_url} alt={selectedStylist.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">{selectedStylist.full_name[0]}</div>
                )}
              </div>
              <div>
                <p className="font-body font-semibold text-foreground text-sm">{selectedStylist.full_name}</p>
                <p className="text-xs text-muted-foreground">{selectedStylist.service_category}</p>
              </div>
            </div>

            {stylistServices.length > 1 && (
              <div>
                <Label className="font-body text-sm mb-1.5 block">Select Service</Label>
                <Select value={selectedService?.id} onValueChange={(id) => setSelectedService(stylistServices.find(s => s.id === id))}>
                  <SelectTrigger><SelectValue placeholder="Choose a service" /></SelectTrigger>
                  <SelectContent>
                    {stylistServices.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.service_name} — ${(s.discount_price ?? s.price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedService && (
              <div className="text-sm font-body text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedService.service_name}</span>
                {" — "}${(selectedService.discount_price ?? selectedService.price).toFixed(2)}
                {" • "}{selectedService.duration_minutes} min
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-primary" /> Select Date
              </Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-xl border border-border pointer-events-auto mx-auto"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" /> Select Time
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(slot => (
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

            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => setStep("stylist")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button variant="hero" className="flex-1" disabled={!date || !time || !selectedService} onClick={() => setStep("contact")}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Contact Info */}
        {step === "contact" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                  <User className="w-4 h-4 text-primary" /> Full Name
                </Label>
                <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                  <Mail className="w-4 h-4 text-primary" /> Email
                </Label>
                <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                  <Phone className="w-4 h-4 text-primary" /> Phone
                </Label>
                <Input type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> Service Address
                </Label>
                <Input placeholder="123 Main St, City, State ZIP" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border" />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-secondary/50 rounded-xl p-4 text-sm font-body space-y-2">
              <p className="font-semibold text-foreground">Order Summary</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{product.title} × {quantity}</span>
                <span className="font-semibold">${(effectivePrice * quantity).toFixed(2)}</span>
              </div>
              {selectedService && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedService.service_name}</span>
                  <span className="font-semibold">${(selectedService.discount_price ?? selectedService.price).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>${((effectivePrice * quantity) + (selectedService?.discount_price ?? selectedService?.price ?? 0)).toFixed(2)}</span>
              </div>
              {date && time && (
                <p className="text-xs text-muted-foreground">
                  {selectedStylist?.full_name} • {format(date, "EEE, MMM d")} at {time}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => setStep("booking")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                disabled={!name.trim() || !email.trim() || !phone.trim() || !address.trim() || submitting}
                onClick={handleSubmitBooking}
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CheckCircle className="w-4 h-4 mr-1" /> Checkout & Pay</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
