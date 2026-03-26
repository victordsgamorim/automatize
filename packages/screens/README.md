# @automatize/screens

Consolidated cross-platform screen package for the Automatize monorepo. Contains all feature screens with `.web.tsx` and `.native.tsx` implementations.

---

## Available Screens

| Screen          | Subpath                               | Description                           |
| --------------- | ------------------------------------- | ------------------------------------- |
| Sign In         | `@automatize/screens/sign-in`         | Email/password authentication         |
| Forgot Password | `@automatize/screens/forgot-password` | Password reset flow                   |
| Content (Home)  | `@automatize/screens/content`         | Dashboard layout with sidebar         |
| Settings        | `@automatize/screens/settings`        | App settings (theme, language, about) |

Each screen exposes two entry points:

- **Native** (default): `@automatize/screens/<screen>` — React Native implementation
- **Web**: `@automatize/screens/<screen>/web` — HTML/Tailwind implementation

---

## Usage

### Web (Next.js / Expo Web)

```tsx
import { SignInScreen } from '@automatize/screens/sign-in/web';
import { ForgotPasswordScreen } from '@automatize/screens/forgot-password/web';
import { SettingsScreen } from '@automatize/screens/settings/web';
import { HomeScreen } from '@automatize/screens/content/web';
```

### Mobile (React Native / Expo)

```tsx
import { SignInScreen } from '@automatize/screens/sign-in';
import { ForgotPasswordScreen } from '@automatize/screens/forgot-password';
import { SettingsScreen } from '@automatize/screens/settings';
```

---

## Dependencies

This package centralizes shared dependencies so individual screens inherit them:

| Dependency                      | Purpose                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `@automatize/core-localization` | Translation hook (`useTranslation`) for i18n              |
| `@automatize/core-theme`        | Theme types (light/dark/system preferences)               |
| `@automatize/ui`                | Design system components (Button, Input, FormField, etc.) |
| `@automatize/auth`              | Auth context and Zod schemas                              |
| `@automatize/utils`             | ULID generation, timestamps                               |

### How Localization Works

Screens use `useTranslation()` from `@automatize/core-localization` — a platform-agnostic hook that reads from React context. The actual i18next integration lives in `@automatize/localization` (the runtime provider), which apps wrap at their root.

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

### How Theming Works

Screens use theme types from `@automatize/core-theme`. Theme state (preference, isDark) is passed as props from the app's `ThemeProvider`:

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

### How UI Components Work

All UI primitives come from `@automatize/ui`. Screens import components like `Button`, `Input`, `FormField`, `AnimatedFadeIn`, etc. No screen defines its own primitive components — everything comes from the shared design system.

---

## Directory Structure

```
packages/screens/
  src/
    sign-in/
      SignInScreen.web.tsx       # Web implementation
      SignInScreen.native.tsx    # React Native implementation
      SignInScreen.types.ts      # Shared prop types
      useSignIn.ts               # Auth hook
      index.ts                   # Native entry
      web.ts                     # Web entry
      __tests__/
    forgot-password/
      ForgotPasswordScreen.web.tsx
      ForgotPasswordScreen.native.tsx
      ForgotPasswordScreen.types.ts
      useForgotPassword.ts
      index.ts
      web.ts
      __tests__/
    content/
      HomeScreen.web.tsx
      HomeScreen.types.ts
      index.ts                   # Re-exports from web (no native yet)
      web.ts
      __tests__/
    settings/
      SettingsScreen.web.tsx
      SettingsScreen.native.tsx
      SettingsScreen.types.ts
      index.ts
      web.ts
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
- Mock `@automatize/core-localization` with a translation map for your screen's keys
- Use the shared `src/test/setup.ts` for jsdom polyfills (ResizeObserver)
- Tests resolve `.web.tsx` files via the vitest `resolve.extensions` config

---

**Last Updated:** 2026-03-25
