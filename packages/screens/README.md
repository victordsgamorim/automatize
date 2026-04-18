# @automatize/screens

Cross-platform screen package for the Automatize monorepo. Contains feature screens with `.web.tsx` and `.native.tsx` implementations.

---

## Available Screens

| Screen           | Subpath                          | Description                               |
| ---------------- | -------------------------------- | ----------------------------------------- |
| TechnicianScreen | `@automatize/screens/technician` | Technician management — add, edit, delete |

Each screen exposes two entry points:

- **Native** (default): `@automatize/screens/<screen-name>` — React Native implementation
- **Web**: `@automatize/screens/<screen-name>/web` — HTML/Tailwind implementation

---

## Usage

### Web (Next.js / Expo Web)

```tsx
import { <ScreenName>Screen } from '@automatize/screens/<screen-name>/web';
```

### Mobile (React Native / Expo)

```tsx
import { <ScreenName>Screen } from '@automatize/screens/<screen-name>';
```

---

## Dependencies

This package centralizes shared dependencies so individual screens inherit them:

| Dependency                   | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `@automatize/localization`   | Translation hook (`useTranslation`) for i18n              |
| `@automatize/form-validator` | Zod schemas and validation helpers                        |
| `@automatize/ui`             | Design system components (Button, Input, FormField, etc.) |
| `@automatize/ui/web`         | Web-specific components (Radix primitives)                |
| `@automatize/auth`           | Auth context and Zod schemas                              |
| `@automatize/utils`          | ULID generation, timestamps                               |

### Button Variants

Buttons use variants from `@automatize/ui`:

| Variant       | Use case                           |
| ------------- | ---------------------------------- |
| `primary`     | Main action (submit, confirm)      |
| `secondary`   | Secondary actions (cancel, back)   |
| `destructive` | Dangerous actions (delete, remove) |

```tsx
// Native
import { Button } from '@automatize/ui';

// Web
import { Button } from '@automatize/ui/web';
```

### Form Validation

Forms use `@automatize/form-validator` for Zod schemas. Input components from `@automatize/ui` integrate with the validation library:

```tsx
import { FormField } from '@automatize/ui';
import { useFormValidator } from '@automatize/form-validator';
```

### Screen Hooks

Each screen can have a co-located hook for business logic:

```
src/<screen-name>/
  use<ScreenName>.ts         # Shared hook (optional)
```

Hooks handle:

- Form validation logic
- API calls
- State management
- Business rules

### How Localization Works

Screens use `useTranslation()` from `@automatize/localization` — the translation hook. The actual i18next runtime lives in the singleton (see `@automatize/localization` docs), which apps wrap at their root.

Screens receive locale configuration via props:

```tsx
<<ScreenName>Screen
  locale={{
    languages: [{ code: 'en', label: 'English', ext: 'US' }],
    currentLanguage: 'en',
    onLanguageChange: (code) => i18n.changeLanguage(code),
  }}
/>
```

### How Theming Works

Screens use theme types from `@automatize/ui/tokens`. Theme state is passed as props from the app's theme provider:

```tsx
<<ScreenName>Screen
  theme={{
    currentTheme: preference,
    isDarkTheme: isDark,
    themeOptions: [{ value: 'light', label: 'Light' }, ...],
    onThemeChange: setTheme,
  }}
/>
```

### How UI Components Work

All UI primitives come from `@automatize/ui`. Screens import components like `Button`, `Input`, `FormField`, `AnimatedFadeIn`, etc. No screen defines its own primitive components — everything comes from the shared design system.

---

## Directory Structure

```
packages/screens/
  src/
    <screen-name>/
      <ScreenName>.web.tsx       # Web implementation
      <ScreenName>.native.tsx    # React Native implementation
      <ScreenName>.types.ts      # Shared prop types
      use<ScreenName>.ts         # Auth hook (optional)
      index.ts                   # Native entry
      web.ts                     # Web entry
      __tests__/
    test/
      setup.ts                   # Shared test setup (ResizeObserver polyfill)
```

---

## Adding a New Screen

1. Create a directory under `src/<screen-name>/`
2. Add the screen implementations:
   - `<ScreenName>.web.tsx` — Web version using `@automatize/ui/web`
   - `<ScreenName>.native.tsx` — Native version using `@automatize/ui`
   - `<ScreenName>.types.ts` — Shared props interface
   - Optional: `use<ScreenName>.ts` — Shared hook
3. Create entry files:
   - `index.ts` — exports from `.native` implementation + types
   - `web.ts` — exports from `.web` implementation + types
4. Add entry points to `tsup.config.ts`:
   ```ts
   entry: [
     // ...existing entries
     'src/<screen-name>/index.ts',
     'src/<screen-name>/web.ts',
   ],
   ```
5. Add subpath exports to `package.json`:
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
6. Add tests in `__tests__/` directory
7. Build and verify: `pnpm --filter @automatize/screens build && pnpm --filter @automatize/screens test`

---

## Development

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

## Testing Conventions

- Mock `@automatize/ui/web` with simple HTML equivalents (see existing tests for examples)
- Mock `@automatize/localization` with a translation map for your screen's keys
- Use the shared `src/test/setup.ts` for jsdom polyfills (ResizeObserver)
- Tests resolve `.web.tsx` files via the vitest `resolve.extensions` config

---

**Last Updated:** 2026-04-15
