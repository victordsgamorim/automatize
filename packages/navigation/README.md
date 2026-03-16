# @automatize/navigation

Cross-platform navigation primitives and hooks for the Automatize invoicing system.

This package provides reusable navigation logic and components that work consistently across Web (Expo/Next.js), Mobile (Expo/React Native), and Windows Desktop (React Native Windows).

## Features

- **Platform-agnostic hooks**: `useNavigation`, `useRoute`, `useFocusEffect`, `useNavigationSync`
- **Adaptive components**: `NavigationLink`, `NavigationMenu`, `Breadcrumb` with platform-specific implementations
- **Zero duplication**: Replaces scattered navigation logic in `apps/*` directories
- **Full TypeScript support**: Exhaustive platform handling via discriminated unions
- **Accessibility compliant**: WCAG 2.1 AA touch targets, ARIA labels, keyboard navigation
- **Tree-shakeable**: Platform-specific code is excluded when unused

## Installation

This is a workspace package — install is automatic via Turborepo/pnpm:

```bash
# From workspace root
pnpm install
```

## Usage

### Navigation Hooks

```tsx
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  useNavigationSync,
} from '@automatize/navigation';

function ProfileScreen() {
  const { navigate, goBack } = useNavigation();
  const { path, params } = useRoute();

  useFocusEffect(() => {
    // Analytics or data refresh when screen gains focus
    trackScreenView(path);
    return () => {
      // Cleanup on blur
    };
  });

  useNavigationSync(({ path }) => {
    // Update breadcrumbs or analytics on route change
    updateBreadcrumb(path);
  });

  return (
    <View>
      <Text>User ID: {params.userId}</Text>
      <Button onPress={() => goBack()}>Back</Button>
    </View>
  );
}
```

### NavigationLink

```tsx
import { NavigationLink } from '@automatize/navigation';

function Sidebar() {
  return (
    <NavigationLink href="/invoices" accessibilityLabel="Go to invoices list">
      Invoices
    </NavigationLink>
  );
}
```

### NavigationMenu

```tsx
import { NavigationMenu } from '@automatize/navigation';

function MainNav() {
  const items = [
    { key: 'dashboard', label: 'Dashboard', href: '/' },
    { key: 'invoices', label: 'Invoices', href: '/invoices' },
    { key: 'clients', label: 'Clients', href: '/clients' },
  ];

  return <NavigationMenu items={items} />;
}
```

### Breadcrumb

```tsx
import { Breadcrumb } from '@automatize/navigation';

function InvoiceDetail() {
  const segments = [
    { label: 'Home', href: '/' },
    { label: 'Invoices', href: '/invoices' },
    { label: 'INV-00123' }, // current page
  ];

  return <Breadcrumb segments={segments} />;
}
```

## API Reference

See `src/types.ts` for the full TypeScript interface documentation.

## Design

- Follows the **Platform Extension Pattern**: `.web.tsx`, `.native.tsx`, `.windows.tsx`
- UI primitives come from `@automatize/ui`; this package handles logic only
- Web implementation uses Next.js/App Router primitives
- Native implementation uses Expo Router primitives
- Windows implementation shares native logic where appropriate

## Testing

```bash
# Unit + integration tests
pnpm test

# Unit tests only
pnpm test:unit

# Watch mode
pnpm test:watch
```

## License

See root [LICENSE](../LICENSE) file.
