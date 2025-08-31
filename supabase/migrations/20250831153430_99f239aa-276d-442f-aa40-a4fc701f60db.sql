BEGIN;

-- =========================================================
-- 1) Índice para acelerar checagem de vínculo (memberships)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_memberships_user_company
  ON public.memberships (user_id, company_id);

-- =========================================================
-- 2) company_counters (garante existência) + RLS completa
-- =========================================================
CREATE TABLE IF NOT EXISTS public.company_counters (
  company_id   UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  sale_seq     BIGINT NOT NULL DEFAULT 0,
  purchase_seq BIGINT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_counters ENABLE ROW LEVEL SECURITY;

-- Recria políticas para evitar conflito
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

-- =========================================================
-- 3) Trigger function de timestamp (invoker; sem SECURITY DEFINER)
-- =========================================================
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

-- (Opcional) exemplo de uso:
-- CREATE TRIGGER update_products_updated_at
--   BEFORE UPDATE ON public.products
--   FOR EACH ROW
--   EXECUTE FUNCTION public.update_timestamp();

-- =========================================================
-- 4) Funções de numeração com checagem de vínculo + RLS
-- =========================================================
CREATE OR REPLACE FUNCTION public.next_sale_number(comp_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.next_purchase_number(comp_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
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

-- =========================================================
-- 5) Estoque atual com escala fixa (NUMERIC(14,3)) e filtro por empresa
-- =========================================================
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

-- =========================================================
-- 6) Função de pós-cadastro de usuário (cria empresa + membership OWNER)
--    Hardened: só pode rodar como trigger em auth.users
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Garante que só roda como TRIGGER de INSERT no auth.users
  IF TG_OP <> 'INSERT' OR TG_TABLE_SCHEMA <> 'auth' OR TG_RELNAME <> 'users' THEN
    RAISE EXCEPTION 'Esta função só deve ser chamada pelo trigger em auth.users';
  END IF;

  -- Cria automaticamente uma empresa
  INSERT INTO public.companies (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'))
  RETURNING id INTO new_company_id;

  -- Cria membership do usuário como OWNER
  INSERT INTO public.memberships (user_id, company_id, role)
  VALUES (NEW.id, new_company_id, 'OWNER');

  RETURN NEW;
END;
$$;

-- (Opcional) evita chamadas manuais fora do trigger
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- =========================================================
-- 7) Trigger em auth.users para disparar handle_new_user
-- =========================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

COMMIT;