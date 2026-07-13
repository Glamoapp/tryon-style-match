-- Restore public read on public_profiles view (safe: view already filters approved/onboarded providers and hides email/phone).
ALTER VIEW public.public_profiles SET (security_invoker = false);
GRANT SELECT ON public.public_profiles TO anon, authenticated;