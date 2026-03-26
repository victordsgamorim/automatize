# @automatize/tsconfig

Shared TypeScript configuration.

## What is this?

A package containing base TypeScript configurations used by all packages in the monorepo. Ensures consistent TypeScript settings without duplicating configuration files.

## How it works

The package exports three configuration files:

**base.json** — Foundation for all packages. Strict mode enabled, modern JavaScript features, proper module resolution.

**nextjs.json** — Extends base for Next.js apps. Enables JSX preservation (Next.js handles transformation), incremental builds.

**react-native.json** — Extends base for React Native. Uses React Native JSX mode, CommonJS modules (required by Metro bundler).

## Why this way?

**Shared configs**: Instead of copying tsconfig.json to every package, each package extends from this central location. When TypeScript settings change, one update propagates everywhere.

**Strict by default**: The base config enables all strict checks. Individual packages can override, but the default is maximum safety.

**Separation by platform**: Different platforms have different requirements. Next.js needs JSX preserve, React Native needs React Native JSX, Node packages need CommonJS. Platform-specific configs handle these differences.

## Usage pattern

Every new package extends from one of these configs:

```json
{
  "extends": "@automatize/tsconfig/base"
}
```

## Design decisions

**Why strict mode?**
Catches more bugs at compile time. TypeScript's strict mode has saved countless runtime errors.

**Why moduleResolution: bundler?**
Works with modern bundlers (Vite, tsup, Metro). Resolves imports naturally without needing exact file extensions.

**Why ES2022 target?**
Modern enough for new features, old enough for broad compatibility. Can be lowered for specific platforms if needed.

---

**Last Updated:** 2026-03-25
