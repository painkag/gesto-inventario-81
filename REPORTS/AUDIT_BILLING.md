# AUDITORIA PLANOS & PAGAMENTOS
## Data: 2025-01-09

---

## ✅ O QUE JÁ EXISTE

### 1. **ESTRUTURA DE DADOS (70%)**
- ✅ Tabela `subscriptions` existente com campos:
  - `company_id` (FK para companies)
  - `plan` (string do plano)
  - `status` (status da assinatura)
  - `ai_included` (boolean para recursos IA)
  - `current_period_start`, `current_period_end`
  - `created_at`, `updated_at`
- ✅ Tabela `companies` com campo `is_blocked` existente

### 2. **INTERFACE DE PREÇOS (100%)**
- ✅ Página inicial com seção de preços (`PricingSection.tsx`)
- ✅ 2 planos definidos: Essencial (R$ 299) e Profissional (R$ 500)
- ✅ Features bem definidas por plano
- ✅ CTA "Começar Teste Grátis" implementado

---

## ❌ O QUE ESTÁ FALTANDO (CRÍTICO)

### 1. **PÁGINA DE PLANOS (0%)**
**Gap**: Não existe rota `/plano` ou `/dashboard/plano`
**Necessário**: 
- Página dedicada para gerenciar assinatura
- Exibir plano atual do usuário
- Botões para assinar/alterar planos
- Botão "Pagar agora" para inadimplentes

### 2. **SISTEMA DE CHECKOUT (0%)**
**Gap**: Nenhum endpoint de checkout implementado
**Necessário**:
- `POST /api/billing/checkout` (mock)
- Redirecionamento simulado para pagamento
- Retorno com sucesso/falha

### 3. **WEBHOOKS MOCK (0%)**
**Gap**: Nenhum webhook implementado
**Necessário**:
- `POST /api/billing/webhook/mock`
- Eventos: `invoice.paid`, `invoice.payment_failed`, `subscription.canceled`
- Atualização automática de status e bloqueios

### 4. **SISTEMA DE BLOQUEIOS (0%)**
**Gap**: Não há guardas/middlewares para bloquear acesso
**Necessário**:
- Middleware para redirecionar usuários bloqueados para `/plano`
- Hook `useAiEnabled()` para controlar recursos IA
- Lógica de bloqueio baseada em `isBlocked` e `status`

### 5. **HOOKS DE ASSINATURA (0%)**
**Gap**: Nenhum hook para gerenciar assinatura
**Necessário**:
- `useSubscription()` - Status da assinatura atual
- `useBilling()` - Operações de pagamento
- `useAiEnabled()` - Controle de recursos IA

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### **Etapa 1: Página de Planos**
- Criar `/dashboard/plano` ou `/plano`
- Exibir status atual da assinatura
- Mostrar planos disponíveis
- Botões de ação (assinar, pagar, cancelar)

### **Etapa 2: Sistema Mock de Checkout**
- Edge Function `checkout` para simular pagamento
- Redirecionamento fake com delay
- Página de sucesso/falha

### **Etapa 3: Webhooks Mock**
- Edge Function `webhook/mock` para simular eventos Stripe
- Lógica para atualizar status baseado no evento
- Controle de bloqueios e IA

### **Etapa 4: Sistema de Guardas**
- Middleware global para verificar `isBlocked`
- Hook `useAiEnabled()` para recursos IA
- Redirecionamentos automáticos

---

## 🎯 EVENTOS DE WEBHOOK NECESSÁRIOS

### **invoice.paid**
```json
{
  "type": "invoice.paid",
  "company_id": "uuid",
  "plan": "professional", // ou "essential"
  "ai_included": true // baseado no plano
}
```
**Ação**: `status=ACTIVE`, `isBlocked=false`, `currentPeriodEnd=now()+30d`

### **invoice.payment_failed**
```json
{
  "type": "invoice.payment_failed", 
  "company_id": "uuid"
}
```
**Ação**: `status=PAST_DUE`, `isBlocked=true`

### **subscription.canceled**
```json
{
  "type": "subscription.canceled",
  "company_id": "uuid" 
}
```
**Ação**: `status=CANCELED`, `isBlocked=true`, `aiIncluded=false`

---

## 🔒 REGRAS DE BLOQUEIO

### **Sistema Bloqueado (isBlocked=true)**
- Todas as rotas redirecionam para `/plano`
- **Exceção**: `/plano`, `/login`, `/register` permanecem acessíveis
- Usuário só pode pagar para desbloquear

### **IA Bloqueada (aiIncluded=false)**
- Recursos de IA ficam disabled/hidden
- Botões de IA mostram tooltip: "Disponível no plano Profissional"
- Formulários de IA não processam

---

## 📊 ESTRUTURA DE PLANOS

### **Plano Essential (R$ 299/mês)**
- Gestão completa de estoque
- Relatórios básicos
- 3 usuários
- **AI**: ❌ Não incluído

### **Plano Professional (R$ 500/mês)**  
- Tudo do Essential
- Relatórios avançados com IA
- Previsão de demanda
- Usuários ilimitados
- **AI**: ✅ Incluído

---

## 🎯 DEFINIÇÃO DE PRONTO (DoD)

### **Funcionalidades Obrigatórias**
- [ ] Página `/plano` funcional para OWNER ❌
- [ ] Checkout mock com redirecionamento fake ❌
- [ ] Webhook mock que altera status via eventos ❌ 
- [ ] Bloqueio total quando PAST_DUE ❌
- [ ] IA bloqueada quando `aiIncluded=false` ❌
- [ ] Guardas em todas as rotas protegidas ❌

### **Testes de Aceitação**
1. **Mock Payment**: Clicar "Assinar" → checkout fake → webhook → status ativo
2. **Bloqueio Sistema**: Webhook `payment_failed` → todas rotas redirecionam para `/plano`
3. **Bloqueio IA**: Plano Essential → recursos IA disabled/hidden
4. **Reativação**: Webhook `invoice.paid` → sistema desbloqueado

---

## ⚠️ RISCOS IDENTIFICADOS

### **Risco Alto**
- **UX Confusa**: Usuário pode não entender por que está bloqueado
- **Loops infinitos**: Redirecionamentos mal implementados
- **Perda de dados**: Alterações não salvas durante bloqueio

### **Risco Médio**
- **Performance**: Verificações de status em todas as rotas
- **Cache desatualizado**: Status antigo pode persistir
- **Mock vs Real**: Confusão entre dados simulados e reais

### **Mitigação**
- Messages explicativas nos bloqueios
- Loading states durante verificações
- Cache invalidation após webhooks
- Logs detalhados para debugging

---

## 📈 STATUS RESUMO

| Componente | Atual | Meta | Gap |
|-----------|-------|------|-----|
| **Dados** | 70% | 100% | Hooks + validações |
| **Interface** | 20% | 100% | Página /plano completa |
| **Checkout** | 0% | 100% | Edge Function mock |
| **Webhooks** | 0% | 100% | Edge Function eventos |
| **Bloqueios** | 0% | 100% | Middlewares + guardas |

**Total de Lacunas**: 5 componentes principais
**Esforço Estimado**: 6-8 horas
**Prioridade**: Alta (funcionalidade core de monetização)