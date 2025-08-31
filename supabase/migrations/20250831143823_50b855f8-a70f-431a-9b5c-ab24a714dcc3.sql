-- Habilitar extensão UUID se ainda não estiver ativa
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-------------------------------------------------
-- Tabela de empresas (Company)
-------------------------------------------------
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT, -- CNPJ/CPF
  city TEXT,
  state TEXT,
  phone TEXT,
  fiscal_email TEXT,

  -- Plano & billing
  plan TEXT NOT NULL DEFAULT 'trial', -- trial, basic, pro_ai
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  ai_enabled BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,

  -- LGPD
  consent_opt_in BOOLEAN DEFAULT false,
  consent_version TEXT,
  consent_timestamp TIMESTAMPTZ,
  consent_ip TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para manter updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-------------------------------------------------
-- Relação entre usuário e empresa (Membership)
-------------------------------------------------
CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');

CREATE TABLE public.memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'STAFF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-------------------------------------------------
-- Exemplo de auditoria mínima
-------------------------------------------------
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,      -- CREATE / UPDATE / DELETE / LOGIN / EXPORT
  entity TEXT,               -- tabela ou módulo afetado
  entity_id TEXT,            -- id do registro
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-------------------------------------------------
-- RLS (Row Level Security)
-------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuário só vê empresas onde é membro
CREATE POLICY "user_can_view_their_companies"
ON public.companies
FOR SELECT USING (
  id IN (
    SELECT company_id FROM public.memberships m
    WHERE m.user_id = auth.uid()
  )
);

-- Usuário só vê suas memberships
CREATE POLICY "user_can_view_own_memberships"
ON public.memberships
FOR SELECT USING (user_id = auth.uid());

-- Usuário só insere membership se for ele mesmo
CREATE POLICY "user_can_insert_self_membership"
ON public.memberships
FOR INSERT WITH CHECK (user_id = auth.uid());

-- AuditLog só pode ser visto por usuários da empresa
CREATE POLICY "user_can_view_audit_logs"
ON public.audit_logs
FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM public.memberships m
    WHERE m.user_id = auth.uid()
  )
);

-------------------------------------------------
-- Automação: criar empresa + membership OWNER ao cadastrar usuário
-------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Cria automaticamente uma empresa
  INSERT INTO public.companies (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'))
  RETURNING id INTO new_company_id;

  -- Cria membership do usuário como OWNER
  INSERT INTO public.memberships (user_id, company_id, role)
  VALUES (NEW.id, new_company_id, 'OWNER');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: quando um novo usuário é criado no auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();