# 📐 Arquitetura

Documentação sobre a arquitetura do projeto.

---

## 🏗️ Estrutura do Projeto

### [Project Structure](PROJECT_STRUCTURE.md)
Visualização completa da estrutura de diretórios e arquivos.

**Inclui:**
- Árvore de diretórios
- Dependency graph
- Ordem de build
- Estatísticas de arquivos
- Estrutura futura (fases seguintes)

---

## 🔐 Segurança

### [RLS Policies Template](rls-policies-template.md)
Template e guia para políticas de Row Level Security no Supabase.

**Conteúdo:**
- Princípios de segurança
- Template de tabela base
- Políticas padrão (SELECT, INSERT, UPDATE, DELETE)
- RBAC (Role-Based Access Control)
- Tabelas PII (dados sensíveis)
- Checklist de migração
- Exemplos de testes

---

## 📋 ADRs (Architecture Decision Records)

### [ADR Index](../adr/README.md)
Registro de todas as decisões arquiteturais importantes.

**ADRs criados:**
- [ADR-001: Monorepo com Turborepo](../adr/001-monorepo-with-turborepo.md)

**ADRs planejados (Phase 1+):**
- ADR-002: Supabase para Backend
- ADR-003: WatermelonDB para Offline-First
- ADR-004: Expo Router para Navegação
- ADR-005: Zod para Validação

---

## 🎨 Design System

### Tokens (Ver código)
- [Colors](../../packages/ui/src/tokens/colors.ts)
- [Spacing](../../packages/ui/src/tokens/spacing.ts)
- [Typography](../../packages/ui/src/tokens/typography.ts)

### Princípios
- Mobile-first
- Offline-first
- Multi-tenancy obrigatória
- Extreme privacy (PII redaction)
- WCAG 2.1 AA compliance

---

## 🔄 Padrões de Sincronização

### Sync Strategy (Phase 2)
Documentação virá na Phase 2, incluindo:
- Push/Pull operations
- Conflict resolution (LWW)
- Outbox pattern
- Network detection
- Retry logic com exponential backoff

---

## 📊 Data Model

### Entidades Base
Todos os modelos herdam de BaseEntity:
```typescript
{
  id: ULID
  createdAt: ISO 8601
  updatedAt: ISO 8601
  deletedAt: ISO 8601 | null
  version: number
  tenantId: ULID
}
```

### Multi-tenancy
- Isolamento obrigatório por `tenantId`
- RLS policies em 100% das tabelas
- Custom JWT claims

---

## 🏛️ Princípios Arquiteturais

### SOLID
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

### Offline-First
- Local DB (WatermelonDB) é source of truth
- Writes são imediatas no local
- Sync assíncrono em background
- UI nunca espera sync

### Multi-tenancy
- Tenant isolation obrigatória
- RLS em todas as tabelas
- Zero trust (validar no servidor)

### Security
- Never trust the client
- PII redaction automática
- Secrets apenas em servidor
- MFA obrigatório

---

**Última atualização:** 2026-01-04
