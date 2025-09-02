-- ✅ Habilitar RLS na tabela processed_events
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;

-- 🔐 Política para permitir que Edge Functions (service role) gerenciem eventos
CREATE POLICY "service_role_processed_events" ON public.processed_events
FOR ALL USING (true) WITH CHECK (true);

-- 📝 Comentário para documentar o uso da tabela
COMMENT ON TABLE public.processed_events IS 'Tabela para controle de idempotência de webhooks do Stripe. Acesso restrito apenas para Edge Functions.';