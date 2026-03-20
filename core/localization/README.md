# @automatize/core-localization

Platform-agnostic localization type contracts for Automatize.

## What is this?

A minimal types-only package defining the **localization boundary** between the app layer and UI feature packages. It exports the data-shape that apps must provide and that UI components consume — no i18n library dependency, no runtime logic.

## Why this exists

Feature packages like `@automatize/sign-in` need to render a language switcher, but they must not depend on `i18next`, `react-i18next`, or any app-specific initialization. This package defines the agreed-upon data shape:

- Apps read from their i18n provider and compose a `LocaleData` object
- Feature packages accept `LocaleData` as a prop — they stay library-agnostic

## Exports

```ts
import type {
  LanguageOption, // A single selectable language
  LocaleData, // The full locale data object passed as a prop
} from '@automatize/core-localization';
```

### `LanguageOption`

```ts
interface LanguageOption {
  code: string; // BCP-47 language code, e.g. "en" or "pt-BR"
  label: string; // Full display name, e.g. "English"
  ext?: string; // Short trigger label, e.g. "US" or "BR"
}
```

### `LocaleData`

```ts
interface LocaleData {
  languages: LanguageOption[]; // All selectable options
  currentLanguage: string; // Active BCP-47 code
  onLanguageChange: (code: string) => void; // Called on selection
}
```

## Usage pattern

```tsx
// App layer — composes LocaleData from its i18n provider
import { useTranslation } from 'react-i18next';
import type { LocaleData } from '@automatize/core-localization';

const { i18n } = useTranslation();
const locale: LocaleData = {
  languages: [
    { code: 'en', label: 'English', ext: 'US' },
    { code: 'pt-BR', label: 'Português', ext: 'BR' },
  ],
  currentLanguage: i18n.language,
  onLanguageChange: (code) => i18n.changeLanguage(code),
};

<SignInScreen locale={locale} ... />
```

## Rules

- Types only — no runtime code, no dependencies, no tests required
- MUST NOT import from `@automatize/localization` or any i18n library
- MUST NOT import from any app (`apps/*`) or feature package
