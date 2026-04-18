import type { ProductRow } from '@automatize/screens/product/web';
import type {
  ProductFormData,
  Company,
} from '@automatize/screens/product-form/web';

/**
 * Module-level in-memory store.
 * Survives SPA navigations; cleared on page refresh (JS runtime restart).
 */
let savedProducts: ProductRow[] = [];
const productFormDataMap = new Map<string, ProductFormData>();
let productIdToEdit: string | undefined;
let savedCompanies: Company[] = [];

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

export function setProductToEdit(id: string): void {
  productIdToEdit = id;
}

export function getProductIdToEdit(): string | undefined {
  return productIdToEdit;
}

export function clearProductToEdit(): void {
  productIdToEdit = undefined;
}

export function getSavedCompanies(): Company[] {
  return savedCompanies;
}

export function addSavedCompany(company: Company): void {
  savedCompanies = [...savedCompanies, company];
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
