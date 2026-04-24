import type { ProductRow } from '@automatize/screens/product/web';
import type {
  ProductFormData,
  Supplier,
} from '@automatize/screens/product-form/web';
import { generateId } from '@automatize/utils';

let savedProducts: ProductRow[] = [];
const productFormDataMap = new Map<string, ProductFormData>();
let savedSuppliers: Supplier[] = [];

export function getSavedProducts(): ProductRow[] {
  return savedProducts;
}

export function addSavedProduct(
  row: ProductRow,
  formData: ProductFormData
): void {
  savedProducts = [row, ...savedProducts];
  productFormDataMap.set(row.id, formData);
}

export function getProductFormData(id: string): ProductFormData | undefined {
  return productFormDataMap.get(id);
}

export function updateSavedProduct(
  id: string,
  row: ProductRow,
  formData: ProductFormData
): void {
  savedProducts = savedProducts.map((p) => (p.id === id ? row : p));
  productFormDataMap.set(id, formData);
}

export function getSavedSuppliers(): Supplier[] {
  return savedSuppliers;
}

export function addSavedSupplier(name: string): Supplier {
  const supplier: Supplier = { id: generateId(), name };
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

export function decrementProductStock(id: string, qty: number): void {
  savedProducts = savedProducts.map((p) =>
    p.id === id ? { ...p, quantity: Math.max(0, p.quantity - qty) } : p
  );
}

export function incrementProductStock(id: string, qty: number): void {
  savedProducts = savedProducts.map((p) =>
    p.id === id ? { ...p, quantity: p.quantity + qty } : p
  );
}
