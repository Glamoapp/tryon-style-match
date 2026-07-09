
-- Switch the view back to security_invoker so it isn't a SECURITY DEFINER view.
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
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
  is_founding_stylist,
  bio,
  created_at,
  CASE WHEN show_location THEN latitude ELSE NULL::double precision END AS latitude,
  CASE WHEN show_location THEN longitude ELSE NULL::double precision END AS longitude,
  show_location
FROM public.profiles
WHERE role = 'provider' AND is_onboarded = true AND is_approved = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Column-level SELECT for anon: everything the public directory needs,
-- but NEVER email or phone. Since Postgres enforces column privileges,
-- anon literally cannot read those fields even if it tries.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, full_name, avatar_url, city, role, service_category,
  is_approved, is_onboarded, is_founding_stylist, bio, created_at,
  latitude, longitude, show_location
) ON public.profiles TO anon;

-- Restore the row-level policy so approved providers are visible via the view.
DROP POLICY IF EXISTS "Public can read approved providers" ON public.profiles;
CREATE POLICY "Public can read approved providers" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (role = 'provider' AND is_onboarded = true AND is_approved = true);
