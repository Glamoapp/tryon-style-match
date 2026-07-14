DROP POLICY IF EXISTS "Public can read approved providers" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read approved providers" ON public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;