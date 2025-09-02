-- =========================================
-- SETOR & FEATURES POR EMPRESA
-- =========================================
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS sector TEXT
    CHECK (sector IN ('padaria','mercadinho','adega'))
    DEFAULT 'mercadinho',
  ADD COLUMN IF NOT EXISTS sector_features JSONB DEFAULT '[]'::jsonb;

UPDATE public.companies
  SET sector = COALESCE(sector, 'mercadinho');

-- Habilitar RLS (caso ainda não esteja)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy de UPDATE para OWNER (idempotente usando DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'companies_owner_update'
  ) THEN
    CREATE POLICY companies_owner_update
    ON public.companies
    FOR UPDATE
    USING (
      id IN (SELECT company_id FROM public.memberships m
             WHERE m.user_id = auth.uid() AND m.role = 'OWNER')
    )
    WITH CHECK (
      id IN (SELECT company_id FROM public.memberships m
             WHERE m.user_id = auth.uid() AND m.role = 'OWNER')
    );
  END IF;
END$$;

-- =========================================
-- FUNÇÃO FEFO (consumo por validade, thread-safe)
-- =========================================
CREATE OR REPLACE FUNCTION public.consume_fefo(
  p_company UUID, p_product UUID, p_qty NUMERIC
) RETURNS TABLE(batch_id UUID, qty_consumed NUMERIC) AS $$
DECLARE
  rem NUMERIC := p_qty;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT id, quantity
    FROM public.inventory_batches
    WHERE company_id = p_company
      AND product_id = p_product
      AND quantity > 0
    ORDER BY expiry_date NULLS LAST, created_at
    FOR UPDATE SKIP LOCKED
  LOOP
    IF rem <= 0 THEN EXIT; END IF;

    qty_consumed := LEAST(rec.quantity, rem);
    batch_id := rec.id;

    UPDATE public.inventory_batches
       SET quantity = quantity - qty_consumed
     WHERE id = rec.id;

    INSERT INTO public.stock_movements(company_id, product_id, type, quantity, reference_type, reference_id, created_at)
    VALUES (p_company, p_product, 'OUT', qty_consumed, 'Sale', NULL, now());

    rem := rem - qty_consumed;
    RETURN NEXT;
  END LOOP;

  IF rem > 0 THEN
    RAISE EXCEPTION 'Estoque insuficiente para produto % (faltam %)', p_product, rem;
  END IF;
END; $$ LANGUAGE plpgsql;

-- =========================================
-- CHECK DE STATUS DE ASSINATURA (inclui PENDING)
-- =========================================
DO $$
DECLARE
  v_tbl oid;
  v_conname text;
BEGIN
  SELECT c.oid INTO v_tbl
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relname = 'companies' AND n.nspname = 'public';

  SELECT conname INTO v_conname
  FROM pg_constraint
  WHERE conrelid = v_tbl AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%subscription_status%';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.companies DROP CONSTRAINT %I', v_conname);
  END IF;

  ALTER TABLE public.companies
    ADD CONSTRAINT companies_subscription_status_check
    CHECK (subscription_status IN ('PENDING','ACTIVE','PAST_DUE','CANCELED','INACTIVE'));
END$$;

-- =========================================
-- ÍNDICE PARA FEFO (melhora performance)
-- =========================================
CREATE INDEX IF NOT EXISTS idx_batches_company_product_expiry_pos
  ON public.inventory_batches (company_id, product_id, expiry_date)
  WHERE quantity > 0;