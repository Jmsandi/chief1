-- Keep bookings.payment_status in sync with payments.status

CREATE OR REPLACE FUNCTION public.sync_booking_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- When a payment is completed, mark booking as confirmed + completed payment
  IF NEW.status = 'completed' THEN
    UPDATE public.bookings
    SET 
      payment_status = 'completed',
      status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
      updated_at = now()
    WHERE id = NEW.booking_id;

  ELSIF NEW.status = 'failed' THEN
    UPDATE public.bookings
    SET 
      payment_status = 'failed',
      updated_at = now()
    WHERE id = NEW.booking_id;

  ELSIF NEW.status = 'refunded' THEN
    UPDATE public.bookings
    SET 
      payment_status = 'refunded',
      updated_at = now()
    WHERE id = NEW.booking_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_booking_payment_status ON public.payments;
CREATE TRIGGER trg_sync_booking_payment_status
AFTER INSERT OR UPDATE OF status ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.sync_booking_payment_status();




