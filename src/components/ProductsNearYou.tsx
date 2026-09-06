import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingBag, Loader2, ShoppingCart, Zap, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const ProductsNearYou = () => {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VendorProduct | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("vendor_products")
          .select("*, vendor:profiles!vendor_products_vendor_id_fkey(full_name)")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (data) {
          const ids = data.map((p: any) => p.id);
          const { data: deals } = await supabase
            .from("vendor_deals")
            .select("*")
            .in("product_id", ids)
            .eq("is_active", true);

          const dealsMap = new Map<string, any[]>();
          deals?.forEach((d: any) => {
            const existing = dealsMap.get(d.product_id) || [];
            existing.push(d);
            dealsMap.set(d.product_id, existing);
          });

          setProducts(data.map((p: any) => ({ ...p, deals: dealsMap.get(p.id) || [] })));
        }
      } catch (err) {
        console.error("Failed to fetch vendor products:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getEffectivePrice = (p: VendorProduct) => {
    const deal = p.deals?.[0];
    if (!deal) return p.price;
    if (deal.discount_percent) return p.price * (1 - deal.discount_percent / 100);
    if (deal.discount_amount) return Math.max(0, p.price - deal.discount_amount);
    return p.price;
  };

  if (loading) {
    return (
      <section className="py-8 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="text-sm md:text-base font-logo font-bold text-primary uppercase tracking-[0.25em]">
                Shop
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-logo font-bold text-foreground uppercase tracking-[0.15em]">
              Hair Extensions Near You
            </h2>
          </div>
          <Link to="/extensions">
            <Button variant="ghost" size="sm" className="text-primary font-body">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-6 px-6">
          {products.map((product, index) => {
            const image = product.image_urls?.[0];
            const effectivePrice = getEffectivePrice(product);
            const hasDeal = product.deals && product.deals.length > 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="snap-start flex-shrink-0 w-[70%] sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)]"
              >
                <div className="group block bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
                  <div className="aspect-square bg-muted overflow-hidden relative">
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    {hasDeal && (
                      <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {product.deals![0].deal_title}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-base font-bold text-foreground font-body">
                          ${Number(effectivePrice).toFixed(2)}
                        </span>
                        {hasDeal && effectivePrice < product.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => setSelected(product)}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" /> Add
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => setSelected(product)}
                        >
                          <Zap className="w-3 h-3 mr-1" /> Buy
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <VendorProductDialog
        product={selected}
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      />
    </section>
  );
};

export default ProductsNearYou;
