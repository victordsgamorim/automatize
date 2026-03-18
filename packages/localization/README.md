# @automatize/localization

Internationalization (i18n) infrastructure for the Automatize invoicing system.

---

## What is this?

A standalone, cross-platform localization package that provides everything needed to translate the Automatize app into multiple languages. It wraps `i18next` and `react-i18next` behind a clean, application-facing API so that no app or feature package ever depends on i18next directly.

The package is built around an **adapter pattern**: the source of translations (local files, remote server, or any future mechanism) is always injected from the outside. The app itself never knows — or cares — where translations come from.

---

## Purpose

- Provide a single source of truth for all translated strings in the monorepo
- Decouple the app from the translation infrastructure so Phase 2 (remote translations) requires zero changes to app code
- Enforce a consistent i18n setup across web, mobile (iOS/Android), and Windows desktop
- Operate fully offline — translations bundled locally are always available with no network dependency

---

## Supported languages

| Code    | Language             |
| ------- | -------------------- |
| `en`    | English (fallback)   |
| `pt-BR` | Brazilian Portuguese |

If a key is missing in any language, i18next automatically falls back to the `en` value. New languages can be added by creating a new locale folder and registering it in the loader — no changes to the provider or app code are required.

---

## Supported namespaces

| Namespace | Purpose                                                                  |
| --------- | ------------------------------------------------------------------------ |
| `common`  | Shared strings used across all features (app shell, navigation, actions) |

Additional namespaces can be added as the app grows to enable code-splitting of translations per domain.

---

## Architecture

### The adapter pattern

The core design principle is that `LocalizationProvider` does not know where translations come from. It only knows _how_ to initialize i18next using a `TranslationLoader` — an interface with a single `load(language, namespace)` method.

This means:

- **Phase 1** ships `createLocalLoader()`, which reads bundled JSON files. Works offline, zero latency, no network calls.
- **Phase 2** will ship `createRemoteLoader(url)`, which fetches JSON from a remote server. The app integration point stays identical — only the loader passed to the provider changes.

### Translation flow

1. The app wraps its root with `LocalizationProvider`, passing a loader and a default language.
2. On mount, the provider creates an isolated i18next instance and calls the loader to fetch the initial translations.
3. Once initialized, the provider renders its children and all nested components can call `useTranslation()` to access translated strings.
4. Until initialization is complete, the provider renders nothing — preventing any flash of untranslated content.

### Isolation

The provider creates an **isolated i18next instance** (not the global singleton). This prevents conflicts between tests, multiple providers, or potential future multi-tenant scenarios.

---

## Directory structure

```
packages/localization/
  src/
    loaders/
      types.ts             — TranslationLoader interface + SupportedLanguage / SupportedNamespace types
      LocalLoader.ts       — Phase 1 implementation: loads bundled JSON files
    locales/
      en/
        common.json        — English translation strings
      pt-BR/
        common.json        — Brazilian Portuguese translation strings
    LocalizationProvider.tsx  — React provider: initializes i18next, renders children
    index.ts               — Public API barrel (the only import path consumers should use)
  __tests__/
    LocalLoader.test.ts
    LocalizationProvider.test.tsx
  package.json
  tsconfig.json
  .eslintrc.js
  tsup.config.ts
  vitest.config.ts
```

---

## Public API

Everything the rest of the app needs is exported from the package root (`@automatize/localization`):

| Export                 | Kind             | Description                                                                   |
| ---------------------- | ---------------- | ----------------------------------------------------------------------------- |
| `LocalizationProvider` | Component        | Wraps the app root; accepts a loader and default language                     |
| `createLocalLoader`    | Factory function | Returns a loader backed by bundled JSON files                                 |
| `useTranslation`       | Hook (re-export) | Re-export of `react-i18next`'s `useTranslation` — use this in every component |
| `TranslationLoader`    | Type             | The interface contract for loaders (used to implement Phase 2)                |
| `SupportedLanguage`    | Type             | Union of all valid language codes (`'en' \| 'pt-BR'`)                         |
| `SupportedNamespace`   | Type             | Union of all valid namespace keys (`'common'`)                                |

---

## Prerequisites

Before integrating this package into an app, ensure the following:

