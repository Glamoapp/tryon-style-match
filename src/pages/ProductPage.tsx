import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Loader2, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id title description handle
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 5) { edges { node { url altText } } }
      variants(first: 20) {
        edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } }
      }
      options { name values }
    }
  }
`;

const ProductPage = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        if (data?.data?.productByHandle) {
          setProduct({ node: data.data.productByHandle });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [handle]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 text-center py-24">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground">Product not found</h1>
        <Link to="/extensions" className="text-primary font-body mt-4 inline-block">← Back to shop</Link>
      </div>
    </div>
  );

  const images = product.node.images.edges;
  const variants = product.node.variants.edges;
  const selectedVariant = variants[selectedVariantIdx]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success(`${product.node.title} added to cart`, { position: "top-center" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Link to="/extensions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Extensions
          </Link>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden mb-4">
                {images[selectedImage] ? (
                  <img src={images[selectedImage].node.url} alt={images[selectedImage].node.altText || product.node.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-muted-foreground" /></div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-primary' : 'border-border'}`}>
                      <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">{product.node.title}</h1>
              <p className="text-2xl font-bold text-primary font-body mt-3">
                ${parseFloat(selectedVariant?.price.amount || product.node.priceRange.minVariantPrice.amount).toFixed(2)}
              </p>
              <p className="text-muted-foreground font-body mt-4 leading-relaxed">{product.node.description}</p>

              {/* Variants */}
              {variants.length > 1 && (
                <div className="mt-6">
                  <label className="text-sm font-semibold text-foreground font-body">Options</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variants.map((v, i) => (
                      <button
                        key={v.node.id}
                        onClick={() => setSelectedVariantIdx(i)}
                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-all ${
                          i === selectedVariantIdx
                            ? 'bg-primary text-primary-foreground shadow-soft'
                            : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                        }`}
                      >
                        {v.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <Button variant="outline" size="lg" className="flex-1" onClick={handleAddToCart} disabled={isCartLoading || !selectedVariant?.availableForSale}>
                  {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </Button>
                <Button variant="hero" size="lg" className="flex-1" onClick={() => {
                  if (!selectedVariant) return;
                  navigate("/checkout", {
                    state: {
                      item: {
                        product,
                        variantId: selectedVariant.id,
                        variantTitle: selectedVariant.title,
                        price: selectedVariant.price,
                        quantity: 1,
                        selectedOptions: selectedVariant.selectedOptions || [],
                      },
                    },
                  });
                }} disabled={!selectedVariant?.availableForSale}>
                  <Zap className="w-5 h-5" /> Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
