
GRANT SELECT ON public.provider_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_services TO authenticated;
GRANT ALL ON public.provider_services TO service_role;

GRANT SELECT ON public.service_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_photos TO authenticated;
GRANT ALL ON public.service_photos TO service_role;
