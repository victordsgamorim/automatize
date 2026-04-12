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

**Recent consolidations:**

- `Label` + `Text` → Single unified `Text` component with `htmlFor` prop for form labels
- `FormField` + `Input` → Single unified `Input` component with `label`, `error`, and `helperText` props
- `AnimatedFadeIn` + `Fade` → Single unified `Fade` component supporting both entrance animations and visibility toggles
- `ContentPlaceholder` → Moved to `packages/screens/src/content/` (not a design system primitive)

- **src/styles/\_tokens.css** — ⚠️ GENERATED CSS custom properties (do not edit). Run `pnpm tokens:build`.
- **src/styles/\_animation.css** — ⚠️ GENERATED animation keyframes + utility classes (do not edit). Run `pnpm tokens:build`.
- **src/styles/globals.css** — Hand-authored semantic mappings (CSS vars). Imports `_tokens.css`. **Does not contain Tailwind directives.**
- **src/components/** — Visual UI components organized in folders. Each folder contains platform-specific implementations (`.web.tsx` / `.native.tsx`). No per-component barrel files.
  - Examples: `Button/`, `Input/`, `Card/`, `Text/`, `Checkbox/`, etc.
  - Each component folder has only `.web.tsx` and/or `.native.tsx` files — NO `index.ts` or barrel files
  - `Input/` includes label, error, and helper text support (consolidated from former `FormField`)
  - `Text/` handles both general text and form labels (consolidated from former `Label`)
- **src/actions/** — Behavioral components that provide interaction patterns (floating positioning, open/close state, keyboard navigation, error catching, animation). Same folder conventions as `src/components/`.
  - Examples: `Fade/` (entrance animation + visibility toggle), `ErrorBoundary/`, `Popover/`, `Select/`, etc.
  - `Fade/` consolidates entrance animations (formerly `AnimatedFadeIn`) with visibility toggles
  - `ErrorBoundary/` provides root and component-level error catching with fallback UI
- **src/index.ts** — Main package entry (`@automatize/ui`). Exports native implementations using explicit `.native.tsx` paths (e.g., `./components/Button/Button.native`).
- **src/web.ts** — Web entry (`@automatize/ui/web`). Exports web implementations using explicit `.web.tsx` paths (e.g., `./components/Button/Button.web`).
- **style-dictionary.config.ts** — Build config for token generation.

## Token authoring guide

### Workflow summary

```
Edit tokens/*.json
      ↓
pnpm --filter @automatize/ui build    ← runs tokens:build automatically
      ↓
Generated: src/tokens/*.ts + src/styles/_tokens.css + src/styles/_animation.css
```

### Adding or modifying a token

1. Edit the relevant JSON file in `tokens/`:

   | File              | Contains                                                     |
   | ----------------- | ------------------------------------------------------------ |
   | `color.json`      | Color palettes + semantic color mappings                     |
   | `spacing.json`    | Spacing scale (4px base unit)                                |
   | `typography.json` | Font families, sizes, weights, line heights                  |
   | `shadow.json`     | Shadow definitions (with RN elevation)                       |
   | `radius.json`     | Border radius values                                         |
   | `breakpoint.json` | Responsive breakpoint values (Tailwind-aligned)              |
   | `animation.json`  | Animation values (duration, easing, blur, translate, delays) |

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

| Output                      | Consumer          | Format                                              |
| --------------------------- | ----------------- | --------------------------------------------------- |
| `src/tokens/colors.ts`      | React Native      | `export const colors = { ... }`                     |
| `src/tokens/spacing.ts`     | React Native      | `export const spacing = { ... }`                    |
| `src/tokens/typography.ts`  | React Native      | `export const typography = { ... }`                 |
| `src/tokens/shadows.ts`     | React Native      | `export const shadows/borderRadius`                 |
| `src/tokens/animation.ts`   | React Native      | `export const animation = { ... }`                  |
| `src/tokens/breakpoints.ts` | Cross-platform    | `export const breakpoints = { ... }`                |
| `src/tokens/index.ts`       | Barrel re-export  | `export * from './...'`                             |
| `src/styles/_tokens.css`    | Web / Tailwind v4 | CSS custom properties in `:root`                    |
| `src/styles/_animation.css` | Web / Tailwind v4 | Keyframes + utility classes + CSS custom properties |

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

**Component folder structure:**

All components (visual and behavioral) live in their respective folders (`src/components/<Name>/` or `src/actions/<Name>/`) with platform-specific files only — **no per-component barrel files**:

```text
src/components/Button/
  Button.web.tsx        # Web implementation (Radix UI / Tailwind)
  Button.native.tsx     # React Native implementation

src/components/Input/
  Input.web.tsx         # Web implementation (includes label, error support)
  Input.native.tsx      # React Native implementation (includes label, error, icons)

src/components/Text/
  Text.web.tsx          # Web implementation (text + form labels)
  Text.native.tsx       # React Native implementation

src/actions/Fade/
  Fade.web.tsx          # Web implementation (entrance animation + visibility toggle)
  Fade.native.tsx       # React Native implementation (via Animated API)

src/actions/ErrorBoundary/
  ErrorBoundary.web.tsx # Web implementation
  ErrorBoundary.tsx     # React Native implementation
```

**Rules:**

- `src/index.ts` — exports native implementations via explicit `.native.tsx` paths (e.g., `'./components/Button/Button.native'`)
- `src/web.ts` — exports web implementations via explicit `.web.tsx` paths (e.g., `'./components/Button/Button.web'`)
- Internal imports within `packages/ui` MUST use explicit `.web.tsx` or `.native.tsx` paths — never relative folder paths
- No component may have its own `index.ts` or barrel file — all exports go through the root `index.ts` and `web.ts`

**Component philosophy:**

- Every component uses design tokens (no hardcoded colors, spacing, or typography)
- Components are consolidated when possible (e.g., `Input` combines form input + label + error, `Fade` combines entrance animation + visibility toggle)
- Every component has consistent variant support across platforms
- Every interactive component is accessible (WCAG 2.1 Level AA minimum)
- Form-related components (`Input`, `Text` with `htmlFor`) handle both label association and error display

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

#### Animation tokens (React Native)

```ts
import { animation } from '@automatize/ui/tokens';
import { Animated, Easing } from 'react-native';

// Access shared animation values
const fadeIn = Animated.timing(opacity, {
  toValue: 1,
  duration: animation.fadeSlideIn.duration, // 600
  easing: Easing.bezier(...animation.fadeSlideIn.easing), // [0, 0, 0.2, 1]
  useNativeDriver: true,
});

// Use delay tokens for staggered animations
const delay = animation.delay[200]; // 200 (ms)
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

#### Animation utilities (Web)

The `@automatize/ui/styles` import includes generated animation utility classes:

```html
<!-- Fade + slide up with staggered delays -->
<h1 class="animate-element animate-delay-100">Title</h1>
<p class="animate-element animate-delay-200">Subtitle</p>
<div class="animate-element animate-delay-300">Content</div>

<!-- Slide from right -->
<div class="animate-slide-right animate-delay-100">Panel</div>

<!-- Testimonial entrance -->
<div class="animate-testimonial animate-delay-200">Quote</div>
```

CSS custom properties are also available for custom animations:

```css
.custom-animation {
  animation-duration: var(--animation-fadeSlideIn-duration);
  animation-timing-function: var(--animation-fadeSlideIn-easing);
}

---

**Last Updated:** 2026-04-12
```

### Breakpoint tokens

Breakpoint values are Tailwind-aligned and shared across the monorepo:

| Name  | Min Width |
| ----- | --------- |
| `sm`  | 640px     |
| `md`  | 768px     |
| `lg`  | 1024px    |
| `xl`  | 1280px    |
| `2xl` | 1536px    |

```ts
import { breakpoints, type BreakpointName } from '@automatize/ui/tokens';

// Numeric values for matchMedia / comparisons
const mql = window.matchMedia(`(min-width: ${breakpoints.lg}px)`);

// Type-safe breakpoint access
const bp: BreakpointName = 'md'; // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
```

Consumed by `@automatize/theme`'s `ResponsiveProvider` + `useResponsive()` hook for React-based breakpoint state.
