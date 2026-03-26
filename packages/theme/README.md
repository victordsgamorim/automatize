# @automatize/theme

Cross-platform theme management for the Automatize invoicing system.

---

## What is this?

A standalone, cross-platform theme package that provides everything needed to manage light/dark mode across all Automatize platforms (web, iOS, Android, Windows Desktop). It wraps platform-specific APIs behind a clean, application-facing API so that no app ever depends on `localStorage`, `matchMedia`, `Appearance`, or `AsyncStorage` directly.

The package is built around the same **singleton + adapter pattern** used by `@automatize/localization`: the persistence mechanism is injected from the outside, and the React provider bridges singleton state to the component tree.

---

## Purpose

- Provide a single source of truth for theme preference and resolved theme across the monorepo
- Decouple the app from platform-specific storage and OS detection APIs
- Prevent flash-of-wrong-theme on page load (web) via an inline anti-flash script
- Prevent SSR hydration mismatches by using deterministic defaults on the first render
- Expose semantic color tokens from `@automatize/ui/tokens` so native consumers can read them directly

---

## Supported themes

| Preference | Resolved to                              |
| ---------- | ---------------------------------------- |
| `light`    | Always light                             |
| `dark`     | Always dark                              |
| `system`   | Defers to OS setting (default behaviour) |

The user's preference is persisted via a platform-specific storage adapter. If no preference has been stored, the default is `system`.

---

## Architecture

### Singleton + eager initialization

The package uses a **module-level singleton**. `initTheme(config)` must be called once at the app entry point — at module level, before the React tree mounts. This eagerly reads the stored preference from the storage adapter so the value is available by the time `ThemeProvider` renders.

Calling `initTheme()` more than once is safe — subsequent calls are no-ops.

### Storage adapters

The persistence layer is abstracted behind a `ThemeStorageAdapter` interface with two methods: `get()` and `set()`. Two implementations are provided:

- **Web** (`createWebStorageAdapter`) — reads/writes `localStorage` with key `theme-preference`. Validates stored values and gracefully handles unavailability (e.g., private browsing).
- **Native** (`createNativeStorageAdapter`) — reads/writes `@react-native-async-storage/async-storage`. Same validation and error handling.

Custom adapters can be created by implementing the `ThemeStorageAdapter` interface.

### SSR hydration safety

On the web (Next.js), the server has no access to `localStorage` or `matchMedia`. To prevent hydration mismatches, the `ThemeProvider` always starts with deterministic defaults:

- `preference`: `'system'`
- `resolvedTheme`: `'light'`

After hydration, a `useEffect` reads the real preference from the singleton and updates the state. The anti-flash script (see below) ensures the user never sees the wrong theme visually, even during this brief window.

### Anti-flash script

The package exports `THEME_ANTI_FLASH_SCRIPT` — an inline JavaScript snippet that must be placed in the `<head>` of the HTML document (via `dangerouslySetInnerHTML`). It runs before React hydrates and:

1. Reads the same `localStorage` key used by `createWebStorageAdapter()`
2. Resolves the stored preference against the OS colour scheme
3. Adds the `dark` class to `<html>` if needed

This prevents any visual flash of the wrong theme between page load and React hydration.

### Platform effects

When the resolved theme changes, a platform-specific effect is applied:

- **Web** — toggles the `dark` class on `<html>` (for Tailwind CSS dark mode)
- **Native** — no-op; native components read colours directly from the `useTheme()` context

### OS colour scheme detection

Platform-specific hooks listen for OS theme changes:

- **Web** — `matchMedia('(prefers-color-scheme: dark)')` with a change listener. Initialises with `'light'` to match the server default, then reads the real value in `useEffect`.
- **Native** — `Appearance.getColorScheme()` with `Appearance.addChangeListener()`.

When the OS theme changes and the user's preference is `system`, the resolved theme updates automatically.

---

## Directory structure

```
packages/theme/
  src/
    singleton.ts                   — Module-level singleton: initTheme, sync/async state access
    ThemeProvider.tsx               — React context provider: bridges singleton to component tree
    useTheme.ts                    — useTheme hook: reads context, throws if used outside provider
    useSystemColorScheme.web.ts    — OS theme listener (web, hydration-safe)
    useSystemColorScheme.native.ts — OS theme listener (React Native)
    anti-flash-script.ts           — Inline script to prevent flash-of-wrong-theme (web only)
    types.ts                       — All type definitions
    storage/
      web.ts                       — localStorage adapter
      native.ts                    — AsyncStorage adapter (React Native)
    effects/
      web.ts                       — Toggles `dark` class on <html>
      native.ts                    — No-op (native uses context colours)
    index.ts                       — Public API barrel
  __tests__/
    setup.ts
    singleton.test.ts
    storage-web.test.ts
    ThemeProvider.test.tsx
    useTheme.test.tsx
  package.json
  tsconfig.json
  tsup.config.ts
  vitest.config.ts
  .eslintrc.js
```

---

## Public API

Everything the rest of the app needs is exported from `@automatize/theme`:

| Export                       | Kind             | Description                                                          |
| ---------------------------- | ---------------- | -------------------------------------------------------------------- |
| `initTheme`                  | Function         | Call once at module level before React mounts; starts theme loading  |
| `ThemeProvider`              | Component        | Wraps the app root; provides theme context to all descendants        |
| `useTheme`                   | Hook             | Returns the full theme context (preference, resolved theme, colours) |
| `createWebStorageAdapter`    | Factory function | Returns a localStorage-backed adapter (web)                          |
| `createNativeStorageAdapter` | Factory function | Returns an AsyncStorage-backed adapter (React Native)                |
| `THEME_ANTI_FLASH_SCRIPT`    | String constant  | Inline JS to inject in `<head>` to prevent flash-of-wrong-theme      |
| `_resetTheme`                | Function         | Internal — resets singleton state for test isolation                 |
| `Theme`                      | Type             | `'light' \| 'dark'`                                                  |
| `ThemePreference`            | Type             | `'light' \| 'dark' \| 'system'`                                      |
| `ThemeStorageAdapter`        | Type             | Interface for custom storage adapters                                |
| `ThemeConfig`                | Type             | Configuration object for `initTheme()`                               |
| `ThemeContextValue`          | Type             | Full shape of the context returned by `useTheme()`                   |

