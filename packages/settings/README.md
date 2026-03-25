# @automatize/settings

Cross-platform settings screen for Automatize.

## What is this?

A feature package providing the settings screen for both web (Next.js) and mobile (Expo/React Native). It is the single source of truth for the settings UI — apps never duplicate this screen.

## How it works

The package follows the `.web.tsx` / `.native.tsx` split pattern:

- **`SettingsScreen.web.tsx`** — React/HTML implementation using `@automatize/ui/web` (Radix UI + Tailwind)
- **`SettingsScreen.native.tsx`** — React Native implementation using `@automatize/ui` (StyleSheet)

The screen is **fully presentational** — it receives all translated strings via a `labels` prop and never calls `useTranslation()` internally. The parent app is responsible for localization, theme wiring, and sign-out logic.

Apps import from the appropriate entry point:

```ts
// Web (Next.js)
import { SettingsScreen } from '@automatize/settings/web';

// Mobile (Expo / Metro)
import { SettingsScreen } from '@automatize/settings';
```

## Props (`SettingsScreenProps`)

| Prop         | Type             | Required | Description                                      |
| ------------ | ---------------- | -------- | ------------------------------------------------ |
| `labels`     | `SettingsLabels` | yes      | All translated UI strings                        |
| `locale`     | `LocaleData`     | yes      | Language switcher data (options + callback)      |
| `theme`      | `ThemeData`      | no       | Theme switcher data — web only, ignored natively |
| `appVersion` | `string`         | yes      | App version string displayed in the About row    |

### `SettingsLabels`

```ts
interface SettingsLabels {
  title: string;
  subtitle: string;
  appearanceTitle: string;
  appearanceDescription: string;
  themeLabel: string;
  languageTitle: string;
  languageDescription: string;
  languageLabel: string;
  aboutTitle: string;
  versionLabel: string;
}
```

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

| Package                         | Role                                            |
| ------------------------------- | ----------------------------------------------- |
| `@automatize/ui`                | UI primitives (ThemeSwitcher, LanguageSwitcher) |
| `@automatize/core-localization` | `LocaleData` / `LanguageOption` type contracts  |
| `@automatize/core-theme`        | `ThemeData` / `ThemeOption` type contracts      |

**No localization** lives here. The app passes all translated strings via the `labels` prop.

**No theme logic** lives here. The app passes theme state via the `theme` prop.

## Package entries

| Import path                | Resolves to              |
| -------------------------- | ------------------------ |
| `@automatize/settings`     | `dist/index.js` (native) |
| `@automatize/settings/web` | `dist/web.js` (web)      |

## Development

```sh
# Build
pnpm --filter @automatize/settings build

# Watch
pnpm --filter @automatize/settings dev

# Test
pnpm --filter @automatize/settings test

# Typecheck
pnpm --filter @automatize/settings typecheck
```
