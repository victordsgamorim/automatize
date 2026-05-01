import React, { createContext, useCallback, useContext, useMemo } from 'react';
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
  technicians?: TechnicianRow[];
  isLoading?: boolean;
  error?: Error | null;
  onAdd?: (name: string, entryDate: string) => void;
  onUpdate?: (id: string, name: string, entryDate: string) => void;
  onDelete?: (id: string) => void;
}

export function TechnicianProvider({
  children,
  technicians = [],
  isLoading: _isLoading = false,
  error: _error = null,
  onAdd,
  onUpdate,
  onDelete,
}: TechnicianProviderProps): React.JSX.Element {
  const addTechnician = useCallback(
    (name: string, entryDate: string) => {
      onAdd?.(name, entryDate);
    },
    [onAdd]
  );

  const updateTechnician = useCallback(
    (id: string, name: string, entryDate: string) => {
      onUpdate?.(id, name, entryDate);
    },
    [onUpdate]
  );

  const deleteTechnician = useCallback(
    (id: string) => {
      onDelete?.(id);
    },
    [onDelete]
  );

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
