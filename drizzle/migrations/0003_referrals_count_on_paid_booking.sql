ALTER TABLE public.customer_referrals ADD COLUMN qualified_at timestamptz;

-- Signing up only links the friend; the reward is earned when they pay for a booking.
CREATE OR REPLACE FUNCTION public.claim_customer_referral(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  clean_code text := upper(trim(coalesce(_code, '')));
  ref_id uuid;
  account_created timestamptz;
  inserted_id uuid;
BEGIN
  IF uid IS NULL OR clean_code = '' THEN
    RETURN false;
  END IF;

  SELECT id INTO ref_id FROM public.profiles WHERE referral_code = clean_code;
  IF ref_id IS NULL OR ref_id = uid THEN
    RETURN false;
  END IF;

  SELECT created_at INTO account_created FROM public.profiles WHERE id = uid;
  IF account_created IS NULL OR account_created < now() - interval '7 days' THEN
    RETURN false;
  END IF;

  INSERT INTO public.customer_referrals (referrer_id, referred_id, referral_code)
  VALUES (ref_id, uid, clean_code)
  ON CONFLICT (referred_id) DO NOTHING
  RETURNING id INTO inserted_id;

  RETURN inserted_id IS NOT NULL;
END;
$$;

-- When a referred friend's booking is paid, count them; every 5th counted friend earns a free service.
CREATE OR REPLACE FUNCTION public.qualify_referral_on_paid_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_row public.customer_referrals%ROWTYPE;
  qualified_count int;
BEGIN
  IF NEW.payment_intent_id IS NULL OR NEW.status IN ('rejected', 'cancelled') THEN
    RETURN NEW;
  END IF;

  UPDATE public.customer_referrals
     SET qualified_at = now()
   WHERE referred_id = NEW.customer_id
     AND qualified_at IS NULL
  RETURNING * INTO ref_row;

  IF ref_row.id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO qualified_count
    FROM public.customer_referrals
   WHERE referrer_id = ref_row.referrer_id
     AND qualified_at IS NOT NULL;

  IF qualified_count % 5 = 0 THEN
    INSERT INTO public.referral_rewards (user_id) VALUES (ref_row.referrer_id);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.qualify_referral_on_paid_booking() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER qualify_referral_on_paid_booking
AFTER INSERT OR UPDATE OF payment_intent_id, status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.qualify_referral_on_paid_booking();