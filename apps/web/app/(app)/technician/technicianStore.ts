import type { TechnicianRow } from '@automatize/screens/technician/web';
import { generateId } from '@automatize/utils';

/**
 * Module-level in-memory store.
 * Survives SPA navigations; cleared on page refresh (JS runtime restart).
 */
let savedTechnicians: TechnicianRow[] = [];

export function getSavedTechnicians(): TechnicianRow[] {
  return savedTechnicians;
}

export function addSavedTechnician(
  name: string,
  entryDate: string
): TechnicianRow {
  const tech: TechnicianRow = { id: generateId(), name, entryDate };
  savedTechnicians = [...savedTechnicians, tech];
  return tech;
}

export function updateSavedTechnician(
  id: string,
  name: string,
  entryDate: string
): void {
  savedTechnicians = savedTechnicians.map((t) =>
    t.id === id ? { ...t, name, entryDate } : t
  );
}

export function deleteSavedTechnician(id: string): void {
  savedTechnicians = savedTechnicians.filter((t) => t.id !== id);
}
