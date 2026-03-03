## Project Context

You (AGENT) will be responsible for creating and evolving a **cross-platform** project for managing and generating **Invoices**, supporting:

- **Mobile:** iOS and Android
- **Web**
- **Windows Desktop**

Main areas/features:

- Invoices
- Products
- Clients
- Analytics

The project **does not exist yet**, and the design/layout will be defined progressively.

The permanent focus is **production quality**, predictability, extreme security, and a professional experience:

- Modular architecture by feature
- True offline-first with resilient sync
- Extreme privacy (PII-safe)
- Multi-tenancy and access control

---

## Predictable performance

- Secure observability
- Comfortable design for prolonged use
- Technical governance (ADR)
- Living documentation
- Remote backend via Supabase MCP
- Tooling and automatic enforcement (CI / Lint / Pre-commit)
- Mandatory unit and integration tests

---

## Tech Stack & Standards (Official Technical Decisions)

### Core Technologies

#### Database & Storage

**Local Database:** WatermelonDB

- Native offline-first
- Performance optimized with lazy loading
- Built-in resilient sync
- Reactive (automatically observes changes)
- Multi-threading (does not block UI)
- Cross-platform (RN + Web via adapters)

#### ID Generation

**Standard:** ULID (Universally Unique Lexicographically Sortable Identifier)  
**Library:** `ulid`  
Format: `01ARZ3NDEKTSV4RRFFQ69G5FAV`

- Chronologically sortable
- Embedded timestamp
- Comparable size to UUID v4

#### State Management

**Global State:** Zustand

- Zero boilerplate
- Native TypeScript
- DevTools support
- Persist middleware

**Server Cache:** TanStack Query (React Query)

- Automatic cache
- Smart invalidation
- Offline support
- Automatic retry and refetch

**Lightweight UI State:** React Context

Only for:

- themes
- i18n
- preferences

Never for business logic.

**Responsibilities structure:**

- Zustand → global app state
- TanStack Query → server/sync cache
- React Context → themes, i18n (light state)

#### Navigation

**Library:** Expo Router

- File-based routing (like Next.js)
- Native, typed deep linking
- Full TypeScript support
- Seamless Expo integration
- Shared layouts
- Unified Web + Mobile

#### Validation

**Library:** Zod

- TypeScript-first with automatic type inference
- Composable and extensible
- Runtime + compile-time safety
- Built-in transform + refine
- Customizable error messages

Example:

```ts
const invoiceSchema = z.object({
  id: z.string().ulid(),
  amount: z.number().positive(),
  clientId: z.string().ulid(),
  dueDate: z.date(),
  tenantId: z.string().ulid(),
});
type Invoice = z.infer<typeof invoiceSchema>;
```

---

## Development Tools

### Monorepo & Package Management

**Monorepo Tool:** Turborepo

- Smart caching and incremental builds
- Remote caching for CI
- Parallel pipelines

**Package Manager:** pnpm

- Faster than npm/yarn
- Efficient disk usage
- Strict mode (no phantom dependencies)

### Testing

**Unit & Integration:** Vitest + Testing Library

- Much faster than Jest
- Jest-compatible API (easy migration)
- Native ESM
- Excellent watch mode
- Debug UI

**E2E:**

- Mobile: Maestro
- Web: Playwright

### HTTP Client

**Library:** ky

- Built on native fetch
- Configurable automatic retry
- Configurable timeout
- Request/response hooks
- Native TypeScript
- Bundle size: ~3kb

Default configuration:

```ts
const fetcher = ky.create({
  prefixUrl: API_URL,
  retry: 3,
  timeout: 10000,
  hooks: {
    beforeRequest: [addAuthHeader],
    afterResponse: [handleErrors],
  },
});
```

### Date/Time Handling

**Library:** date-fns

- Tree-shakeable (import only what you use)
- Immutable (does not mutate objects)
- Full TypeScript
- Built-in i18n
- Timezone via date-fns-tz
- Functional (composable)

