
-- PROFILES: hide PII from other users
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT
  id,
  full_name,
  avatar_url,
  city,
  role,
  service_category,
  is_approved,
  is_onboarded,
  bio,
  created_at,
  CASE WHEN show_location THEN latitude ELSE NULL END AS latitude,
  CASE WHEN show_location THEN longitude ELSE NULL END AS longitude,
  show_location
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- REWARDS: admin-only writes
DROP POLICY IF EXISTS "Authenticated users can insert rewards" ON public.rewards;
DROP POLICY IF EXISTS "Authenticated users can update rewards" ON public.rewards;
DROP POLICY IF EXISTS "Authenticated users can delete rewards" ON public.rewards;

CREATE POLICY "Admins can insert rewards"
  ON public.rewards FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update rewards"
  ON public.rewards FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete rewards"
  ON public.rewards FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- STYLIST_LOCATIONS: server-only writes
DROP POLICY IF EXISTS "Anyone can insert stylist locations" ON public.stylist_locations;
DROP POLICY IF EXISTS "Anyone can update stylist locations" ON public.stylist_locations;

CREATE POLICY "Service role can insert stylist locations"
  ON public.stylist_locations FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "Service role can update stylist locations"
  ON public.stylist_locations FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Admins can update stylist locations"
  ON public.stylist_locations FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- VISITOR_LOGS: server-only insert, drop from realtime
DROP POLICY IF EXISTS "Service role can insert visitors" ON public.visitor_logs;
CREATE POLICY "Service role can insert visitor logs"
  ON public.visitor_logs FOR INSERT TO service_role
  WITH CHECK (true);
ALTER PUBLICATION supabase_realtime DROP TABLE public.visitor_logs;

-- STORAGE: remove public listing (public URLs still work)
DROP POLICY IF EXISTS "Anyone can read photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read reward images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read handbook files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read vendor product images" ON storage.objects;

-- STORAGE: vendor-products folder-based ownership
DROP POLICY IF EXISTS "Vendors can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete own product images" ON storage.objects;

CREATE POLICY "Vendors can upload own product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vendor-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Vendors can update own product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vendor-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Vendors can delete own product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'vendor-products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- STORAGE: reward-images admin-only writes
DROP POLICY IF EXISTS "Authenticated users can upload reward images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update reward images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete reward images" ON storage.objects;

CREATE POLICY "Admins can upload reward images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reward-images' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can update reward images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'reward-images' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete reward images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'reward-images' AND public.is_admin(auth.uid()));

-- FUNCTIONS: fix search_path and restrict EXECUTE
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
