-- Tabela de contadores (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.company_counters (
  company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  sale_seq BIGINT NOT NULL DEFAULT 0,
  purchase_seq BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS na tabela de contadores
ALTER TABLE public.company_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sel_counters ON public.company_counters;
DROP POLICY IF EXISTS ins_counters ON public.company_counters;
DROP POLICY IF EXISTS upd_counters ON public.company_counters;

CREATE POLICY sel_counters ON public.company_counters
  FOR SELECT USING (
    company_id IN (SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid())
  );

CREATE POLICY ins_counters ON public.company_counters
  FOR INSERT WITH CHECK (
    company_id IN (SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid())
  );

CREATE POLICY upd_counters ON public.company_counters
  FOR UPDATE USING (
    company_id IN (SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid())
  );

-- Função: próximo número de VENDA (com checagem de vínculo e RLS)
CREATE OR REPLACE FUNCTION public.next_sale_number(comp_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE n BIGINT;
BEGIN
  -- Garante que o usuário pertence à empresa informada
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships m
     WHERE m.company_id = comp_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado: usuário não tem vínculo com a empresa %', comp_id
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.company_counters (company_id, sale_seq)
  VALUES (comp_id, 1)
  ON CONFLICT (company_id) DO UPDATE
    SET sale_seq = public.company_counters.sale_seq + 1,
        updated_at = now()
  RETURNING sale_seq INTO n;

  RETURN 'VENDA-' || LPAD(n::TEXT, 6, '0');
END; $$;

-- Função: próximo número de COMPRA (com checagem de vínculo e RLS)
CREATE OR REPLACE FUNCTION public.next_purchase_number(comp_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE n BIGINT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships m
     WHERE m.company_id = comp_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado: usuário não tem vínculo com a empresa %', comp_id
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.company_counters (company_id, purchase_seq)
  VALUES (comp_id, 1)
  ON CONFLICT (company_id) DO UPDATE
    SET purchase_seq = public.company_counters.purchase_seq + 1,
        updated_at = now()
  RETURNING purchase_seq INTO n;

  RETURN 'COMPRA-' || LPAD(n::TEXT, 6, '0');
END; $$;

-- Função: estoque atual do produto (company-aware + RLS)
CREATE OR REPLACE FUNCTION public.get_product_stock(comp_id UUID, product_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(SUM(b.quantity), 0)::numeric
    FROM public.inventory_batches b
   WHERE b.company_id = comp_id
     AND b.product_id = product_uuid
     AND b.quantity > 0;
$$;