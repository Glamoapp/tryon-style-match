
-- 1) Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions.
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.enqueue_email(text, jsonb)',
    'public.move_to_dlq(text, text, bigint, jsonb)',
    'public.read_email_batch(text, integer, integer)',
    'public.delete_email(text, bigint)',
    'public.email_queue_wake()',
    'public.email_queue_dispatch()',
    'public.generate_stylist_referral_code()',
    'public.handle_new_user()',
    'public.on_provider_profile_created()'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
  END LOOP;
END $$;

-- 2) Fix service-photos INSERT policy to require folder ownership.
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
