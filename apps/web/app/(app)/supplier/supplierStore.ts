import type { SupplierRow } from '@automatize/screens/supplier/web';
import { generateId } from '@automatize/utils';

let savedSuppliers: SupplierRow[] = [];

export function getSavedSuppliers(): SupplierRow[] {
  return savedSuppliers;
}

export function addSavedSupplier(name: string): SupplierRow {
  const supplier: SupplierRow = { id: generateId(), name };
  savedSuppliers = [...savedSuppliers, supplier];
  return supplier;
}

export function updateSavedSupplier(id: string, name: string): void {
  savedSuppliers = savedSuppliers.map((s) =>
    s.id === id ? { ...s, name } : s
  );
}

export function deleteSavedSupplier(id: string): void {
  savedSuppliers = savedSuppliers.filter((s) => s.id !== id);
}
