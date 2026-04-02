# AGENT INSTRUCTION — @automatize/screens

## 1) Role and Mission

You are working with the `@automatize/screens` package, which contains **cross-platform screens** with `.web.tsx` and `.native.tsx` implementations. Screens are full-page components tied to routing (e.g., SignInScreen, SettingsScreen).

---

## 2) Mandatory First Step (Non-Negotiable)

Before performing any task in this package, you **MUST**:

### 2.1 Read the Package README.md

Read `packages/screens/README.md` and treat it as the **highest-priority source of truth** for:

- available screens and their subpaths
- usage patterns (web vs mobile imports)
- dependencies overview
- directory structure
- adding new screens procedures
- development commands

### 2.2 Read Root CLAUDE.md

Read the root `CLAUDE.md` for project-wide context:

- Non-negotiable principles (§3)
- Performance standards (§4.1)
- Code structure standards (§4.2)
- Official technical decisions (§5)
- Testing requirements (§22)
- UI component rules (§24)

---

## 3) Package Dependencies

Screens consume these shared packages:

| Package                          | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `@automatize/ui`                 | Design system components (Button, Input) |
| `@automatize/ui/web`             | Web-specific UI components               |
| `@automatize/core-localization`  | Translation hook (`useTranslation`)      |
| `@automatize/localization`       | **NEVER USE** — i18n runtime (singleton) |
| `@automatize/core-theme`         | Theme types (Theme, ThemeMode, etc.)     |
| `@automatize/ui` (ThemeProvider) | **NEVER USE** — Theme runtime            |
| `@automatize/auth`               | Auth context and Zod schemas             |
| `@automatize/utils`              | ULID generation, timestamps              |

**CRITICAL:** Screens MUST only use `@automatize/core-localization` and `@automatize/core-theme`. Never import from `@automatize/localization` (runtime) or `@automatize/ui` ThemeProvider.

### 3.1 How Localization Works

Screens use `useTranslation()` from `@automatize/core-localization` — the translation hook interface. The actual i18next runtime lives in `@automatize/localization` (singleton + adapter pattern), which apps wrap at their root.

Screens receive locale configuration via props:

```tsx
<SignInScreen
  locale={{
    languages: [{ code: 'en', label: 'English', ext: 'US' }],
    currentLanguage: 'en',
    onLanguageChange: (code) => i18n.changeLanguage(code),
  }}
/>
```

### 3.2 How Theming Works

Screens use theme types from `@automatize/core-theme` — the theme type definitions (Theme, ThemeMode, etc.). The actual theme state lives in the app's ThemeProvider (usually `@automatize/ui` or app-specific), which passes the resolved state as props to screens:

```tsx
<SignInScreen
  theme={{
    currentTheme: preference,
    isDarkTheme: isDark,
    themeOptions: [{ value: 'light', label: 'Light' }, ...],
    onThemeChange: setTheme,
  }}
/>
```

### 3.3 How UI Components Work

All UI primitives come from `@automatize/ui` (native) or `@automatize/ui/web` (web). Screens import components like `Button`, `Input`, `FormField`, `AnimatedFadeIn`, etc. No screen defines its own primitive components.

---

## 4) Creating a New Screen

### 4.1 Directory Structure

Create the following structure under `src/<screen-name>/`:

```
src/<screen-name>/
  <ScreenName>.web.tsx        # Web implementation (HTML/Tailwind)
  <ScreenName>.native.tsx     # React Native implementation (StyleSheet)
  <ScreenName>.types.ts      # Shared props interface
  use<ScreenName>.ts         # Optional: shared hook
  index.ts                   # Native entry (exports from .native + types)
  web.ts                     # Web entry (exports from .web + types)
  __tests__/                 # Test files
```

### 4.2 Implementation Rules

**Web implementation** (`<ScreenName>.web.tsx`):

