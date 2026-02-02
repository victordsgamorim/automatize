# 📂 Estrutura da Documentação

Visão geral da organização da documentação do Automatize.

---

## 📁 Árvore de Diretórios

```
docs/
│
├── INDEX.md                    # 📚 Índice principal
├── README.md                   # 👋 Bem-vindo
├── DOCUMENTATION_STRUCTURE.md  # 📂 Este arquivo
│
├── guides/                     # 📖 GUIAS PRÁTICOS
│   ├── README.md
│   ├── QUICK_START.md          # 5 minutos
│   └── GETTING_STARTED.md      # Setup completo
│
├── planning/                   # 🗺️ PLANEJAMENTO
│   ├── README.md
│   ├── ROADMAP.md              # 15 fases
│   ├── STATUS.md               # Estado atual
│   └── PHASE_0_COMPLETE.md     # Conclusão Phase 0
│
├── architecture/               # 📐 ARQUITETURA
│   ├── README.md
│   ├── PROJECT_STRUCTURE.md    # Estrutura visual
│   └── rls-policies-template.md # Segurança
│
├── troubleshooting/            # 🔧 TROUBLESHOOTING
│   ├── README.md
│   └── FIXES_APPLIED.md        # Histórico de fixes
│
├── runbooks/                   # 📘 RUNBOOKS (Futuro)
│   └── README.md
│
└── adr/                        # 📋 ADRs
    ├── README.md
    ├── adr-template.md
    └── 001-monorepo-with-turborepo.md
```

---

## 🎯 Propósito de Cada Categoria

### 📖 Guides

**Para:** Desenvolvedores que querem começar ou aprender
**Contém:** Tutoriais, walkthroughs, how-tos
**Exemplos:** Quick Start, Getting Started, How to add a feature

### 🗺️ Planning

**Para:** Entender o roadmap e progresso
**Contém:** Roadmap, status, milestones, releases
**Exemplos:** Roadmap completo, Status atual, Phase completions

### 📐 Architecture

**Para:** Entender decisões técnicas
**Contém:** Estrutura, ADRs, padrões, templates
**Exemplos:** Project Structure, ADRs, RLS templates

### 🔧 Troubleshooting

**Para:** Resolver problemas
**Contém:** Problemas comuns, soluções, fixes históricos
**Exemplos:** Fixes Applied, Common Problems, Debug guides

### 📘 Runbooks

**Para:** Operações de produção (futuro)
**Contém:** Procedimentos operacionais, deploys, incidents
**Exemplos:** Deploy procedures, Monitoring, Incident response

### 📋 ADRs

**Para:** Registro de decisões arquiteturais
**Contém:** Architecture Decision Records
**Exemplos:** ADR-001 Monorepo, ADR-002 Supabase (futuro)

---

## 📊 Estatísticas

### Documentos Criados (Phase 0)

| Categoria           | Arquivos | Status             |
| ------------------- | -------- | ------------------ |
| **Guides**          | 3        | ✅ Base criada     |
| **Planning**        | 4        | ✅ Completo        |
| **Architecture**    | 4        | ✅ Base criada     |
| **Troubleshooting** | 2        | ✅ Base criada     |
| **Runbooks**        | 1        | 📅 Planejado       |
| **ADRs**            | 3        | ✅ Base criada     |
| **TOTAL**           | **17**   | **✅ Estruturado** |

---

## 🔍 Como Encontrar o Que Você Precisa

### Por Persona

**Novo Desenvolvedor:**

1. [guides/QUICK_START.md](guides/QUICK_START.md)
2. [guides/GETTING_STARTED.md](guides/GETTING_STARTED.md)
3. [architecture/PROJECT_STRUCTURE.md](architecture/PROJECT_STRUCTURE.md)

**Product Manager:**

1. [planning/ROADMAP.md](planning/ROADMAP.md)
2. [planning/STATUS.md](planning/STATUS.md)
3. [planning/PHASE_0_COMPLETE.md](planning/PHASE_0_COMPLETE.md)

**Arquiteto:**

1. [adr/](adr/)
2. [architecture/](architecture/)
3. [planning/ROADMAP.md](planning/ROADMAP.md)

**DevOps (Futuro):**

1. [runbooks/](runbooks/)
2. [troubleshooting/](troubleshooting/)

---

### Por Necessidade

| Necessidade              | Caminho                             |
| ------------------------ | ----------------------------------- |
| Começar rapidamente      | `guides/QUICK_START.md`             |
| Setup completo           | `guides/GETTING_STARTED.md`         |
| Ver progresso            | `planning/STATUS.md`                |
| Ver plano                | `planning/ROADMAP.md`               |
| Entender estrutura       | `architecture/PROJECT_STRUCTURE.md` |
| Entender decisão técnica | `adr/`                              |
| Resolver problema        | `troubleshooting/`                  |
| Deploy (futuro)          | `runbooks/`                         |

---

## 🎨 Convenções de Estilo

### Nomes de Arquivo

- **UPPERCASE.md** para documentos importantes (README, INDEX, etc)
- **kebab-case.md** para documentos técnicos (rls-policies-template.md)
- **PascalCase.md** para ADRs numerados (001-monorepo-with-turborepo.md)

### Estrutura de Documento

```markdown
# Título

Breve descrição

---

## Seção Principal

Conteúdo...

---

## Outra Seção

Conteúdo...

---

**Última atualização:** YYYY-MM-DD
```

### Emojis

- 📚 Documentação geral
- 📖 Guias
- 🗺️ Planejamento
- 📐 Arquitetura
- 🔧 Troubleshooting
- 📘 Runbooks
- 📋 ADRs
- ✅ Completo
- ⏳ Em progresso
- 📅 Planejado
- 🚀 Ação/Comando

---

## 🔗 Links Entre Documentos

### Links Relativos

Sempre use links relativos dentro de `docs/`:

```markdown
# De docs/guides/QUICK_START.md

[Roadmap](../planning/ROADMAP.md)

# De docs/planning/ROADMAP.md

[Quick Start](../guides/QUICK_START.md)

# De docs/README.md

[Quick Start](guides/QUICK_START.md)
```

### Links para Raiz

```markdown
[README Principal](../README.md)
[CLAUDE.md](../CLAUDE.md)
```

---

## 📝 Mantendo a Documentação

### Quando Adicionar Novo Doc

1. **Escolha a categoria certa**
2. **Crie o arquivo** na pasta apropriada
3. **Atualize README** da categoria
4. **Atualize INDEX.md** principal
5. **Atualize links** relacionados
6. **Adicione à tabela** deste arquivo

### Quando Atualizar Doc

1. **Faça as mudanças**
2. **Atualize a data** no final do arquivo
3. **Verifique links** quebrados
4. **Atualize referências** se necessário

---

## 🚀 Evolução da Documentação

### Phase 0 ✅ (Atual)

- Estrutura base criada
- Documentos fundamentais
- Guias de início
- ADR inicial

### Phase 1 (Próxima)

- [ ] Supabase setup guide
- [ ] Authentication guide
- [ ] ADR-002: Supabase Backend
- [ ] ADR-003: MFA Strategy

### Phase 2

- [ ] WatermelonDB guide
- [ ] Sync engine docs
- [ ] ADR-004: Offline Strategy
- [ ] First runbook (backup)

### Phase 9+

- [ ] Deployment runbooks
- [ ] Monitoring guides
- [ ] Performance guides
- [ ] User documentation

---

**Estrutura criada em:** 2026-01-04
**Versão da estrutura:** 1.0
**Última atualização:** 2026-01-04
**Total de documentos:** 17
**Status:** ✅ Organizado e pronto para crescer
