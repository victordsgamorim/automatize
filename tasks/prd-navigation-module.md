# PRD: Cross-Platform Navigation Module

## Introduction

Create a centralized navigation module in `@packages/navigation` that provides reusable navigation logic and components for the Automatize invoicing system across all platforms: Mobile (iOS/Android via Expo), Web (Expo Web), and Windows Desktop (React Native Windows). This module will replace duplicated navigation implementations and ensure consistent navigation behavior and appearance across platforms.

## Goals

- Centralize all navigation logic in a single, reusable package
- Provide platform-adaptive navigation components that follow each platform's conventions
- Enable consistent navigation state management across platforms
- Support deep linking and URL synchronization where applicable
- Maintain compatibility with Expo Router for file-based routing
- Ensure zero duplication of navigation code between apps/\* directories

## User Stories

### US-001: Create navigation module package structure

**Description:** As a developer, I need a properly structured navigation package so I can begin implementing cross-platform navigation components.

**Acceptance Criteria:**

- [ ] Create `packages/navigation/` directory with proper package.json
- [ ] Set up TypeScript configuration extending `@automatize/tsconfig/base.json`
- [ ] Set up ESLint configuration extending `@automatize/eslint-config/base.js`
- [ ] Create src/ directory with appropriate subdirectories (components/, hooks/, utils/)
- [ ] Export public API from index.ts
- [ ] Typecheck passes

### US-002: Implement platform-agnostic navigation hooks

**Description:** As a developer, I need platform-agnostic navigation hooks so I can manage navigation state consistently across platforms.

**Acceptance Criteria:**

- [ ] create `useNavigation()` hook that returns navigation methods (navigate, goBack, etc.)
- [ ] create `useRoute()` hook that returns current route parameters
- [ ] create `useFocusEffect()` hook for platform-appropriate focus handling
- [ ] Hooks work identically across web, mobile, and Windows platforms
- [ ] Typecheck passes
- [ ] Unit tests cover basic hook functionality

### US-003: Implement cross-platform navigation link component

**Description:** As a developer, I need a NavigationLink component so I can create navigational links that adapt to each platform.

**Acceptance Criteria:**

- [ ] NavigationLink.web.tsx implements web-appropriate linking (using <a> or Next.js Link)
- [ ] NavigationLink.native.tsx implements native-appropriate linking (using TouchableOpacity/Pressable)
- [ ] NavigationLink.windows.tsx implements Windows-appropriate linking (if different from native)
- [ ] Component accepts href/to, children, and optional props
- [ ] Component handles external URLs appropriately per platform
- [ ] Visual appearance follows platform conventions
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill (for web variant)
- [ ] Unit tests cover props handling and behavior

### US-004: Implement platform-adaptive navigation menu

**Description:** As a developer, I need a NavigationMenu component so I can create platform-appropriate navigation menus (tab bars, nav rails, etc.).

**Acceptance Criteria:**

- [ ] NavigationMenu.web.tsx implements horizontal/vertical nav bar appropriate for web
- [ ] NavigationMenu.native.tsx implements bottom tab bar for mobile
- [ ] NavigationMenu.windows.tsx implements nav rail or similar for Windows
- [ ] Menu accepts array of navigation items with labels and icons
- [ ] Menu highlights active item based on current route
- [ ] Menu items trigger navigation when selected
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill (for web variant)
- [ ] Unit tests cover item selection and active state

### US-005: Implement breadcrumb navigation component

**Description:** As a developer, I need a Breadcrumb component so users can understand their location in the app hierarchy.

**Acceptance Criteria:**

- [ ] Breadcrumb.web.tsx implements web-style breadcrumb navigation
- [ ] Breadcrumb.native.tsx implements mobile-appropriate breadcrumb (or collapses to simple text)
- [ ] Breadcrumb.windows.tsx implements Windows-style breadcrumb
- [ ] Component accepts route segments and generates appropriate links
- [ ] Separators follow platform conventions
- [ ] Current page is non-linkable and visually distinct
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill (for web variant)
- [ ] Unit tests cover rendering and link generation

### US-006: Implement navigation state synchronization

**Description:** As a developer, I need navigation state synchronization so URL and internal state stay in sync across platforms.

**Acceptance Criteria:**

