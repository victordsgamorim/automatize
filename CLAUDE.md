# AGENT INSTRUCTION — Cross-Platform Invoicing System

## 1) Role and Mission

You are an Engineering AGENT responsible for building and evolving a **cross-platform** invoicing system that runs on:

- **Mobile:** iOS and Android
- **Web**
- **Windows Desktop**

The system must support these core domains:

- Invoices
- Products
- Clients
- Analytics

The product and its UX/UI must be defined **incrementally**, without compromising architecture, quality, or security.

---

## 2) Mandatory First Step (Non-Negotiable)

Before performing any task, you **MUST** read `README.md` and treat it as the **highest-priority source of truth** for:

- bootstrapping steps
- scripts and workflows
- architecture notes
- environment configuration
- contribution and release rules
- security constraints

Conflict resolution order:

1. `README.md`
2. This instruction
3. Codebase reality (tests, types, lint rules)
4. Everything else

---

## 3) Non-Negotiable Principles

Always prioritize, in this order:

1. Production-grade quality
2. Predictability and consistency
3. Extreme security
4. Extreme privacy (PII-safe)
5. Professional, comfortable UX for prolonged use
6. True offline-first with resilient sync
7. Multi-tenancy and access control

Global rules:

- Use a **feature-modular architecture**.
- Enforce **true offline-first**: the app must fully function offline.
- Implement **resilient sync**: async, idempotent, retryable, circuit-breaker protected.
- Enforce **tenant isolation** at every layer.
- Treat personal data as **PII** and apply strict redaction and isolation.

---

## 4) Predictable Performance and Governance

You MUST implement and continuously maintain:

- Secure observability (with PII redaction)
- Comfortable design for prolonged use
- Technical governance via ADR (Architecture Decision Records)
- Living documentation (kept current as the system evolves)
- Remote backend via Supabase MCP
- Tooling with automatic enforcement (CI / lint / pre-commit)
- Mandatory unit and integration tests (plus E2E where applicable)

---

## 5) Official Technical Decisions (Do Not Negotiate)

### 5.1 Local Database & Storage

**Local database:** WatermelonDB

Requirements:

- native offline-first
- performance optimized with lazy loading
- built-in resilient sync
- reactive change observation
- multi-threading (must not block UI)
- cross-platform support (RN + Web via adapters)

### 5.2 ID Generation

**Standard:** ULID  
**Library:** `ulid`  
Format example: `01ARZ3NDEKTSV4RRFFQ69G5FAV`

Requirements:

- chronologically sortable
- embedded timestamp
- comparable size to UUID v4

### 5.3 State Management

- **Server/sync cache:** TanStack Query (React Query)
- **Local component/module state:** React `useState` / `useReducer`
- **Cross-component state:** React Provider, scoped to the module that owns it

Responsibilities:

- TanStack Query → server/sync cache
- React Provider → shared state within a bounded module (e.g. auth session, theme, i18n)
- `useState` / `useReducer` → local or provider-owned state

### 5.4 Navigation

**Library:** Expo Router

Requirements:

- file-based routing
- typed deep linking
- full TypeScript support
- seamless Expo integration
- shared layouts
- unified Web + Mobile routing

### 5.5 Validation

**Library:** Zod

Requirements:

- TypeScript-first with inferred types
- runtime + compile-time safety
- composable schemas with `transform` + `refine`
- custom error messages
- invariants enforced in the domain layer

---

## 6) Development Tooling (Mandatory)

### 6.1 Monorepo & Package Management

- **Monorepo:** Turborepo
- **Package manager:** pnpm (strict mode)

### 6.2 Testing

- **Unit & Integration:** Vitest + Testing Library
- **E2E:**
  - Mobile: Maestro
  - Web: Playwright

### 6.3 HTTP Client

**Library:** ky

Requirements:

- configurable retry
- configurable timeout
- request/response hooks
- native TypeScript support

### 6.4 Date/Time

**Library:** date-fns (+ date-fns-tz)

Requirements:

- tree-shakeable imports
- immutable operations
- i18n-ready
- prefer date-fns for performance and bundle efficiency

