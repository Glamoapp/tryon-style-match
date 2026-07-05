
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_founding_stylist boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_free_until timestamptz,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code text;

CREATE TABLE IF NOT EXISTS public.stylist_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'signed_up',
  reward_amount numeric(10,2) NOT NULL DEFAULT 25.00,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

GRANT SELECT, INSERT, UPDATE ON public.stylist_referrals TO authenticated;
GRANT ALL ON public.stylist_referrals TO service_role;

ALTER TABLE public.stylist_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON public.stylist_referrals;
CREATE POLICY "Users can view own referrals" ON public.stylist_referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

DROP POLICY IF EXISTS "System can insert referrals" ON public.stylist_referrals;
CREATE POLICY "System can insert referrals" ON public.stylist_referrals
  FOR INSERT TO authenticated
  WITH CHECK (referred_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage referrals" ON public.stylist_referrals;
CREATE POLICY "Admins can manage referrals" ON public.stylist_referrals
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Random 8-char code generator with collision retry
CREATE OR REPLACE FUNCTION public.generate_stylist_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_provider_profile_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider_count int;
BEGIN
  IF NEW.role = 'provider' THEN
    IF NEW.referral_code IS NULL THEN
      NEW.referral_code := public.generate_stylist_referral_code();
    END IF;
    IF NEW.commission_free_until IS NULL THEN
      NEW.commission_free_until := now() + interval '90 days';
    END IF;
    SELECT count(*) INTO provider_count FROM public.profiles WHERE role = 'provider';
    IF provider_count < 100 THEN
      NEW.is_founding_stylist := true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_provider_profile_created ON public.profiles;
CREATE TRIGGER trg_on_provider_profile_created
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_provider_profile_created();

-- Backfill existing providers with unique random codes
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE role = 'provider' AND referral_code IS NULL LOOP
    UPDATE public.profiles SET referral_code = public.generate_stylist_referral_code() WHERE id = r.id;
  END LOOP;
END $$;

UPDATE public.profiles
SET commission_free_until = created_at + interval '90 days'
WHERE role = 'provider' AND commission_free_until IS NULL;

WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC) AS rn
  FROM public.profiles WHERE role = 'provider'
)
UPDATE public.profiles p
SET is_founding_stylist = true
FROM ranked r
WHERE p.id = r.id AND r.rn <= 100;
