# @automatize/core

Dependency injection container and interface contracts.

## What is this?

This package contains:

- **DI container** — Dependency injection setup
- **Repository interfaces** — Contracts that define how features access data
- **Service interfaces** — Contracts for business services

## Current Structure

```
src/
├── di/                 # Dependency injection (planned)
└── interfaces/         # Repository & service contracts (planned)
```

## Purpose

The core package defines **contracts** (interfaces) that feature packages implement. This enables:

- **Loose coupling** — Features don't depend on concrete implementations
- **Testability** — Easy to mock interfaces
- **Flexibility** — Swap implementations without touching feature code

## Current Status

Placeholder. DI container and interfaces will be defined as features are built.

## Related

- See `packages/` for feature modules with business logic
- See `integration/` for concrete implementations
