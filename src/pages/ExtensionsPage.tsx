import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Loader2, ArrowLeft, Package, Zap, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { VendorProductDialog } from "@/components/VendorProductDialog";

type VendorProduct = {
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
};

const ExtensionsPage = () => {
  const navigate = useNavigate();
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const [selectedVendorProduct, setSelectedVendorProduct] = useState<VendorProduct | null>(null);

  useEffect(() => {
    Promise.all([fetchShopifyProducts(), fetchVendorProducts()]).finally(() => setLoading(false));
  }, []);

  async function fetchShopifyProducts() {
    try {
      const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50 });
      setShopifyProducts(data?.data?.products?.edges || []);
    } catch (err) {
      console.error("Failed to fetch Shopify products:", err);
    }
  }

  async function fetchVendorProducts() {
    try {
      const { data } = await supabase
        .from("vendor_products")
        .select("*, vendor:profiles!vendor_products_vendor_id_fkey(full_name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data) {
        // Fetch active deals for these products
        const productIds = data.map((p: any) => p.id);
        const { data: deals } = await supabase
          .from("vendor_deals")
          .select("*")
          .in("product_id", productIds)
          .eq("is_active", true);

        const dealsMap = new Map<string, any[]>();
        deals?.forEach((d: any) => {
          const existing = dealsMap.get(d.product_id) || [];
          existing.push(d);
          dealsMap.set(d.product_id, existing);
        });

        setVendorProducts(data.map((p: any) => ({ ...p, deals: dealsMap.get(p.id) || [] })));
      }
    } catch (err) {
      console.error("Failed to fetch vendor products:", err);
    }
  }

  const handleAddToCart = async (product: ShopifyProduct) => {
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
    toast.success(`${product.node.title} added to cart`, { position: "top-center" });
  };

  const handleBuyNow = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    navigate("/checkout", {
      state: {
        item: {
          product,
          variantId: variant.id,
          variantTitle: variant.title,
          price: variant.price,
          quantity: 1,
          selectedOptions: variant.selectedOptions || [],
        },
      },
    });
  };

  const getEffectivePrice = (p: VendorProduct) => {
    const deal = p.deals?.[0];
    if (!deal) return p.price;
    if (deal.discount_percent) return p.price * (1 - deal.discount_percent / 100);
    if (deal.discount_amount) return Math.max(0, p.price - deal.discount_amount);
    return p.price;
  };

  const hasProducts = shopifyProducts.length > 0 || vendorProducts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">Shop</span>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-2">
                Hair <span className="text-gradient-rose">Extensions</span> & Products
              </h1>
              <p className="text-muted-foreground mt-4 max-w-lg font-body">
                Premium hair extensions and beauty products from our verified vendors and store.
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !hasProducts ? (
            <div className="text-center py-24">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">No products found</h2>
              <p className="text-muted-foreground font-body max-w-md mx-auto">
                We're stocking up! Products will appear here once they're added.
              </p>
            </div>
          ) : (
            <>
              {/* Vendor Products */}
              {vendorProducts.length > 0 && (
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">From Our Vendors</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vendorProducts.map((product, index) => {
                      const effectivePrice = getEffectivePrice(product);
                      const hasDeal = product.deals && product.deals.length > 0;
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300"
                        >
                          <div className="aspect-square bg-muted overflow-hidden relative">
                            {product.image_urls?.[0] ? (
                              <img src={product.image_urls[0]} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                            {hasDeal && (
                              <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {product.deals![0].deal_title}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-display font-semibold text-foreground line-clamp-2">{product.title}</h3>
                            {(product as any).vendor?.full_name && (
                              <p className="text-xs text-muted-foreground mt-0.5">by {(product as any).vendor.full_name}</p>
                            )}
                            <p className="text-sm text-muted-foreground font-body mt-1 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-foreground font-body">
                                  ${effectivePrice.toFixed(2)}
                                </span>
                                {hasDeal && effectivePrice < product.price && (
                                  <span className="text-sm text-muted-foreground line-through">${Number(product.price).toFixed(2)}</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedVendorProduct(product)}>
                                  <ShoppingCart className="w-4 h-4" /> Add
                                </Button>
                                <Button variant="hero" size="sm" onClick={() => setSelectedVendorProduct(product)}>
                                  <Zap className="w-4 h-4" /> Buy Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shopify Products */}
              {shopifyProducts.length > 0 && (
                <div>
                  {vendorProducts.length > 0 && <h2 className="font-display text-2xl font-bold text-foreground mb-6">From Our Store</h2>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {shopifyProducts.map((product, index) => {
                      const image = product.node.images.edges[0]?.node;
                      const price = product.node.priceRange.minVariantPrice;
                      return (
                        <motion.div
                          key={product.node.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300"
                        >
                          <Link to={`/product/${product.node.handle}`}>
                            <div className="aspect-square bg-muted overflow-hidden">
                              {image ? (
                                <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-12 h-12 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link to={`/product/${product.node.handle}`}>
                              <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {product.node.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground font-body mt-1 line-clamp-2">{product.node.description}</p>
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-lg font-bold text-foreground font-body">
                                ${parseFloat(price.amount).toFixed(2)}
                              </span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleAddToCart(product)} disabled={isCartLoading}>
                                  {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Add</>}
                                </Button>
                                <Button variant="hero" size="sm" onClick={() => handleBuyNow(product)}>
                                  <Zap className="w-4 h-4" /> Buy Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <VendorProductDialog
        product={selectedVendorProduct}
        open={!!selectedVendorProduct}
        onOpenChange={(open) => { if (!open) setSelectedVendorProduct(null); }}
      />
      <Footer />
    </div>
  );
};

export default ExtensionsPage;
