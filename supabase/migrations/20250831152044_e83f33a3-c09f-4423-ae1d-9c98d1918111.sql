-- Dropar função existente primeiro
DROP FUNCTION IF EXISTS public.get_product_stock(UUID);

-- 1) TIPOS: quantidades como NUMERIC(14,3) e min_stock decimal
ALTER TABLE public.inventory_batches
  ALTER COLUMN quantity TYPE NUMERIC(14,3) USING quantity::numeric;
ALTER TABLE public.sale_items
  ALTER COLUMN quantity TYPE NUMERIC(14,3) USING quantity::numeric;
ALTER TABLE public.purchase_items
  ALTER COLUMN quantity TYPE NUMERIC(14,3) USING quantity::numeric;
ALTER TABLE public.stock_movements
  ALTER COLUMN quantity TYPE NUMERIC(14,3) USING quantity::numeric;
ALTER TABLE public.products
  ALTER COLUMN min_stock TYPE NUMERIC(14,3) USING min_stock::numeric;

-- 2) CHECKS úteis
ALTER TABLE public.products
  ADD CONSTRAINT chk_cost_price_nonneg CHECK (cost_price >= 0),
  ADD CONSTRAINT chk_selling_price_nonneg CHECK (selling_price >= 0);
ALTER TABLE public.sales
  ADD CONSTRAINT chk_discount_percent CHECK (discount_percent BETWEEN 0 AND 100),
  ADD CONSTRAINT chk_discount_amount_nonneg CHECK (discount_amount >= 0);

-- 3) UNIT como lista controlada (se não quiser ENUM)
ALTER TABLE public.products
  ADD CONSTRAINT chk_unit_allowed CHECK (unit IN ('UN','KG','L','CX'));

-- 4) Defaults de autoria
ALTER TABLE public.sales
  ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.purchases
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- 5) FKs compostos para blindar cross-tenant
-- Primeiro, tornar (id, company_id) único nas tabelas-pai
ALTER TABLE public.sales      ADD CONSTRAINT sales_id_company_uniq      UNIQUE (id, company_id);
ALTER TABLE public.purchases  ADD CONSTRAINT purchases_id_company_uniq  UNIQUE (id, company_id);
ALTER TABLE public.products   ADD CONSTRAINT products_id_company_uniq   UNIQUE (id, company_id);
ALTER TABLE public.inventory_batches ADD CONSTRAINT batches_id_company_uniq UNIQUE (id, company_id);

