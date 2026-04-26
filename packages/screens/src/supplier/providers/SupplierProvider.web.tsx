import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { SupplierRow } from '../SupplierScreen.types';

export interface SupplierContextValue {
  suppliers: SupplierRow[];
  addSupplier: (name: string) => void;
  updateSupplier: (id: string, name: string) => void;
  deleteSupplier: (id: string) => void;
}

const SupplierContext = createContext<SupplierContextValue | null>(null);

export interface SupplierProviderProps {
  children: React.ReactNode;
  initialSuppliers?: SupplierRow[];
  isLoading?: boolean;
  error?: Error | null;
}

export function SupplierProvider({
  children,
  initialSuppliers = [],
  isLoading: _isLoading = false,
  error: _error = null,
}: SupplierProviderProps): React.JSX.Element {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>(initialSuppliers);
  const seededRef = useRef(initialSuppliers.length > 0);

  useEffect(() => {
    if (!seededRef.current && initialSuppliers.length > 0) {
      seededRef.current = true;
      setSuppliers(initialSuppliers);
    }
  }, [initialSuppliers]);

  const addSupplier = useCallback((name: string) => {
    const newSupplier: SupplierRow = {
      id: crypto.randomUUID(),
      name,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
  }, []);

  const updateSupplier = useCallback((id: string, name: string) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const value = useMemo<SupplierContextValue>(
    () => ({
      suppliers,
      addSupplier,
      updateSupplier,
      deleteSupplier,
    }),
    [suppliers, addSupplier, updateSupplier, deleteSupplier]
  );

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplierContext(): SupplierContextValue {
  const ctx = useContext(SupplierContext);
  if (!ctx) {
    throw new Error(
      'useSupplierContext must be used within a SupplierProvider'
    );
  }
  return ctx;
}
