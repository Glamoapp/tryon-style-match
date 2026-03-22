import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CalendarDays, Zap, Truck, Loader2, MapPin, Package, Scissors, User, Star, CreditCard, Smartphone, DollarSign } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";

interface CheckoutProduct {
  title: string;
  price: string;
  quantity: number;
  imageUrl: string | null;
}

interface CheckoutService {
  serviceName: string;
  providerName: string;
  providerAvatarUrl?: string | null;
  date: string;
  time: string;
  price: number;
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data can come from location.state or from the cart store
  const stateProducts = location.state?.products as CheckoutProduct[] | undefined;
  const stateServices = location.state?.services as CheckoutService[] | undefined;
  const fromCart = location.state?.fromCart as boolean | undefined;

  const {
    items, serviceItems, vendorItems,
    removeItem, removeServiceItem, removeVendorItem,
    updateQuantity, updateVendorQuantity,
  } = useCartStore();

  // Build unified product/service lists
  const products: CheckoutProduct[] = fromCart
    ? [
        ...items.map(item => ({
          title: item.product.node.title,
          price: item.price.amount,
          quantity: item.quantity,
          imageUrl: item.product.node.images?.edges?.[0]?.node?.url || null,
        })),
        ...vendorItems.map(item => ({
          title: item.title,
          price: String(item.price),
          quantity: item.quantity,
          imageUrl: item.image || null,
        })),
      ]
    : stateProducts || [];

  const services: CheckoutService[] = fromCart
    ? serviceItems.map(svc => ({
        serviceName: svc.serviceName,
        providerName: svc.providerName,
        date: svc.date,
        time: svc.time,
        price: svc.price,
      }))
    : stateServices || [];

  const [fullName, setFullName] = useState(location.state?.customerName || "");
  const [email, setEmail] = useState(location.state?.customerEmail || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [deliveryType, setDeliveryType] = useState<"express" | "scheduled">("express");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "cash_app">("card");

  const hasPhysicalProducts = products.length > 0;
  const hasServices = services.length > 0;
  const hasItems = hasPhysicalProducts || hasServices;

  // Pre-fill from auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        if (!email) setEmail(user.email || "");
        if (!fullName) setFullName(user.user_metadata?.full_name || "");
      }
    });
  }, []);

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center py-24">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground">No items to checkout</h1>
          <Link to="/extensions" className="text-primary font-body mt-4 inline-block">← Back to shop</Link>
        </div>
      </div>
    );
  }

  const expressFee = hasPhysicalProducts ? 9.99 : 0;
  const deliveryFee = hasPhysicalProducts && deliveryType === "express" ? expressFee : 0;
  const productSubtotal = products.reduce((sum, p) => sum + parseFloat(p.price) * p.quantity, 0);
  const serviceSubtotal = services.reduce((sum, s) => sum + s.price, 0);
  const subtotal = productSubtotal + serviceSubtotal;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in your name and email");
      return;
    }
    if (hasPhysicalProducts && (!address.trim() || !city.trim() || !state.trim() || !zip.trim())) {
      toast.error("Please fill in your delivery address");
      return;
    }
    if (hasPhysicalProducts && deliveryType === "scheduled" && !scheduledDate) {
      toast.error("Please pick a delivery date");
      return;
    }

    setCheckingOut(true);
    try {
      const allProducts = [
        ...products,
        ...(deliveryFee > 0
          ? [{ title: "Express Delivery (20 min)", price: String(expressFee), quantity: 1, imageUrl: null }]
          : []),
      ];

      const { data, error } = await supabase.functions.invoke("unified-checkout", {
        body: {
          products: allProducts.length > 0 ? allProducts : undefined,
          services: services.length > 0 ? services : undefined,
          customerEmail: email,
          customerName: fullName,
          shippingAddress: hasPhysicalProducts ? `${address}, ${city}, ${state} ${zip}` : undefined,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link to="/extensions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">Review Your Order</h1>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="md:col-span-3 space-y-8">
              {/* Contact Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Your Information
                </h2>
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="font-body text-sm">Full Name *</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-body text-sm">Email *</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="font-body text-sm">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className="mt-1" />
                  </div>
                </div>
              </motion.div>

              {/* Delivery Address — only for physical products */}
              {hasPhysicalProducts && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="address" className="font-body text-sm">Street Address *</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Apt 4" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="font-body text-sm">City *</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="state" className="font-body text-sm">State *</Label>
                        <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="zip" className="font-body text-sm">ZIP *</Label>
                        <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="12345" className="mt-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Delivery Options — only for physical products */}
              {hasPhysicalProducts && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> Delivery Option
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setDeliveryType("express")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        deliveryType === "express"
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-foreground">Express</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-body">Delivered in ~20 minutes</p>
                      <p className="text-sm font-semibold text-primary font-body mt-1">+ ${expressFee.toFixed(2)}</p>
                    </button>

                    <button
                      onClick={() => setDeliveryType("scheduled")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        deliveryType === "scheduled"
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-foreground">Scheduled</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-body">Pick a delivery date</p>
                      <p className="text-sm font-semibold text-primary font-body mt-1">Free</p>
                    </button>
                  </div>

                  {deliveryType === "scheduled" && (
                    <div className="mt-4">
                      <Label className="font-body text-sm mb-1 block">Select Delivery Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-body">
                            <CalendarDays className="w-4 h-4 mr-2" />
                            {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right: Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h2 className="font-display font-bold text-lg text-foreground mb-4">Order Summary</h2>

                {/* Products */}
                {products.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Package className="w-3 h-3" /> Products
                    </p>
                    {products.map((p, i) => (
                      <div key={i} className="flex gap-3 pb-3 border-b border-border last:border-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground" /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-body font-semibold text-foreground text-sm truncate">{p.title}</h3>
                          <p className="text-xs text-muted-foreground font-body">Qty: {p.quantity}</p>
                          <p className="text-sm font-bold text-foreground font-body">${(parseFloat(p.price) * p.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Services */}
                {services.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> Services
                    </p>
                    {services.map((s, i) => (
                      <div key={i} className="pb-3 border-b border-border last:border-0">
                        <h3 className="font-body font-semibold text-foreground text-sm">{s.serviceName}</h3>
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                          <Star className="w-3 h-3" /> {s.providerName}
                        </p>
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {s.date} at {s.time}
                        </p>
                        <p className="text-sm font-bold text-foreground font-body mt-1">${s.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 text-sm font-body mb-4 pt-2 border-t border-border">
                  {hasPhysicalProducts && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Products</span>
                      <span>${productSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  {hasServices && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Services</span>
                      <span>${serviceSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  {hasPhysicalProducts && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {deliveryType === "express" ? <Zap className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
                        {deliveryType === "express" ? "Express Delivery" : "Scheduled Delivery"}
                      </span>
                      <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "Free"}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center font-display font-bold text-lg text-foreground pt-4 border-t border-border mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {hasPhysicalProducts && deliveryType === "express" && (
                  <div className="flex items-center gap-2 bg-primary/5 rounded-xl p-3 mb-4">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground font-body">Estimated arrival in ~20 minutes</span>
                  </div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={checkingOut}
                >
                  {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay $${total.toFixed(2)}`}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
