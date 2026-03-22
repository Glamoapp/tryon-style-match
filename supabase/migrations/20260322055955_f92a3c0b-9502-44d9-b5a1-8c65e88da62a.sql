
CREATE TABLE public.vendor_product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.vendor_products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  length TEXT,
  size TEXT,
  color TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active variants" ON public.vendor_product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors can read own variants" ON public.vendor_product_variants FOR SELECT TO authenticated USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can insert own variants" ON public.vendor_product_variants FOR INSERT TO authenticated WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update own variants" ON public.vendor_product_variants FOR UPDATE TO authenticated USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can delete own variants" ON public.vendor_product_variants FOR DELETE TO authenticated USING (auth.uid() = vendor_id);
CREATE POLICY "Admin can manage variants" ON public.vendor_product_variants FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
