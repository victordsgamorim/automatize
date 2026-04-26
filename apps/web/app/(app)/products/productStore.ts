import type { ProductRow } from '@automatize/screens/product/web';
import type { ProductFormData } from '@automatize/screens/product-form/web';

export {
  getSavedSuppliers,
  addSavedSupplier,
  updateSavedSupplier,
  deleteSavedSupplier,
} from '../supplier/supplierStore';

let savedProducts: ProductRow[] = [];
const productFormDataMap = new Map<string, ProductFormData>();

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
