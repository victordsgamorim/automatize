/** Tile identifiers — one per sidebar menu entry. */
export type TileId = 'dashboard' | 'invoices' | 'products' | 'clients';

/** Route path associated with each tile. */
export const TILE_ROUTES: Record<TileId, string> = {
  dashboard: '/',
  invoices: '/invoices',
  products: '/products',
  clients: '/clients',
};

/** Ordered list of tile IDs (determines sidebar ordering). */
export const TILE_ORDER: TileId[] = [
  'dashboard',
  'invoices',
  'products',
  'clients',
];

/** Labels for each tile. Plain strings — localization is handled by the consumer. */
export const TILE_LABELS: Record<TileId, string> = {
  dashboard: 'Dashboard',
  invoices: 'Invoices',
  products: 'Products',
  clients: 'Clients',
};

/** The sidebar group name for all main tiles. */
export const TILE_GROUP = 'Menu';
