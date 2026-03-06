# @automatize/eslint-config

Shared ESLint configuration.

## What is this?

A package containing ESLint configurations used by all packages in the monorepo. Ensures consistent code quality and style without duplicating rules.

## How it works

The package exports two configurations:

**base.js** — Foundation for all TypeScript packages. TypeScript-aware linting, recommended rules, Prettier integration.

**react-native.js** — Extends base for React Native packages. Adds React-specific rules, React Native specific rules (no inline styles, no unused styles).

## Why this way?

**Centralized rules**: One place to update rules for the entire monorepo. When a new rule is needed, add it once.

**Prettier integration**: ESLint and Prettier can conflict. This config includes Prettier as an ESLint config, eliminating conflicts automatically.

**Platform-specific rules**: React Native has specific concerns (no inline styles for performance, warn on color literals). These rules only apply where relevant.

## Usage pattern

Every package extends from one or more configs:

```javascript
module.exports = {
  extends: ['@automatize/eslint-config/base'],
};
```

React Native packages add the platform config:

```javascript
module.exports = {
  extends: [
    '@automatize/eslint-config/base',
    '@automatize/eslint-config/react-native',
  ],
};
```

## Rules philosophy

**Errors over warnings**: Most rules are set to error. Warnings get ignored; errors stop the build.

**No unused code**: Unused variables, imports, and styles are errors. Dead code indicates technical debt.

**Prefer const**: Using const signals immutability intent and prevents accidental reassignment.

**Console warnings**: console.log is allowed in development but warned in production code.

## Design decisions

**Why not use flat config?**
This package uses CommonJS (module.exports) for broad compatibility with various tooling setups. Could be migrated to flat config in the future.

**Why warn on any?**
Explicit any is a code smell. It's sometimes necessary but should be rare. Warning encourages fixing it eventually.
