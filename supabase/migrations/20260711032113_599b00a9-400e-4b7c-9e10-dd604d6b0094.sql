-- Remove anon access to the profiles table entirely so email/phone can't be read publicly.
DROP POLICY IF EXISTS "Public can read approved providers" ON public.profiles;

CREATE POLICY "Authenticated can read approved providers"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'provider' AND is_onboarded = true AND is_approved = true);

REVOKE SELECT ON public.profiles FROM anon;

-- Ensure the safe public view is readable by anon and authenticated for the public directory.
GRANT SELECT ON public.public_profiles TO anon, authenticated;