# @automatize/forgot-password

Cross-platform forgot-password screen for Automatize.

## What is this?

A feature package providing the forgot-password screen and its shared logic for both web (Next.js) and mobile (Expo/React Native). It is the single source of truth for the password reset request UI — apps never duplicate this screen.

## How it works

The package follows the `.web.tsx` / `.native.tsx` split pattern:

- **`ForgotPasswordScreen.web.tsx`** — React/HTML implementation using `@automatize/ui/web` (Radix UI + Tailwind)
- **`ForgotPasswordScreen.native.tsx`** — React Native implementation using `@automatize/ui` (StyleSheet)
- **`useForgotPassword.ts`** — Shared hook (platform-agnostic). Handles form state, validation via `resetPasswordRequestSchema`, and delegates auth to `useAuth()` from `@automatize/auth`

Apps import from the appropriate entry point:

```ts
// Web (Next.js)
import { ForgotPasswordScreen } from '@automatize/forgot-password/web';

// Mobile (Expo / Metro)
import { ForgotPasswordScreen } from '@automatize/forgot-password';
```

## Props (`ForgotPasswordScreenProps`)

| Prop             | Type         | Required | Description                                      |
| ---------------- | ------------ | -------- | ------------------------------------------------ |
| `onBackToSignIn` | `() => void` | yes      | Called when user wants to go back to sign-in     |
| `locale`         | `LocaleData` | yes      | Language switcher data (options + callback)      |
| `theme`          | `ThemeData`  | no       | Theme switcher data — web only, ignored natively |

### `LocaleData`

```ts
interface LocaleData {
  languages: LanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
}
```

### `ThemeData` (web only)

```ts
interface ThemeData {
  currentTheme: 'light' | 'dark' | 'system';
  isDarkTheme: boolean;
  themeOptions: ThemeOption[];
  onThemeChange: (preference: 'light' | 'dark' | 'system') => void;
}
```

## Dependencies

| Package                         | Role                                              |
| ------------------------------- | ------------------------------------------------- |
| `@automatize/auth`              | `useAuth()` hook + `resetPasswordRequestSchema`   |
| `@automatize/core-localization` | `LocaleData` / `LanguageOption` type contracts    |
| `@automatize/core-theme`        | `ThemeData` / `ThemeOption` type contracts        |
| `@automatize/ui`                | UI primitives (Button, Input, FormField, etc.)    |
| `react-i18next`                 | `useTranslation()` — peer dep, initialized by app |

**No auth implementation** lives here. The screen relies on the `AuthProvider` from `@automatize/supabase-auth` being mounted above it in the tree.

**No i18n initialization** lives here. The app must call `initLocalization` before mounting this screen.

## Package entries

| Import path                       | Resolves to              |
| --------------------------------- | ------------------------ |
| `@automatize/forgot-password`     | `dist/index.js` (native) |
| `@automatize/forgot-password/web` | `dist/web.js` (web)      |

## Development

```sh
# Build
pnpm --filter @automatize/forgot-password build

# Watch
pnpm --filter @automatize/forgot-password dev

# Test
pnpm --filter @automatize/forgot-password test

# Typecheck
pnpm --filter @automatize/forgot-password typecheck
```
