# Project Structure

This document provides a visual overview of the Automatize project structure after Phase 0 completion.

## Directory Tree

```
automatize/
│
├── .github/
│   └── workflows/
│       └── ci.yml                          # CI/CD pipeline
│
├── .husky/
│   ├── commit-msg                          # Commit message validation hook
│   └── pre-commit                          # Pre-commit linting hook
│
├── apps/
│   ├── mobile/                             # Expo app (iOS/Android/Web)
│   │   ├── app/
│   │   │   ├── _layout.tsx                 # Root layout
│   │   │   └── index.tsx                   # Home screen
│   │   ├── assets/                         # Images, fonts, etc.
│   │   ├── .eslintrc.js
│   │   ├── app.json                        # Expo configuration
│   │   ├── babel.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                                # Web-specific (Phase 10)
│   │   └── package.json
│   │
│   └── windows/                            # Windows desktop (Phase 11)
│       └── package.json
│
├── core/                                   # Business logic (platform-agnostic)
│   ├── src/
│   │   ├── domain/                         # Entities, Value Objects
│   │   ├── services/                       # Use cases
│   │   ├── hooks/                          # Domain React hooks
│   │   ├── types/
│   │   │   └── index.ts                    # Base types (BaseEntity, UserRole)
│   │   ├── utils/
│   │   │   ├── index.ts                    # Utility functions
│   │   │   └── index.test.ts               # Unit tests
│   │   └── index.ts                        # Package entry
│   ├── .eslintrc.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsup.config.ts
│   └── vitest.config.ts
│
├── integration/                            # Plain container — no package.json
│   ├── auth/                               # @automatize/auth — Authentication
│   │   ├── src/
│   │   │   ├── hooks/                      # Auth hooks
│   │   │   ├── providers/                  # Auth provider
│   │   │   ├── utils/                      # Auth utilities
│   │   │   └── index.ts                    # Package entry
│   │   ├── .eslintrc.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── vitest.config.ts
│   │
│   ├── storage/                            # @automatize/storage — WatermelonDB
│   │   ├── src/
│   │   │   ├── models/                     # WatermelonDB models
│   │   │   ├── schemas/                    # Database schemas
│   │   │   ├── adapters/                   # Platform adapters
│   │   │   └── index.ts                    # Package entry
│   │   ├── .eslintrc.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── vitest.config.ts
│   │
│   ├── sync/                               # @automatize/sync — Sync engine
│   │   ├── src/
│   │   │   ├── engine/                     # Sync orchestration
│   │   │   ├── operations/                 # Push/Pull operations
│   │   │   └── index.ts                    # Package entry
│   │   ├── .eslintrc.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── vitest.config.ts
│   │
│   └── supabase/                           # Supabase CLI project
│       └── migrations/                     # SQL migration files
│
├── packages/
│   └── ui/                                 # Design system
│       ├── src/
│       │   ├── components/                 # UI components
│       │   ├── tokens/
│       │   │   ├── colors.ts               # Color system
│       │   │   ├── spacing.ts              # Spacing scale
│       │   │   ├── typography.ts           # Font system
│       │   │   └── index.ts                # Tokens entry
│       │   ├── theme/                      # Theme provider
│       │   └── index.ts                    # Package entry
│       ├── .eslintrc.js
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
│
├── docs/
│   ├── adr/
│   │   ├── 001-monorepo-with-turborepo.md  # First ADR
│   │   ├── adr-template.md                 # ADR template
│   │   └── README.md                       # ADR index
│   ├── runbooks/                           # (Future) Operational guides
│   └── rls-policies-template.md            # RLS policies template
│
├── tools/
│   ├── eslint-config/
│   │   ├── base.js                         # Base ESLint config
│   │   ├── react-native.js                 # React Native config
│   │   └── package.json
│   │
│   └── tsconfig/
│       ├── base.json                       # Base TypeScript config
│       ├── react-native.json               # React Native config
│       └── package.json
│
├── .commitlintrc.json                      # Commitlint configuration
├── .env.example                            # Environment variables template
├── .eslintrc.js                            # Root ESLint config
├── .gitignore                              # Git ignore rules
├── .lintstagedrc.json                      # Lint-staged config
├── .npmrc                                  # pnpm settings
├── .prettierignore                         # Prettier ignore rules
├── .prettierrc.json                        # Prettier configuration
├── CLAUDE.md                               # Project context & standards
├── GETTING_STARTED.md                      # Setup guide
├── package.json                            # Root package.json
├── PHASE_0_COMPLETE.md                     # Phase 0 completion summary
├── pnpm-workspace.yaml                     # Workspace configuration
├── PROJECT_STRUCTURE.md                    # This file
├── README.md                               # Main README
├── renovate.json                           # Renovate configuration
├── ROADMAP.md                              # Development roadmap
└── turbo.json                              # Turborepo configuration
```

---

## Package Dependencies

### Dependency Graph

