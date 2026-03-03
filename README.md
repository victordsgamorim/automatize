# Automatize

Cross-platform invoice management system with offline-first architecture.

> 📚 **[Documentação Completa](docs/INDEX.md)** | 🚀 **[Quick Start](docs/guides/QUICK_START.md)** | 📊 **[Status](docs/planning/STATUS.md)** | 🗺️ **[Roadmap](docs/planning/ROADMAP.md)**

## Overview

Automatize is a production-grade invoice management application supporting:

- **Mobile**: iOS and Android (via Expo)
- **Web**: Progressive Web App
- **Desktop**: Windows (planned for Phase 11)

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
- **Language**: TypeScript 5.3+
- **Database (Local)**: WatermelonDB
- **Database (Remote)**: Supabase (PostgreSQL)
- **ID Generation**: ULID
- **Validation**: Zod

### State & Data

- **Global State**: Zustand
- **Server Cache**: TanStack Query
- **UI State**: React Context

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

### DevOps

- **CI/CD**: GitHub Actions
- **Dependency Updates**: Renovate

---

## Project Structure

```
automatize/
├── apps/
│   ├── mobile/         # Expo app (iOS + Android + Web)
│   ├── web/            # Web-specific optimizations (Phase 10)
│   └── windows/        # Windows desktop app (Phase 11)
├── packages/
│   ├── core/           # Platform-agnostic business logic
│   ├── ui/             # Design system + components
│   └── integration/    # Infrastructure + external integration sub-packages
│       ├── auth/       # @automatize/auth — Authentication logic (Supabase)
│       ├── storage/    # @automatize/storage — WatermelonDB models & schemas
│       ├── sync/       # @automatize/sync — Sync engine
│       ├── supabase/   # Supabase CLI project (migrations, config)
│       ├── payment/    # @automatize/integration-payment (planned)
│       └── nfe/        # @automatize/integration-nfe (planned)
├── docs/
│   ├── adr/            # Architecture Decision Records
│   └── runbooks/       # Operational guides
├── tools/
│   ├── eslint-config/  # Shared ESLint configs
│   └── tsconfig/       # Shared TypeScript configs
└── .github/
    └── workflows/      # CI/CD pipelines
```

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **pnpm**: 8.x or higher
- **Git**: Latest version

### Installation

1. **Install pnpm** (if not installed):

```bash
npm install -g pnpm@8
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
- `pnpm clean` - Remove all build artifacts and node_modules

### Package Level

Each package has its own scripts:

- `pnpm build` - Build the package
- `pnpm dev` - Watch mode for development
- `pnpm lint` - Lint the package
- `pnpm typecheck` - Type-check the package
- `pnpm test` - Run package tests

---

## Architecture Decisions

See [docs/adr/](docs/adr/) for Architecture Decision Records (ADRs).

Key decisions:

- **ADR-001**: Monorepo with Turborepo (Phase 0)
- **ADR-002**: Offline-first with WatermelonDB (Phase 2)
- **ADR-003**: Multi-tenancy with RLS (Phase 1)

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

See [docs/rls-policies-template.md](docs/rls-policies-template.md) for RLS policy templates.

---

## Roadmap

We follow an incremental, phase-based roadmap. See [docs/planning/ROADMAP.md](docs/planning/ROADMAP.md) for details.

**Current Phase:** Phase 0 - Foundation & Setup ✅

**Next Phase:** Phase 1 - Authentication & Multi-tenancy

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

**Status:** Phase 0 Complete ✅
**Version:** 0.0.0
**Last Updated:** 2026-01-04
