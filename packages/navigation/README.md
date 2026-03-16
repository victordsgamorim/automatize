# @automatize/navigation

Cross-platform navigation logic for the Automatize invoicing system.

## What is this?

A unified navigation solution that provides platform-agnostic hooks and components for handling routing and navigation state across Web (Expo/Next.js), Mobile (Expo/React Native), and Windows Desktop (React Native Windows). It eliminates duplicated navigation logic while ensuring consistent behavior and appearance across all platforms.

## How it works

The package separates navigation concerns into two layers:

- **Logic layer**: Platform-agnostic hooks and components that handle navigation state, route parsing, and navigation actions
- **UI layer**: Thin adapters that render platform-appropriate primitives using components from `@automatize/ui`

This separation ensures that business logic never depends on platform-specific APIs, satisfying Automatize's core architectural requirement.

## Directory organization

- **src/** — Source code for the navigation module
  - **hooks/** — Platform-agnostic navigation hooks with .web/.native implementations
  - **components/** — Adaptive navigation components with platform-specific rendering
  - **utils/** — Shared navigation utilities and helpers
  - **types.ts** — Public TypeScript interfaces and type guards
  - **index.web.ts** — Web entry point (Next.js/Expo Web)
  - **index.native.ts** — Native entry point (Expo/React Native)
- \***\*tests**/\*\* — Unit tests for hooks and components

## Design decisions

### Why platform-agnostic hooks?

Navigation logic (parsing routes, managing history, triggering navigation) is fundamentally the same across platforms. By abstracting this logic into hooks like `useNavigation()` and `useRoute()`, we ensure consistent behavior while allowing each platform to implement the underlying mechanics appropriately.

### Why adaptive components instead of universal ones?

While navigation logic is universal, the optimal UI presentation differs significantly:

- Web: Horizontal navigation bars, sidebar navigators, breadcrumb trails
- Mobile: Bottom tab bars, drawer navigators, stack navigators
- Windows: Navigation rails, nav panes, tabs, menubar

The `NavigationLink`, `NavigationMenu`, and `Breadcrumb` components adapt their rendering to follow each platform's established patterns while maintaining a consistent API for consumers.

### How platform extension works

Following Automatize's established pattern, platform-specific implementations use file extensions:

- `NavigationLink.web.tsx` — Web implementation using Next.js Link
- `NavigationLink.native.tsx` — Native implementation using Expo Router Link
- `NavigationLink.windows.ts` — Windows-specific implementation (if needed)

The bundler automatically selects the correct file based on the target platform, ensuring consumers only see the unified interface.

### Design system integration

All visual styling comes exclusively from `@automatize/ui`:

- Navigation components use design tokens for spacing, colors, and typography
- Icons are sourced from `@automatize/ui` icon set (lucide-react/lucide-react-native)
- No hardcoded colors, spacing, or styling appears in the navigation module
- Components accept `className` and `style` props for additional customization when needed

## Usage pattern

Applications import and use the navigation module through its unified interface:

```tsx
// Consumers import from the package root
import {
  useNavigation,
  useRoute,
  NavigationLink,
  NavigationMenu,
} from '@automatize/navigation';

// The same import works on web, mobile, and Windows
```

### Navigation hooks

The hooks provide essential navigation capabilities:

- `useNavigation()` — Imperative navigation (navigate, goBack, replace)
- `useRoute()` — Declarative access to current route parameters and path
- `useFocusEffect()` — Run effects when screens gain/lose focus
- `useNavigationSync()` — Respond to route changes for analytics or state updates

These hooks encapsulate platform differences while providing identical APIs.

### Navigation components

Components adapt their rendering to each platform:

- `NavigationLink` renders as `<a>`/Next.js Link on web, Pressable/Link on native
- `NavigationMenu` renders as vertical sidebar on web, bottom tab bar on mobile
- `Breadcrumb` renders as hierarchical trail with appropriate separators per platform

All components meet accessibility requirements (WCAG 2.1 AA) including:

- Minimum 44×44 dp touch targets
- Proper ARIA labels and roles
- Keyboard navigation support
- Sufficient color contrast

## Testing

The navigation module includes comprehensive unit tests covering:

- Hook behavior and platform differences
- Component rendering and prop handling
- Accessibility attributes and event handling
- Type safety and interface compliance

Tests run automatically as part of the monorepo's CI pipeline and can be executed locally with `pnpm test` from the package directory.

## Integration with Automatize architecture

This module follows Automatize's core architectural principles:

- **Feature-modular architecture**: Navigation logic is encapsulated in its own package
- **Platform independence**: No business logic depends on Expo, React Native, or web APIs
- **True offline-first**: Navigation logic functions independently of connectivity state
- **Shared core**: All domain logic lives outside platform-specific apps/
- **UI separation**: Visual presentation is delegated to `@automatize/ui` components

The module replaces duplicated navigation implementations in `apps/*` directories with a single, maintainable source of truth.
