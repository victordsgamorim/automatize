# @automatize/ui

Design system and UI components for Automatize.

## What is this?

A unified design system that provides reusable UI components and design tokens for both mobile (React Native) and web platforms. It ensures visual consistency across all Automatize applications.

## How it works

The package has two main exports:

**Design tokens** — Centralized definitions for colors, spacing, typography, shadows, and border radius. Tokens are defined once in JSON ([W3C DTCG format](https://design-tokens.github.io/community-group/format/)) and generated into both TypeScript (for React Native) and CSS custom properties (for web/Tailwind) using [Style Dictionary](https://styledictionary.style).

**UI components** — Pre-built, accessible components like buttons, inputs, cards, and text elements. Components are built on top of tokens, ensuring they always use the correct values.

## Directory organization

- **tokens/** — Token source files (JSON, W3C DTCG format). **This is the single source of truth.**
- **src/tokens/** — ⚠️ GENERATED TypeScript modules (do not edit). Run `pnpm tokens:build`.

**Important:** Full-page screens (e.g., `SignInScreen`, `DashboardScreen`) do NOT belong in the design system. Cross-platform screens live in their own feature packages under `packages/` (e.g., `packages/sign-in/` → `@automatize/sign-in`). Platform-specific screens live in `apps/<platform>/components/screens/`. The design system contains only reusable primitives, tokens, and generic composites.

- **src/styles/\_tokens.css** — ⚠️ GENERATED CSS custom properties (do not edit). Run `pnpm tokens:build`.
- **src/styles/globals.css** — Hand-authored semantic mappings (CSS vars). Imports `_tokens.css`. **Does not contain Tailwind directives.**
- **src/components/** — Reusable UI components.
- **src/web/** — Web-specific components (shadcn/ui / Radix UI).
- **style-dictionary.config.ts** — Build config for token generation.

## Token authoring guide

### Workflow summary

```
Edit tokens/*.json
      ↓
pnpm --filter @automatize/ui build    ← runs tokens:build automatically
      ↓
Generated: src/tokens/*.ts + src/styles/_tokens.css
```

### Adding or modifying a token

1. Edit the relevant JSON file in `tokens/`:

   | File              | Contains                                    |
   | ----------------- | ------------------------------------------- |
   | `color.json`      | Color palettes + semantic color mappings    |
   | `spacing.json`    | Spacing scale (4px base unit)               |
   | `typography.json` | Font families, sizes, weights, line heights |
   | `shadow.json`     | Shadow definitions (with RN elevation)      |
   | `radius.json`     | Border radius values                        |

2. **Build the project** (tokens are generated automatically):

   ```sh
   # Option 1: Build only this package
   pnpm --filter @automatize/ui build

   # Option 2: Build entire monorepo (tokens generated for all deps)
   pnpm build
   ```

   The `tokens:build` script runs automatically as part of `pnpm build`.

3. Verify the output in `src/tokens/*.ts` and `src/styles/_tokens.css`.

4. If you added a **new semantic token** that maps to a shadcn/ui CSS variable, update `src/styles/globals.css` to reference it (e.g., `--primary: var(--semantic-primary)`).

### Token format (W3C DTCG)

```jsonc
{
  "color": {
    "$type": "color",
    "brand": {
      "600": { "$value": "#2563EB" },
    },
  },
  "semantic": {
    "$type": "color",
    "primary": { "$value": "{color.brand.600}" }, // ← reference, resolved at build time
  },
}
```

- Use `$value` for the token value and `$type` for the token type.
- Use `{group.subgroup.name}` syntax for references — Style Dictionary resolves them at build time.
- Shadows use `$extensions` for React Native `elevation` values.

### What gets generated

| Output                     | Consumer          | Format                              |
| -------------------------- | ----------------- | ----------------------------------- |
| `src/tokens/colors.ts`     | React Native      | `export const colors = { ... }`     |
| `src/tokens/spacing.ts`    | React Native      | `export const spacing = { ... }`    |
| `src/tokens/typography.ts` | React Native      | `export const typography = { ... }` |
| `src/tokens/shadows.ts`    | React Native      | `export const shadows/borderRadius` |
| `src/tokens/index.ts`      | Barrel re-export  | `export * from './...'`             |
| `src/styles/_tokens.css`   | Web / Tailwind v4 | CSS custom properties in `:root`    |

### Rules

- **Never edit generated files** — they will be overwritten on next build.
- **No hardcoded colors/spacing in features** — always import from `@automatize/ui/tokens`.
- **Generated files are committed** — consumers don't need to run the generator.

## Build behavior

**The `tokens:build` script runs automatically** during `pnpm build`:

```jsonc
// packages/ui/package.json
"scripts": {
  "tokens:build": "tsx style-dictionary.config.ts",
  "build": "pnpm tokens:build && tsup"  // ← automatic token generation
}
```

**You never need to run `tokens:build` manually** unless you specifically want to regenerate tokens without building the package.

## Design decisions

**Why Style Dictionary?**
It provides a single source of truth for design tokens. Change a value once in JSON, both platforms (React Native + Web CSS) update automatically. No drift possible.

**Why W3C DTCG format?**
Aligns with the emerging standard. Growing tooling ecosystem, future-proof.

**Why tokens instead of raw CSS or StyleSheet?**
Tokens provide a language-agnostic foundation. The same color token works whether rendered as a CSS custom property or a React Native StyleSheet value.

**Why lucide icons?**
Lucide provides consistent, clean icons that work across platforms. The library is actively maintained and has excellent accessibility.

**Component philosophy:**

- Every component uses design tokens
- Every component has size variants (sm, md, lg)
- Every interactive component is accessible
- No hardcoded colors or spacing anywhere

## Usage pattern

Apps import from this package instead of creating their own styling. This guarantees that every button, input, and card looks exactly the same across the entire application.

### React Native

```ts
import { colors, spacing, typography } from '@automatize/ui/tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    padding: spacing[4], // 16px
  },
});
```

### Web (CSS/Tailwind)

```css
@import '@automatize/ui/styles';

/* Token variables are available globally */
.custom {
  color: var(--color-brand-600);
  padding: var(--spacing-4);
}
```