---

## 7) Git Workflow and Delivery Gates

### 7.1 Branching Strategy

**GitHub Flow**

- `main` → production (always deployable)
- `feature/*` → features
- `fix/*` → bug fixes
- `hotfix/*` → emergencies

Rules:

- Pull Requests required
- CI must pass 100%
- 1+ approval required
- squash merge preferred

### 7.2 Commit Convention

**Standard:** Conventional Commits  
**Enforcement:** commitlint + husky

Required types:

- feat
- fix
- docs
- refactor
- test
- chore
- perf
- ci

---

## 8) Environments and Configuration

Required environments:

1. Local (development)
2. Staging
3. Production
4. E2E

Rules:

- environment variables must be defined per environment (e.g., `.env.development`, `.env.production`)
- staging must be used for full QA before production
- E2E must run in an isolated environment with automatic resets

---

## 9) Mobile-Specific Requirements

### 9.1 Network Detection

**Library:** `@react-native-community/netinfo`  
Rule: when connectivity is restored, trigger sync.

### 9.2 Background Sync Strategy

- iOS: background fetch + silent push notifications
- Android: WorkManager via `expo-task-manager`
- Web: service workers with periodic background sync

### 9.3 Permissions

**Library:** `expo-permissions`

Mandatory UX:

1. Explain why the permission is needed
2. Request permission
3. If denied → show a deep link to Settings

### 9.4 Push Notifications

**Tooling:** Expo Notifications + FCM

Use cases:

- sync completed
- critical sync errors
- reminders (invoices due)
- important updates

### 9.5 File Handling

Upload/Download: `expo-file-system`

Rules:

- < 5MB → direct upload
- > 5MB → chunked, resumable upload
- progress tracking required
- background upload when possible

---

## 10) Design System (Mandatory)

### 10.1 Design Tokens

- token structure must follow semantic layers (Tailwind/Radix style)
- generate cross-platform tokens via Style Dictionary
- hardcoded colors/spacing in features are forbidden

### 10.2 Responsive Design (Web)

Mobile-first. Use defined breakpoints consistently.

### 10.3 Asset Management

Use a consistent asset structure and enforce:

- sharp for image optimization (build time)
- SVG as React components (tree-shakeable)
- WebP with PNG fallback
- lazy loading of images

---

## 11) Internationalization (i18n)

**Library:** i18next + react-i18next

Requirements:

- namespaces for code splitting
- lazy loading translations
- full TypeScript support
- fallback language: `en`

---

## 12) Accessibility (Mandatory)

Compliance: **WCAG 2.1 Level AA**

Mandatory checklist per feature:

- labels for all inputs and buttons
- correct semantic roles
- logical focus management
- minimum contrast ratio 4.5:1
- minimum touch targets 44x44
- keyboard navigation works (Web/Desktop)
- screen reader tested (VoiceOver / TalkBack)

---

## 13) Error Boundaries

**Library:** react-error-boundary

Requirements:

- root-level boundary
- feature-level boundary (per main route)
- component-level boundary (critical components)
- all logs must be PII-redacted

---

## 14) Platform Strategy (Official)

Use Expo (React Native) for:

- Mobile (iOS / Android)
- Web (react-native-web)

Separate Windows Desktop app using:

- react-native-windows

Shared core is mandatory. All domain logic must live outside apps:

- business rules
- calculations
- validations
- types
- services
- domain hooks

### Non-Negotiable Rule

No business rule may depend on:

- Expo APIs
- platform-specific APIs
- UI or navigation

---

## 15) Project Structure (Mandatory)

The repository SHOULD follow this structure exactly.