Why not dayjs/moment:

- date-fns has better tree-shaking and performance

---

## Git Workflow

**Strategy:** GitHub Flow (simplified)

- main → Production (always deployable)
- feature/\* → Features
- fix/\* → Bugfixes
- hotfix/\* → Emergencies

Rules:

- Pull Requests required
- CI must pass (100%)
- 1+ approval required
- Squash merge preferred

### Commit Convention

**Standard:** Conventional Commits  
**Enforcement:** commitlint + husky

Format:

```
<type>(<scope>): <subject>
<body>
<footer>
```

Required types:

- feat : New feature
- fix : Bugfix
- docs : Documentation
- refactor : Refactor
- test : Tests
- chore : Tooling/Config
- perf : Performance
- ci : CI/CD

---

## Infrastructure & Operations

### Observability & APM

**Tool:** To be defined (optional)

- Error tracking
- Performance monitoring
- Release tracking
- Built-in PII scrubbing

Structure prepared for future observability integration. No external APM tool configured at this time.

### Environment Management

Required environments:

1. Local (development)
   - Local DB: WatermelonDB
   - Supabase dev project
   - Hot reload enabled

2. Staging (staging)
   - Supabase staging project
   - Preview deployments (Vercel/Netlify)
   - Full QA testing

3. Production (production)
   - Supabase prod project
   - High availability
   - 24/7 active monitoring

4. E2E (e2e)
   - Isolated for automated tests
   - Automatic reset between runs

Environment variables:

```env
# .env.development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
API_URL=http://localhost:3000
SENTRY_DSN=xxx
ENVIRONMENT=development

# .env.production
SUPABASE_URL=https://prod.supabase.co
SUPABASE_ANON_KEY=xxx
API_URL=https://api.production.com
SENTRY_DSN=xxx
ENVIRONMENT=production
```

---

## Mobile-Specific

### Network Detection

**Library:** @react-native-community/netinfo

- Official and maintained
- Cross-platform
- Reactive hooks
- Detects connection type (WiFi, Cellular, etc.)

Usage:

```ts
import NetInfo from '@react-native-community/netinfo';

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      triggerSync();
    }
  });
  return unsubscribe;
}, []);
```

### Background Sync Strategy

- iOS: Background fetch (limited ~15min) + silent push notifications
- Android: WorkManager via expo-task-manager (more flexible)
- Web: Service Workers with Periodic Background Sync

### Permissions

**Library:** expo-permissions (unified API)

Required UX pattern:

1. Explain why the permission is needed
2. Request permission
3. If denied → show deep link to Settings

### Push Notifications

**Tool:** Expo Notifications + FCM

- Unified API for iOS + Android
- Background notifications
- Data payloads

Use cases:

- Sync completed
- Critical sync errors
- Reminders (invoices due)
- Important updates

### File Handling

Upload/Download: expo-file-system

Strategy:

- Files <5MB → direct upload
- Files >5MB → chunked upload (resumable)
- Progress tracking required
- Background upload when possible

---

## Design System

### Design Tokens

Structure based on Tailwind/Radix:

```ts
// tokens/colors.ts
export const colors = {
  // Semantic layers
  brand: {
    50: '#...',
    100: '#...',
    // ... up to 900
  },
  // Functional tokens
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    tertiary: colors.neutral[200],
  },
  // State colors
  success: colors.green[600],
  error: colors.red[600],
  warning: colors.yellow[600],
  info: colors.blue[600],
};

// tokens/spacing.ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

// tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
};
```

Tool: Style Dictionary to generate cross-platform tokens

### Responsive Design (Web)

Strategy: Mobile-first

Breakpoints:

```ts
const breakpoints = {
  sm: 640, // Mobile landscape
  md: 768, // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
  '2xl': 1536, // Extra large
};
```

### Asset Management

Structure:

