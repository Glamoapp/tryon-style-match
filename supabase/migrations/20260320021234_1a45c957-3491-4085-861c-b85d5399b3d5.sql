INSERT INTO storage.buckets (id, name, public) VALUES ('handbook', 'handbook', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read handbook files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'handbook');
CREATE POLICY "Service role can upload handbook files" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'handbook' AND auth.role() = 'service_role');