```text
project/
  apps/
    mobile/              # Expo (iOS + Android)
    web/                 # Expo Web
    windows/             # RN Windows

  core/                  #  Bridge module wiring integration, features, etc

  integration/           # infrastructure with services, client-sdk, database
    storage/             # @automatize/storage — DB adapters (WatermelonDB)
      models/
      schemas/
      adapters/
      migrations/
    sync/                # @automatize/sync — Sync engine (WatermelonDB)
      engine/
      operations/
      migrations/
      docs/
    supabase/            # Plain container (no package.json, no src/)
      auth/              # @automatize/supabase-auth — Auth logic (Supabase SDK)
        hooks/
        providers/
        utils/
      migrations/        # Supabase CLI SQL migration files (NOT a package)
    payment/             # @automatize/integration-payment (future)
    nfe/                 # @automatize/integration-nfe (future)
    <domain>/            # One sub-package per integration domain

  packages/              # packages for features
    navigation/          # Cross-platform navigation logic
      hooks/
      components/
      utils/
    ui/                  # Design system + components
      components/
      tokens/
      theme/
      docs/

  tools/
    eslint-config/
    tsconfig/
```

Hard rules:

- `core/` MUST never import from `apps/`
- `core/` MUST never use platform APIs
- UI MUST be a thin wrapper over core
- `integration/` MUST have no `package.json` and no `src/`
- Each sub-package inside `integration/` MUST have its own `package.json` and tests
- Packages that use Supabase SDK directly MUST live under `integration/supabase/<domain>/`
- `pnpm-workspace.yaml` MUST list every package explicitly (no globs)

---

## 16) Backend, Sync, and Extreme Security (Mandatory)

### 16.1 Supabase MCP (Remote Source)

- Supabase is the remote source for controlled CRUD and sync operations via Supabase MCP
- The UI MUST NOT depend on remote reads to function
- WatermelonDB is the local source of truth

### 16.2 Extreme Protection Principles

- Never trust the client
- Access rules MUST live in Postgres (RLS) and/or Edge Functions
- Separate PII from operational domain (distinct schemas/tables)
- Encryption layers:
  - TLS in transit
  - infra encryption at rest
  - field encryption for sensitive PII (prefer client-side when feasible)
- Least privilege:
  - service role keys MUST never be in the app
  - privileged keys MUST exist only in Edge Functions

### 16.3 Supabase Hardening

Postgres + RLS:

- RLS ON for 100% of tables exposed via API
- Policies required for SELECT/INSERT/UPDATE/DELETE
- All tables MUST include `tenant_id` (ULID)
- JWT MUST carry `tenant_id` and role/permissions
- Policies MUST validate tenant_id via JWT claims
- PII tables MUST be isolated (e.g., private schema)
- Grants/privileges MUST be reviewed and minimized

Auth:

- MFA mandatory (minimum TOTP)
- Custom JWT claims: tenant_id, role/permissions
- Administrative actions MUST never be executed directly by the client

Edge Functions:

- Mandatory for privileged operations, external integrations, complex validations, rate limiting
- Service role key only in Function environment
- Input validation required (Zod)
- Structured logs with redaction

Secrets/Vault:

- Secrets only in Vault/Secrets
- Hardcoding secrets is forbidden (code/build/versioned config)

Storage:

- Private buckets only
- Signed URLs with short TTL (< 15 minutes)
- Public buckets are forbidden

---

## 17) API Contract — Sync and CRUD (Mandatory)

Create and maintain:

- `integration/sync/docs/api-contract.md`

Push (Outbox):

- `pushOperations(operations[])`

Each operation includes:

- opId (ULID)
- accountId (ULID)
- entityType (string)
- entityId (ULID)
- operationType (CREATE | UPDATE | DELETE)
- payload (JSON)
- baseVersion (number)
- createdAt (ISO 8601)

Pull (Delta Sync):

- `pullChanges(cursor)`

Rules:

- return incremental changes + new cursor
- cursor based on timestamp
- idempotency enforced by `opId` (ULID)
- soft delete via `deletedAt`
- multi-tenancy enforced via RLS
- breaking changes require ADR + versioning

---

## 18) Multi-Tenancy and Access Control (Mandatory)

- All entities MUST have `tenantId` (ULID)
- Tenant isolation is mandatory

Minimum roles:

- admin
- editor
- viewer

Rules:

- Authorization logic MUST live in `core/`
- UI MUST only query/apply permissions
- Invalid writes MUST fail in the domain layer before persistence

---

## 19) Offline-First Architecture and Sync Engine (Mandatory)

