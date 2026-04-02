# AGENT INSTRUCTION — @automatize/ui

## 1) Role and Mission

You are working with the `@automatize/ui` package, which provides the **design system** for Automatize. This includes:

- **Design tokens** — Centralized definitions for colors, spacing, typography, shadows, and border radius
- **UI components** — Pre-built, accessible components (buttons, inputs, cards, text elements)
- **Behavioral components** — Interaction patterns (Fade, ErrorBoundary, Popover, Select)

Screens do NOT belong in the design system — they live in `packages/screens`.

---

## 2) Mandatory First Step (Non-Negotiable)

Before performing any task in this package, you **MUST**:

### 2.1 Read the Package README.md

Read `packages/ui/README.md` and treat it as the **highest-priority source of truth** for:

- directory organization
- token authoring guide
- build behavior
- design decisions
- usage patterns

### 2.2 Read Root CLAUDE.md

Read the root `CLAUDE.md` for project-wide context:

- Non-negotiable principles (§3)
- Performance standards (§4.1)
- Code structure standards (§4.2)
- Testing requirements (§22)
- UI component rules (§24)

---

## 3) Package Structure

### 3.1 Directories

| Directory         | Purpose                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `tokens/`         | Token source files (JSON, W3C DTCG format) — **single source of truth** |
| `src/tokens/`     | ⚠️ GENERATED TypeScript modules (do not edit)                           |
| `src/styles/`     | Generated CSS custom properties (do not edit)                           |
| `src/components/` | Visual UI components (Button, Input, Card, Text, etc.)                  |
| `src/actions/`    | Behavioral components (Fade, ErrorBoundary, Popover, Select)            |

### 3.2 Entry Points

| Import path             | Exports                                           |
| ----------------------- | ------------------------------------------------- |
| `@automatize/ui`        | Native implementations from `src/index.ts`        |
| `@automatize/ui/web`    | Web implementations from `src/web.ts`             |
| `@automatize/ui/tokens` | Design tokens (colors, spacing, typography, etc.) |

---

## 4) Design Tokens

### 4.1 Token Workflow

```
Edit tokens/*.json
       ↓
pnpm --filter @automatize/ui build    ← runs tokens:build automatically
       ↓
Generated: src/tokens/*.ts + src/styles/_tokens.css + src/styles/_animation.css
```

### 4.2 Token Files

| File                     | Contains                                                     |
| ------------------------ | ------------------------------------------------------------ |
| `tokens/color.json`      | Color palettes + semantic color mappings                     |
| `tokens/spacing.json`    | Spacing scale (4px base unit)                                |
| `tokens/typography.json` | Font families, sizes, weights, line heights                  |
| `tokens/shadow.json`     | Shadow definitions (with RN elevation)                       |
| `tokens/radius.json`     | Border radius values                                         |
| `tokens/animation.json`  | Animation values (duration, easing, blur, translate, delays) |

### 4.3 Token Format (W3C DTCG)

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
    "primary": { "$value": "{color.brand.600}" },
  },
}
```

- Use `$value` for token value and `$type` for token type
- Use `{group.subgroup.name}` syntax for references
- Shadows use `$extensions` for React Native `elevation` values

### 4.4 Rules

1. **Never edit generated files** — they will be overwritten on next build
2. **No hardcoded colors/spacing in features** — always import from `@automatize/ui/tokens`
3. **Generated files are committed** — consumers don't need to run the generator

---

## 5) Creating a New Component

### 5.1 Component Types

- **Visual components** (`src/components/`) — render visible UI (Button, Input, Card, Text)
- **Behavioral components** (`src/actions/`) — provide interaction patterns (Fade, Popover, Select)

### 5.2 Directory Structure

```
src/components/<Name>/
  <Name>.web.tsx        # Web implementation (Radix UI / Tailwind)
  <Name>.native.tsx     # React Native implementation

src/actions/<Name>/
  <Name>.web.tsx        # Web implementation
  <Name>.native.tsx     # React Native implementation
```

**Rules:**

- Every `.web.tsx` or `.native.tsx` file **MUST** be inside its own named folder
- No per-component barrel files (`index.ts` or `index.native.ts`)
- `src/index.ts` exports native via explicit `.native.tsx` paths
- `src/web.ts` exports web via explicit `.web.tsx` paths

### 5.3 Entry File Updates

Update `src/index.ts`:

```ts
export { Button } from './components/Button/Button.native';
```

Update `src/web.ts`:

```ts
export { Button } from './components/Button/Button.web';
```

### 5.4 Build Configuration

If adding a new component requires new dependencies, update the package accordingly. The package uses tsup for bundling.

---

## 6) Component Philosophy

Every component MUST follow:

1. **Use design tokens** — no hardcoded colors, spacing, or typography
2. **Consolidate when possible** — e.g., Input combines form input + label + error
3. **Consistent variants** across platforms
4. **Accessible** — WCAG 2.1 Level AA minimum
5. **Form components** handle label association and error display

---

## 7) Testing

### 7.1 Test Location

Tests live next to components in their folder: `src/components/Button/__tests__/`

### 7.2 Test Commands

```bash
pnpm --filter @automatize/ui build
pnpm --filter @automatize/ui lint
pnpm --filter @automatize/ui typecheck
pnpm --filter @automatize/ui test
```

### 7.3 Requirements

- Unit tests for all business logic
- Coverage must exceed 80%
- No UI dependency in unit tests — mock external deps

---

## 8) Important Rules

1. **Screens do NOT belong here** — they go in `packages/screens`
2. **Never edit generated files** — they are overwritten on build
3. **No hardcoded values** — always use tokens
4. **No barrel files** in component folders — exports go through root
5. **Explicit import paths** — use `.web.tsx` or `.native.tsx`, never relative folder paths
6. **Tests are mandatory** — >80% coverage required
7. **Run lint before finishing** — must pass

---

## 9) Conflict Resolution Order

1. Root `README.md`
2. `packages/ui/README.md`
3. This instruction (`packages/ui/CLAUDE.md`)
4. Root `CLAUDE.md`
5. Codebase reality (tests, types, lint rules)
6. Everything else

---

**Last Updated:** 2026-04-02
