-- short_code numérico curto (1..999)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_code SMALLINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_short_code_range'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT chk_products_short_code_range
      CHECK (short_code BETWEEN 1 AND 999);
  END IF;
END$$;

-- Unicidade por empresa, ignorando NULL
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_company_short_code
  ON public.products (company_id, short_code)
  WHERE short_code IS NOT NULL;

COMMENT ON COLUMN public.products.short_code
  IS 'Código curto numérico (1–3 dígitos) para produtos populares. Ex.: 40, 41, 42.';