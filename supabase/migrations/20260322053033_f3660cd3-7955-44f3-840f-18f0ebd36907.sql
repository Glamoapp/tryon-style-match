
-- Vendor products table
CREATE TABLE public.vendor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  category TEXT DEFAULT 'Hair Extensions',
  image_urls TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vendor deals table
CREATE TABLE public.vendor_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.vendor_products(id) ON DELETE CASCADE NOT NULL,
  deal_title TEXT NOT NULL,
  discount_percent NUMERIC,
  discount_amount NUMERIC,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_deals ENABLE ROW LEVEL SECURITY;

-- Vendor products RLS
CREATE POLICY "Anyone can read active vendor products" ON public.vendor_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can read own products" ON public.vendor_products
  FOR SELECT TO authenticated USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert own products" ON public.vendor_products
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = vendor_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'vendor' AND is_approved = true)
  );

CREATE POLICY "Vendors can update own products" ON public.vendor_products
  FOR UPDATE TO authenticated USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own products" ON public.vendor_products
  FOR DELETE TO authenticated USING (auth.uid() = vendor_id);

-- Admin can manage all vendor products
CREATE POLICY "Admin can manage vendor products" ON public.vendor_products
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Vendor deals RLS
CREATE POLICY "Anyone can read active deals" ON public.vendor_deals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can read own deals" ON public.vendor_deals
  FOR SELECT TO authenticated USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert own deals" ON public.vendor_deals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own deals" ON public.vendor_deals
  FOR UPDATE TO authenticated USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own deals" ON public.vendor_deals
  FOR DELETE TO authenticated USING (auth.uid() = vendor_id);

-- Storage bucket for vendor product images
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-products', 'vendor-products', true);

-- Storage RLS for vendor-products bucket
CREATE POLICY "Anyone can read vendor product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'vendor-products');

CREATE POLICY "Vendors can upload product images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vendor-products');

CREATE POLICY "Vendors can delete own product images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'vendor-products');
