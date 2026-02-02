# 📘 Runbooks

Guias operacionais para tarefas específicas em produção.

---

## O Que São Runbooks?

**Runbooks** são documentos que descrevem exatamente como executar tarefas operacionais específicas, geralmente em ambientes de produção.

São como "receitas" passo a passo para:

- Resolver incidentes
- Executar manutenções
- Fazer deploys
- Recuperar de falhas
- Monitorar sistemas

---

## 🚀 Runbooks Planejados

### Deployment

- [ ] Como fazer deploy do mobile (App Store + Play Store)
- [ ] Como fazer deploy do web (Vercel/Netlify)
- [ ] Como fazer rollback de uma versão
- [ ] Como fazer deploy de hotfix

### Operations

- [ ] Como fazer backup manual do Supabase
- [ ] Como restaurar backup
- [ ] Como resetar dados de um tenant
- [ ] Como adicionar novo tenant manualmente

### Monitoring

- [ ] Como investigar erros nos logs
- [ ] Como analisar performance
- [ ] Como ver logs de sync
- [ ] Como identificar usuários com problemas de sync

### Incident Response

- [ ] App mobile não abre
- [ ] Sync parou de funcionar
- [ ] Supabase está fora do ar
- [ ] Rate limit atingido

### Maintenance

- [ ] Como atualizar dependências
- [ ] Como fazer migration do banco
- [ ] Como adicionar novo environment (staging/prod)
- [ ] Como rotacionar secrets

---

## 📋 Template de Runbook

```markdown
# [Nome da Tarefa]

## Visão Geral

Breve descrição da tarefa

## Quando Usar

Situações que exigem este runbook

## Pré-requisitos

- Acesso X
- Permissão Y
- Tool Z instalada

## Passos

### 1. Preparação

Comandos e verificações iniciais

### 2. Execução

Passo a passo detalhado

### 3. Verificação

Como confirmar que deu certo

### 4. Rollback (se necessário)

Como desfazer se algo der errado

## Troubleshooting

Problemas comuns e soluções

## Contatos

Quem acionar em caso de problemas
```

---

## 🎯 Quando Criar um Runbook?

Crie um runbook quando:

- ✅ A tarefa é crítica
- ✅ Precisa ser executada sob pressão
- ✅ Tem múltiplos passos
- ✅ Pode dar errado facilmente
- ✅ Precisa ser repetível
- ✅ Outras pessoas precisam executar

**Não** crie para:

- ❌ Tarefas triviais (1-2 comandos)
- ❌ Coisas que nunca se repetem
- ❌ Desenvolvimento normal

---

## 📚 Exemplos de Bons Runbooks

### Deploy de Emergency Hotfix

1. Criar branch hotfix
2. Fix + testes
3. Build
4. Deploy staging
5. Validar
6. Deploy prod
7. Monitorar logs
8. Comunicar time

### Investigar Erro de Sync

1. Identificar tenant/usuário afetado
2. Verificar logs da aplicação
3. Verificar outbox no banco
4. Verificar network logs
5. Identificar causa raiz
6. Aplicar correção
7. Verificar resolução

---

## 🔗 Relacionado

- **[Troubleshooting](../troubleshooting/)** - Problemas comuns de desenvolvimento
- **[Guides](../guides/)** - Guias de desenvolvimento
- **[Architecture](../architecture/)** - Decisões arquiteturais

---

**Status:** 📅 Em planejamento
**Runbooks criados:** 0
**Runbooks planejados:** ~15

**Nota:** Runbooks serão criados conforme o projeto avança e temos operações reais em produção.

---

**Última atualização:** 2026-01-04
