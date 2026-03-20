# @automatize/sign-in

Cross-platform sign-in screen for Automatize.

## What is this?

A feature package providing the sign-in screen and its shared logic for both web (Next.js) and mobile (Expo/React Native). It is the single source of truth for the authentication UI — apps never duplicate this screen.

## How it works

The package follows the `.web.tsx` / `.native.tsx` split pattern:

- **`SignInScreen.web.tsx`** — React/HTML implementation using `@automatize/ui/web` (Radix UI + Tailwind)
- **`SignInScreen.native.tsx`** — React Native implementation using `@automatize/ui` (StyleSheet)
- **`useSignIn.ts`** — Shared hook (platform-agnostic). Handles form state, validation via `loginSchema`, and delegates auth to `useAuth()` from `@automatize/auth`

Apps import from the appropriate entry point:

```ts
// Web (Next.js)
import { SignInScreen } from '@automatize/sign-in/web';

// Mobile (Expo / Metro)
import { SignInScreen } from '@automatize/sign-in';
```

## Props (`SignInScreenProps`)

| Prop              | Type         | Required | Description                                      |
| ----------------- | ------------ | -------- | ------------------------------------------------ |
| `onSuccess`       | `() => void` | yes      | Called after a successful sign-in                |
| `onResetPassword` | `() => void` | yes      | Called when the user taps "Reset password"       |
| `locale`          | `LocaleData` | yes      | Language switcher data (options + callback)      |
| `theme`           | `ThemeData`  | no       | Theme switcher data — web only, ignored natively |

### `LocaleData`

```ts
interface LocaleData {
  languages: LanguageOption[]; // list of selectable languages
  currentLanguage: string; // active BCP-47 code
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
| `@automatize/auth`              | `useAuth()` hook + `loginSchema` validation       |
| `@automatize/core-localization` | `LocaleData` / `LanguageOption` type contracts    |
| `@automatize/core-theme`        | `ThemeData` / `ThemeOption` type contracts        |
| `@automatize/ui`                | UI primitives (Button, Input, FormField, etc.)    |
| `react-i18next`                 | `useTranslation()` — peer dep, initialized by app |

**No auth implementation** lives here. The screen relies on the `AuthProvider` from `@automatize/supabase-auth` being mounted above it in the tree.

**No i18n initialization** lives here. The app must call `initLocalization` before mounting this screen.

## Package entries

| Import path               | Resolves to              |
| ------------------------- | ------------------------ |
| `@automatize/sign-in`     | `dist/index.js` (native) |
| `@automatize/sign-in/web` | `dist/web.js` (web)      |

## Development

```sh
# Build
pnpm --filter @automatize/sign-in build

# Watch
pnpm --filter @automatize/sign-in dev

# Test
pnpm --filter @automatize/sign-in test

# Typecheck
pnpm --filter @automatize/sign-in typecheck
```