- WatermelonDB is the source of truth
- Writes:
  - persist to WatermelonDB immediately
  - always generate an outbox operation
- Central sync engine in `integration/sync`:
  - push + incremental pull
  - idempotent via opId (ULID)
  - asynchronous and resilient
  - never blocks UI
  - exponential backoff + jitter
  - configurable circuit breaker
  - network detection via NetInfo

---

## 20) Lists, Pagination, and Lazy Loading (Mandatory)

All lists MUST be:

- paginated (cursor or limit/offset)
- lazy-loaded (infinite scroll)
- virtualized (react-native-virtualized-list or FlashList)
- searchable offline via WatermelonDB queries

Rendering full datasets at once is forbidden.

---

## 21) Tooling & Quality Gates (Mandatory)

ESLint:

- Use exactly the provided ESLint config from `tools/eslint-config`
- Do not rewrite rules from scratch
- Size/complexity rules are refactoring triggers

#### Enforced Lint Rules (`tools/eslint-config/base.js`)

| Rule                                                | Severity  | Notes                                                                                                                             |
| --------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `@typescript-eslint/no-unused-vars`                 | **error** | Unused variables/args MUST be prefixed with `_` (e.g. `_e`, `_unused`). Pattern: `argsIgnorePattern: ^_`, `varsIgnorePattern: ^_` |
| `@typescript-eslint/no-explicit-any`                | warn      | Avoid `any`; use `unknown` or proper types                                                                                        |
| `@typescript-eslint/no-non-null-assertion`          | warn      | Avoid `!` assertions; prefer optional chaining or guards                                                                          |
| `@typescript-eslint/explicit-module-boundary-types` | off       | Return types are inferred                                                                                                         |
| `no-console`                                        | warn      | Only `console.warn` and `console.error` are allowed                                                                               |
| `prefer-const`                                      | **error** | Use `const` unless reassignment is needed                                                                                         |
| `no-var`                                            | **error** | Never use `var`                                                                                                                   |

**Key convention:** unused function parameters MUST start with `_` (underscore) to pass lint. Example: `(_event: MouseEvent) => { ... }`

Pre-commit:

- Use the provided `.pre-commit-config.yaml`
- Required hooks:
  - Prettier
  - ESLint
  - check-json
  - check-yaml
  - detect-private-key
  - end-of-file-fixer
  - trailing-whitespace
  - validate-hook-names
- Commits MUST be rejected if pre-commit fails

Husky + Commitlint:

- Commitlint enforces Conventional Commits
- Pre-commit runs lint + typecheck
- Pre-push runs tests

CI (minimum required pipeline):

1. Install + cache (pnpm + turborepo cache)
2. Typecheck
3. Lint
4. Format check
5. Unit tests (+ coverage upload)
6. Integration tests
7. Build

Branch protection:

- CI must pass 100%
- 1+ review approval
- No merge conflicts

---

## 22) Tests as a Quality Contract (Mandatory)

Unit tests MUST cover:

- business rules (100% of use cases)
- calculations and validations (edge cases)
- domain invariants (Zod schemas)
- permissions (RBAC/ABAC rules)
- data transformations

Unit test rules:

- no UI dependency
- no real Supabase (use MSW mocks)
- external deps mocked
- parallelizable and fast

Integration tests MUST validate:

- full flows per feature (journeys)
- offline → online transitions and sync behavior
- outbox generation and pending operations
- tenant isolation enforcement
- retry logic and recoverable errors

After completing a feature:

1. Add unit tests (coverage > 80%)
2. Add integration tests (happy path + failure cases)
3. Run `pnpm test` (unit + integration)
4. Run `pnpm lint` and `pnpm typecheck`
5. Fix all errors/warnings
6. Open PR only when all gates pass

---

## 23) Shared Tools — TypeScript and ESLint (Mandatory)

Every module MUST use the shared configs from `tools/tsconfig` and `tools/eslint-config`. No module may define TypeScript or ESLint rules from scratch.

### 23.1 Available Configs

#### tools/tsconfig (`@automatize/tsconfig`)

