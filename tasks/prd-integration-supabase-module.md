# PRD: Reorganização do Módulo `integration/supabase`

## Introduction

O módulo `integration/` cresceu de forma plana, misturando pacotes de infraestrutura
local (WatermelonDB, sync engine) com pacotes que dependem diretamente do Supabase SDK.
Esse PRD descreve a criação de um sub-contêiner `integration/supabase/` para agrupar
todos os pacotes que se comunicam diretamente com o Supabase, começando pelo pacote
`auth`. A `integration/supabase/` já existe como pasta de migrações SQL do Supabase CLI
— ela é promovida a contêiner de pacotes sem nenhuma perda de dados.

Além da reorganização física dos arquivos, o `pnpm-workspace.yaml` passa de globs
(`integration/*`) para listagem explícita de cada pacote, e o `CLAUDE.md` recebe a
documentação do padrão para que futuras implementações sigam a mesma convenção.

---

## Goals

- Mover `integration/auth/` para `integration/supabase/auth/` sem quebrar nenhum
  consumidor existente
- Renomear o pacote de `@automatize/auth` para `@automatize/supabase-auth` com
  atualização de todas as referências no monorepo
- Substituir globs no `pnpm-workspace.yaml` por listagem explícita de cada pacote,
  tornando o workspace completamente auditável
- Documentar no `CLAUDE.md` o padrão `integration/supabase/<domain>/` e a convenção
  `@automatize/supabase-<domain>` para novas implementações futuras
- Manter as migrações SQL do Supabase CLI em `integration/supabase/migrations/` sem
  alteração de caminho

---

## Scope

### Estrutura atual

```
integration/
├── auth/          → @automatize/auth        (usa Supabase SDK diretamente)
├── storage/       → @automatize/storage     (WatermelonDB, sem Supabase)
├── sync/          → @automatize/sync        (HTTP via ky, sem Supabase)
└── supabase/      → sem package.json
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_rls_policies.sql
        ├── 003_auth_functions.sql
        └── 004_dev_seed.sql
```

### Estrutura alvo

```
integration/
├── storage/       → @automatize/storage     (inalterado)
├── sync/          → @automatize/sync        (inalterado)
└── supabase/      → contêiner plano (sem package.json)
    ├── auth/      → @automatize/supabase-auth   ← movido + renomeado
    └── migrations/                              ← inalterado (Supabase CLI)
        ├── 001_initial_schema.sql
        ├── 002_rls_policies.sql
        ├── 003_auth_functions.sql
        └── 004_dev_seed.sql
```

### pnpm-workspace.yaml atual

```yaml
packages:
  - 'apps/*'
  - 'core'
  - 'packages/*'
  - 'integration/*'
  - 'tools/*'
```

### pnpm-workspace.yaml alvo (explícito)

```yaml
packages:
  # Apps
  - 'apps/mobile'
  - 'apps/web'
  - 'apps/windows'
  # Core
  - 'core'
  # Design system
  - 'packages/ui'
  # Integration — local infrastructure
  - 'integration/storage'
  - 'integration/sync'
  # Integration — Supabase ecosystem
  - 'integration/supabase/auth'
  # Tools
  - 'tools/eslint-config'
  - 'tools/tsconfig'
```

> **Por que explícito?** Globs como `integration/*` ou `integration/**` são implícitos:
> qualquer pasta com `package.json` é silenciosamente incluída, tornando impossível
> auditar o workspace sem rodar um comando. A listagem explícita transforma o
> `pnpm-workspace.yaml` em documentação viva da arquitetura — cada novo pacote exige
> uma decisão consciente e revisada em PR. É o padrão adotado por Vercel, Linear e
> Shopify em seus monorepos.

---

## User Stories

### US-001: Mover o pacote `auth` para dentro de `integration/supabase/`

**Description:** As a developer, I want the `auth` package to live inside
`integration/supabase/auth/` so that the folder structure visually communicates that
it depends directly on the Supabase SDK.

