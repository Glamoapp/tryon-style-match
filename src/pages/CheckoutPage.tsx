import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CalendarDays, Zap, Truck, Loader2, MapPin, Package } from "lucide-react";
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
import type { ShopifyProduct } from "@/lib/shopify";

interface CheckoutItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface VendorCheckoutItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  vendor?: string;
  quantity?: number;
  variantLabel?: string;
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item as CheckoutItem | undefined;
  const vendorItem = location.state?.vendorItem as VendorCheckoutItem | undefined;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [deliveryType, setDeliveryType] = useState<"express" | "scheduled">("express");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [checkingOut, setCheckingOut] = useState(false);

  // Pre-fill from auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "");
      }
    });
  }, []);

  const hasItem = !!(item || vendorItem);

  if (!hasItem) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center py-24">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground">No item selected</h1>
          <Link to="/extensions" className="text-primary font-body mt-4 inline-block">← Back to shop</Link>
        </div>
      </div>
    );
  }

  // Normalize values for both item types
  const productTitle = item ? item.product.node.title : vendorItem!.title;
  const unitPrice = item ? parseFloat(item.price.amount) : vendorItem!.price;
  const quantity = item ? item.quantity : (vendorItem!.quantity || 1);
  const imageUrl = item ? item.product.node.images?.edges?.[0]?.node?.url : vendorItem!.image;
  const optionsText = item ? item.selectedOptions.map(o => o.value).join(" • ") : (vendorItem!.vendor ? `by ${vendorItem!.vendor}` : "");

  const expressFee = 9.99;
  const deliveryFee = deliveryType === "express" ? expressFee : 0;
  const subtotal = unitPrice * quantity;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !email.trim() || !address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (deliveryType === "scheduled" && !scheduledDate) {
      toast.error("Please pick a delivery date");
      return;
    }

    setCheckingOut(true);
    try {
      const deliveryNote = deliveryType === "express"
        ? "Express Delivery — 20 minutes"
        : `Scheduled Delivery — ${scheduledDate ? format(scheduledDate, "PPP") : ""}`;

      const { data, error } = await supabase.functions.invoke("unified-checkout", {
        body: {
          products: [
            {
              title: productTitle,
              price: String(unitPrice),
              quantity: quantity,
              imageUrl: imageUrl || null,
            },
            ...(deliveryFee > 0
              ? [{ title: "Express Delivery (20 min)", price: String(expressFee), quantity: 1, imageUrl: null }]
              : []),
          ],
          customerEmail: email,
          customerName: fullName,
          deliveryNote,
          shippingAddress: `${address}, ${city}, ${state} ${zip}`,
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

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">Checkout</h1>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="md:col-span-3 space-y-8">
              {/* Delivery Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Delivery Information
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

              {/* Delivery Options */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" /> Delivery Option
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Express */}
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

                  {/* Scheduled */}
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
            </div>

            {/* Right: Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h2 className="font-display font-bold text-lg text-foreground mb-4">Order Summary</h2>

                <div className="flex gap-4 mb-4 pb-4 border-b border-border">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-body font-semibold text-foreground text-sm truncate">{productTitle}</h3>
                    {optionsText && <p className="text-xs text-muted-foreground font-body">{optionsText}</p>}
                    <p className="text-sm font-bold text-foreground font-body mt-1">
                      ${unitPrice.toFixed(2)} × {quantity}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm font-body mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {deliveryType === "express" ? <Zap className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
                      {deliveryType === "express" ? "Express Delivery" : "Scheduled Delivery"}
                    </span>
                    <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "Free"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center font-display font-bold text-lg text-foreground pt-4 border-t border-border mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {deliveryType === "express" && (
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
