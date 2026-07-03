
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
  bio,
  created_at,
  CASE WHEN show_location THEN latitude ELSE NULL END AS latitude,
  CASE WHEN show_location THEN longitude ELSE NULL END AS longitude,
  show_location
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
