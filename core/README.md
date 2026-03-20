# Core Modules Workspace

The `core/` directory acts as a logical workspace boundary for foundational, backend-agnostic contracts and utilities within the monorepo.

**Note:** `core/` is **not** a monolithic package. It is a monorepo workspace folder that allocates and organizes independent sub-modules (like `@automatize/auth` and `@automatize/utils`).

## Architectural Philosophy (The "Wirer" Pattern)

Modules inside the `core/` workspace function purely as abstract interfaces or "wirers."

They adhere strictly to the **Dependency Inversion Principle**:

1. **Core modules** provide the generic "socket" and define the precise "plug shape" (via TypeScript Interfaces, React Contexts, and strict schemas like Zod). They contain **no heavy structural logic or backend constraints**.
2. **Integration modules** (like `@automatize/supabase-auth`) handle the massive computing logic (e.g. session management, TOTP validation) and inject that data globally by satisfying the core interface requirements.
3. **UI Packages** (like `@automatize/sign-in`) strictly consume their hooks from `core/` modules and remain totally completely ignorant of the actual backend implementation.

This strict logical separation guarantees that generic frontend packages do not implicitly inherit external providers. If the project's backend stack rotates from Supabase to Firebase, your UI packages and core logic remain **entirely untouched**.

## Active Modules

- **`@automatize/auth`** (`core/auth/`): The strict authentication boundary. Exposes `useAuth()`, `AuthContext`, and `loginSchema`. No implementation — backed by `@automatize/supabase-auth`.
- **`@automatize/utils`** (`core/utils/`): Pure, platform-agnostic utility functions shared across the monorepo (`generateId`, `getCurrentTimestamp`).
- **`@automatize/core-localization`** (`core/localization/`): Types-only. Defines `LocaleData` and `LanguageOption` — the data contract between app-level i18n providers and UI feature packages.
- **`@automatize/core-theme`** (`core/theme/`): Types-only. Defines `ThemeData` and `ThemeOption` — the data contract between app-level theme providers and UI feature packages.
