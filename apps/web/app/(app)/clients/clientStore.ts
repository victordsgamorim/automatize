import type { ClientRow } from '@automatize/screens/client/web';

/**
 * Module-level in-memory store for clients added in the current session.
 * Survives SPA navigations but is cleared on page refresh (same pattern
 * as formDraft in new/page.tsx).
 */
let savedClients: ClientRow[] = [];

export function getSavedClients(): ClientRow[] {
  return savedClients;
}

export function addSavedClient(client: ClientRow): void {
  savedClients = [client, ...savedClients];
}
