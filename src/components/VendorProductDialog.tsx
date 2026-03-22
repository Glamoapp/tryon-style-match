import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Minus, Plus, Zap, ShoppingCart, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  image_urls: string[];
  vendor_id: string;
  vendor?: { full_name: string };
  deals?: { deal_title: string; discount_percent: number | null; discount_amount: number | null }[];
}

interface Props {
  product: VendorProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VendorProductDialog = ({ product, open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && open) {
      setQuantity(1);
      setSelectedLength("");
      setSelectedColor("");
      setSelectedSize("");
      fetchVariants(product.id);
    }
  }, [product, open]);

  async function fetchVariants(productId: string) {
    setLoading(true);
    const { data } = await supabase
      .from("vendor_product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true);
    setVariants(data || []);
    setLoading(false);
  }

  const hasVariants = variants.length > 0;

  const uniqueLengths = useMemo(() => [...new Set(variants.map(v => v.length).filter(Boolean))] as string[], [variants]);
  const uniqueColors = useMemo(() => [...new Set(variants.map(v => v.color).filter(Boolean))] as string[], [variants]);
  const uniqueSizes = useMemo(() => [...new Set(variants.map(v => v.size).filter(Boolean))] as string[], [variants]);

  // Auto-select if only one option
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

  const handleBuyNow = () => {
    if (needsSelection) {
      toast.error("Please select all options", { position: "top-center" });
      return;
    }
    onOpenChange(false);
    navigate("/checkout", {
      state: {
        vendorItem: {
          id: product.id,
          title: product.title,
          price: effectivePrice,
          image: product.image_urls?.[0],
          vendor: product.vendor?.full_name,
          quantity,
          variantLabel: [selectedLength, selectedColor, selectedSize].filter(Boolean).join(" / ") || undefined,
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{product.title}</DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
          {product.image_urls?.[0] ? (
            <img src={product.image_urls[0]} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {product.vendor?.full_name && (
          <p className="text-xs text-muted-foreground">by {product.vendor.full_name}</p>
        )}
        {product.description && (
          <p className="text-sm text-muted-foreground font-body">{product.description}</p>
        )}

        {deal && (
          <Badge variant="destructive" className="w-fit">
            <Tag className="w-3 h-3 mr-1" /> {deal.deal_title}
          </Badge>
        )}

        {/* Variant selectors */}
        {hasVariants && (
          <div className="space-y-4 mt-2">
            {uniqueLengths.length > 0 && (
              <div>
                <Label className="font-body text-sm mb-1.5 block">Length</Label>
                <Select value={selectedLength} onValueChange={setSelectedLength}>
                  <SelectTrigger><SelectValue placeholder="Select length" /></SelectTrigger>
                  <SelectContent>
                    {uniqueLengths.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {uniqueColors.length > 0 && (
              <div>
                <Label className="font-body text-sm mb-1.5 block">Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                  <SelectContent>
                    {uniqueColors.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div>
                <Label className="font-body text-sm mb-1.5 block">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {uniqueSizes.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Quantity */}
        <div className="mt-2">
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

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold text-foreground font-body">${(effectivePrice * quantity).toFixed(2)}</span>
          {deal && effectivePrice < basePrice && (
            <span className="text-sm text-muted-foreground line-through">${(basePrice * quantity).toFixed(2)}</span>
          )}
        </div>

        {outOfStock && (
          <p className="text-sm text-destructive font-body">Only {matchedVariant.inventory_count} in stock</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => { toast.info("Vendor cart coming soon!", { position: "top-center" }); }}>
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </Button>
          <Button variant="hero" className="flex-1" onClick={handleBuyNow} disabled={!!outOfStock}>
            <Zap className="w-4 h-4" /> Buy Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
