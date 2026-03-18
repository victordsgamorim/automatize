# Automatize

Cross-platform invoice management system with offline-first architecture.

> 📁 **[Modules](core/README.md)** | 🔐 **[Auth](integration/supabase/auth/README.md)** | 🗺️ **Roadmap** (local-only)

---

## Architecture: Modular Monolith

This project follows a **Modular Monolith** architecture with **Core-Driven Dependency Injection**.

```
apps/                 # Platform applications
├── mobile/           # Expo app (iOS + Android + Web)
├── web/              # Next.js web app
│   └── components/
│       ├── screens/  # Full-page components (auth, dashboard, etc.)
│       └── composites/ # Reusable UI pieces
└── windows/          # Windows desktop app

core/                 # Dependency injection & interfaces

  packages/             # Feature modules
    ├── navigation/     # Cross-platform navigation logic
    └── ui/             # Design system

integration/          # Infrastructure implementations
├── supabase/        # Supabase clients & auth
├── storage/         # WatermelonDB
└── sync/            # Sync engine
```

### Architecture

This project follows a **Modular Monolith** approach:

- **Core** — DI container and interfaces
- **Packages** — Feature modules (UI design system)
- **Integration** — Concrete implementations
- **Apps** — Platform-specific entry points

## Overview

Automatize is a production-grade invoice management application supporting:

- **Mobile**: iOS and Android (via Expo)
- **Web**: Progressive Web App
- **Desktop**: Windows

### Key Features

- Offline-first architecture with WatermelonDB
- Multi-tenancy with strict tenant isolation
- Role-based access control (RBAC)
- End-to-end type safety with TypeScript and Zod
- Extreme privacy and PII protection
- Production-ready security (RLS, MFA, secure storage)

---

## Tech Stack

### Core

- **Monorepo**: Turborepo + pnpm
- **Language**: TypeScript 5.9+
- **Database (Local)**: WatermelonDB
- **Database (Remote)**: Supabase (PostgreSQL)
- **ID Generation**: ULID
- **Validation**: Zod

### State & Data

- **Server Cache**: TanStack Query
- **Module State**: React Provider (scoped per module)
- **Local State**: React `useState` / `useReducer`

### UI & Styling

- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **Icons**: lucide-react-native
- **Design System**: Custom tokens (colors, spacing, typography)

### Testing & Quality

- **Unit/Integration**: Vitest + Testing Library
- **E2E**: Maestro (mobile), Playwright (web)
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Commit Convention**: Conventional Commits (enforced)

### Dependency Management

- **Version centralization**: pnpm catalogs (`pnpm-workspace.yaml`)
- **Dependency scanner**: `pnpm scan:deps` (identifies duplicates, conflicts, catalog coverage)
- **React version split**: Named catalogs `react18` (mobile/RN) and `react19` (web/Next.js)

### DevOps

- **CI/CD**: GitHub Actions
- **Dependency Updates**: Renovate

---

## Project Structure

```
automatize/
├── apps/
│   ├── mobile/         # Expo app (iOS + Android + Web)
│   ├── web/            # Next.js web app
│   │   └── components/
│   │       └── composites/ # Reusable UI pieces (AppSidebar, etc.)
│   └── windows/        # Windows desktop app
├── core/               # Dependency injection & interfaces
│   └── README.md
├── integration/        # Infrastructure implementations
│   ├── supabase/       # Supabase ecosystem
│   │   ├── auth/       # @automatize/supabase-auth
│   │   │   └── README.md
│   │   └── docs/       # Auth config, RLS policies
│   ├── storage/        # @automatize/storage
│   └── sync/           # @automatize/sync
├── packages/
│   ├── navigation/     # Cross-platform navigation logic
│   ├── sign-in/        # Cross-platform sign-in screen + hook
│   └── ui/             # Design system + components
│       ├── src/
│       │   ├── components/  # Cross-platform components (Button/, Input/, Label/, etc.)
│       │   │   └── <Name>/  # Each has .web.tsx, .native.tsx, index.ts, index.native.ts
│       │   ├── web/         # Web entry point + web-only shadcn/ui components
│       │   └── tokens/      # Generated design tokens
│       └── README.md
├── scripts/
│   └── scan-deps.ts    # Dependency deduplication scanner
└── tools/
    ├── eslint-config/  # Shared ESLint configs
    └── tsconfig/       # Shared TypeScript configs
```

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **pnpm**: 10.x or higher
- **Git**: Latest version

### Installation

1. **Install pnpm** (if not installed):

```bash
npm install -g pnpm@10
```

2. **Clone the repository**:

```bash
git clone <repository-url>
cd automatize
```

3. **Install dependencies**:

```bash
pnpm install
```

4. **Setup environment variables**:

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

5. **Build packages**:

```bash
pnpm build
```

### Development

**Run all packages in development mode:**

```bash
pnpm dev
```

**Run mobile app:**

```bash
cd apps/mobile
pnpm dev
```

**Run tests:**

```bash
pnpm test
```

**Lint and format:**

```bash
pnpm lint
pnpm format
```

