import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingBag, Loader2, ShoppingCart, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

const ProductsNearYou = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 12 });
        setProducts(data?.data?.products?.edges || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, product: ShopifyProduct) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleBuyNow = async (e: React.MouseEvent, product: ShopifyProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    const image = product.node.images.edges[0]?.node;
    navigate("/checkout", {
      state: {
        products: [{
          title: product.node.title,
          price: variant.price.amount,
          quantity: 1,
          imageUrl: image?.url || null,
        }],
      },
    });
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                Shop
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Products Near You
            </h2>
          </div>
          <Link to="/extensions">
            <Button variant="ghost" size="sm" className="text-primary font-body">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-6 px-6">
          {products.map((product, index) => {
            const image = product.node.images.edges[0]?.node;
            const price = product.node.priceRange.minVariantPrice;

            return (
              <motion.div
                key={product.node.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="snap-start flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)]"
              >
                <Link
                  to={`/product/${product.node.handle}`}
                  className="group block bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300"
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText || product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.node.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 gap-1">
                      <span className="text-base font-bold text-foreground font-body">
                        ${parseFloat(price.amount).toFixed(2)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isCartLoading}
                        >
                          {isCartLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="w-3 h-3 mr-1" /> Add
                            </>
                          )}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={(e) => handleBuyNow(e, product)}
                        >
                          <Zap className="w-3 h-3 mr-1" /> Buy
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductsNearYou;
