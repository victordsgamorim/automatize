# @automatize/content

Cross-platform home layout screen for Automatize.

## What is this?

A feature package providing the home screen layout — sidebar navigation + main content area — for both web (Next.js) and mobile (Expo/React Native). It is the single source of truth for the authenticated app shell — apps never duplicate this screen.

The `HomeScreen` does **not** own tile definitions. It receives navigation items as props, making it agnostic to which tiles exist or what routes they point to. The consuming app is responsible for defining items, icons, labels, and routes.

## How it works

The package follows the `.web.tsx` / `.native.tsx` split pattern:

- **`HomeScreen.web.tsx`** — React/HTML implementation using `@automatize/ui/web` (`SidebarProvider`, `SidebarLayout`)
- **`HomeScreen.native.tsx`** — _(planned)_ React Native implementation using `@automatize/ui`
- **`HomeScreen.types.ts`** — Shared props interface used by both platforms

Apps import from the appropriate entry point:

```ts
// Web (Next.js)
import { HomeScreen } from '@automatize/content/web';

// Mobile (Expo / Metro) — when native implementation is added
import { HomeScreen } from '@automatize/content';
```

## Props (`HomeScreenProps`)

| Prop               | Type                       | Required | Description                                           |
| ------------------ | -------------------------- | -------- | ----------------------------------------------------- |
| `items`            | `HomeScreenItem[]`         | yes      | Ordered list of navigation items (tiles)              |
| `activeTile`       | `string`                   | yes      | The currently active tile id                          |
| `onNavigate`       | `(id, route) => void`      | yes      | Called when a tile is clicked                         |
| `header`           | `React.ReactNode`          | yes      | Header slot — typically a logo or brand element       |
| `profile`          | `SidebarProfileConfig`     | no       | Profile configuration for the sidebar footer          |
| `profileMenuItems` | `SidebarProfileMenuItem[]` | no       | Profile dropdown menu items (Settings, Log out, etc.) |
| `children`         | `React.ReactNode`          | yes      | Main content area (route content)                     |

### `HomeScreenItem`

```ts
interface HomeScreenItem {
  id: string; // Unique identifier for this tile
  icon: React.ReactNode; // Icon element to display
  label: string; // Display label
  route: string; // Route path to navigate to when clicked
  group?: string; // Optional group label for sidebar grouping
}
```

## Usage

```tsx
// apps/web/app/(app)/layout.tsx
import { HomeScreen } from '@automatize/content/web';
import type { HomeScreenItem } from '@automatize/content/web';
import { SidebarLogo } from '@automatize/ui/web';
import { LayoutDashboard, FileText } from 'lucide-react';

const ITEMS: HomeScreenItem[] = [
  {
    id: 'dashboard',
    icon: <LayoutDashboard className="size-5" />,
    label: 'Dashboard',
    route: '/',
    group: 'Menu',
  },
  {
    id: 'invoices',
    icon: <FileText className="size-5" />,
    label: 'Invoices',
    route: '/invoices',
    group: 'Menu',
  },
];

export default function AppLayout({ children }) {
  return (
    <HomeScreen
      items={ITEMS}
      activeTile="dashboard"
      onNavigate={(_id, route) => router.push(route)}
      header={<SidebarLogo />}
    >
      {children}
    </HomeScreen>
  );
}
```

## Dependencies

| Package          | Role                                               |
| ---------------- | -------------------------------------------------- |
| `@automatize/ui` | UI primitives (`SidebarProvider`, `SidebarLayout`) |

**No navigation** lives here. The app passes `onNavigate` and handles routing.

**No localization** lives here. The app translates labels before passing items.

**No theming** lives here. Theme is handled at the app root level.

## Package entries

| Import path               | Resolves to              |
| ------------------------- | ------------------------ |
| `@automatize/content`     | `dist/index.js` (native) |
| `@automatize/content/web` | `dist/web.js` (web)      |

## Development

```sh
# Build
pnpm --filter @automatize/content build

# Watch
pnpm --filter @automatize/content dev

# Test
pnpm --filter @automatize/content test

# Typecheck
pnpm --filter @automatize/content typecheck
```