```
assets/
├── images/
│   ├── logos/
│   ├── illustrations/
│   └── photos/
├── icons/ # SVG components
├── fonts/
│   ├── Inter/
│   └── JetBrainsMono/
└── lottie/ # Animations (if used)
```

Optimization:

- sharp for images (build time)
- SVG as React components (tree-shakeable)
- WebP with PNG fallback
- Lazy loading for images

---

## Internationalization (i18n)

Library  
Tool: i18next + react-i18next

- Industry standard
- Built-in pluralization
- Namespaces for code-splitting
- Lazy loading translations
- Full TypeScript support

File structure:

```
locales/
├── en/
│   ├── common.json
│   ├── invoices.json
│   ├── products.json
│   ├── clients.json
│   └── errors.json
└── pt-BR/
    ├── common.json
    ├── invoices.json
    ├── products.json
    ├── clients.json
    └── errors.json
```

Configuration:

```ts
i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  ns: ['common'],
  defaultNS: 'common',
});
```

---

## Accessibility

### Standards

Compliance: WCAG 2.1 Level AA (mandatory)

Tools:

- @react-native-aria (web parity on mobile)
- react-native-testing-library (a11y assertions)
- Manual testing with VoiceOver (iOS) / TalkBack (Android)

Mandatory checklist per feature:

- Labels for all inputs and buttons
- Correct semantic roles
- Focus management (logical order)
- Minimum contrast ratio 4.5:1
- Minimum touch targets 44x44px
- Keyboard navigation works (Web/Desktop)
- Screen reader tested

---

## Error Boundaries

Library  
Tool: react-error-boundary

Implementation:

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => {
    // Log error with PII redaction
    logger.error('React Error Boundary', { error, info });
  }}
  onReset={() => {
    // Reset app state
    queryClient.clear();
  }}
>
  <App />
</ErrorBoundary>
```

Granularity:

- Root level (entire app)
- Feature level (per main route)
- Component level (critical components)

---

## Platform Strategy (Official Technical Decision)

Use Expo (React Native) for:

- Mobile (iOS / Android)
- Web (react-native-web)

Separate Windows Desktop app using:

- react-native-windows

Shared core is mandatory.  
All domain must live outside apps:

- business rules
- calculations
- validations
- types
- services
- domain hooks

### Non-negotiable rule

No business rule may depend on:

- Expo APIs
- platform-specific APIs
- UI or navigation

---

## Project Structure (Mandatory)

```
project/
├── apps/
│   ├── mobile/   # Expo (iOS + Android)
│   ├── web/      # Expo Web
│   └── windows/  # RN Windows
├── packages/
│   ├── core/     # Business logic (platform-agnostic)
│   │   ├── domain/   # Entities, Value Objects
│   │   ├── services/ # Use cases, Services
│   │   ├── hooks/    # Domain React hooks
│   │   ├── types/    # TypeScript types/interfaces
│   │   └── utils/    # Pure helpers
│   ├── ui/       # Design system + components
│   │   ├── components/
│   │   ├── tokens/
│   │   └── theme/
│   ├── sync/     # Sync engine (WatermelonDB)
│   │   ├── engine/
│   │   ├── operations/
│   │   └── migrations/
│   ├── storage/  # DB adapters (WatermelonDB)
│   │   ├── models/
│   │   ├── schemas/
│   │   └── adapters/
│   ├── auth/     # Auth logic (Supabase)
│   │   ├── hooks/
│   │   ├── providers/
│   │   └── utils/
│   └── integration/          # Meta-package — external integrations
│       ├── src/index.ts      # Barrel: re-exports active sub-modules
│       ├── payment/          # @automatize/integration-payment
│       ├── nfe/              # @automatize/integration-nfe
│       └── <domain>/         # One sub-package per integration domain
├── docs/
│   ├── adr/            # Architecture Decision Records
│   ├── api-contract.md # API Sync Contract
│   └── runbooks/       # Operational guides
└── tools/
    ├── eslint-config/
    └── tsconfig/
