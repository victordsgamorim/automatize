# @automatize/core-theme

Platform-agnostic theme type contracts for Automatize.

## What is this?

A minimal types-only package defining the **theme boundary** between the app layer and UI feature packages. It exports the data-shape that apps must provide and that UI components consume — no theme library dependency, no runtime logic.

## Why this exists

Feature packages like `@automatize/sign-in` need to render a theme switcher on web, but they must not depend on any app-specific theme provider or CSS-in-JS library. This package defines the agreed-upon data shape:

- Apps read from their theme provider and compose a `ThemeData` object
- Feature packages accept `ThemeData` as an optional prop — they stay provider-agnostic

## Exports

```ts
import type {
  ThemeOption, // A single selectable theme
  ThemeData, // The full theme data object passed as a prop
} from '@automatize/core-theme';
```

### `ThemeOption`

```ts
interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  label: string; // Display name, e.g. "Light", "Dark", "System"
}
```

### `ThemeData`

```ts
interface ThemeData {
  currentTheme: 'light' | 'dark' | 'system'; // User's active preference
  isDarkTheme: boolean; // Resolved dark state (controls icons)
  themeOptions: ThemeOption[]; // All selectable options
  onThemeChange: (preference: 'light' | 'dark' | 'system') => void;
}
```

## Usage pattern

```tsx
// Web app — composes ThemeData from its theme provider
import { useThemePreference } from '../theme-provider';
import type { ThemeData } from '@automatize/core-theme';

const { preference, isDark, setPreference } = useThemePreference();
const theme: ThemeData = {
  currentTheme: preference,
  isDarkTheme: isDark,
  themeOptions: [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ],
  onThemeChange: setPreference,
};

<SignInScreen theme={theme} ... />
```

The `theme` prop is **web-only** — `SignInScreen.native.tsx` ignores it and reads the system color scheme directly via `useColorScheme()`.

## Rules

- Types only — no runtime code, no dependencies, no tests required
- MUST NOT import from any CSS-in-JS library, theme provider, or app layer
- MUST NOT import from any app (`apps/*`) or feature package
