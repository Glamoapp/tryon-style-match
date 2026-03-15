import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Scissors, Package, Calendar, Sparkles } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCrossSell, setShowCrossSell] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const {
    items, serviceItems, isLoading, isSyncing,
    updateQuantity, removeItem, removeServiceItem,
    syncCart, hasProducts, hasServices,
  } = useCartStore();

  const totalProductItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalServiceItems = serviceItems.length;
  const totalItems = totalProductItems + totalServiceItems;

  const productTotal = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const serviceTotal = serviceItems.reduce((sum, svc) => sum + svc.price, 0);
  const totalPrice = productTotal + serviceTotal;

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = async () => {
    // Show cross-sell dialog before proceeding
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

      // Get user email
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
      // Products only → go to stylists page to book
      navigate("/stylists");
    } else if (hasServices() && !hasProducts()) {
      // Services only → go to extensions page to shop
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
          <div className="flex flex-col flex-1 pt-6 min-h-0">
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
                          <div key={item.variantId} className="flex gap-4 p-2 rounded-xl bg-secondary/30">
                            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {item.product.node.images?.edges?.[0]?.node && (
                                <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-body font-medium truncate text-foreground">{item.product.node.title}</h4>
                              <p className="text-sm text-muted-foreground font-body">{item.selectedOptions.map(o => o.value).join(' • ')}</p>
                              <p className="font-semibold text-foreground font-body">${parseFloat(item.price.amount).toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.variantId)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                      : <><ExternalLink className="w-4 h-4 mr-2" />Checkout — ${totalPrice.toFixed(2)}</>}
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
