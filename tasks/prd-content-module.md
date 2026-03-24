# PRD: Content Module (`@automatize/content`)

## Introduction

The sidebar navigation logic — tile definitions, icons, Logo component, and content placeholders — currently lives inside `apps/web/app/(app)/navigation.tsx`. This couples content concerns with platform-specific routing and providers. This PRD covers:

1. **New UI components in `packages/ui`**: `ContentNavigation` and `ContentPlaceholder` — pure UI components following the existing component pattern
2. **New `packages/content`** (`@automatize/content`): owns tile metadata (IDs, labels, routes, ordering) and re-exports UI components for convenience

After this change, `apps/web` only handles root-level concerns (theme, localization, navigation routing, auth) and wires them to the content module.

## Goals

- Add `ContentNavigation` and `ContentPlaceholder` UI components to `packages/ui`
- Create `packages/content` to own tile definitions and provide a unified import surface
- Simplify `apps/web/app/(app)/navigation.tsx` to a thin wiring layer
- Keep `lucide-react` usage centralized through `packages/ui` (already in catalog)
- Web-only for now, folder structure ready for `.native.tsx`

## User Stories

### US-001: Add ContentNavigation UI component to packages/ui

**Description:** As a developer, I need a `ContentNavigation` component in the design system that composes `SidebarLayout` with configurable tiles.

**Acceptance Criteria:**

- [ ] `packages/ui/src/components/ContentNavigation/ContentNavigation.web.tsx` created
- [ ] Component renders `SidebarLayout` from the same package (internal import)
- [ ] Props: `onNavigate(tileId, route)`, `activeTile`, `items` (tile config array), `profile`, `profileMenuItems`, `header` (ReactNode for logo)
- [ ] Component maps `items` to `SidebarNavItem[]` and computes `activeIndex`
- [ ] Component does NOT import any router, i18n, or theme logic
- [ ] Exported from `packages/ui/src/web.ts`
- [ ] `lucide-react` icons used from `packages/ui`'s existing catalog dependency — no new dep added
- [ ] Typecheck passes

### US-002: Add ContentPlaceholder UI component to packages/ui

**Description:** As a developer, I need a simple placeholder component in the design system for content areas without real implementation yet.

**Acceptance Criteria:**

- [ ] `packages/ui/src/components/ContentPlaceholder/ContentPlaceholder.web.tsx` created
- [ ] Props: `title` (string), `subtitle` (string, defaults to "Coming soon")
- [ ] Centered layout with heading + muted subtitle text
- [ ] Exported from `packages/ui/src/web.ts`
- [ ] Typecheck passes

### US-003: Create content package scaffold

**Description:** As a developer, I need the `packages/content` package to own tile metadata and provide a convenient import surface.

**Acceptance Criteria:**

- [ ] `packages/content/package.json` created following `@automatize/sign-in` pattern (dual exports `.` + `./web`, catalog deps)
- [ ] Dependencies: `@automatize/ui: workspace:*` — no direct `lucide-react` dep (comes transitively from UI)
- [ ] `packages/content/tsconfig.json` extends `../../tools/tsconfig/base.json`
- [ ] `packages/content/.eslintrc.js` extends `../../tools/eslint-config/base.js`
- [ ] `packages/content/tsup.config.ts` builds `src/index.ts` + `src/web.ts` with `"use client"` banner
- [ ] `packages/content` added to `pnpm-workspace.yaml`
- [ ] `@automatize/content` added as dependency in `apps/web/package.json`
- [ ] `pnpm install` resolves successfully
- [ ] `pnpm --filter @automatize/content build` succeeds
- [ ] Typecheck passes

### US-004: Define tile metadata in content module

**Description:** As a developer, I need platform-agnostic tile definitions owned by the content module.

**Acceptance Criteria:**

- [ ] `packages/content/src/tiles.ts` defines `TileId` type: `'dashboard' | 'invoices' | 'products' | 'clients'`
- [ ] `TILE_ROUTES` maps each `TileId` to its route path (`/`, `/invoices`, `/products`, `/clients`)
- [ ] `TILE_ORDER` defines display order as an ordered `TileId[]` array
- [ ] `TILE_LABELS` maps each `TileId` to its display label string
- [ ] `TILE_GROUP` constant set to `'Menu'`
- [ ] File has zero React/JSX dependencies (platform-agnostic)
- [ ] All constants and types exported from `src/web.ts`

### US-005: Wire content module exports

**Description:** As a developer, I need `packages/content` to re-export UI components and tile data for convenient consumption.

**Acceptance Criteria:**

- [ ] `src/web.ts` re-exports `ContentNavigation` and `ContentPlaceholder` from `@automatize/ui/web`
- [ ] `src/web.ts` exports all tile constants and types from `./tiles`
- [ ] `src/index.ts` re-exports from `./web` (web-only for now)
- [ ] Consumers can do `import { ContentNavigation, TILE_ROUTES, TileId } from '@automatize/content/web'`

### US-006: Refactor apps/web navigation to consume content module

**Description:** As a developer, I need `apps/web/app/(app)/navigation.tsx` to use `ContentNavigation` from `@automatize/content/web` instead of defining tiles inline.

**Acceptance Criteria:**

