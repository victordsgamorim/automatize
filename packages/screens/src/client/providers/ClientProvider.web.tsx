import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ClientRow } from '../ClientScreen.types';

export interface ClientContextValue {
  clients: ClientRow[];
  isLoading: boolean;
  error: Error | null;
  clientIdToEdit: string | undefined;
  setClientToEdit: (id: string) => void;
  clearClientToEdit: () => void;
}

const ClientContext = createContext<ClientContextValue | null>(null);

export interface ClientProviderProps {
  children: React.ReactNode;
  clients?: ClientRow[];
  isLoading?: boolean;
  error?: Error | null;
}

export function ClientProvider({
  children,
  clients = [],
  isLoading = false,
  error = null,
}: ClientProviderProps): React.JSX.Element {
  const [clientIdToEdit, setClientIdToEdit] = useState<string | undefined>();

  const setClientToEdit = useCallback((id: string) => {
    setClientIdToEdit(id);
  }, []);

  const clearClientToEdit = useCallback(() => {
    setClientIdToEdit(undefined);
  }, []);

  const value = useMemo<ClientContextValue>(
    () => ({
      clients,
      isLoading,
      error,
      clientIdToEdit,
      setClientToEdit,
      clearClientToEdit,
    }),
    [
      clients,
      isLoading,
      error,
      clientIdToEdit,
      setClientToEdit,
      clearClientToEdit,
    ]
  );

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
}

export function useClientContext(): ClientContextValue {
  const ctx = useContext(ClientContext);
  if (!ctx) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return ctx;
}
