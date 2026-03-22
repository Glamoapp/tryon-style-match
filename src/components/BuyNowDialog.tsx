import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Package, Scissors, ArrowRight, ArrowLeft, CalendarIcon, Clock,
  User, MapPin, Loader2, Star, Zap, ShoppingBag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ShopifyProduct } from "@/lib/shopify";

interface Stylist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  service_category: string | null;
  avgRating: number;
}

interface StylistService {
  id: string;
  service_name: string;
  price: number;
  duration_minutes: number;
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

interface Props {
  product: ShopifyProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choice" | "stylists" | "booking";

export const BuyNowDialog = ({ product, open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("choice");
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [services, setServices] = useState<StylistService[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [loadingStylists, setLoadingStylists] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("choice");
      setSelectedStylist(null);
      setServices([]);
      setSelectedService("");
      setDate(undefined);
      setTime("");
      setAddress("");
    }
  }, [open]);

  const productData = product
    ? {
        title: product.node.title,
        price: product.node.variants.edges[0]?.node?.price?.amount || product.node.priceRange.minVariantPrice.amount,
        imageUrl: product.node.images.edges[0]?.node?.url || null,
      }
    : null;

  const goToCheckoutOnly = () => {
    if (!productData) return;
    navigate("/checkout", {
      state: {
        products: [{ title: productData.title, price: productData.price, quantity: 1, imageUrl: productData.imageUrl }],
      },
    });
    onOpenChange(false);
  };

  const fetchStylists = async () => {
    setLoadingStylists(true);
    const { data: providers } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, city, service_category")
      .eq("role", "provider")
      .eq("is_approved", true)
      .eq("is_onboarded", true);

    if (!providers) { setLoadingStylists(false); return; }

    const ids = providers.map((p) => p.id);
    const { data: reviews } = await supabase
      .from("reviews")
      .select("provider_id, rating")
      .in("provider_id", ids);

    const ratingMap: Record<string, { sum: number; count: number }> = {};
    reviews?.forEach((r) => {
      if (!ratingMap[r.provider_id]) ratingMap[r.provider_id] = { sum: 0, count: 0 };
      ratingMap[r.provider_id].sum += r.rating;
      ratingMap[r.provider_id].count += 1;
    });

    setStylists(
      providers.map((p) => ({
        ...p,
        avgRating: ratingMap[p.id] ? ratingMap[p.id].sum / ratingMap[p.id].count : 0,
      }))
    );
    setLoadingStylists(false);
  };

  const fetchStylistServices = async (stylistId: string) => {
    setLoadingServices(true);
    const { data } = await supabase
      .from("provider_services")
      .select("*")
      .eq("provider_id", stylistId)
      .eq("is_active", true);
    setServices(data || []);
    setLoadingServices(false);
  };

  const handlePickStylist = () => {
    fetchStylists();
    setStep("stylists");
  };

  const handleSelectStylist = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    fetchStylistServices(stylist.id);
    setStep("booking");
  };

  const handleProceedToCheckout = () => {
    if (!productData || !selectedStylist || !selectedService || !date || !time) {
      toast.error("Please fill in all booking details");
      return;
    }
    const svc = services.find((s) => s.id === selectedService);
    if (!svc) return;

    navigate("/checkout", {
      state: {
        products: [{ title: productData.title, price: productData.price, quantity: 1, imageUrl: productData.imageUrl }],
        services: [
          {
            serviceName: svc.service_name,
            providerName: selectedStylist.full_name,
            providerAvatarUrl: selectedStylist.avatar_url,
            providerId: selectedStylist.id,
            serviceId: svc.id,
            date: format(date, "EEE, MMM d"),
            time,
            price: svc.price,
          },
        ],
        customerAddress: address,
      },
    });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        {/* Product preview header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {productData?.imageUrl ? (
              <img src={productData.imageUrl} alt={productData.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground" /></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-foreground text-sm truncate">{productData?.title}</h3>
            <p className="text-primary font-bold font-body">${parseFloat(productData?.price || "0").toFixed(2)}</p>
          </div>
        </div>

        {/* Step: Choice */}
        {step === "choice" && (
          <div className="space-y-4 pt-2">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">How would you like to proceed?</DialogTitle>
            </DialogHeader>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 px-4" onClick={goToCheckoutOnly}>
              <ShoppingBag className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-display font-bold text-sm">Buy Product Only</p>
                <p className="text-xs text-muted-foreground font-body">Go straight to checkout</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 px-4 border-primary/30 bg-primary/5" onClick={handlePickStylist}>
              <Scissors className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-display font-bold text-sm">Buy + Book a Stylist</p>
                <p className="text-xs text-muted-foreground font-body">Get it installed by a pro</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
          </div>
        )}

        {/* Step: Stylists */}
        {step === "stylists" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep("choice")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <DialogTitle className="font-display text-lg">Choose a Stylist</DialogTitle>
            </div>
            {loadingStylists ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : stylists.length === 0 ? (
              <p className="text-center text-muted-foreground font-body py-8">No stylists available right now</p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {stylists.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStylist(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <Avatar className="h-12 w-12">
                      {s.avatar_url ? <AvatarImage src={s.avatar_url} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{s.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-foreground truncate">{s.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                        {s.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{s.city}</span>}
                        {s.avgRating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{s.avgRating.toFixed(1)}</span>}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Booking details */}
        {step === "booking" && selectedStylist && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep("stylists")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <DialogTitle className="font-display text-lg">Book with {selectedStylist.full_name}</DialogTitle>
            </div>

            {/* Service select */}
            <div>
              <Label className="font-body text-sm">Select Service</Label>
              {loadingServices ? (
                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
              ) : (
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a service" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.service_name} — ${s.price.toFixed(2)} ({s.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date */}
            <div>
              <Label className="font-body text-sm">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-1 font-body">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div>
              <Label className="font-body text-sm">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div>
              <Label className="font-body text-sm">Your Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Where should the stylist come?" className="mt-1" />
            </div>

            {/* Summary */}
            {selectedService && (
              <div className="bg-muted/50 rounded-xl p-3 text-sm font-body space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-bold">${parseFloat(productData?.price || "0").toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-bold">${services.find((s) => s.id === selectedService)?.price.toFixed(2)}</span></div>
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">
                    ${(parseFloat(productData?.price || "0") + (services.find((s) => s.id === selectedService)?.price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button variant="hero" className="w-full" onClick={handleProceedToCheckout} disabled={!selectedService || !date || !time}>
              <Zap className="w-4 h-4 mr-2" /> Proceed to Checkout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