---

## Scripts

### Root Level

- `pnpm build` - Build all packages and apps
- `pnpm dev` - Start all packages in dev mode
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type-check all packages
- `pnpm test` - Run all tests
- `pnpm format` - Format all files with Prettier
- `pnpm scan:deps` - Scan for duplicate/conflicting dependencies
- `pnpm scan:deps:json` - Scan output in JSON format
- `pnpm scan:deps:summary` - Scan output as summary
- `pnpm clean` - Remove all build artifacts and node_modules

### Package Level

Each package has its own scripts:

- `pnpm build` - Build the package
- `pnpm dev` - Watch mode for development
- `pnpm lint` - Lint the package
- `pnpm typecheck` - Type-check the package
- `pnpm test` - Run package tests

---

## Dependency Management

This project uses **pnpm catalogs** for centralized dependency version management. All shared dependency versions are defined once in `pnpm-workspace.yaml` and referenced via the `catalog:` protocol in each package's `package.json`.

### How It Works

```yaml
# pnpm-workspace.yaml
catalog:
  zod: ^3.25.76
  vitest: ^1.2.1
```

```json
// any package.json
{ "dependencies": { "zod": "catalog:" } }
```

### Named Catalogs

React has a version split (React 18 for mobile/RN, React 19 for web/Next.js). Named catalogs handle this:

```json
// apps/mobile/package.json
{ "dependencies": { "react": "catalog:react18" } }

// apps/web/package.json
{ "dependencies": { "react": "catalog:react19" } }
```

### Adding a New Shared Dependency

1. Add the version to the `catalog:` section in `pnpm-workspace.yaml`
2. In each consuming package.json, use `"dep-name": "catalog:"`
3. Run `pnpm install`
4. Run `pnpm scan:deps` to verify no conflicts

### Scanning for Issues

```bash
pnpm scan:deps          # Full report
pnpm scan:deps --summary # Quick summary
pnpm scan:deps --json    # Machine-readable output
```

---

## Architecture Decisions

Key decisions are documented in the project context file.

- **ADR-001**: Monorepo with Turborepo
- **ADR-002**: Offline-first with WatermelonDB
- **ADR-003**: Multi-tenancy with RLS

---

## Development Workflow

### Branching Strategy

- `main` - Production (always deployable)
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes
- `hotfix/*` - Emergency fixes

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Tooling/Config
- `perf`: Performance
- `ci`: CI/CD

**Example:**

```bash
git commit -m "feat(invoices): add invoice list pagination"
```

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure all tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Ensure types are correct: `pnpm typecheck`
6. Create a Pull Request to `develop`
7. Wait for CI to pass (required)
8. Request code review (minimum 1 approval required)
9. Squash and merge

---

## Testing Strategy

### Unit Tests

- Located next to source files (`*.test.ts`)
- Test business logic, utils, and calculations
- Must have >80% coverage

### Integration Tests

- Test full user flows
- Test sync engine and offline scenarios
- Validate multi-tenancy isolation

### E2E Tests

- Test complete user journeys
- Mobile: Maestro
- Web: Playwright

**Run tests:**

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# Watch mode
pnpm test:watch
```

---

## Security

### Principles

1. **Never trust the client**
2. **Enforce RLS on all tables**
3. **Multi-tenancy is mandatory**
4. **PII must be redacted from logs**
5. **Service role keys never in client code**

### Secrets Management

- Store secrets in `.env` files (never commit)
- Use `expo-secure-store` for tokens (mobile)
- Use Supabase Vault for server secrets

### RLS Policies

See [integration/supabase/docs/RLS_POLICIES.md](integration/supabase/docs/RLS_POLICIES.md) for RLS policy templates.

---

## Roadmap

See local documentation for details (not committed to git).

---

## Contributing

### Before Contributing

1. Read [CLAUDE.md](CLAUDE.md) for project context and standards
2. Review existing ADRs in [docs/adr/](docs/adr/)
3. Ensure you understand the testing requirements

### Code Style

- Follow ESLint and Prettier configs
- Write self-documenting code
- Add comments only where logic is complex
- Keep functions small and focused

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

### Definition of Done

A feature is complete when:

- ✅ Code is implemented and reviewed
- ✅ Tests pass (unit + integration, >80% coverage)
- ✅ Lint and typecheck pass with no errors
- ✅ Works offline (if applicable)
- ✅ Syncs correctly (if applicable)
- ✅ Documentation updated
- ✅ PR approved and merged

---

## License

[To be defined]

---

## Support

For issues and questions:

- Check existing [GitHub Issues](https://github.com/your-org/automatize/issues)
- Create a new issue with detailed reproduction steps
- Tag appropriately (bug, feature, question, etc.)

---

## Acknowledgments

Built with:

- [Expo](https://expo.dev)
- [Supabase](https://supabase.com)
- [WatermelonDB](https://nozbe.github.io/WatermelonDB/)
- [Turborepo](https://turbo.build)

---

**Status:** ✅
**Version:** 0.0.0
**Last Updated:** 2026-03-18