**Acceptance Criteria:**

- [ ] A pasta `integration/auth/` é movida para `integration/supabase/auth/` com todos
      os seus arquivos e subpastas preservados integralmente
- [ ] Nenhum arquivo interno do pacote é modificado nesta etapa (apenas a localização
      física muda)
- [ ] `integration/supabase/` não recebe `package.json` — permanece contêiner plano
- [ ] `integration/supabase/migrations/` permanece intocado
- [ ] `git status` mostra a operação como rename/move (não como delete + create)
- [ ] Typecheck passes (`pnpm turbo run typecheck`)

### US-002: Renomear o pacote de `@automatize/auth` para `@automatize/supabase-auth`

**Description:** As a developer, I want the package name to follow the
`@automatize/supabase-<domain>` convention so that any engineer immediately knows this
package interacts directly with the Supabase SDK.

**Acceptance Criteria:**

- [ ] `integration/supabase/auth/package.json` tem `"name": "@automatize/supabase-auth"`
- [ ] Todas as ocorrências de `"@automatize/auth"` no monorepo são substituídas por
      `"@automatize/supabase-auth"` (package.json de outros pacotes, imports TypeScript,
      documentação)
- [ ] `pnpm install` executa sem erros
- [ ] Typecheck passes (`pnpm turbo run typecheck`)
- [ ] `pnpm turbo run build` conclui sem erros

### US-003: Atualizar `pnpm-workspace.yaml` para listagem explícita

**Description:** As a developer, I want the workspace file to list every package path
explicitly so that the monorepo architecture is immediately auditable without running
any command.

**Acceptance Criteria:**

- [ ] `pnpm-workspace.yaml` não contém nenhum glob com wildcard (`*`)
- [ ] Todos os pacotes existentes estão listados individualmente com comentários de
      seção (Apps, Core, Design system, Integration — local infrastructure,
      Integration — Supabase ecosystem, Tools)
- [ ] `integration/supabase/auth` está listado na seção "Integration — Supabase
      ecosystem"
- [ ] `pnpm install` executa sem erros após a mudança
- [ ] `pnpm turbo run build` enxerga todos os pacotes corretamente
- [ ] Typecheck passes

### US-004: Atualizar `CLAUDE.md` com o padrão do módulo Supabase

**Description:** As a developer (or AI agent), I want the CLAUDE.md to document the
`integration/supabase/` pattern so that any future Supabase-related package is created
in the correct location with the correct naming convention without ambiguity.

**Acceptance Criteria:**

- [ ] A seção **"Integration Module — Pattern (Mandatory)"** do `CLAUDE.md` é atualizada
      com as seguintes informações:
  - `integration/supabase/` é um segundo nível de contêiner plano (sem `package.json`,
    sem `src/`) que agrupa pacotes que dependem diretamente do Supabase SDK
  - Pacotes Supabase seguem o nome `@automatize/supabase-<domain>`
    (ex: `@automatize/supabase-auth`, `@automatize/supabase-functions`)
  - Novos pacotes Supabase devem ser adicionados em `integration/supabase/<domain>/`
    e listados explicitamente no `pnpm-workspace.yaml` na seção
    "Integration — Supabase ecosystem"
  - O `scaffolding checklist` existente se aplica igualmente a sub-pacotes Supabase
- [ ] A seção **"Project Structure (Mandatory)"** do `CLAUDE.md` é atualizada com o
      diagrama de estrutura refletindo `integration/supabase/auth/`
- [ ] A nota do Supabase CLI (`--workdir integration/supabase`) permanece correta e
      visível (o caminho não muda)
- [ ] Nenhuma outra seção do CLAUDE.md é removida ou alterada

---

## Functional Requirements

- **FR-1:** A pasta `integration/auth/` deve ser movida para `integration/supabase/auth/`
  mantendo toda a estrutura interna de arquivos intacta.
