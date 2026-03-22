import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Scissors, Package, Calendar, Sparkles, CheckCircle, Tag, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { applyDiscountCode, removeDiscountCode } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCrossSell, setShowCrossSell] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const {
    items, serviceItems, vendorItems, isLoading, isSyncing, justAdded,
    updateQuantity, removeItem, removeServiceItem,
    updateVendorQuantity, removeVendorItem,
    syncCart, hasProducts, hasServices, hasVendorProducts, clearJustAdded,
  } = useCartStore();

  const totalProductItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalVendorItems = vendorItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalServiceItems = serviceItems.length;
  const totalItems = totalProductItems + totalVendorItems + totalServiceItems;

  const productTotal = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceTotal = serviceItems.reduce((sum, svc) => sum + svc.price, 0);
  const totalPrice = productTotal + vendorTotal + serviceTotal;

  // Auto-open cart when an item is added (Amazon-style)
  useEffect(() => {
    if (justAdded) {
      setIsOpen(true);
    }
  }, [justAdded]);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  // Clear justAdded when drawer closes
  useEffect(() => {
    if (!isOpen && justAdded) {
      const timeout = setTimeout(() => clearJustAdded(), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, justAdded, clearJustAdded]);

  const handleCheckout = async () => {
    const onlyProducts = hasProducts() && !hasServices();
    const onlyServices = hasServices() && !hasProducts();

    if (onlyProducts || onlyServices) {
      setShowCrossSell(true);
      return;
    }

    await processCheckout();
  };

  const processCheckout = async () => {
    setCheckingOut(true);
    setShowCrossSell(false);

    try {
      const products = items.map(item => ({
        title: item.product.node.title,
        price: item.price.amount,
        quantity: item.quantity,
        imageUrl: item.product.node.images?.edges?.[0]?.node?.url || null,
      }));

      const services = serviceItems.map(svc => ({
        serviceName: svc.serviceName,
        providerName: svc.providerName,
        date: svc.date,
        time: svc.time,
        price: svc.price,
      }));

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke("unified-checkout", {
        body: {
          products: products.length > 0 ? products : undefined,
          services: services.length > 0 ? services : undefined,
          customerEmail: user?.email || serviceItems[0]?.email || "",
          customerName: user?.user_metadata?.full_name || serviceItems[0]?.customerName || "",
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        setIsOpen(false);
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

  const handleCrossSellAction = () => {
    setShowCrossSell(false);
    setIsOpen(false);

    if (hasProducts() && !hasServices()) {
      navigate("/stylists");
    } else if (hasServices() && !hasProducts()) {
      navigate("/extensions");
    }
  };

  const crossSellType = hasProducts() && !hasServices() ? "service" : "product";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="font-display">Shopping Cart</SheetTitle>
            <SheetDescription>
              {totalItems === 0
                ? "Your cart is empty"
                : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col flex-1 pt-4 min-h-0">
            {/* Amazon-style "Added to Cart" confirmation banner */}
            {justAdded && (
              <div className="flex gap-3 p-3 mb-4 rounded-xl border-2 border-green-500/30 bg-green-500/5 animate-in slide-in-from-top-2 duration-300">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {justAdded.product.node.images?.edges?.[0]?.node && (
                    <img
                      src={justAdded.product.node.images.edges[0].node.url}
                      alt={justAdded.product.node.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-600 font-body">Added to Cart</span>
                  </div>
                  <p className="text-sm font-medium text-foreground font-body truncate">{justAdded.product.node.title}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {justAdded.selectedOptions?.map(o => o.value).join(' • ')} — Qty: {justAdded.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground font-body flex-shrink-0">
                  ${parseFloat(justAdded.price.amount).toFixed(2)}
                </p>
              </div>
            )}

            {totalItems === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body">Your cart is empty</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="hero" onClick={() => { setIsOpen(false); navigate("/extensions"); }}>
                      <Package className="w-4 h-4 mr-2" /> Shop Hair Extensions
                    </Button>
                    <Button variant="outline" onClick={() => { setIsOpen(false); navigate("/stylists"); }}>
                      <Scissors className="w-4 h-4 mr-2" /> Book a Stylist
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                  <div className="space-y-4">
                    {/* Service items */}
                    {serviceItems.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground font-body">
                          <Scissors className="w-4 h-4 text-primary" />
                          Services
                        </div>
                        {serviceItems.map((svc) => (
                          <div key={svc.id} className="flex gap-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-body font-medium truncate text-foreground text-sm">{svc.serviceName}</h4>
                              <p className="text-xs text-muted-foreground font-body">
                                {svc.providerName} • {svc.date} at {svc.time}
                              </p>
                              <p className="font-semibold text-foreground font-body text-sm">${svc.price.toFixed(2)}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeServiceItem(svc.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Product items */}
                    {items.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground font-body">
                          <Package className="w-4 h-4 text-primary" />
                          Products
                        </div>
                        {items.map((item) => (
                          <div key={item.variantId} className="flex gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                            {/* Product image */}
                            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {item.product.node.images?.edges?.[0]?.node ? (
                                <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            {/* Product details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-body font-semibold text-foreground text-sm leading-tight line-clamp-2">{item.product.node.title}</h4>
                              {item.selectedOptions.length > 0 && (
                                <p className="text-xs text-muted-foreground font-body mt-0.5">{item.selectedOptions.map(o => o.value).join(' • ')}</p>
                              )}
                              <p className="font-bold text-foreground font-body text-base mt-1">${(parseFloat(item.price.amount) * item.quantity).toFixed(2)}</p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-muted-foreground font-body">${parseFloat(item.price.amount).toFixed(2)} each</p>
                              )}
                              {/* Quantity controls inline */}
                              <div className="flex items-center gap-2 mt-2">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold font-body">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="ml-auto text-xs text-destructive hover:text-destructive h-7 px-2" onClick={() => removeItem(item.variantId)}>
                                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Discount code */}
                <div className="flex-shrink-0 pt-3">
                  {appliedDiscount ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-sm font-body font-semibold text-foreground flex-1">{appliedDiscount}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={async () => {
                          const cartId = useCartStore.getState().cartId;
                          if (cartId) await removeDiscountCode(cartId);
                          setAppliedDiscount(null);
                          setDiscountCode("");
                          toast.info("Discount removed");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        className="text-sm font-body"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 whitespace-nowrap"
                        disabled={!discountCode.trim() || applyingDiscount}
                        onClick={async () => {
                          const cartId = useCartStore.getState().cartId;
                          if (!cartId) { toast.error("Add items to cart first"); return; }
                          setApplyingDiscount(true);
                          const result = await applyDiscountCode(cartId, discountCode.trim());
                          setApplyingDiscount(false);
                          if (result.success && result.applicable) {
                            setAppliedDiscount(discountCode.trim());
                            toast.success(`Discount "${discountCode.trim()}" applied!`);
                          } else if (result.success && !result.applicable) {
                            toast.error("This code is not applicable to your cart");
                          } else {
                            toast.error(result.error || "Invalid discount code");
                          }
                        }}
                      >
                        {applyingDiscount ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totals & checkout */}
                <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border bg-background">
                  {(hasProducts() && hasServices()) && (
                    <div className="space-y-1 text-sm font-body">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Products</span>
                        <span>${productTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Services</span>
                        <span>${serviceTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm font-body text-primary">
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Discount</span>
                      <span>Applied at checkout</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-display font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold font-body text-foreground">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button
                    variant="hero"
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                    disabled={totalItems === 0 || isLoading || isSyncing || checkingOut}
                  >
                    {isLoading || isSyncing || checkingOut
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><ExternalLink className="w-4 h-4 mr-2" />Proceed to Checkout — ${totalPrice.toFixed(2)}</>}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cross-sell dialog */}
      <Dialog open={showCrossSell} onOpenChange={setShowCrossSell}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {crossSellType === "service"
                ? "Complete Your Look?"
                : "Get the Perfect Hair?"}
            </DialogTitle>
            <DialogDescription className="font-body">
              {crossSellType === "service"
                ? "Want a professional stylist to install your hair extensions? Book a service and get the full experience!"
                : "Need premium hair extensions for your styling appointment? Browse our collection for the perfect match."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button variant="hero" onClick={handleCrossSellAction}>
              {crossSellType === "service"
                ? <><Scissors className="w-4 h-4 mr-2" />Browse Stylists</>
                : <><Package className="w-4 h-4 mr-2" />Shop Extensions</>}
            </Button>
            <Button variant="outline" onClick={processCheckout} disabled={checkingOut}>
              {checkingOut
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : "No thanks, checkout now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
