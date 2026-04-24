import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ProductRow } from '../ProductScreen.types';

export interface ProductContextValue {
  products: ProductRow[];
  isLoading: boolean;
  error: Error | null;
  /** ID of the product currently staged for editing. */
  productIdToEdit: string | undefined;
  setProductToEdit: (id: string) => void;
  clearProductToEdit: () => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

export interface ProductProviderProps {
  children: React.ReactNode;
  products?: ProductRow[];
  isLoading?: boolean;
  error?: Error | null;
}

export function ProductProvider({
  children,
  products = [],
  isLoading = false,
  error = null,
}: ProductProviderProps): React.JSX.Element {
  const [productIdToEdit, setProductIdToEdit] = useState<string | undefined>();

  const setProductToEdit = useCallback((id: string) => {
    setProductIdToEdit(id);
  }, []);

  const clearProductToEdit = useCallback(() => {
    setProductIdToEdit(undefined);
  }, []);

  const value = useMemo<ProductContextValue>(
    () => ({
      products,
      isLoading,
      error,
      productIdToEdit,
      setProductToEdit,
      clearProductToEdit,
    }),
    [
      products,
      isLoading,
      error,
      productIdToEdit,
      setProductToEdit,
      clearProductToEdit,
    ]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProductContext(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return ctx;
}
