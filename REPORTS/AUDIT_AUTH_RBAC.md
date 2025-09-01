# AUDITORIA AUTH + MULTI-TENANT + RBAC
## Data: 2025-01-09

---

## ✅ O QUE JÁ EXISTE E FUNCIONA

### 1. **AUTENTICAÇÃO (100% OK)**
- ✅ Login/Registro funcional (`src/pages/Login.tsx`, `src/pages/Register.tsx`)
- ✅ Hash de senha (Supabase Auth nativo)
- ✅ Sessão com `userId` (`src/hooks/useAuth.tsx`)
- ✅ Proteção de rotas (`src/components/auth/ProtectedRoute.tsx`)
- ✅ Logout global com limpeza de estado

### 2. **MULTI-TENANT (100% OK)**
- ✅ Tabela `companies` com isolamento
- ✅ Tabela `memberships` relacionando user ↔ company
- ✅ `companyId` no fluxo de sessão (`src/hooks/useCompany.tsx`)
- ✅ RLS (Row Level Security) implementado em todas as tabelas
- ✅ Auto-criação de company + membership no registro

### 3. **ESTRUTURA RBAC (80% OK)**
- ✅ Enum `user_role` com `OWNER` e `STAFF`
- ✅ Campo `role` na tabela `memberships`
- ✅ Auto-criação de OWNER no registro
- ✅ Tipos TypeScript gerados (`Database["public"]["Enums"]["user_role"]`)

---

## ❌ O QUE FALTA (CRÍTICO)

### 1. **ROLE NO CONTEXTO FRONTEND (0%)**
**Problema**: O hook `useCompany` não retorna o `role` do usuário atual
**Impacto**: Frontend não sabe se o usuário é OWNER ou STAFF

**Arquivo**: `src/hooks/useCompany.tsx`
**Linha**: 15-27
```sql
-- Query atual (SEM role)
SELECT company_id, companies (id, name, document, phone, plan, trial_ends_at)
FROM memberships WHERE user_id = ?

-- Query necessária (COM role)  
SELECT company_id, role, companies (...)
FROM memberships WHERE user_id = ?
```

### 2. **MENU SEM RBAC (0%)**
**Problema**: Sidebar mostra todas as opções para qualquer usuário
**Impacto**: STAFF pode acessar Configurações (deveria ser só OWNER)

**Arquivo**: `src/components/layout/DashboardSidebar.tsx`
**Linhas**: 177-191 (seção Configurações)

### 3. **ROTAS SEM RBAC (0%)**
**Problema**: ProtectedRoute apenas verifica autenticação, não permissões
**Impacto**: STAFF pode acessar `/dashboard/settings` diretamente na URL

---

## 🔧 PATCHES MÍNIMOS NECESSÁRIOS

### **PATCH 1: Adicionar role ao contexto**
**Arquivo**: `src/hooks/useCompany.tsx`
**Ação**: Modificar query para incluir `role` e retornar no contexto

### **PATCH 2: Criar hook de permissões**
**Arquivo**: `src/hooks/usePermissions.tsx` (CRIAR)
**Ação**: Criar utilitários `hasAccess()`, `isOwner()`, `isStaff()`

### **PATCH 3: Aplicar RBAC no menu**
**Arquivo**: `src/components/layout/DashboardSidebar.tsx`
**Ação**: Esconder "Configurações" para STAFF (linhas 177-191)

### **PATCH 4: Proteger rotas sensíveis**
**Arquivo**: `src/App.tsx` ou criar `RoleProtectedRoute.tsx`
**Ação**: Proteger `/dashboard/settings` apenas para OWNER

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### **Etapa 1**: Modificar useCompany para incluir role
```typescript
// Retornar: { company, role, isOwner, isStaff }
```

### **Etapa 2**: Criar hook de permissões
```typescript
// usePermissions() → { hasAccess, canAccessSettings, etc. }
```

### **Etapa 3**: Aplicar no menu
```typescript
// EM_EDIT: Esconder Configurações para STAFF
{canAccessSettings && (
  <SidebarMenuItem>Configurações</SidebarMenuItem>
)}
```

### **Etapa 4**: Proteger rota Settings
```typescript
// EM_EDIT: Adicionar verificação de role
<Route path="/dashboard/settings" element={
  <ProtectedRoute requireRole="OWNER">
    <Settings />
  </ProtectedRoute>
} />
```

---

## 🎯 DEFINIÇÃO DE PRONTO (DoD)

### **Funcionalidades Obrigatórias**
- [ ] Login/Registro mantém funcionamento atual ✅ (já OK)
- [ ] Sessão inclui `userId`, `companyId` ✅ (já OK) + `role` ❌
- [ ] STAFF não vê item "Configurações" no menu ❌
- [ ] STAFF recebe erro 403 ao acessar `/dashboard/settings` ❌
- [ ] OWNER mantém acesso total ❌

### **Páginas NÃO PODEM QUEBRAR**
- ✅ Produtos, Estoque, Vendas (PDV), Compras, Relatórios, Movimentação
- ✅ Dashboard principal

### **Testes de Aceitação**
1. **Como OWNER**: Vejo "Configurações" no menu e acesso a página
2. **Como STAFF**: NÃO vejo "Configurações" no menu
3. **Como STAFF**: URL `/dashboard/settings` redireciona ou mostra 403
4. **Ambos**: Demais funcionalidades funcionam normalmente

---

## ⚠️ RISCOS IDENTIFICADOS

### **Risco Alto**
- **Quebra de multi-tenant**: Modificar query pode afetar isolamento
- **Perda de sessão**: Mudanças no contexto podem forçar logout

### **Risco Médio** 
- **UX inconsistente**: Menu vs rotas com comportamentos diferentes
- **Cache inválido**: TanStack Query pode manter dados antigos

### **Mitigação**
- Testar com 2 usuários (OWNER + STAFF) na mesma company
- Manter fallbacks para casos onde role não carrega
- Implementar loading states durante verificações

---

## 📊 RESUMO EXECUTIVO

| Módulo | Status Atual | Após Patches | Esforço |
|--------|-------------|--------------|---------|
| **Auth** | ✅ 100% | ✅ 100% | 0h |
| **Multi-tenant** | ✅ 100% | ✅ 100% | 0h |
| **RBAC Backend** | ✅ 80% | ✅ 100% | 0h |
| **RBAC Frontend** | ❌ 0% | ✅ 100% | 2-3h |

**Total de arquivos a modificar**: 3-4 arquivos
**Risco de quebra**: Baixo (mudanças isoladas)
**Compatibilidade**: Mantém tudo funcionando