
-- Revert view to invoker so it respects RLS and column grants of the caller.
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Lock down column-level SELECT access on profiles for public roles.
REVOKE SELECT ON public.profiles FROM anon, authenticated;

-- Public-safe columns only.
GRANT SELECT (
  id, full_name, avatar_url, city, role, service_category,
  is_approved, is_onboarded, bio, created_at,
  latitude, longitude, show_location
) ON public.profiles TO anon, authenticated;

-- Allow anyone to read approved+onboarded provider rows through the public view.
DROP POLICY IF EXISTS "Public can read approved providers" ON public.profiles;
CREATE POLICY "Public can read approved providers"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (role = 'provider' AND is_onboarded = true AND is_approved = true);
