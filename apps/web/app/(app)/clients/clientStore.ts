import type { ClientRow } from '@automatize/screens/client/web';
import type { ClientFormData } from '@automatize/screens/client-form/web';

/**
 * Module-level in-memory store.
 * Survives SPA navigations; cleared on page refresh (JS runtime restart).
 */
let savedClients: ClientRow[] = [];
const clientFormDataMap = new Map<string, ClientFormData>();
let clientIdToEdit: string | undefined;

export function getSavedClients(): ClientRow[] {
  return savedClients;
}

export function addSavedClient(row: ClientRow, formData: ClientFormData): void {
  savedClients = [row, ...savedClients];
  clientFormDataMap.set(row.id, formData);
}

export function getClientFormData(id: string): ClientFormData | undefined {
  return clientFormDataMap.get(id);
}

export function updateSavedClient(
  id: string,
  row: ClientRow,
  formData: ClientFormData
): void {
  savedClients = savedClients.map((c) => (c.id === id ? row : c));
  clientFormDataMap.set(id, formData);
}

export function setClientToEdit(id: string): void {
  clientIdToEdit = id;
}

export function getClientIdToEdit(): string | undefined {
  return clientIdToEdit;
}

export function clearClientToEdit(): void {
  clientIdToEdit = undefined;
}
