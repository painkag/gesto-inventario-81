-- Add sector columns to companies table with proper defaults
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'mercadinho',
  ADD COLUMN IF NOT EXISTS sector_features JSONB DEFAULT '[]'::jsonb;

-- Defaults e backfill
ALTER TABLE public.companies
  ALTER COLUMN sector SET DEFAULT 'mercadinho',
  ALTER COLUMN sector_features SET DEFAULT '[]'::jsonb;

UPDATE public.companies
SET sector = COALESCE(sector, 'mercadinho');

-- (opcional, depois do backfill) garantir que nunca fique null
ALTER TABLE public.companies
  ALTER COLUMN sector SET NOT NULL;

-- CHECK para aceitar só os 3 setores (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'companies_sector_check'
      AND conrelid = 'public.companies'::regclass
  ) THEN
    ALTER TABLE public.companies
      ADD CONSTRAINT companies_sector_check
      CHECK (sector IN ('padaria','mercadinho','adega'));
  END IF;
END$$;

-- (opcional) índice simples, útil se você filtrar por setor às vezes
CREATE INDEX IF NOT EXISTS idx_companies_sector ON public.companies(sector);