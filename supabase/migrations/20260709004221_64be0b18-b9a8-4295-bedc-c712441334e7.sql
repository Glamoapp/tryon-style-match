
-- =========================================================
-- 1. Move admin helper functions to a private (non-API) schema
-- =========================================================
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;

-- =========================================================
-- 2. Recreate policies to reference private.is_admin
-- =========================================================
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read visitors" ON public.visitor_logs;
DROP POLICY IF EXISTS "Admin can manage vendor products" ON public.vendor_products;
DROP POLICY IF EXISTS "Admin can manage variants" ON public.vendor_product_variants;
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can insert rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admins can update rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admins can delete rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admins can update stylist locations" ON public.stylist_locations;
DROP POLICY IF EXISTS "Booking parties can read stylist locations" ON public.stylist_locations;
DROP POLICY IF EXISTS "Admins can manage referrals" ON public.stylist_referrals;
DROP POLICY IF EXISTS "Admins can upload reward images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update reward images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete reward images" ON storage.objects;

CREATE POLICY "Admin can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE POLICY "Admin can read visitors" ON public.visitor_logs
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE POLICY "Admin can manage vendor products" ON public.vendor_products
  FOR ALL TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Admin can manage variants" ON public.vendor_product_variants
  FOR ALL TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Admins can read all bookings" ON public.bookings
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE POLICY "Admins can insert rewards" ON public.rewards
  FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Admins can update rewards" ON public.rewards
  FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Admins can delete rewards" ON public.rewards
  FOR DELETE TO authenticated USING (private.is_admin(auth.uid()));
CREATE POLICY "Admins can update stylist locations" ON public.stylist_locations
  FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Booking parties can read stylist locations" ON public.stylist_locations
  FOR SELECT TO authenticated USING (
    private.is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id::text = stylist_locations.booking_id
        AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );
CREATE POLICY "Admins can manage referrals" ON public.stylist_referrals
  FOR ALL TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

CREATE POLICY "Admins can upload reward images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reward-images' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins can update reward images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'reward-images' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins can delete reward images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'reward-images' AND private.is_admin(auth.uid()));

-- Drop old public helpers
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- =========================================================
-- 3. Stop exposing email/phone to anonymous visitors
-- =========================================================
-- Recreate the public_profiles view with security_invoker=false so it runs
-- with the view owner's privileges, bypassing RLS on the base table.
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT
  id,
  full_name,
  avatar_url,
  city,
  role,
  service_category,
  is_approved,
  is_onboarded,
  is_founding_stylist,
  bio,
  created_at,
  CASE WHEN show_location THEN latitude ELSE NULL::double precision END AS latitude,
  CASE WHEN show_location THEN longitude ELSE NULL::double precision END AS longitude,
  show_location
FROM public.profiles
WHERE role = 'provider' AND is_onboarded = true AND is_approved = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Remove the overly broad public policy that exposed email/phone
DROP POLICY IF EXISTS "Public can read approved providers" ON public.profiles;

-- Anonymous users no longer need direct table access; they use the view
REVOKE SELECT ON public.profiles FROM anon;
