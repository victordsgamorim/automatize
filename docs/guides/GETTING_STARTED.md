# Getting Started with Automatize

Welcome to Automatize! This guide will help you set up the project and start developing.

## Phase 0 Setup Complete ✅

The foundation of the project is now ready. Here's what has been configured:

### Infrastructure ✅

- Monorepo with Turborepo + pnpm
- Complete package structure (core, ui, sync, storage, auth)
- Apps structure (mobile, web, windows)

### Tooling ✅

- ESLint + Prettier configured
- Pre-commit hooks (Husky + lint-staged)
- Commitlint (Conventional Commits)
- Renovate for dependency updates
- Vitest with sample tests

### Design System ✅

- Design tokens (colors, spacing, typography)
- Foundation for dark mode

### Security ✅

- Environment variables structure
- RLS policies template
- Observability structure (to be configured)

### CI/CD ✅

- GitHub Actions pipeline configured
- Automated testing, linting, type-checking, and build

### Documentation ✅

- Comprehensive README
- ADR structure with first ADR
- RLS policies template
- This getting started guide

---

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js 20.x or higher**

   ```bash
   node --version  # Should be >= 20.0.0
   ```

2. **pnpm 8.x**

   ```bash
   npm install -g pnpm@8
   ```

3. **Git**
   ```bash
   git --version
   ```

---

## Installation Steps

### 1. Install Dependencies

From the project root:

```bash
pnpm install
```

This will install all dependencies for all packages and apps. It might take a few minutes on the first run.

### 2. Setup Environment Variables

Create a `.env` file in the root:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Supabase Configuration (you'll set this up in Phase 1)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
API_URL=http://localhost:3000

# Observability Configuration (optional - to be configured)
# OBSERVABILITY_PROVIDER=

# Environment
ENVIRONMENT=development
```

> **Note:** Supabase setup will be done in Phase 1. For now, you can leave placeholder values.

### 3. Build All Packages

```bash
pnpm build
```

This builds all packages in the correct order (respecting dependencies).

**Expected output:**

```
✓ @automatize/core built successfully
✓ @automatize/ui built successfully
✓ @automatize/sync built successfully
✓ @automatize/storage built successfully
✓ @automatize/auth built successfully
```

### 4. Run Tests

```bash
pnpm test
```

You should see the sample test in `@automatize/core` passing.

### 5. Start the Mobile App

```bash
cd apps/mobile
pnpm dev
```

This will start the Expo development server. You can then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

---

## Development Workflow

### Running Commands

#### From Root (Monorepo Level)

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint everything
pnpm lint

# Type-check everything
pnpm typecheck

# Format all code
pnpm format
```

#### From Package Level

```bash
cd packages/core

# Build this package
pnpm build

# Run tests for this package
pnpm test

# Watch mode for development
pnpm dev
```

### Making Changes

1. **Create a branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run checks:**

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

4. **Commit (pre-commit hooks will run automatically):**

   ```bash
   git commit -m "feat(scope): your commit message"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Project Structure

```
automatize/
├── apps/
│   ├── mobile/           # Expo app (iOS/Android/Web)
│   │   ├── app/          # Expo Router pages
│   │   ├── assets/       # Images, fonts, etc.
│   │   └── package.json
│   ├── web/              # Web-specific (Phase 10)
│   └── windows/          # Windows desktop (Phase 11)
│
├── packages/
│   ├── core/             # Business logic (platform-agnostic)
│   │   ├── domain/       # Entities, Value Objects
│   │   ├── services/     # Use cases
│   │   ├── hooks/        # React hooks
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Helper functions
│   │
│   ├── ui/               # Design system
│   │   ├── components/   # UI components
│   │   ├── tokens/       # Design tokens
│   │   └── theme/        # Theme configuration
│   │
│   ├── sync/             # Sync engine (Phase 2)
│   ├── storage/          # WatermelonDB (Phase 2)
│   └── auth/             # Authentication (Phase 1)
│
├── docs/
│   ├── adr/              # Architecture decisions
│   ├── runbooks/         # Operational guides
│   └── rls-policies-template.md
│
├── tools/
│   ├── eslint-config/    # Shared ESLint config
│   └── tsconfig/         # Shared TypeScript config
│
├── .github/
│   └── workflows/        # CI/CD pipelines
│
├── .husky/               # Git hooks
├── package.json          # Root package.json
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Workspace config
```

---

## Common Tasks

### Adding a New Package

1. Create directory: `mkdir packages/my-package`
2. Create `package.json`:
   ```json
   {
     "name": "@automatize/my-package",
     "version": "0.0.0",
     "private": true,
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch"
     },
     "dependencies": {
       "@automatize/core": "workspace:*"
     },
     "devDependencies": {
       "@automatize/tsconfig": "workspace:*",
       "tsup": "^8.0.1",
       "typescript": "^5.3.3"
     }
   }
   ```
3. Create `tsconfig.json`, `tsup.config.ts`, and `src/index.ts`
4. Run `pnpm install` from root

### Adding a Dependency

```bash
# Add to a specific package
pnpm add <package> --filter @automatize/core

# Add to root (dev dependencies)
pnpm add -D <package> -w
```

### Running Specific Tests

```bash
# Run tests for one package
pnpm --filter @automatize/core test

# Watch mode
pnpm --filter @automatize/core test:watch
```

---

## Troubleshooting

### `pnpm install` fails

1. Delete `node_modules` and `pnpm-lock.yaml`
2. Run `pnpm install` again
3. If still failing, check Node.js version (must be 20+)

### Build fails

1. Ensure all dependencies are installed: `pnpm install`
2. Clean and rebuild: `pnpm clean && pnpm install && pnpm build`

### Tests fail

1. Ensure packages are built: `pnpm build`
2. Check if you're in the right directory
3. Run with verbose output: `pnpm test -- --reporter=verbose`

### Expo app won't start

1. Clear Expo cache: `cd apps/mobile && rm -rf .expo`
2. Reinstall dependencies: `cd apps/mobile && pnpm install`
3. Start again: `pnpm dev`

---

## Next Steps

You're now ready to move to **Phase 1: Authentication & Multi-tenancy**!

Phase 1 will include:

- Supabase Auth integration
- Login/Register screens
- MFA setup
- Tenant model and RLS policies
- Secure token storage
- Protected routes with Expo Router

Refer to [ROADMAP.md](ROADMAP.md) for the complete development plan.

---

## Getting Help

- **Documentation**: Check [README.md](README.md) and [CLAUDE.md](CLAUDE.md)
- **Architecture Decisions**: See [docs/adr/](docs/adr/)
- **Issues**: Create a GitHub issue with detailed reproduction steps

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io)
- [Supabase Documentation](https://supabase.com/docs)
- [WatermelonDB Documentation](https://nozbe.github.io/WatermelonDB/)

---

**Happy Coding! 🚀**
