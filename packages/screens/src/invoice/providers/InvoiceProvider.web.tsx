import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { InvoiceRow } from '../InvoiceScreen.types';

export interface InvoiceContextValue {
  invoices: InvoiceRow[];
  isLoading: boolean;
  error: Error | null;
  /** ID of the invoice currently staged for editing. */
  invoiceIdToEdit: string | undefined;
  setInvoiceToEdit: (id: string) => void;
  clearInvoiceToEdit: () => void;
}

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

export interface InvoiceProviderProps {
  children: React.ReactNode;
  invoices?: InvoiceRow[];
  isLoading?: boolean;
  error?: Error | null;
}

export function InvoiceProvider({
  children,
  invoices = [],
  isLoading = false,
  error = null,
}: InvoiceProviderProps): React.JSX.Element {
  const [invoiceIdToEdit, setInvoiceIdToEdit] = useState<string | undefined>();

  const setInvoiceToEdit = useCallback((id: string) => {
    setInvoiceIdToEdit(id);
  }, []);

  const clearInvoiceToEdit = useCallback(() => {
    setInvoiceIdToEdit(undefined);
  }, []);

  const value = useMemo<InvoiceContextValue>(
    () => ({
      invoices,
      isLoading,
      error,
      invoiceIdToEdit,
      setInvoiceToEdit,
      clearInvoiceToEdit,
    }),
    [
      invoices,
      isLoading,
      error,
      invoiceIdToEdit,
      setInvoiceToEdit,
      clearInvoiceToEdit,
    ]
  );

  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
}

export function useInvoiceContext(): InvoiceContextValue {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return ctx;
}
