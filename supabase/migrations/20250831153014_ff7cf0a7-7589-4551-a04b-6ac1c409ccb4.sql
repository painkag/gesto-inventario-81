-- 1) Índice para acelerar a checagem de vínculo (memberships)
CREATE INDEX IF NOT EXISTS idx_memberships_user_company
  ON public.memberships (user_id, company_id);

-- 2) Trigger function sem SECURITY DEFINER (invoker é o padrão)
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3) Estoque atual com escala fixa (NUMERIC(14,3)) e filtro por empresa
CREATE OR REPLACE FUNCTION public.get_product_stock(comp_id UUID, product_uuid UUID)
RETURNS NUMERIC(14,3)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = 'public'
AS $$
  SELECT COALESCE(SUM(b.quantity), 0)::numeric(14,3)
  FROM public.inventory_batches b
  WHERE b.company_id = comp_id
    AND b.product_id = product_uuid
    AND b.quantity > 0;
$$;

-- 4) RLS da company_counters (necessária para INSERT/UPDATE via funções)
ALTER TABLE public.company_counters ENABLE ROW LEVEL SECURITY;

-- Evita duplicidade caso já exista
DROP POLICY IF EXISTS sel_counters ON public.company_counters;
DROP POLICY IF EXISTS ins_counters ON public.company_counters;
DROP POLICY IF EXISTS upd_counters ON public.company_counters;

CREATE POLICY sel_counters ON public.company_counters
  FOR SELECT USING (
    company_id IN (
      SELECT m.company_id FROM public.memberships m
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY ins_counters ON public.company_counters
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT m.company_id FROM public.memberships m
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY upd_counters ON public.company_counters
  FOR UPDATE USING (
    company_id IN (
      SELECT m.company_id FROM public.memberships m
      WHERE m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT m.company_id FROM public.memberships m
      WHERE m.user_id = auth.uid()
    )
  );