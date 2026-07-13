-- Revert to security_invoker view and enforce column-level grants on profiles (email/phone stay unreadable to anon/authenticated public reads).
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Column-level SELECT on profiles for the columns the public directory needs.
-- Email and phone are intentionally EXCLUDED.
GRANT SELECT (
  id, full_name, avatar_url, city, role, service_category,
  is_approved, is_onboarded, is_founding_stylist, bio, created_at,
  latitude, longitude, show_location
) ON public.profiles TO anon, authenticated;

-- Ensure a policy exists that lets anon/authenticated see approved provider rows (needed under security_invoker).
DROP POLICY IF EXISTS "Public can read approved providers" ON public.profiles;
CREATE POLICY "Public can read approved providers"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (role = 'provider' AND is_onboarded = true AND is_approved = true);