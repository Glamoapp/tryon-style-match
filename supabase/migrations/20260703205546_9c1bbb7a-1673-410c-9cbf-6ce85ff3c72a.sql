-- Allow public (anon) read access to provider services, service photos, and reviews
GRANT SELECT ON public.provider_services TO anon;
GRANT SELECT ON public.service_photos TO anon;
GRANT SELECT ON public.reviews TO anon;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='provider_services' AND policyname='Public can view provider services') THEN
    CREATE POLICY "Public can view provider services" ON public.provider_services FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_photos' AND policyname='Public can view service photos') THEN
    CREATE POLICY "Public can view service photos" ON public.service_photos FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Public can view reviews') THEN
    CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;