```

Rules:

- core/ never imports from apps/
- core/ never uses platform APIs
- UI is a thin wrapper over core
- Each package has its own package.json
- integration/ is a meta-package: the root contains only the barrel (src/index.ts); all logic lives in sub-packages

---

## Integration Module — Pattern (Mandatory)

`packages/integration` is a **meta-package**: it acts as a container and barrel for independent integration sub-modules. It must stay minimal.

### Structure rules

- `packages/integration/src/index.ts` — only re-exports from active sub-modules; no logic of its own
- Each integration domain lives in its own sub-package (e.g. `packages/integration/payment/`)
- Sub-packages are independent workspace members with their own `package.json`, `tsconfig.json`, `tsup.config.ts` and tests
- Sub-packages are named `@automatize/integration-<domain>` (e.g. `@automatize/integration-payment`)
- `pnpm-workspace.yaml` includes `packages/integration/*` so every sub-package is automatically discovered by Turborepo and CI

### When to add content to the root integration package

Never add runtime logic to `packages/integration` itself. Only add a re-export line to `src/index.ts` after a sub-package is created and stable.

### When to create a new sub-package

Create a new sub-package for each external integration domain (payment, fiscal/NFe, ERP, CRM, shipping, etc.). Do not mix domains inside a single sub-package.

### Sub-package scaffolding checklist

Every sub-package must have:

- `package.json` (name: `@automatize/integration-<domain>`, `private: true`)
- `tsconfig.json` (extends `../../../../tools/tsconfig/base.json`)
- `tsup.config.ts`
- `vitest.config.ts`
- `.eslintrc.js`
- `src/index.ts` (public API barrel)
- At least one unit test before the sub-package is considered active

---

## Backend and Database (Official Technical Context)

### Supabase MCP

The project uses Supabase as the remote data backend, accessed via Supabase MCP.

- Supabase is the remote source of data
- All remote CRUD and sync operations are performed via Supabase MCP

Supabase is NOT the immediate source for the UI:

- the app is offline-first
- local WatermelonDB is the source of truth
- Supabase is used only for controlled sync and remote operations

### Local WatermelonDB

- All operational data lives first in WatermelonDB
- Writes are immediate in the local DB
- Sync happens asynchronously in the background
- UI never waits for sync to update

---

## Extreme Protection Principles (Mandatory)

- Never trust the client
- Access rules always in Postgres (RLS) or Edge Functions
- Separate PII from operational domain (distinct schemas/tables)
- Layered encryption:
  - TLS (in transit)
  - infra encryption (at rest)
  - field encryption for sensitive PII (preferably client-side)
- Always least privilege:
  - service role never in the app
  - privileged keys only in Edge Functions

---

## Supabase Hardening (Mandatory)

### Postgres + RLS

- RLS ON for 100% of tables exposed via API
- Mandatory policies for:
  - SELECT
  - INSERT
  - UPDATE
  - DELETE

- All tables contain tenant_id (ULID)
- JWT carries tenant_id
- Policies validate tenant_id via claims
- PII tables isolated (e.g., private schema)
- Grants and privileges reviewed

### Auth

- MFA mandatory (minimum: TOTP)
- Custom claims in JWT:
  - tenant_id
  - role / permissions
- Administrative actions never executed directly by the client

### Edge Functions

Mandatory layer for:

- privileged operations
- external integrations
- complex validations
- rate limiting

- Service role key only in the Function environment
- Mandatory input validation (Zod)
- Structured and redacted logs

### Secrets / Vault

- Secrets only in Vault/Secrets
- Hardcoding is forbidden in code, build, or versioned config

### Storage (if applicable)

- Private buckets
- Policies by auth.uid() and/or tenant_id
- Signed URLs with short TTL (<15min)
- Public buckets are forbidden

---

## API Contract — Sync and CRUD (Mandatory)

Create and maintain:

- docs/api-contract.md

### Push (Outbox)

pushOperations(operations[])

Each operation includes:

- opId (ULID)
- accountId (ULID)
- entityType (string)
- entityId (ULID)
- operationType (CREATE | UPDATE | DELETE)
- payload (JSON)
- baseVersion (number)
- createdAt (ISO 8601)

### Pull (Delta Sync)

pullChanges(cursor)

- Incremental return + new cursor
- Cursor based on timestamp

### Rules

- Idempotency by opId (ULID)
- Soft delete (deletedAt)
- Multi-tenancy enforced via RLS
- Breaking change requires ADR + versioning

---

## Multi-tenancy and Access Control (Mandatory)

- All entities have tenant_id (ULID)
- Tenant isolation is mandatory

Minimum roles:

- admin
- editor
- viewer

- Authorization lives in core (packages/core)
- UI only queries/applies permissions
- Invalid writes fail in the domain (before persisting)

---

## Offline-first Architecture and Sync (Mandatory)

- Local WatermelonDB is the source of truth

Writes:

- update WatermelonDB immediately
- always generate outbox

Central sync engine (in packages/sync):

- push + incremental pull
- idempotent (via opId ULID)
- asynchronous
- resilient
- never blocks UI
- exponential backoff + jitter
- configurable circuit breaker
- network detection via NetInfo

---

## Schema Migrations (Mandatory)

### Local (WatermelonDB)

- Migrations versioned by incremental number
- Each migration is idempotent
- Migrations run automatically on app start

Structure:

```ts
// packages/storage/migrations/index.ts
export default [
  {
    toVersion: 2,
    steps: [
      addColumns({
        table: 'invoices',
        columns: [{ name: 'tax_amount', type: 'number', isOptional: true }],
      }),
    ],
  },
  {
    toVersion: 3,
    steps: [
      createTable({
        name: 'products',
        columns: [
          { name: 'name', type: 'string' },
          { name: 'price', type: 'number' },
        ],
      }),
    ],
  },
];
```

### Remote (Supabase)

- Use Supabase CLI migrations
- Versioning synced with the app
- Migrations in pure SQL
- Always test in staging before prod

Rule:

- Breaking changes require ADR
- Downtime migrations only with approval and planned window

---

## Conflict Resolution (Mandatory)

Default strategy: Last-Write-Wins (LWW) by updatedAt

- Complex conflicts generate events for resolution
- UI must allow viewing and manually resolving conflicts
- Conflicts are logged for analysis

Implementation:

```ts
function resolveConflict(local, remote) {
  // Standard LWW
  if (local.updatedAt > remote.updatedAt) {
    return local;
  }
  // If complex conflict, create event
  if (isComplexConflict(local, remote)) {
    createConflictEvent({ local, remote });
    return local; // keep local until manual resolution
  }
  return remote;
}
```

---

## Sync UX and Error Handling (Mandatory)

### Visual State Indicators

- Synced: green badge with checkmark
- Syncing: animated spinner + operation counter
- Sync error: red badge + "Retry" button
- Offline mode: gray badge "Offline"

### Error UX

- Non-intrusive notifications (toast/snackbar)
- Visible pending operations queue (side drawer or bottom sheet)
- Manual retry button always accessible
- Error details (without exposing PII)
- User-friendly error messages

Message examples:

- ❌ "Network request failed with status 500"
- ✅ "Unable to sync. Check your connection."

### Error Recovery

- Automatic retry with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s)
- Graceful fallback when an operation fails
- Structured error logs (redacted, sent to logger)
- Circuit breaker to avoid request storms
- After 5 consecutive failures, pause sync for 5 minutes

---

## Data Model and Integrity (Mandatory)

- IDs generated locally using ULID (via ulid library)

Mandatory fields for all entities:

- id (ULID)
- createdAt (ISO 8601)
- updatedAt (ISO 8601)
- deletedAt (ISO 8601, nullable)
- version (number, for optimistic concurrency)
- tenantId (ULID)

- Explicit, tested invariants (Zod schemas)
- Invalid writes never persist (validation in core)
- Repair routine for known inconsistencies

Zod schema example:

```ts
const baseEntitySchema = z.object({
  id: z.string().ulid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  version: z.number().int().nonnegative(),
  tenantId: z.string().ulid(),
});

const invoiceSchema = baseEntitySchema.extend({
  number: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  clientId: z.string().ulid(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']),
});
```

---

## Extreme Privacy (Mandatory)

Required classification:

- PII: name, email, phone, address, national IDs, IP
- Non-PII: IDs, timestamps, status, aggregated numeric values

Rules:

- Never log PII (redaction required)
- Never send PII to analytics or logs
- Telemetry with explicit allowlist + redaction
- Error correlation only via hashed + salted IDs
- Event retention documented by type
- Mandatory local wipe on logout/delete account

Automatic redaction (Logger):

```ts
function redactPII(data: any): any {
  // Remove PII from all known keys (email, name, phone, etc.)
  // Implementation in packages/core/utils/redaction.ts
  return sanitizeData(data);
}
```

---

## Data Lifecycle / Compliance (LGPD-ready)

Architecture must allow:

- deleting data by tenant/workspace (cascade)
- full local wipe (WatermelonDB reset)
- retention by data type (configurable)
- future data export (GDPR Article 20)

Nothing in the architecture may prevent future compliance.

- Audit logs for LGPD actions

---

## Backup & Recovery (Mandatory)

### Export and Import

- Full user data export in structured format (JSON)
- Import previous backup with integrity validation (Zod)
- Post-import checksum verification
- Automatic backup before critical migrations

### Recovery Mode

- Recovery mode for corrupted WatermelonDB
- Restore to last known valid state
- Recovery logs for analysis/support (local logging)
- Recovery UI accessible even with corrupted DB (fallback to AsyncStorage)

### Retention

- Backup retention policy documented (e.g., 30-day rolling)
- Automatic rotation of old backups
- Disk space monitored (alerts if >80%)

---

## Lists, Pagination, and Lazy Loading (Mandatory)

All lists:

- paginated (limit/offset or cursor-based)
- lazy-loaded (infinite scroll)
- virtualized (react-native-virtualized-list or FlashList)
- Search works offline (WatermelonDB queries)

Rendering everything at once is forbidden (critical performance).

Recommended implementation:

```ts
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['invoices'],
  queryFn: ({ pageParam = 0 }) => fetchInvoices(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

---

## Routing and Deep Links (Mandatory)

Expo Router

- File-based routing (folder structure = routes)
- Declarative, typed, documented routes

Automatic deep links:

- Mobile: myapp://invoices/123
- Web: https://myapp.com/invoices/123
- Desktop: myapp://invoices/123

Routes structure:

```
app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (app)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── invoices/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── new.tsx
│   ├── products/
│   └── clients/
└── _layout.tsx
```

Validation:

- Params validated (Zod schemas)
- Invalid routes fail safely (custom 404)
- Auto redirect to login if not authenticated

---

## Design System and Visual Guidelines (Mandatory)

- Modern and minimalist interface
- Low visual intensity
- Evolved flat design
- Consistent rounded corners (border-radius: 8px standard)
- Spacing-based separation (spacing tokens)
- Outline icons (library: lucide-react-native)
- Modern sans-serif typography (Inter)
- Clear interactive states (hover, focus, active, disabled)
- Subtle, functional microinteractions (spring animations)
- Centralized tokens (no hardcoded colors/spacing)

A feature is not done if it violates design guidelines.

### Base Components

All components must:

- Use design system tokens
- Support dark mode
- Be accessible (a11y)
- Have size variants (sm, md, lg)
- Have clear visual states

---

## Tooling & Gates (CI, Lint, Pre-commit) (Mandatory)

### ESLint

- Use exactly the ESLint model provided by the user (Flat Config).
- Do not rewrite rules from scratch.
- Size/complexity rules are refactoring triggers.

### Pre-commit

- Use the provided .pre-commit-config.yaml.

Required hooks:

- Prettier
- ESLint
- check-json
- check-yaml
- detect-private-key
- end-of-file-fixer
- trailing-whitespace
- validate-hook-names

Commits that do not pass pre-commit are not acceptable.

### Husky + Commitlint

- Commitlint configured for Conventional Commits
- Pre-commit hook runs lint + typecheck
- Pre-push hook runs tests

### CI Pipeline (GitHub Actions / GitLab CI)

Minimum required pipeline:

1. Install + Cache
   - pnpm install with cache
   - Cache node_modules and pnpm store
2. Typecheck
   - pnpm turbo run typecheck
3. Lint
   - pnpm turbo run lint
4. Format Check
   - prettier --check .
5. Unit Tests
   - pnpm turbo run test:unit
   - Coverage report (upload to Codecov)
6. Integration Tests
   - pnpm turbo run test:integration
7. Build
   - pnpm turbo run build

CI must fail on any relevant error (exit code !== 0).

Branch protection:

- CI must pass 100%
- 1+ code review approved
- No merge conflicts

---

## Dependency Management & Security (Mandatory)

### Dependency Management

- Lockfiles must be committed (pnpm-lock.yaml)
- Renovate configured for automatic updates (weekly PRs)
- Automatic security scanning (pnpm audit, Snyk, or Dependabot)
- Breaking changes in critical dependencies require ADR

### Update Policy

- Security patches: immediate update (<24h)
- Minor versions: monthly review/update (batch updates)
- Major versions: technical evaluation + mandatory ADR + migration plan

- Full tests after any dependency update

### Security Audit

- Security review for all new dependencies
- License review for compliance (MIT, Apache 2.0, ISC allowed)
- Continuous monitoring for known vulnerabilities (Snyk alerts)
- Immediate removal of unused dependencies (depcheck)

### Renovate Configuration

```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "all non-major dependencies",
      "groupSlug": "all-minor-patch",
      "automerge": true
    },
    {
      "matchUpdateTypes": ["major"],
      "labels": ["major-update"],
      "automerge": false
    }
  ],
  "schedule": ["before 10am on monday"]
}
```

---

## Client Security Baseline (Mandatory)

### A) Secure Storage

Tokens and sensitive data must never be stored in AsyncStorage.  
Use expo-secure-store (Keychain/Keystore wrapper)

Secrets must be isolated from the UI layer (only in services)

Implementation:

```ts
import * as SecureStore from 'expo-secure-store';

async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}
```

### B) Absolute Redaction

Full payload logging is forbidden.  
Structured, redacted logs by default.

Advanced debug:

- local-only (never in prod)
- exportable without PII (for support)

Structured logger:

```ts
logger.info('User logged in', {
  userId: hashUserId(userId), // hash, not raw ID
  timestamp: new Date().toISOString(),
  // NEVER include: email, name, phone
});
```

### C) Basic Anti-leak

Mobile:

- Block screenshots on sensitive screens (expo-screen-capture)
- Block app preview in task switcher

Web/Desktop:

- Be careful with copy/export of sensitive data
- Always respect user permissions

### D) Configuration and Secrets

- No privileged key allowed in the app
- Only anon/public key in client (Supabase)
- Secrets and URLs via secure config (expo-constants + env)
- Never hardcode in code

Example:

```ts
import Constants from 'expo-constants';

const config = {
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl,
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey,
};
```

Violation of the Client Security Baseline is a critical security bug.

---

## Unit and Integration Tests (Mandatory)

### Unit Tests (Vitest + Testing Library)

Must cover:

- business rules (100% of use cases)
- calculations and validations (edge cases)
- invariants (Zod schemas)
- permissions (RBAC/ABAC rules)
- data transformations

Rules:

- No UI dependency
- No real Supabase (use mocks via MSW)
- External dependencies mocked
- Isolated (can run in parallel)
- Fast (<1s per test)

Example:

```ts
import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotal } from './invoice-calculations';

describe('calculateInvoiceTotal', () => {
  it('should calculate total with tax', () => {
    const result = calculateInvoiceTotal({
      subtotal: 100,
      taxRate: 0.2,
    });
    expect(result).toBe(120);
  });
});
```

### Integration Tests

Must validate:

- full flows per feature (user journey)
- offline → online (sync engine)
- sync engine and outbox (pending operations)
- applied permissions (tenant isolation)
- recoverable errors (retry logic)

Rules:

- No real Supabase (mock server)
- Deterministic and repeatable (seed data)
- Reset state between tests

Example:

```ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useInvoices } from './use-invoices';

it('should sync invoices when coming online', async () => {
  const { result } = renderHook(() => useInvoices());

  // Simulate offline
  mockNetInfo.setConnected(false);

  // Create invoice offline
  await result.current.createInvoice({ amount: 100 });

  // Simulate going online
  mockNetInfo.setConnected(true);

  // Wait for sync
  await waitFor(() => {
    expect(result.current.pendingOperations).toBe(0);
  });
});
```

### Mandatory Execution

After completing a feature:

1. Create unit tests (coverage > 80%)
2. Create integration tests (happy path + error cases)
3. Run pnpm test (unit + integration)
4. Run pnpm lint and pnpm typecheck
5. Fix all errors and warnings
6. Open PR only after everything passes

---

## Definition of Ready (DoR) — Design & UX (Mandatory)

Before starting any feature:

- Reference layout defined (Figma, sketch, or wireframe)
- States defined:
  - loading (skeleton or spinner)
  - empty (empty state with CTA)
  - error (message + retry)
  - success (data rendered)
- Minimum labels and A11y defined (ARIA labels, screen reader flow)
- Security/PII impact assessed (security checklist)
- Performance budget defined (e.g., list must render in <16ms)

Without minimum DoR, the feature does not start.

DoR checklist:

- Clear and testable user story
- Design approved
- Technical dependencies resolved
- Effort estimate completed
- Security review if needed

---

## Definition of Done (DoD) (Mandatory)

A feature is only considered done when:

- Works offline (tested with airplane mode)
- Syncs correctly (tested on slow 3G)
- Respects tenant isolation (tested with multiple tenants)
- Applies permissions correctly (tested with different roles)
- Does not violate privacy (no PII logs, verified)
- Does not degrade performance (Lighthouse score > 90 for web)
- Unit and integration tests created (coverage > 80%)
- Routes and deep links tested (iOS + Android + Web)
- Design validated (approved by designer)
- Documentation updated (README, ADR if applicable)
- Code review approved (1+ reviewer)
- CI passing (all green checks)

DoD checklist:

- Code complete and tested
- Tests passing (unit + integration)
- Lint + typecheck with no errors
- Documentation updated
- Design validated
- Security checklist complete
- Performance validated
- Code review approved
- Merged to main

---

## Final Rule of Excellence

This project must always reflect:

- True offline-first (WatermelonDB as source of truth)
- Reliable sync (idempotent, resilient, with retry)
- Supabase hardening (RLS, MFA, Edge, Secrets)
- Extreme privacy (redaction, PII isolation)
- Enterprise governance (ADR, code review, CI/CD)
- Comfortable and professional design (design system, a11y)
- Tooling with automatic enforcement (pre-commit, CI, Renovate)
- Tests as a quality contract (>80% coverage)
- Always-updated documentation (README, ADR, API contract)
- Consistent tech stack (follow the decisions in this document)

No feature is considered complete if it violates any of these rules.
