-- Corrigir avisos de segurança: definir search_path nas funções

-- Atualizar função update_timestamp com search_path seguro
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Atualizar função handle_new_user com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;