- **FR-2:** O campo `name` em `integration/supabase/auth/package.json` deve ser alterado
  de `"@automatize/auth"` para `"@automatize/supabase-auth"`.
- **FR-3:** Toda referência a `@automatize/auth` no monorepo (campos `dependencies`,
  `devDependencies`, `peerDependencies` em qualquer `package.json`, bem como imports
  TypeScript em qualquer arquivo `.ts` ou `.tsx`) deve ser atualizada para
  `@automatize/supabase-auth`.
- **FR-4:** O `pnpm-workspace.yaml` deve substituir todos os globs por caminhos
  explícitos, um por linha, agrupados por comentários de seção.
- **FR-5:** `integration/supabase/` não deve receber `package.json` em nenhum momento
  — é e permanece um contêiner plano.
- **FR-6:** `integration/supabase/migrations/` não deve ser movido, renomeado ou
  modificado em nenhum arquivo SQL.
- **FR-7:** O `CLAUDE.md` deve documentar o padrão `integration/supabase/<domain>/` e
  a convenção de nome `@automatize/supabase-<domain>` na seção
  "Integration Module — Pattern (Mandatory)".
- **FR-8:** O diagrama de estrutura em "Project Structure (Mandatory)" do `CLAUDE.md`
  deve refletir a nova localização de `auth` em `integration/supabase/auth/`.

---

## Non-Goals

- Não serão criados novos sub-pacotes Supabase neste PRD (ex: `supabase-functions`,
  `supabase-realtime`) — apenas `auth` é movido
- Nenhuma lógica interna do pacote `auth` será alterada (zero mudanças em `.ts`)
- O `turbo.json` não requer alteração — ele opera sobre nomes de pacotes via
  `dependsOn`, não caminhos físicos
- Não serão adicionadas novas tarefas de CI/CD
- As migrações SQL não serão alteradas

---

## Technical Considerations

### Nota crítica: nome de pacote npm

`@automatize/supabase/auth` **não é um nome de pacote npm válido.** O npm permite
slash apenas no prefixo de escopo (`@scope/name`). Qualquer barra adicional causa erro
no `pnpm install`. O nome correto e válido é `@automatize/supabase-auth`.

### Supabase CLI workdir inalterado

O `CLAUDE.md` documenta `--workdir integration/supabase` para o CLI. Como as migrações
continuam em `integration/supabase/migrations/`, este caminho permanece correto após
o `auth/` ser adicionado como sub-pasta irmã. Nenhuma instrução CLI precisa mudar.

### `git mv` para histórico limpo

O move deve ser feito com `git mv integration/auth integration/supabase/auth` para que
o Git rastreie como rename e preserve o histórico de commits do arquivo. Usar
delete + create apagaria o histórico.

### Verificação de referências

Antes de concluir, buscar por `@automatize/auth` em todo o repositório:

```bash
grep -r "@automatize/auth" . --include="*.json" --include="*.ts" --include="*.tsx" --include="*.md"
```

Nenhum resultado deve restar após a execução da US-002.

### pnpm-workspace.yaml — política de manutenção

Com listagem explícita, qualquer novo pacote exige atualização manual do
`pnpm-workspace.yaml`. Isso é intencional. O arquivo torna-se o registro canônico
da arquitetura do monorepo.

---

## Success Metrics

- `pnpm install` executa sem warnings ou erros após todas as mudanças
- `pnpm turbo run build` completa com sucesso para todos os pacotes
- `pnpm turbo run typecheck` completa com sucesso para todos os pacotes
- `pnpm turbo run test:unit` completa com sucesso (nenhum teste quebrado)
- Zero ocorrências de `@automatize/auth` no repositório após a refatoração
- `git log --follow integration/supabase/auth/src/index.ts` exibe histórico completo
  (confirma que o Git rastreou como rename)

---

## Open Questions

- Nenhuma. Todas as decisões foram tomadas pelo owner do projeto.
