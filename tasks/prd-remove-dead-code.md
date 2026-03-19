# PRD: Remove Dead Code (Components & Screens)

## Introduction

The project is in early development with only `packages/sign-in` actively being worked on. A significant amount of scaffolded code exists for features not yet in progress: dashboard, sidebar navigation, forgot-password, register, MFA, invite, and reset-password screens. Additionally, `packages/ui/src/web/` contains ~40 shadcn/ui primitive files that are not the source of truth for components — `packages/ui/src/components/` is.

Leaving this code in place causes confusion about where components should come from and creates a false impression of completeness. This PRD defines what to remove, what to stub with TODO markers, and what to preserve.

---

## Goals

- Remove all UI components from `packages/ui/src/web/` that are not yet needed, keeping the directory as a thin re-export of `src/components/`
- Replace unbuilt screen implementations in `apps/web` and `apps/mobile` with minimal stubs carrying a TODO comment
- Delete composite components in `apps/web` that belong to unbuilt features
- Ensure `packages/sign-in` continues to work correctly after cleanup
- All typecheck, lint, and build gates pass after changes

---

## User Stories

### US-001: Slim down packages/ui/src/web/

**Description:** As a developer, I want `packages/ui/src/web/` to contain only what is currently needed so that I'm not confused about where components come from.

**Acceptance Criteria:**

- [ ] All shadcn `.tsx` files in `packages/ui/src/web/` are deleted (~40 files: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, calendar, card, carousel, chart, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip)
- [ ] `utils.ts` and `use-mobile.ts` are kept in `src/web/`
- [ ] `src/web/index.ts` is replaced with a slim re-export that only exports: `cn`, `useIsMobile`, `Button`, `buttonVariants`, `Input`, `Label`, `Checkbox`, `useToasts`, `ToastProvider`, `ToastType`
- [ ] All exports come from `src/components/` (no more importing from shadcn files directly in the index)
- [ ] `pnpm -F @automatize/ui build` passes
- [ ] `pnpm typecheck` passes

### US-002: Clean up packages/ui/src/web/composites/

**Description:** As a developer, I want unused composite components removed so only components that are actively used remain.

**Acceptance Criteria:**

- [ ] `EmptyState.tsx`, `ErrorState.tsx`, `StatsCard.tsx`, `ThemeToggle.tsx` are deleted from `src/web/composites/`
- [ ] `ThemeSwitcher.tsx` is kept (it is imported by `packages/sign-in` via `@automatize/ui/composites`)
- [ ] `ThemeSwitcher.tsx` still compiles — if it imported deleted shadcn files, those internal dependencies are resolved (either inline or replace with available components)
- [ ] `composites/index.ts` only exports `ThemeSwitcher` and its types
- [ ] `pnpm -F @automatize/sign-in build` passes

### US-003: Stub unbuilt screens in apps/web

**Description:** As a developer, I want unbuilt web screens replaced with stubs so the router doesn't crash and the intent is clearly documented.

**Acceptance Criteria:**

- [ ] `app/(auth)/forgot-password/page.tsx` replaced with stub + TODO comment
- [ ] `app/(auth)/register/page.tsx` replaced with stub + TODO comment (check if exists)
- [ ] `app/(auth)/reset-password/page.tsx` replaced with stub + TODO comment
- [ ] `app/(app)/page.tsx` (dashboard) replaced with stub + TODO comment
- [ ] `app/(app)/clients/`, `app/(app)/invoices/`, `app/(app)/products/` directories are deleted
- [ ] `app/(app)/navigation.tsx` is deleted
- [ ] Stub format: a `export default function` returning `null` with a leading `// TODO:` comment
- [ ] No TypeScript errors from removed imports (layout files that reference deleted composites must be updated)
- [ ] `pnpm typecheck` passes

### US-004: Remove dead composites in apps/web

**Description:** As a developer, I want dead composite components in apps/web removed so there are no dangling files.

**Acceptance Criteria:**

- [ ] `apps/web/components/composites/app-sidebar.tsx` is deleted
- [ ] `apps/web/components/composites/invoice-table.tsx` is deleted
- [ ] `apps/web/components/composites/bottom-nav.tsx` is deleted
- [ ] `apps/web/components/composites/status-badge.tsx` is deleted
- [ ] If `apps/web/components/composites/` is now empty, the folder is deleted too
- [ ] Any file that imported these composites is updated (remove the import, not the whole file)
- [ ] `pnpm typecheck` passes

### US-005: Stub unbuilt screens in apps/mobile