- Use `@automatize/ui/web` for components
- Use Tailwind CSS for styling
- Apply proper semantic HTML and accessibility

**Native implementation** (`<ScreenName>.native.tsx`):

- Use `@automatize/ui` for components
- Use `StyleSheet.create` for styling
- Follow React Native conventions

**Types** (`<ScreenName>.types.ts`):

- Define shared props interface
- Include locale and theme props
- Export for both entry points

### 4.3 Entry Files

**index.ts** (Native entry):

```ts
export { SignInScreen } from './SignInScreen.native';
export type { SignInScreenProps } from './SignInScreen.types';
```

**web.ts** (Web entry):

```ts
export { SignInScreen } from './SignInScreen.web';
export type { SignInScreenProps } from './SignInScreen.types';
```

### 4.4 Build Configuration

Update `tsup.config.ts`:

```ts
entry: [
  // ...existing entries
  'src/<screen-name>/index.ts',
  'src/<screen-name>/web.ts',
],
```

Update `package.json`:

```json
"./<screen-name>": {
  "types": "./dist/<screen-name>/index.d.ts",
  "import": "./dist/<screen-name>/index.mjs",
  "require": "./dist/<screen-name>/index.js"
},
"./<screen-name>/web": {
  "types": "./dist/<screen-name>/web.d.ts",
  "import": "./dist/<screen-name>/web.mjs",
  "require": "./dist/<screen-name>/web.js"
}
```

### 4.5 Build and Verify

```bash
pnpm --filter @automatize/screens build
pnpm --filter @automatize/screens lint
pnpm --filter @automatize/screens typecheck
pnpm --filter @automatize/screens test
```

---

## 5) Import Patterns

### 5.1 Web (Next.js / Expo Web)

```tsx
import { SignInScreen } from '@automatize/screens/sign-in/web';
import type { SignInScreenProps } from '@automatize/screens/sign-in';
```

### 5.2 Mobile (React Native / Expo)

```tsx
import { SignInScreen } from '@automatize/screens/sign-in';
import type { SignInScreenProps } from '@automatize/screens/sign-in';
```

---

## 6) Testing Conventions

- Mock `@automatize/ui/web` with simple HTML equivalents
- Mock `@automatize/core-localization` with a translation map
- Use `src/test/setup.ts` for jsdom polyfills (ResizeObserver)
- Tests resolve `.web.tsx` files via vitest `resolve.extensions` config
- Coverage must exceed 80%

---

## 7) Development Commands

```bash
# Build
pnpm --filter @automatize/screens build

# Watch mode
pnpm --filter @automatize/screens dev

# Run tests
pnpm --filter @automatize/screens test

# Type check
pnpm --filter @automatize/screens typecheck

# Lint
pnpm --filter @automatize/screens lint
```

---

## 8) Important Rules

1. **Never create primitive UI components in screens** — use `@automatize/ui`
2. **Always create both .web.tsx and .native.tsx** — unless platform-specific only
3. **Types must be shared** — put in `<ScreenName>.types.ts`
4. **No barrel files** — do not create `index.ts` inside the screen folder (only the package root)
5. **All imports must use explicit paths** — e.g., `'./SignInScreen.native'`, never relative folder paths
6. **Tests are mandatory** — create `__tests__/` with >80% coverage
7. **Run lint before finishing** — `pnpm --filter @automatize/screens lint` must pass
8. **Screens MUST NOT live in the design system** (`packages/ui`) — they belong in `packages/screens`
9. **Use core-localization and core-theme ONLY** — never import from `@automatize/localization` (runtime) or `@automatize/ui` ThemeProvider

---

## 9) Conflict Resolution Order

1. Root `README.md`
2. `packages/screens/README.md`
3. This instruction (`packages/screens/CLAUDE.md`)
4. Root `CLAUDE.md`
5. Codebase reality (tests, types, lint rules)
6. Everything else

---

**Last Updated:** 2026-04-02