- [ ] `navigation.tsx` imports `ContentNavigation`, `TILE_ROUTES`, `TILE_ORDER`, `TILE_LABELS`, `TILE_GROUP` from `@automatize/content/web`
- [ ] No more tile icon imports (LayoutDashboard, FileText, Package, Users) — icons owned by UI
- [ ] No more inline `Logo` component — moved to content module or UI
- [ ] No more `ROUTE_INDEX_MAP` — replaced by `TileId`-based active tile detection
- [ ] `onNavigate` callback calls `router.push(route)`
- [ ] `activeTile` derived from `usePathname()` via reverse route-to-tile mapping
- [ ] Profile config and profile menu items remain in `navigation.tsx` (app-level concern)
- [ ] Sidebar behavior unchanged: same items, same order, same active highlighting, same profile dropdown
- [ ] Typecheck and lint pass
- [ ] **Verify in browser using dev-browser skill** — sidebar renders identically to before

### US-007: Create placeholder route pages

**Description:** As a developer, I need placeholder pages for Invoices, Products, and Clients routes so sidebar navigation works end-to-end.

**Acceptance Criteria:**

- [ ] `apps/web/app/(app)/invoices/page.tsx` renders `ContentPlaceholder` with appropriate title
- [ ] `apps/web/app/(app)/products/page.tsx` renders `ContentPlaceholder` with appropriate title
- [ ] `apps/web/app/(app)/clients/page.tsx` renders `ContentPlaceholder` with appropriate title
- [ ] Each page imports from `@automatize/content/web`
- [ ] Clicking sidebar tiles navigates to the correct page and shows the placeholder
- [ ] **Verify in browser using dev-browser skill**

## Functional Requirements

- FR-1: `ContentNavigation` and `ContentPlaceholder` UI components MUST live in `packages/ui/src/components/`
- FR-2: `packages/content` MUST own tile metadata (IDs, labels, routes, icons, ordering) — no UI component definitions
- FR-3: `packages/content` MUST NOT have `lucide-react` as a direct dependency — icons come from `packages/ui`
- FR-4: `packages/content` re-exports UI components from `@automatize/ui/web` for convenient consumption
- FR-5: `ContentNavigation` MUST receive `onNavigate` callback — it never navigates directly
- FR-6: `ContentNavigation` MUST receive `activeTile` — it never reads the URL directly
- FR-7: `ContentNavigation` MUST receive `profile` and `profileMenuItems` — user data stays in the app layer
- FR-8: After refactoring, sidebar appearance and behavior MUST be identical to current implementation

## Non-Goals

- No native (`.native.tsx`) implementations in this iteration
- No real content screens for Invoices, Products, or Clients (just text placeholders)
- No localization of tile labels (plain strings; i18n integration is a future task)
- No tests in this iteration (scaffolding only)
- No changes to existing `packages/ui` sidebar primitives (`SidebarLayout`, `SidebarNav`, etc.)

## Technical Considerations

- **`lucide-react` centralization:** Already in `packages/ui`'s deps via `catalog:` (`^0.487.0`). `ContentNavigation.web.tsx` in `packages/ui` imports icons directly. `packages/content` does NOT list `lucide-react` — it gets it transitively.
- **Component folder pattern:** Per CLAUDE.md §24.3, components use `ComponentName/ComponentName.web.tsx` folder structure
- **`useSidebar` context:** `ContentNavigation` must render inside `SidebarProvider` (already provided by `apps/web/(app)/layout.tsx`)
- **Package pattern:** `packages/content` follows `@automatize/sign-in` for `package.json`, `tsup.config.ts`, exports structure

### Key Files

| File                                                                       | Action                                     |
| -------------------------------------------------------------------------- | ------------------------------------------ |
| `packages/ui/src/components/ContentNavigation/ContentNavigation.web.tsx`   | Create                                     |
| `packages/ui/src/components/ContentPlaceholder/ContentPlaceholder.web.tsx` | Create                                     |
| `packages/ui/src/web.ts`                                                   | Edit — add exports                         |
| `packages/content/package.json`                                            | Create                                     |
| `packages/content/tsconfig.json`                                           | Create                                     |
| `packages/content/.eslintrc.js`                                            | Create                                     |
| `packages/content/tsup.config.ts`                                          | Create                                     |
| `packages/content/src/tiles.ts`                                            | Create                                     |
| `packages/content/src/web.ts`                                              | Create                                     |
| `packages/content/src/index.ts`                                            | Create                                     |
| `pnpm-workspace.yaml`                                                      | Edit — add `packages/content`              |
| `apps/web/package.json`                                                    | Edit — add `@automatize/content` dep       |
| `apps/web/app/(app)/navigation.tsx`                                        | Edit — refactor to use `ContentNavigation` |
| `apps/web/app/(app)/invoices/page.tsx`                                     | Create                                     |
| `apps/web/app/(app)/products/page.tsx`                                     | Create                                     |
| `apps/web/app/(app)/clients/page.tsx`                                      | Create                                     |

## Success Metrics

- `apps/web/app/(app)/navigation.tsx` reduced from ~130 lines to ~60 lines
- Zero tile/icon/Logo definitions remain in `apps/web`
- No `lucide-react` dependency in `packages/content`
- Sidebar renders and behaves identically in the browser
- `pnpm typecheck`, `pnpm lint`, and builds all pass

## Open Questions

- Should tile labels eventually come from localization keys (e.g., `t('tiles.dashboard')`)? For now they are plain strings.
- Should the profile config (name, email, avatar) eventually move to a user/auth module instead of staying inline in `navigation.tsx`?