**Description:** As a developer, I want unbuilt mobile screens replaced with stubs so the router doesn't crash and intent is documented.

**Acceptance Criteria:**

- [ ] `app/(auth)/forgot-password.tsx` replaced with stub + TODO
- [ ] `app/(auth)/invite.tsx` replaced with stub + TODO
- [ ] `app/(auth)/mfa-setup.tsx` replaced with stub + TODO
- [ ] `app/(auth)/mfa-verify.tsx` replaced with stub + TODO
- [ ] `app/(auth)/register.tsx` replaced with stub + TODO
- [ ] `app/(auth)/reset-password.tsx` replaced with stub + TODO
- [ ] `app/(app)/index.tsx` replaced with stub + TODO
- [ ] `app/(app)/profile.tsx` replaced with stub + TODO
- [ ] `app/(app)/tenants.tsx` replaced with stub + TODO
- [ ] `app/(app)/_layout.tsx` and `app/(auth)/_layout.tsx` are updated if they reference removed components
- [ ] `pnpm typecheck` passes

### US-006: Verify sign-in still works end-to-end

**Description:** As a developer, I want to confirm that `packages/sign-in` is not broken by any of the above changes.

**Acceptance Criteria:**

- [ ] `pnpm -F @automatize/sign-in build` passes with no errors
- [ ] `pnpm -F @automatize/ui build` passes with no errors
- [ ] Sign-in page in `apps/web` dev server renders correctly (form visible, no console errors)
- [ ] `pnpm typecheck` passes across the whole monorepo
- [ ] `pnpm lint` passes across the whole monorepo

---

## Functional Requirements

- FR-1: Every deleted screen must be replaced with a stub file (not deleted entirely) to keep the router from producing 404s or missing-module errors
- FR-2: Stub files must include a `// TODO:` comment explaining what feature goes there and that it will be implemented in a future iteration
- FR-3: `@automatize/ui/web` export path must remain valid and continue to export `Button`, `Input`, `Label`, `Checkbox`, `useToasts`, `ToastProvider`, `cn` — these are used by `packages/sign-in`
- FR-4: `@automatize/ui/composites` export path must remain valid and export `ThemeSwitcher` — used by `packages/sign-in/src/ThemeSwitcher.web.tsx`
- FR-5: No import from `@automatize/ui/web` that is not in the new slim index may remain in the codebase (search and remove/update)
- FR-6: After all changes, running `pnpm typecheck && pnpm lint` must produce 0 errors

---

## Non-Goals

- Do NOT remove `packages/sign-in/` or any of its files
- Do NOT remove `packages/ui/src/components/` or any existing component there
- Do NOT remove `packages/ui/src/tokens/` or `src/styles/`
- Do NOT rebuild or refactor existing components — this is purely a deletion/stubbing task
- Do NOT remove `apps/web/app/(auth)/login/` or `apps/mobile/app/(auth)/login.tsx` (active screens)
- Do NOT remove `apps/web/app/(app)/layout.tsx` or `apps/mobile/app/(app)/_layout.tsx` if they are needed by the router

---

## Technical Considerations

- **ThemeSwitcher dependency chain:** `packages/sign-in/src/ThemeSwitcher.web.tsx` imports from `@automatize/ui/composites`. The `ThemeSwitcher` composite likely imports from shadcn files being deleted (e.g. `dropdown-menu.tsx`). Read `packages/ui/src/web/composites/ThemeSwitcher.tsx` before deleting shadcn files and resolve its dependencies first.
- **Import cleanup:** Deleting files without fixing their import sites will cause TypeScript errors. After each deletion batch, run `pnpm typecheck` to catch broken imports early.
- **apps/web layout files:** `app/(app)/layout.tsx` may import `navigation.tsx` or `app-sidebar.tsx`. Update before deleting.
- **apps/mobile \_layout.tsx:** Mobile layout tabs may reference screens being stubbed (e.g., tab icons for dashboard). Update the tab definitions.

---

## Success Metrics

- 0 TypeScript errors after all changes
- 0 ESLint errors after all changes
- `packages/ui` builds cleanly
- `packages/sign-in` builds cleanly
- Sign-in screen renders in both web and mobile dev environments
- No shadcn primitive files remain in `packages/ui/src/web/`

---

## Open Questions

- Does `apps/web/app/(app)/layout.tsx` need to be kept (for auth-gated routing) or can it also be stubbed? Verify before deleting its dependencies.
- Are there any other packages (besides sign-in) that import from `@automatize/ui/web` or `@automatize/ui/composites`? Run a global grep before deleting.
