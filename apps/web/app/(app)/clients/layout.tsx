'use client';

import React, { useMemo } from 'react';
import { ClientProvider } from '@automatize/screens/client/web';
import { useClientsData, toClientRow } from './hooks';

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { data, isLoading, error } = useClientsData();
  const clients = useMemo(() => data?.clients.map(toClientRow) ?? [], [data]);

  return (
    <ClientProvider
      clients={clients}
      isLoading={isLoading}
      error={error ?? null}
    >
      {children}
    </ClientProvider>
  );
}
