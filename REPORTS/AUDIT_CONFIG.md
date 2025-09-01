# AUDITORIA CONFIGURAÇÕES - EMPRESA, NF-e, INTEGRAÇÕES, LGPD
## Data: 2025-01-09

---

## ✅ O QUE JÁ EXISTE

### 1. **ESTRUTURA BÁSICA (30%)**
- ✅ Página `/dashboard/settings` existe (`src/pages/Settings.tsx`)
- ✅ Proteção RBAC para OWNER implementada
- ✅ Tabela `companies` com campos básicos (nome, documento, telefone)
- ✅ Campos LGPD básicos na tabela `companies`:
  - `consent_opt_in` (BOOLEAN)
  - `consent_version` (TEXT)
  - `consent_timestamp` (TIMESTAMPTZ)
  - `consent_ip` (TEXT)

### 2. **DADOS DA EMPRESA (40%)**
- ✅ Campo `name` (nome da empresa)
- ✅ Campo `document` (CNPJ/CPF)
- ✅ Campo `phone` (telefone)
- ❌ Falta: cidade, UF, e-mail fiscal, logo

---

## ❌ O QUE ESTÁ FALTANDO (CRÍTICO)

### 1. **PÁGINA DE CONFIGURAÇÕES (10%)**
**Status**: Página vazia com placeholder
**Gap**: Interface completa com abas organizadas

### 2. **ABA EMPRESA (40%)**
**Existente**: nome, documento, telefone
**Faltando**: 
- Cidade/UF
- E-mail fiscal
- Logo da empresa
- Formulário de edição

### 3. **ABA NF-e HOMOLOGAÇÃO (0%)**
**Faltando completamente**:
- Tabela de configurações NF-e
- Campos: enabled, certAlias, cscId, cscToken, série, env=homolog
- Interface de configuração
- Validações específicas

### 4. **ABA INTEGRAÇÕES (0%)**
**Faltando completamente**:
- Configurações SMTP (host, port, user, pass)
- Configurações WhatsApp (provider, token)
- Testes de conectividade
- Armazenamento seguro de credenciais

### 5. **ABA LGPD/PRIVACIDADE (20%)**
**Existente**: Campos básicos no banco
**Faltando**: Interface de gerenciamento, histórico de consentimentos

### 6. **APIS/ENDPOINTS (0%)**
**Faltando completamente**:
- GET/POST company settings
- GET/POST NF-e settings
- GET/POST integration settings
- POST test-email
- POST test-whatsapp

---

## 🏗️ ESTRUTURA DE DADOS NECESSÁRIA

### **Tabelas a Criar**

