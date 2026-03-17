ALTER TABLE public.provider_services 
ADD COLUMN discount_price numeric DEFAULT NULL,
ADD COLUMN discount_badge text DEFAULT NULL;