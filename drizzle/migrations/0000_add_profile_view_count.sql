ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, avatar_url, city, role, service_category, is_approved, is_onboarded, is_founding_stylist, bio, created_at,
  CASE WHEN show_location THEN latitude ELSE NULL::double precision END AS latitude,
  CASE WHEN show_location THEN longitude ELSE NULL::double precision END AS longitude,
  show_location,
  view_count
FROM public.profiles
WHERE role = 'provider'::text AND is_onboarded = true AND is_approved = true;

CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles SET view_count = view_count + 1 WHERE id = profile_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_profile_views(uuid) TO anon, authenticated;