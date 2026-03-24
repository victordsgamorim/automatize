'use client';

// Re-export UI components from @automatize/ui
export { ContentNavigation, SidebarLogo } from '@automatize/ui/web';
export type {
  ContentNavigationItem,
  ContentNavigationProps,
  SidebarLogoProps,
} from '@automatize/ui/web';

export { ContentPlaceholder } from '@automatize/ui/web';
export type { ContentPlaceholderProps } from '@automatize/ui/web';

// Tile metadata (owned by this module)
export { TILE_ORDER, TILE_ROUTES, TILE_LABELS, TILE_GROUP } from './tiles';
export type { TileId } from './tiles';
