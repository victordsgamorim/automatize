# ADR-001: Monorepo with Turborepo

**Date Created:** 2026-01-04
**Date Accepted:** 2026-01-04
**Status:** Accepted
**Deciders:** Development Team

---

## Context

The Automatize project needs to manage multiple related codebases:

- Multiple apps (mobile, web, windows)
- Shared packages (core, ui, sync, storage, auth)
- Shared tooling (eslint-config, tsconfig)

We need a solution that:

- Allows code sharing between apps and packages
- Provides efficient builds (incremental, cached)
- Supports TypeScript references
- Scales well as the project grows
- Has good developer experience

---

## Decision

We will use **Turborepo** as our monorepo build system with **pnpm workspaces** for package management.

### Key Implementation Details

- `apps/` directory for applications (mobile, web, windows)
- `packages/` directory for shared packages
- `tools/` directory for shared tooling configs
- Turborepo for build orchestration and caching
- pnpm workspaces for dependency management

### Configuration

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".expo/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## Consequences

### Positive

- **Code Reuse**: Shared business logic in `@automatize/core` used by all apps
- **Consistent Tooling**: Single source of truth for ESLint, TypeScript configs
- **Fast Builds**: Turborepo's intelligent caching speeds up CI/CD
- **Type Safety**: TypeScript references ensure type consistency across packages
- **Developer Experience**: Single `pnpm install` for entire project
- **Atomic Changes**: Single PR can update multiple packages

### Negative

- **Initial Complexity**: Higher learning curve for developers new to monorepos
- **Build Times**: Initial builds are slower (mitigated by caching)
- **Tooling Setup**: Requires careful configuration of build pipeline
- **Debugging**: Harder to debug issues across package boundaries

### Neutral

- **Versioning**: All packages share a single version (0.0.0 currently)
- **CI/CD**: Need to configure GitHub Actions for monorepo structure

---

## Alternatives Considered

### Alternative 1: Polyrepo (Multiple Repositories)

- **Pros**: Simpler mental model, independent deployments
- **Cons**: Code duplication, versioning hell, harder to maintain consistency
- **Rejected**: Does not align with our need for tight integration between apps

### Alternative 2: Nx Monorepo

- **Pros**: More features, great tooling, plugin ecosystem
- **Cons**: More complex, larger configuration surface, steeper learning curve
- **Rejected**: Turborepo is simpler and sufficient for our needs

### Alternative 3: Yarn/npm Workspaces Only

- **Pros**: Simpler, built-in to package managers
- **Cons**: No build orchestration, no caching, manual dependency ordering
- **Rejected**: Lacks the build optimizations we need for CI/CD

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

---

## Notes

- This decision was made in Phase 0 (Foundation & Setup)
- Revisit if project complexity significantly increases (>20 packages)
- Remote caching can be enabled later for team collaboration