```
apps/mobile
  ├─> @automatize/core
  ├─> @automatize/ui
  ├─> @automatize/sync
  ├─> @automatize/storage
  └─> @automatize/auth

@automatize/ui
  └─> @automatize/core

@automatize/sync
  ├─> @automatize/core
  └─> @automatize/storage

@automatize/storage
  └─> @automatize/core

@automatize/auth
  └─> @automatize/core

@automatize/core
  └─> (no internal dependencies)
```

### Build Order (Managed by Turborepo)

1. `@automatize/core` (no dependencies)
2. `@automatize/ui`, `@automatize/storage`, `@automatize/auth` (depend on core)
3. `@automatize/sync` (depends on core + storage)
4. `apps/mobile` (depends on all packages)

---

## File Count by Type

| Type              | Count   | Examples                              |
| ----------------- | ------- | ------------------------------------- |
| TypeScript Source | 12      | `*.ts`, `*.tsx`                       |
| Tests             | 1       | `*.test.ts`                           |
| Configuration     | 20+     | `package.json`, `tsconfig.json`, etc. |
| Documentation     | 8       | `*.md`                                |
| CI/CD             | 1       | `.github/workflows/ci.yml`            |
| Git Hooks         | 2       | `.husky/*`                            |
| **Total**         | **45+** |                                       |

---

## Key Configuration Files

### Root Level

| File                  | Purpose                   |
| --------------------- | ------------------------- |
| `package.json`        | Root package with scripts |
| `turbo.json`          | Turborepo build pipeline  |
| `pnpm-workspace.yaml` | Workspace definition      |
| `.npmrc`              | pnpm configuration        |
| `.gitignore`          | Git ignore rules          |
| `.env.example`        | Environment template      |

### Code Quality

| File                 | Purpose                 |
| -------------------- | ----------------------- |
| `.eslintrc.js`       | ESLint configuration    |
| `.prettierrc.json`   | Prettier configuration  |
| `.commitlintrc.json` | Commit message rules    |
| `.lintstagedrc.json` | Pre-commit hooks config |

### Git Hooks

| File                | Purpose                   |
| ------------------- | ------------------------- |
| `.husky/pre-commit` | Run linting before commit |
| `.husky/commit-msg` | Validate commit messages  |

### CI/CD

| File                       | Purpose                      |
| -------------------------- | ---------------------------- |
| `.github/workflows/ci.yml` | GitHub Actions pipeline      |
| `renovate.json`            | Automated dependency updates |

---

## Source Code Statistics

### Lines of Code (Approximate)

| Category          | Lines      |
| ----------------- | ---------- |
| TypeScript Source | ~500       |
| Tests             | ~60        |
| Configuration     | ~1,000     |
| Documentation     | ~2,000     |
| **Total**         | **~3,560** |

### Package Breakdown

| Package               | Files | Lines (approx) |
| --------------------- | ----- | -------------- |
| `@automatize/core`    | 5     | ~200           |
| `@automatize/ui`      | 5     | ~300           |
| `@automatize/sync`    | 2     | ~20            |
| `@automatize/storage` | 2     | ~20            |
| `@automatize/auth`    | 2     | ~20            |
| `apps/mobile`         | 4     | ~100           |

---

## Future Structure (Phases 1-3)

As the project grows, expect these additions:

### Phase 1 (Auth & Multi-tenancy)

```
integration/auth/src/
  ├── hooks/
  │   ├── useAuth.ts
  │   ├── useSession.ts
  │   └── useMFA.ts
  ├── providers/
  │   └── AuthProvider.tsx
  └── utils/
      ├── supabase.ts
      └── secure-storage.ts

apps/mobile/app/
  ├── (auth)/
  │   ├── login.tsx
  │   ├── register.tsx
  │   └── mfa-setup.tsx
  └── (app)/
      └── (tabs)/
          └── index.tsx
```

### Phase 2 (Offline-First)

```
integration/storage/src/
  ├── models/
  │   ├── User.ts
  │   └── Tenant.ts
  ├── schemas/
  │   └── schema.ts
  └── adapters/
      ├── sqlite.ts
      └── indexeddb.ts

integration/sync/src/
  ├── engine/
  │   └── SyncEngine.ts
  ├── operations/
  │   ├── push.ts
  │   └── pull.ts
  └── migrations/
      └── index.ts
```

### Phase 3 (Invoices MVP)

```
core/src/
  ├── domain/
  │   ├── Invoice.ts
  │   └── InvoiceSchema.ts
  └── services/
      ├── InvoiceService.ts
      └── InvoiceCalculations.ts

apps/mobile/app/(app)/
  ├── invoices/
  │   ├── index.tsx
  │   ├── [id].tsx
  │   └── new.tsx
```

---

## Navigation

- [Main README](../README.md)
- [Getting Started](../GETTING_STARTED.md)
- [Phase 0 Complete](../PHASE_0_COMPLETE.md)
- [Roadmap](../ROADMAP.md)
- [Project Context](../CLAUDE.md)

---

**Last Updated:** 2026-01-04
**Phase:** 0 - Foundation & Setup ✅
