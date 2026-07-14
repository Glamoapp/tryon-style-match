
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_credit numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signup_credit_unlocks_at timestamptz;

CREATE OR REPLACE FUNCTION public.grant_signup_credit_on_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
     SET signup_credit = COALESCE(signup_credit, 0) + 5,
         signup_credit_unlocks_at = COALESCE(signup_credit_unlocks_at, now() + interval '60 days')
   WHERE id = NEW.referred_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_signup_credit ON public.stylist_referrals;
CREATE TRIGGER trg_grant_signup_credit
AFTER INSERT ON public.stylist_referrals
FOR EACH ROW EXECUTE FUNCTION public.grant_signup_credit_on_referral();