---

## Prerequisites

Before integrating this package into an app, ensure the following:

- The app is registered as a workspace member in `pnpm-workspace.yaml`
- The app's `package.json` uses React 18 or 19 (both are supported as peer dependencies)
- `@automatize/theme` is listed as a dependency in the app's `package.json`
- `@automatize/ui` is available (peer dependency — provides semantic colour tokens)
- `pnpm install` has been run after adding the dependency

---

## How to integrate — step by step

### Step 1 — Add the dependency

In the app's `package.json`, add `@automatize/theme` to the `dependencies` section using the workspace protocol.

### Step 2 — Run install

From the monorepo root, run `pnpm install` to resolve the new dependency across the workspace.

### Step 3 — Create a theme wrapper (web example)

Create a client wrapper component (e.g., `theme-provider.tsx`). In this file:

1. Import `ThemeProvider`, `initTheme`, and `createWebStorageAdapter` from `@automatize/theme`.
2. Call `initTheme({ storageAdapter: createWebStorageAdapter() })` **at module level** — outside any component, before the React tree mounts.
3. Export a wrapper component that renders `<ThemeProvider>{children}</ThemeProvider>`.

### Step 4 — Add the anti-flash script (web only)

In your root layout (e.g., `layout.tsx`), import `THEME_ANTI_FLASH_SCRIPT` from `@automatize/theme` and inject it in the `<head>`:

Place it as a `<script dangerouslySetInnerHTML={{ __html: THEME_ANTI_FLASH_SCRIPT }} />` inside `<head>`.

Also add `suppressHydrationWarning` to the `<html>` tag — this is necessary because the anti-flash script may modify the `<html>` element's class before React hydrates.

### Step 5 — Create a theme wrapper (mobile example)

For React Native, use `createNativeStorageAdapter()` instead of `createWebStorageAdapter()`. The rest of the pattern is identical. No anti-flash script is needed on native.

### Step 6 — Use the theme in components

In any component that needs theme information, import `useTheme` from `@automatize/theme`. The hook returns:

- `preference` — the user's stored preference (`'light'`, `'dark'`, or `'system'`)
- `resolvedTheme` — the actual resolved theme (`'light'` or `'dark'`)
- `isDark` / `isLight` — convenience booleans
- `setTheme(pref)` — updates the preference and persists it
- `toggleTheme()` — toggles between light and dark
- `colors` — the active semantic colour set from `@automatize/ui/tokens`

### Step 7 — Verify

Run the app locally and confirm:

- The app renders without hydration errors
- The correct theme is applied on page load (no flash of wrong theme)
- Toggling themes works and persists across page reloads
- The `system` preference follows OS changes in real-time
- The app works offline

---

## Key architectural decisions

### Why a singleton instead of prop-driven configuration?

The theme must be resolved before the first render to prevent flash-of-wrong-theme. A prop-driven approach would require the React tree to mount before reading storage, causing a visible flicker. The singleton pattern allows eager initialization at module level, before React mounts.

### Why deterministic defaults instead of reading storage on first render?

On SSR (Next.js), the server cannot access `localStorage` or `matchMedia`. If the client reads storage during the first render, the HTML won't match the server-rendered output, causing a hydration mismatch. By always starting with `'system'`/`'light'` and updating in `useEffect`, server and client produce identical first-render output.

### Why an anti-flash script?

The deterministic defaults mean the server always renders the light theme. For users with a dark preference, there would be a brief flash of light theme before `useEffect` runs. The anti-flash script bridges this gap: it runs synchronously in the `<head>`, before React hydrates, and applies the correct theme class immediately.

### Why separate storage adapters?

Web uses synchronous `localStorage`; React Native uses async `AsyncStorage`. Abstracting behind a common interface allows the `ThemeProvider` and singleton to be platform-agnostic. Custom adapters (e.g., for Electron or MMKV) can be created by implementing the same interface.

---

## Testing

The package includes unit tests covering:

- `singleton` — system theme detection, preference resolution, idempotency, storage errors, sync/async state access, reset behaviour
- `storage-web` — localStorage get/set, value validation, custom keys, error handling
- `ThemeProvider` — React context integration, hydration-safe defaults, effect application, preference persistence
- `useTheme` — hook integration, error boundary when used outside provider

Run tests from the package directory or from the monorepo root:

```
pnpm --filter @automatize/theme test
```

For coverage:

```
pnpm --filter @automatize/theme test --coverage
```

---

## Integration with Automatize architecture

This package follows Automatize's core architectural principles:

- **Depends only on `@automatize/ui/tokens`** — uses semantic colour tokens for native consumers, keeping the dependency graph minimal
- **Offline-first** — theme preference is stored locally and works without a network connection
- **Cross-platform** — platform-specific code is isolated in storage adapters, effects, and OS detection hooks; the core logic is shared
- **Adapter pattern** — the persistence layer is injected, not hardcoded, enabling custom storage backends
- **SSR-safe** — deterministic first-render defaults prevent hydration mismatches on Next.js

---

**Last Updated:** 2026-03-25
