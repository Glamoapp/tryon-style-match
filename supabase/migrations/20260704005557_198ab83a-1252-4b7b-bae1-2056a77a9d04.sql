ALTER TABLE public.provider_services
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS provider_services_provider_active_deleted_idx
ON public.provider_services (provider_id, is_active, deleted_at);