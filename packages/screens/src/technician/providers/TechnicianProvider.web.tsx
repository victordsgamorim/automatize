import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { TechnicianRow } from '../TechnicianScreen.types';

export interface TechnicianContextValue {
  technicians: TechnicianRow[];
  addTechnician: (name: string, entryDate: string) => void;
  updateTechnician: (id: string, name: string, entryDate: string) => void;
  deleteTechnician: (id: string) => void;
}

const TechnicianContext = createContext<TechnicianContextValue | null>(null);

export interface TechnicianProviderProps {
  children: React.ReactNode;
  initialTechnicians?: TechnicianRow[];
  isLoading?: boolean;
  error?: Error | null;
}

export function TechnicianProvider({
  children,
  initialTechnicians = [],
  isLoading: _isLoading = false,
  error: _error = null,
}: TechnicianProviderProps): React.JSX.Element {
  const [technicians, setTechnicians] =
    useState<TechnicianRow[]>(initialTechnicians);
  const seededRef = useRef(initialTechnicians.length > 0);

  useEffect(() => {
    if (!seededRef.current && initialTechnicians.length > 0) {
      seededRef.current = true;
      setTechnicians(initialTechnicians);
    }
  }, [initialTechnicians]);

  const addTechnician = useCallback((name: string, entryDate: string) => {
    const newTech: TechnicianRow = {
      id: crypto.randomUUID(),
      name,
      entryDate,
    };
    setTechnicians((prev) => [...prev, newTech]);
  }, []);

  const updateTechnician = useCallback(
    (id: string, name: string, entryDate: string) => {
      setTechnicians((prev) =>
        prev.map((t) => (t.id === id ? { ...t, name, entryDate } : t))
      );
    },
    []
  );

  const deleteTechnician = useCallback((id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<TechnicianContextValue>(
    () => ({
      technicians,
      addTechnician,
      updateTechnician,
      deleteTechnician,
    }),
    [technicians, addTechnician, updateTechnician, deleteTechnician]
  );

  return (
    <TechnicianContext.Provider value={value}>
      {children}
    </TechnicianContext.Provider>
  );
}

export function useTechnicianContext(): TechnicianContextValue {
  const ctx = useContext(TechnicianContext);
  if (!ctx) {
    throw new Error(
      'useTechnicianContext must be used within a TechnicianProvider'
    );
  }
  return ctx;
}