- [ ] Sync mechanism works with Expo Router's file-based routing on web
- [ ] Sync mechanism works with React Native navigation on mobile
- [ ] Sync mechanism works with React Native Windows navigation
- [ ] Initial navigation state matches URL on app load (web)
- [ ] Navigation updates URL when appropriate (web)
- [ ] Deep linking works to navigate to specific screens
- [ ] Typecheck passes
- [ ] Integration tests verify sync behavior

### US-007: Replace existing web navigation with new module

**Description:** As a developer, I need to replace the current web navigation implementation so we use the centralized module.

**Acceptance Criteria:**

- [ ] Remove `apps/web/app/(app)/navigation.tsx`
- [ ] Remove `apps/web/app/(app)/navigation.module.css`
- [ ] Replace with imports from `@automatize/navigation`
- [ ] Navigation functionality remains identical
- [ ] Visual appearance matches or improves upon original
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Provide `useNavigation()` hook returning { navigate, goBack, canGoBack, reset }
- FR-2: Provide `useRoute()` hook returning current route params and path
- FR-3: NavigationLink component converts to appropriate platform-specific link/button
- FR-4: NavigationMenu component adapts layout to platform (tabs web, bottom tabs mobile, nav rail windows)
- FR-5: Breadcrumb component shows hierarchical path with appropriate separators
- FR-6: Navigation state synchronizes with URL where platform supports it (web primarily)
- FR-7: All components and hooks are tree-shakeable and side-effect free when unused
- FR-8: Module exports types for navigation parameters and route definitions
- FR-9: Supports optional platform-specific overrides via props
- FR-10: Handles accessibility requirements per platform (ARIA labels, keyboard navigation, etc.)

## Non-Goals

- No platform detection logic leaking into consumer code (all abstraction handled internally)
- No direct dependencies on Expo or React Native Windows APIs in shared code
- No persistence of navigation history beyond session (use browser history or native stack)
- No built-in animation system (rely on platform navigation animators)
- No integration with state management libraries (Redux, Zustand, etc.) - remains UI-focused
- No server-side rendering specifics (handled by consuming apps)

## Design Considerations

- Follow Atomic Design principles: navigation primitives (links, menus) → organisms (nav bars, sidebars)
- Use design tokens from `@automatize/ui/tokens` for spacing, colors, typography
- Reuse existing components from `@automatize/ui` where appropriate (icons, badges, etc.)
- Platform-specific implementations should follow each platform's navigation patterns:
  - Web: Horizontal nav bars, sidebar navigators, breadcrumb trails
  - Mobile (iOS/Android): Bottom tab bars, drawer navigators, stack navigators
  - Windows: Navigation rail, nav pane, tabs, menubar
- Icons should be sourced from `@automatize/ui` icon set or platform-appropriate equivalents
- Touch targets minimum 44x44 dp per accessibility guidelines
- Color contrast ratios meet WCAG 2.1 AA standards

## Technical Considerations

- Dependencies: Only peer dependencies on react, react-native, and expo-router where needed
- Platform extensions: Use .web.tsx, .native.tsx, and .windows.tsx files as appropriate
- State management: Use React's useState/useContext or leverage platform navigation state
- Deep linking: Use platform-specific linking libraries abstracted behind common interface
- Bundle optimization: Ensure tree-shaking works to exclude unused platform code
- Testing: Unit tests with Jest, integration tests with React Native Testing Library/web equivalents
- TypeScript: Strict mode enabled, exhaustive platform handling via discriminated unions
- Error boundaries: Wrap platform-specific implementations to prevent whole-app crashes
- Performance: Lazy load platform-specific code where possible, memoize expensive computations

## Success Metrics

- Navigation code duplication eliminated from apps/\* directories
- Consistent navigation behavior verified across all three platforms
- Developer productivity increased when implementing new navigation features
- Bundle size impact minimal (<5kb gzipped added to any platform)
- Accessibility audits pass for navigation components on all platforms
- Migration effort for existing navigation measured and minimized
- No increase in build times for any platform

## Open Questions

- Should the navigation module include route definition utilities or rely on file-based conventions?
- How should we handle platform-specific navigation transitions (animations) in a cross-platform way?
- What is the best approach for Windows navigation - should we use .windows.tsx or extend .native.tsx?
- Should we provide a higher-order navigation container that handles platform-appropriate layout?
- How do we handle web-specific features like browser history scroll restoration in the abstraction?