-- Agora, amarrar os filhos ao par (id, company_id)
ALTER TABLE public.sale_items
  ADD CONSTRAINT fk_sale_items_sale_company
    FOREIGN KEY (sale_id, company_id) REFERENCES public.sales (id, company_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_sale_items_product_company
    FOREIGN KEY (product_id, company_id) REFERENCES public.products (id, company_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_sale_items_batch_company
    FOREIGN KEY (batch_id, company_id) REFERENCES public.inventory_batches (id, company_id) ON DELETE SET NULL;

ALTER TABLE public.purchase_items
  ADD CONSTRAINT fk_purchase_items_purchase_company
    FOREIGN KEY (purchase_id, company_id) REFERENCES public.purchases (id, company_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_purchase_items_product_company
    FOREIGN KEY (product_id, company_id) REFERENCES public.products (id, company_id) ON DELETE CASCADE;

ALTER TABLE public.inventory_batches
  ADD CONSTRAINT fk_batches_product_company
    FOREIGN KEY (product_id, company_id) REFERENCES public.products (id, company_id) ON DELETE CASCADE;

ALTER TABLE public.stock_movements
  ADD CONSTRAINT fk_movements_product_company
    FOREIGN KEY (product_id, company_id) REFERENCES public.products (id, company_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_movements_batch_company
    FOREIGN KEY (batch_id, company_id) REFERENCES public.inventory_batches (id, company_id) ON DELETE SET NULL;

-- 6) RLS: políticas completas para PRODUCTS
DROP POLICY IF EXISTS user_can_view_company_products ON public.products;
DROP POLICY IF EXISTS user_can_manage_company_products ON public.products;

CREATE POLICY sel_products ON public.products
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_products ON public.products
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_products ON public.products
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_products ON public.products
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- RLS: políticas completas para INVENTORY_BATCHES
DROP POLICY IF EXISTS user_can_view_company_batches ON public.inventory_batches;
DROP POLICY IF EXISTS user_can_manage_company_batches ON public.inventory_batches;

CREATE POLICY sel_inventory_batches ON public.inventory_batches
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_inventory_batches ON public.inventory_batches
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_inventory_batches ON public.inventory_batches
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_inventory_batches ON public.inventory_batches
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- RLS: políticas completas para STOCK_MOVEMENTS
DROP POLICY IF EXISTS user_can_view_company_movements ON public.stock_movements;
DROP POLICY IF EXISTS user_can_create_company_movements ON public.stock_movements;

CREATE POLICY sel_stock_movements ON public.stock_movements
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_stock_movements ON public.stock_movements
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_stock_movements ON public.stock_movements
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_stock_movements ON public.stock_movements
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- RLS: políticas completas para SALES
DROP POLICY IF EXISTS user_can_view_company_sales ON public.sales;
DROP POLICY IF EXISTS user_can_manage_company_sales ON public.sales;

CREATE POLICY sel_sales ON public.sales
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_sales ON public.sales
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_sales ON public.sales
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_sales ON public.sales
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- RLS: políticas completas para SALE_ITEMS
DROP POLICY IF EXISTS user_can_view_company_sale_items ON public.sale_items;
DROP POLICY IF EXISTS user_can_manage_company_sale_items ON public.sale_items;

CREATE POLICY sel_sale_items ON public.sale_items
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_sale_items ON public.sale_items
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_sale_items ON public.sale_items
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_sale_items ON public.sale_items
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- RLS: políticas completas para PURCHASES
DROP POLICY IF EXISTS user_can_view_company_purchases ON public.purchases;
DROP POLICY IF EXISTS user_can_manage_company_purchases ON public.purchases;

CREATE POLICY sel_purchases ON public.purchases
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_purchases ON public.purchases
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_purchases ON public.purchases
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_purchases ON public.purchases
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- RLS: políticas completas para PURCHASE_ITEMS
DROP POLICY IF EXISTS user_can_view_company_purchase_items ON public.purchase_items;
DROP POLICY IF EXISTS user_can_manage_company_purchase_items ON public.purchase_items;

CREATE POLICY sel_purchase_items ON public.purchase_items
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_purchase_items ON public.purchase_items
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_purchase_items ON public.purchase_items
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_purchase_items ON public.purchase_items
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- RLS: políticas completas para SUBSCRIPTIONS
DROP POLICY IF EXISTS user_can_view_company_subscription ON public.subscriptions;
DROP POLICY IF EXISTS user_can_manage_company_subscription ON public.subscriptions;

CREATE POLICY sel_subscriptions ON public.subscriptions
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_subscriptions ON public.subscriptions
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_subscriptions ON public.subscriptions
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_subscriptions ON public.subscriptions
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- 7) Indexes práticos
CREATE INDEX IF NOT EXISTS idx_products_company_name ON public.products (company_id, name);
CREATE INDEX IF NOT EXISTS idx_batches_company_prod_expiry ON public.inventory_batches (company_id, product_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_mov_company_prod_created ON public.stock_movements (company_id, product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_company_created ON public.sales (company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_company_created ON public.purchases (company_id, created_at);

-- 8) Funções: manter RLS (SECURITY INVOKER) e evitar corrida em numeração
CREATE TABLE IF NOT EXISTS public.company_counters (
  company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  sale_seq BIGINT NOT NULL DEFAULT 0,
  purchase_seq BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de counters
ALTER TABLE public.company_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY sel_company_counters ON public.company_counters
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY ins_company_counters ON public.company_counters
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY upd_company_counters ON public.company_counters
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()))
           WITH CHECK (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));
CREATE POLICY del_company_counters ON public.company_counters
  FOR DELETE USING (company_id IN (SELECT company_id FROM public.memberships WHERE user_id = auth.uid()));

-- Substituir as funções antigas
DROP FUNCTION IF EXISTS public.generate_sale_number(UUID);
DROP FUNCTION IF EXISTS public.generate_purchase_number(UUID);

CREATE OR REPLACE FUNCTION public.next_sale_number(comp_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE n BIGINT;
BEGIN
  INSERT INTO public.company_counters (company_id, sale_seq)
  VALUES (comp_id, 1)
  ON CONFLICT (company_id) DO UPDATE SET sale_seq = public.company_counters.sale_seq + 1,
                                      updated_at = now()
  RETURNING sale_seq INTO n;
  RETURN 'VENDA-' || LPAD(n::TEXT, 6, '0');
END; $$;

CREATE OR REPLACE FUNCTION public.next_purchase_number(comp_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE n BIGINT;
BEGIN
  INSERT INTO public.company_counters (company_id, purchase_seq)
  VALUES (comp_id, 1)
  ON CONFLICT (company_id) DO UPDATE SET purchase_seq = public.company_counters.purchase_seq + 1,
                                        updated_at = now()
  RETURNING purchase_seq INTO n;
  RETURN 'COMPRA-' || LPAD(n::TEXT, 6, '0');
END; $$;

-- Revisar get_product_stock: manter RLS
CREATE OR REPLACE FUNCTION public.get_product_stock(product_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(SUM(quantity), 0)::numeric
  FROM public.inventory_batches
  WHERE product_id = product_uuid AND quantity > 0;
$$;