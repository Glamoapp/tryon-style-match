
-- 1) Convert public_profiles view to SECURITY INVOKER
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- 2) Revoke EXECUTE from authenticated/anon on sensitive SECURITY DEFINER email/queue functions
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_stylist_referral_code() FROM PUBLIC, anon, authenticated;

-- 3) Replace hardcoded is_admin with a proper user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Seed existing admin from the previously hardcoded email
INSERT INTO public.user_roles (user_id, role)
VALUES ('2df21578-2474-4009-9d96-cec9100d357b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Rewrite is_admin to use user_roles instead of hardcoded email
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

-- 4) customer_points: remove client-side INSERT/UPDATE; only service_role may mutate
DROP POLICY IF EXISTS "System can insert points" ON public.customer_points;
DROP POLICY IF EXISTS "System can update points" ON public.customer_points;
-- SELECT policy already scopes to owner; leave it in place.

-- 5) point_transactions: remove client-side INSERT; only service_role may write
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.point_transactions;

-- 6) notifications: tighten INSERT so a user can only create a notification for themselves,
--    or for the counter-party of a booking they participate in. Service role bypasses RLS.
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert scoped notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR (
      related_booking_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = related_booking_id
          AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid())
          AND (notifications.user_id = b.customer_id OR notifications.user_id = b.provider_id)
      )
    )
  );

-- 7) stylist_locations: restrict SELECT to customer/provider on the linked booking (or admin/service_role)
DROP POLICY IF EXISTS "Anyone can read stylist locations" ON public.stylist_locations;
CREATE POLICY "Booking parties can read stylist locations" ON public.stylist_locations
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id::text = stylist_locations.booking_id
        AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );
