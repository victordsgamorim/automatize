# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for the Automatize project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## Format

Each ADR follows this structure:

```markdown
# ADR-XXX: Title

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

## Alternatives Considered

What other options did we consider?

## References

Links to relevant resources, discussions, or documentation.
```

## Index

### Phase 0: Foundation

- [ADR-001](001-monorepo-with-turborepo.md) - Monorepo with Turborepo
- [ADR-002](002-pnpm-as-package-manager.md) - pnpm as Package Manager
- [ADR-003](003-typescript-strict-mode.md) - TypeScript Strict Mode
- [ADR-004](004-conventional-commits.md) - Conventional Commits

### Phase 1: Auth (Planned)

- ADR-005 - Supabase for Authentication
- ADR-006 - MFA Strategy

### Phase 2: Offline-First (Planned)

- ADR-007 - WatermelonDB for Local Storage
- ADR-008 - Sync Strategy (Push/Pull)
- ADR-009 - Conflict Resolution (LWW)

---

## Creating a New ADR

1. Copy the template: `cp adr-template.md XXX-your-title.md`
2. Fill in the sections
3. Update this README with a link to your ADR
4. Submit a PR with your ADR

---

## Guidelines

- ADRs are **immutable** once accepted
- To change a decision, create a new ADR that supersedes the old one
- Keep ADRs concise and focused
- Include dates (Date Created, Date Accepted)
- Link related ADRs

---

**Last Updated:** 2026-01-04