#### **company_settings**
```sql
CREATE TABLE public.company_settings (
  company_id UUID PRIMARY KEY REFERENCES companies(id),
  -- Dados empresa
  city TEXT,
  state TEXT,
  postal_code TEXT,
  fiscal_email TEXT,
  logo_url TEXT,
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **nfe_settings**
```sql
CREATE TABLE public.nfe_settings (
  company_id UUID PRIMARY KEY REFERENCES companies(id),
  enabled BOOLEAN DEFAULT false,
  cert_alias TEXT,
  csc_id TEXT,
  csc_token TEXT, -- ENCRYPTED
  serie_nfe INTEGER DEFAULT 1,
  ambiente TEXT DEFAULT 'homolog', -- homolog | prod
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **integration_settings**
```sql
CREATE TABLE public.integration_settings (
  company_id UUID PRIMARY KEY REFERENCES companies(id),
  -- SMTP
  smtp_enabled BOOLEAN DEFAULT false,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_pass TEXT, -- ENCRYPTED
  smtp_from_email TEXT,
  -- WhatsApp
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_provider TEXT, -- 'evolution', 'twilio', etc
  whatsapp_token TEXT, -- ENCRYPTED
  whatsapp_instance_id TEXT,
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📋 GAPS DETALHADOS

### **Gap 1: Interface com Abas (0%)**
- Componente Tabs do shadcn/ui
- 4 abas: Empresa | NF-e | Integrações | Privacidade
- Loading states e error handling
- Validação Zod por aba

### **Gap 2: Hooks de Settings (0%)**
- `useCompanySettings()` - GET/POST dados empresa
- `useNFeSettings()` - GET/POST configurações NF-e  
- `useIntegrationSettings()` - GET/POST integrações
- `useLGPDSettings()` - Gestão consentimentos

### **Gap 3: Edge Functions (0%)**
- `/test-email` - Enviar email teste
- `/test-whatsapp` - Enviar mensagem teste
- `/company-settings` - CRUD dados empresa
- `/nfe-settings` - CRUD configurações NF-e
- `/integration-settings` - CRUD integrações

### **Gap 4: Secrets Management (0%)**
- CSC Token (NF-e) - usar Supabase Vault
- SMTP Password - usar Supabase Vault
- WhatsApp Token - usar Supabase Vault

### **Gap 5: Validações (0%)**
- Validação CNPJ/CPF
- Validação CSC formato
- Validação SMTP connection
- Validação WhatsApp credentials

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### **Etapa 1: Estrutura de Dados**
1. Criar migrations para novas tabelas
2. Configurar RLS (Row Level Security)
3. Adicionar índices necessários

### **Etapa 2: Backend (Edge Functions)**
4. Implementar CRUD para cada tipo de setting
5. Implementar funções de teste (email/WhatsApp)
6. Configurar secrets no Supabase Vault

### **Etapa 3: Frontend**
7. Criar hooks para cada configuração
8. Implementar interface com abas
9. Adicionar formulários com validação Zod
10. Implementar testes de conectividade

### **Etapa 4: Segurança**
11. Criptografar campos sensíveis
12. Logs de auditoria para mudanças
13. Rate limiting para testes

---

## 🎯 DEFINIÇÃO DE PRONTO (DoD)

### **Funcionalidades Obrigatórias**
- [ ] **Aba Empresa**: Editar nome, CNPJ, cidade/UF, email fiscal, logo ❌
- [ ] **Aba NF-e**: Configurar homologação (cert, CSC, série) ❌
- [ ] **Aba Integrações**: SMTP + WhatsApp com testes ❌
- [ ] **Aba LGPD**: Gestão de consentimentos ❌
- [ ] **Segurança**: Apenas OWNER acessa ✅
- [ ] **Validação**: Cliente + servidor com Zod ❌
- [ ] **Testes**: Botões "Testar Email" e "Testar WhatsApp" ❌

### **Critérios Técnicos**
- [ ] Secrets não expostos em responses ❌
- [ ] Validações robustas (CNPJ, email, etc.) ❌
- [ ] Toasts informativos (sucesso/erro) ❌
- [ ] Loading states em todas operações ❌
- [ ] Error boundaries para falhas ❌

---

## ⚠️ RISCOS IDENTIFICADOS

### **Risco Alto**
- **Secrets em plaintext**: CSC Token e senhas devem ser criptografados
- **Validação insuficiente**: CNPJ inválido pode quebrar NF-e
- **Rate limiting**: Testes de API podem gerar spam

### **Risco Médio**
- **UX complexa**: Muitas abas podem confundir usuário
- **Rollback**: Mudanças de configuração podem afetar operações
- **Dependências externas**: APIs de terceiros podem estar offline

### **Mitigação**
- Usar Supabase Vault para secrets
- Implementar validações client + server
- Cache de configurações para performance
- Logs detalhados para debugging

---

## 📊 RESUMO EXECUTIVO

| Módulo | Status Atual | Após Implementação | Esforço |
|--------|-------------|-------------------|---------|
| **Página Base** | ✅ 30% | ✅ 100% | 1h |
| **Aba Empresa** | ❌ 40% | ✅ 100% | 2h |
| **Aba NF-e** | ❌ 0% | ✅ 100% | 3h |
| **Aba Integrações** | ❌ 0% | ✅ 100% | 4h |
| **Aba LGPD** | ❌ 20% | ✅ 100% | 1h |
| **Backend/APIs** | ❌ 0% | ✅ 100% | 3h |

**Total**: ~14h de desenvolvimento
**Arquivos novos**: ~8-10 arquivos
**Risco**: Médio (novos recursos, mas isolados)