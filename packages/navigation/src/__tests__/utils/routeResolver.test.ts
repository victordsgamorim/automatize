import { describe, it, expect } from 'vitest';

import type { RouteItem } from '../../utils/routeResolver';
import {
  buildRouteToIdMap,
  resolveActiveTile,
  resolvePageTitle,
  resolveNavigationTarget,
  recordLastVisited,
} from '../../utils/routeResolver';

/* ─── Fixtures ────────────────────────────────────────────────────────────── */

const ITEMS: RouteItem[] = [
  { id: 'dashboard', label: 'Dashboard', route: '/' },
  { id: 'invoices', label: 'Invoices', route: '/invoices' },
  { id: 'products', label: 'Products', route: '/products' },
  { id: 'clients', label: 'Clients', route: '/clients' },
];

const ROUTE_TO_ID = buildRouteToIdMap(ITEMS);

const SUB_ROUTE_TITLES: Record<string, string> = {
  '/clients/new': 'New Client',
  '/settings': 'Settings',
};

/* ─── buildRouteToIdMap ───────────────────────────────────────────────────── */

describe('buildRouteToIdMap', () => {
  it('maps each item route to its id', () => {
    expect(ROUTE_TO_ID).toEqual({
      '/': 'dashboard',
      '/invoices': 'invoices',
      '/products': 'products',
      '/clients': 'clients',
    });
  });

  it('returns an empty object for an empty array', () => {
    expect(buildRouteToIdMap([])).toEqual({});
  });
});

/* ─── resolveActiveTile ───────────────────────────────────────────────────── */

describe('resolveActiveTile', () => {
  describe('exact match', () => {
    it('resolves "/" to dashboard', () => {
      expect(resolveActiveTile('/', ITEMS, ROUTE_TO_ID)).toBe('dashboard');
    });

    it('resolves "/invoices" to invoices', () => {
      expect(resolveActiveTile('/invoices', ITEMS, ROUTE_TO_ID)).toBe(
        'invoices'
      );
    });

    it('resolves "/clients" to clients', () => {
      expect(resolveActiveTile('/clients', ITEMS, ROUTE_TO_ID)).toBe('clients');
    });

    it('resolves "/products" to products', () => {
      expect(resolveActiveTile('/products', ITEMS, ROUTE_TO_ID)).toBe(
        'products'
      );
    });
  });

  describe('prefix (startsWith) fallback', () => {
    it('resolves "/clients/new" to clients via prefix', () => {
      expect(resolveActiveTile('/clients/new', ITEMS, ROUTE_TO_ID)).toBe(
        'clients'
      );
    });

    it('resolves "/clients/123/edit" to clients via prefix', () => {
      expect(resolveActiveTile('/clients/123/edit', ITEMS, ROUTE_TO_ID)).toBe(
        'clients'
      );
    });

    it('resolves "/invoices/draft" to invoices via prefix', () => {
      expect(resolveActiveTile('/invoices/draft', ITEMS, ROUTE_TO_ID)).toBe(
        'invoices'
      );
    });

    it('resolves "/products/42" to products via prefix', () => {
      expect(resolveActiveTile('/products/42', ITEMS, ROUTE_TO_ID)).toBe(
        'products'
      );
    });
  });

  describe('no match', () => {
    it('returns undefined for "/settings" (not in items)', () => {
      expect(
        resolveActiveTile('/settings', ITEMS, ROUTE_TO_ID)
      ).toBeUndefined();
    });

    it('returns undefined for "/profile"', () => {
      expect(resolveActiveTile('/profile', ITEMS, ROUTE_TO_ID)).toBeUndefined();
    });

    it('returns undefined for an empty pathname', () => {
      expect(resolveActiveTile('', ITEMS, ROUTE_TO_ID)).toBeUndefined();
    });
  });

  describe('root "/" does not prefix-match everything', () => {
    it('"/unknown" does not resolve to dashboard', () => {
      expect(resolveActiveTile('/unknown', ITEMS, ROUTE_TO_ID)).toBeUndefined();
    });
  });
});

/* ─── resolvePageTitle ────────────────────────────────────────────────────── */

