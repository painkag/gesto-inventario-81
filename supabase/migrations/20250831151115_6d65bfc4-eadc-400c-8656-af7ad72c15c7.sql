-- Criar tabelas essenciais para o sistema de estoque

-- Tabela de produtos
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    category TEXT,
    brand TEXT,
    unit TEXT NOT NULL DEFAULT 'UN',
    cost_price DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(company_id, code)
);

-- Tabela de lotes de estoque
CREATE TABLE public.inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    cost_price DECIMAL(10,2),
    supplier TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de movimentações de estoque
CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    reason TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de vendas
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    sale_number TEXT NOT NULL,
    customer_name TEXT,
    customer_document TEXT,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('CASH', 'CARD', 'PIX')),
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, sale_number)
);

-- Tabela de itens de venda
CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de compras
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    purchase_number TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_document TEXT,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RECEIVED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, purchase_number)
);

-- Tabela de itens de compra
CREATE TABLE public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de assinaturas/planos
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('TRIAL', 'BASIC', 'PREMIUM')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end TIMESTAMPTZ NOT NULL,
    ai_included BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para products
CREATE POLICY "user_can_view_company_products" ON public.products
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_manage_company_products" ON public.products
    FOR ALL USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Políticas RLS para inventory_batches
CREATE POLICY "user_can_view_company_batches" ON public.inventory_batches
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_manage_company_batches" ON public.inventory_batches
    FOR ALL USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Políticas RLS para stock_movements
CREATE POLICY "user_can_view_company_movements" ON public.stock_movements
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_create_company_movements" ON public.stock_movements
    FOR INSERT WITH CHECK (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Políticas RLS para sales
CREATE POLICY "user_can_view_company_sales" ON public.sales
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_manage_company_sales" ON public.sales
    FOR ALL USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Políticas RLS para sale_items
CREATE POLICY "user_can_view_company_sale_items" ON public.sale_items
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_manage_company_sale_items" ON public.sale_items
    FOR ALL USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Políticas RLS para purchases
CREATE POLICY "user_can_view_company_purchases" ON public.purchases
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_manage_company_purchases" ON public.purchases
    FOR ALL USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Políticas RLS para purchase_items
CREATE POLICY "user_can_view_company_purchase_items" ON public.purchase_items
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_manage_company_purchase_items" ON public.purchase_items
    FOR ALL USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Políticas RLS para subscriptions
CREATE POLICY "user_can_view_company_subscription" ON public.subscriptions
    FOR SELECT USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

CREATE POLICY "user_can_manage_company_subscription" ON public.subscriptions
    FOR ALL USING (company_id IN (
        SELECT m.company_id FROM public.memberships m WHERE m.user_id = auth.uid()
    ));

-- Triggers para atualizar updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_inventory_batches_updated_at
    BEFORE UPDATE ON public.inventory_batches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

-- Função para calcular estoque atual de um produto
CREATE OR REPLACE FUNCTION public.get_product_stock(product_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(quantity) FROM public.inventory_batches 
         WHERE product_id = product_uuid AND quantity > 0),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Função para gerar próximo número de venda
CREATE OR REPLACE FUNCTION public.generate_sale_number(comp_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.sales
    WHERE company_id = comp_id;
    
    RETURN 'VENDA-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar próximo número de compra
CREATE OR REPLACE FUNCTION public.generate_purchase_number(comp_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(purchase_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.purchases
    WHERE company_id = comp_id;
    
    RETURN 'COMPRA-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;