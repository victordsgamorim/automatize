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
const stockDeltas = new Map<string, number>();

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
  const cur = stockDeltas.get(id) ?? 0;
  stockDeltas.set(id, cur - qty);
}

export function incrementProductStock(id: string, qty: number): void {
  savedProducts = savedProducts.map((p) =>
    p.id === id ? { ...p, quantity: p.quantity + qty } : p
  );
  const cur = stockDeltas.get(id) ?? 0;
  stockDeltas.set(id, cur + qty);
}

export function getStockDeltas(): Map<string, number> {
  return stockDeltas;
}

export function applyStockDeltas(products: ProductRow[]): ProductRow[] {
  if (stockDeltas.size === 0) return products;
  return products.map((p) => {
    const delta = stockDeltas.get(p.id);
    if (delta === undefined || delta === 0) return p;
    return { ...p, quantity: Math.max(0, p.quantity + delta) };
  });
}
