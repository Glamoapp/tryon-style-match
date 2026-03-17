
-- Visitor tracking table
CREATE TABLE public.visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision,
  user_agent text,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: service role can insert/read, admin can read
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert visitors"
  ON public.visitor_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin can read visitors"
  ON public.visitor_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Push subscription table for admin
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for visitor_logs so admin dashboard updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_logs;
