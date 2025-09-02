-- 🔐 Campos Stripe na tabela companies
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id_current TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'INACTIVE',
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_product_id_current TEXT;

-- 📝 Comentários (documentação)
COMMENT ON COLUMN public.companies.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN public.companies.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN public.companies.stripe_price_id_current IS 'ID do preço atual no Stripe';
COMMENT ON COLUMN public.companies.subscription_status IS 'Status da assinatura: ACTIVE, PAST_DUE, CANCELED, INACTIVE';
COMMENT ON COLUMN public.companies.current_period_end IS 'Data de fim do período atual da assinatura';
COMMENT ON COLUMN public.companies.stripe_product_id_current IS 'ID do produto atual no Stripe (opcional)';

-- ✅ Normalizar valores antigos e forçar integridade do status
UPDATE public.companies
SET subscription_status = 'INACTIVE'
WHERE subscription_status IS NULL;

ALTER TABLE public.companies
  ALTER COLUMN subscription_status SET NOT NULL,
  ALTER COLUMN subscription_status SET DEFAULT 'INACTIVE';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_subscription_status_chk') THEN
    ALTER TABLE public.companies DROP CONSTRAINT companies_subscription_status_chk;
  END IF;
  ALTER TABLE public.companies
    ADD CONSTRAINT companies_subscription_status_chk
    CHECK (subscription_status IN ('PENDING','ACTIVE','PAST_DUE','CANCELED','INACTIVE'));
END$$;

-- ⚡️ Índices
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer_id 
  ON public.companies(stripe_customer_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_companies_stripe_customer
  ON public.companies (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_companies_stripe_subscription
  ON public.companies (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_current_period_end
  ON public.companies (current_period_end)
  WHERE current_period_end IS NOT NULL;

-- 🧾 Tabela para idempotência (fila)
CREATE TABLE IF NOT EXISTS public.processed_events (
  event_id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  last_error TEXT,
  event_created_at TIMESTAMPTZ,
  event_account TEXT
);

CREATE INDEX IF NOT EXISTS idx_proc_events_processed_received
  ON public.processed_events (processed, received_at);

CREATE INDEX IF NOT EXISTS idx_processed_events_received_at 
  ON public.processed_events(received_at);

ALTER TABLE public.processed_events
  ALTER COLUMN processed SET DEFAULT FALSE;