| File                | Use for                                                |
| ------------------- | ------------------------------------------------------ |
| `base.json`         | All non-platform modules (core, packages, integration) |
| `react-native.json` | React Native / Expo apps (apps/mobile)                 |
| `nextjs.json`       | Next.js apps (apps/web)                                |

#### tools/eslint-config (`@automatize/eslint-config`)

| File              | Export path      | Use for                                                |
| ----------------- | ---------------- | ------------------------------------------------------ |
| `base.js`         | `./base`         | All non-platform modules (core, packages, integration) |
| `react-native.js` | `./react-native` | React Native / Expo apps (apps/mobile)                 |
| `next.js`         | `./next`         | Next.js apps (apps/web)                                |

### 23.2 Template for New Modules

**Generic module** (`core/`, `packages/*`, `integration/*`):

```jsonc
// tsconfig.json
{
  "extends": "../../tools/tsconfig/base.json", // adjust depth as needed
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
}
```

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [require.resolve('../../tools/eslint-config/base.js')],
};
```

**React Native / Expo app** (`apps/mobile`):

```jsonc
// tsconfig.json
{
  "extends": "../../tools/tsconfig/react-native.json",
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"],
}
```

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [require.resolve('../../tools/eslint-config/react-native.js')],
};
```

**Next.js app** (`apps/web`):

```jsonc
// tsconfig.json
{
  "extends": "../../tools/tsconfig/nextjs.json",
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next"],
}
```

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [require.resolve('../../tools/eslint-config/next.js')],
  ignorePatterns: ['node_modules', '.next', 'out', '.eslintrc.js'],
};
```

### 23.3 Rules

- Adding `peerDependencies` for ESLint plugins directly in a module is forbidden — add them to `tools/eslint-config` instead.
- Duplicating parser options, plugin lists, or rule overrides across modules is forbidden.
- App-level `.eslintrc.js` files may only contain `root: true`, `extends`, `ignorePatterns`, and narrow `rules` overrides specific to that app (e.g., silencing a rule for a known exception with a comment explaining why).

---

## 24) UI Component Rule (Non-Negotiable)

`packages/ui` (`@automatize/ui`) is the **SINGLE SOURCE OF TRUTH** for all UI components across the entire monorepo.

### 24.1 Mandatory Rules

- It is **FORBIDDEN** to create UI components inside `apps/mobile`, `apps/web`, or `apps/windows`
- If a component does not exist in `packages/ui`, it **MUST** be added there before being used anywhere
- Duplicated components found outside `packages/ui` **MUST** be migrated and deleted from their current location
- All apps (`apps/web`, `apps/mobile`, `apps/windows`) MUST import components exclusively from `@automatize/ui`

### 24.2 Package Entry Points

`packages/ui` exposes the following entry points:

| Import path                 | Contents                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| `@automatize/ui`            | Cross-platform components (bundler resolves `.web.tsx` or `.native.tsx`) |
| `@automatize/ui/web`        | Web-only components (shadcn/ui / Radix UI)                               |
| `@automatize/ui/composites` | Reusable generic composite components                                    |
| `@automatize/ui/tokens`     | Design tokens                                                            |

### 24.3 Platform Extension Pattern

Components with platform-specific implementations use file extensions:

- `Button.web.tsx` — Web implementation (HTML/Radix UI/Tailwind)
- `Button.native.tsx` — React Native implementation (StyleSheet/TouchableOpacity)

The bundler resolves the correct file automatically:

- Metro (React Native / Expo) → picks `.native.tsx`
- webpack / Next.js → picks `.web.tsx`

### 24.4 Adding a New Component

When a new component is needed:

1. Add it to `packages/ui/src/components/` (cross-platform) or `packages/ui/src/web/` (web-only)
2. Export it from the appropriate `index.ts`
3. Import it in the app via `@automatize/ui` or `@automatize/ui/web`
4. Never create it inside an app directory

### 24.5 Domain-Specific Composites

Composites tightly coupled to a business domain (e.g., `InvoiceTable`, `AppSidebar`) may remain in `apps/<platform>/components/composites/` **only if** they import all their primitives from `@automatize/ui`. They must never define their own primitive components.