describe('resolvePageTitle', () => {
  it('returns sub-route title when pathname matches', () => {
    expect(
      resolvePageTitle('/clients/new', ITEMS, SUB_ROUTE_TITLES, 'clients')
    ).toBe('New Client');
  });

  it('returns sub-route title for /settings even without active tile', () => {
    expect(
      resolvePageTitle('/settings', ITEMS, SUB_ROUTE_TITLES, undefined)
    ).toBe('Settings');
  });

  it('returns active item label when no sub-route title matches', () => {
    expect(
      resolvePageTitle('/clients', ITEMS, SUB_ROUTE_TITLES, 'clients')
    ).toBe('Clients');
  });

  it('returns active item label for invoices', () => {
    expect(
      resolvePageTitle('/invoices', ITEMS, SUB_ROUTE_TITLES, 'invoices')
    ).toBe('Invoices');
  });

  it('returns the fallback when nothing matches', () => {
    expect(
      resolvePageTitle('/unknown', ITEMS, SUB_ROUTE_TITLES, undefined)
    ).toBe('Dashboard');
  });

  it('allows a custom fallback string', () => {
    expect(
      resolvePageTitle('/unknown', ITEMS, SUB_ROUTE_TITLES, undefined, 'Home')
    ).toBe('Home');
  });

  it('prefers sub-route title over item label', () => {
    // Even though "clients" is active, "/clients/new" has a sub-route title
    expect(
      resolvePageTitle('/clients/new', ITEMS, SUB_ROUTE_TITLES, 'clients')
    ).toBe('New Client');
  });
});

/* ─── resolveNavigationTarget ─────────────────────────────────────────────── */

describe('resolveNavigationTarget', () => {
  const clientsItem: RouteItem = {
    id: 'clients',
    label: 'Clients',
    route: '/clients',
  };

  it('returns base route when no last visited entry exists', () => {
    expect(resolveNavigationTarget(clientsItem, {})).toBe('/clients');
  });

  it('returns last visited path when it exists', () => {
    expect(
      resolveNavigationTarget(clientsItem, { clients: '/clients/new' })
    ).toBe('/clients/new');
  });

  it('ignores unrelated entries in lastVisited', () => {
    expect(
      resolveNavigationTarget(clientsItem, { invoices: '/invoices/draft' })
    ).toBe('/clients');
  });
});

/* ─── recordLastVisited ───────────────────────────────────────────────────── */

describe('recordLastVisited', () => {
  it('records the pathname for the active tile', () => {
    const result = recordLastVisited('clients', '/clients/new', {});
    expect(result).toEqual({ clients: '/clients/new' });
  });

  it('overwrites a previous entry for the same tile', () => {
    const result = recordLastVisited('clients', '/clients/123', {
      clients: '/clients/new',
    });
    expect(result).toEqual({ clients: '/clients/123' });
  });

  it('preserves entries for other tiles', () => {
    const result = recordLastVisited('clients', '/clients/new', {
      invoices: '/invoices/draft',
    });
    expect(result).toEqual({
      invoices: '/invoices/draft',
      clients: '/clients/new',
    });
  });

  it('returns the same object when activeTileId is undefined', () => {
    const current = { clients: '/clients/new' };
    const result = recordLastVisited(undefined, '/unknown', current);
    expect(result).toBe(current);
  });
});

/* ─── Full navigation scenario (integration) ─────────────────────────────── */

describe('navigation scenario: client form → product → back to client form', () => {
  let lastVisited: Record<string, string> = {};

  it('step 1: user navigates to /clients/new — clients tile becomes active', () => {
    const active = resolveActiveTile('/clients/new', ITEMS, ROUTE_TO_ID);
    expect(active).toBe('clients');

    lastVisited = recordLastVisited(active, '/clients/new', lastVisited);
    expect(lastVisited.clients).toBe('/clients/new');
  });

  it('step 2: user clicks Products in sidebar — navigates to /products', () => {
    const productsItem = ITEMS.find((i) => i.id === 'products');
    expect(productsItem).toBeDefined();
    const target = resolveNavigationTarget(
      productsItem as RouteItem,
      lastVisited
    );
    expect(target).toBe('/products');

    const active = resolveActiveTile('/products', ITEMS, ROUTE_TO_ID);
    expect(active).toBe('products');

    lastVisited = recordLastVisited(active, '/products', lastVisited);
  });

  it('step 3: user clicks Clients in sidebar — returns to /clients/new (remembered)', () => {
    const clientsItem = ITEMS.find((i) => i.id === 'clients');
    expect(clientsItem).toBeDefined();
    const target = resolveNavigationTarget(
      clientsItem as RouteItem,
      lastVisited
    );
    expect(target).toBe('/clients/new');
  });

  it('step 4: page title on /clients/new shows sub-route title', () => {
    const active = resolveActiveTile('/clients/new', ITEMS, ROUTE_TO_ID);
    const title = resolvePageTitle(
      '/clients/new',
      ITEMS,
      SUB_ROUTE_TITLES,
      active
    );
    expect(title).toBe('New Client');
  });
});