- The app is registered as a workspace member in `pnpm-workspace.yaml`
- The app's `package.json` uses React 18 or 19 (both are supported as peer dependencies)
- `@automatize/localization` is listed as a dependency in the app's `package.json`
- `pnpm install` has been run after adding the dependency

---

## How to integrate — step by step

### Step 1 — Add the dependency

In the app's `package.json` (e.g., `apps/web/package.json` or `apps/mobile/package.json`), add `@automatize/localization` to the `dependencies` section using the workspace protocol.

### Step 2 — Run install

From the monorepo root, run `pnpm install` to resolve the new dependency across the workspace.

### Step 3 — Wrap the app root

Find the root component of the app — typically the layout entry point on web, or the root `_layout` file on mobile. Import `LocalizationProvider` and `createLocalLoader` from `@automatize/localization`, and wrap the entire component tree with the provider.

Pass `createLocalLoader()` as the `loader` prop. Optionally specify a `defaultLanguage` — it defaults to `'en'` if omitted.

### Step 4 — Use translations in components

In any component that needs translated text, import `useTranslation` from `@automatize/localization` (not directly from `react-i18next`). Call `useTranslation()` inside the component and use the `t` function to retrieve strings by key.

Translation keys follow a flat dot-notation format matching the structure in `common.json` (e.g., `app.title`, `nav.invoices`).

### Step 5 — Add new translation keys

When a component needs a string that doesn't exist yet:

1. Add the key and its English value to `src/locales/en/common.json`
2. Add the same key with its Portuguese value to `src/locales/pt-BR/common.json`
3. Both files must always have identical keys — missing keys will fall back to English at runtime, but keeping them in sync is required

### Step 6 — Verify

Run the app locally and confirm:

- The app renders without errors
- Translated strings appear correctly in English
- Switching to `pt-BR` (by changing `defaultLanguage`) shows Portuguese strings
- The app still works without a network connection (offline validation)

---

## Adding a new language

1. Create a new folder under `src/locales/` using the BCP 47 language code (e.g., `es` for Spanish)
2. Copy `en/common.json` into the new folder and translate all values
3. Add the new code to the `SupportedLanguage` type in `src/loaders/types.ts`
4. Register the new locale in `src/loaders/LocalLoader.ts`
5. Pass the new language code as `defaultLanguage` in the provider (or implement a language switcher)

---

## Adding a new namespace

1. Create a new JSON file in `src/locales/en/<namespace>.json` and `src/locales/pt-BR/<namespace>.json`
2. Add the new namespace name to the `SupportedNamespace` type in `src/loaders/types.ts`
3. Register it in the `LOCALES` map in `src/loaders/LocalLoader.ts`
4. Pass the namespace to `useTranslation('myNamespace')` in components that need it

---

## Phase 2 — Remote translations

Phase 2 is **not implemented yet** but the contract is ready. When remote translations are needed:

1. Create a `createRemoteLoader(url)` factory in a new file (e.g., `src/loaders/RemoteLoader.ts`)
2. Implement the `TranslationLoader` interface — the `load` method fetches JSON from the remote URL using `ky`
3. In the app, swap `createLocalLoader()` for `createRemoteLoader(remoteUrl)` in the provider

No changes to `LocalizationProvider`, `useTranslation` usage, or translation keys are required.

---

## Testing

The package includes unit tests covering:

- `LocalLoader` — correct translations for `en` and `pt-BR`, graceful handling of unsupported languages, key parity between locales
- `LocalizationProvider` — renders children after initialization, correct language resolution, graceful fallback when the loader fails, no flash of untranslated content on first render

Run tests from the package directory or from the monorepo root:

```
pnpm --filter @automatize/localization test
```

For coverage:

```
pnpm --filter @automatize/localization test --coverage
```

---

## Integration with Automatize architecture

This package follows Automatize's core architectural principles:

- **Zero internal dependencies** — imports nothing from other `@automatize/*` packages, keeping it fully decoupled and reusable across any future product
- **Offline-first** — Phase 1 translations are bundled locally and work without a network connection
- **Cross-platform** — uses no DOM-specific APIs; works identically on web, React Native (iOS/Android), and Windows Desktop
- **Adapter pattern** — the translation source is injected, not hardcoded, enabling Phase 2 with zero app-level changes
- **Single source of truth** — all translated strings live in this package; no app or feature package defines its own translation files
