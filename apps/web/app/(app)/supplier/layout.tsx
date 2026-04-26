'use client';

import React, { useMemo } from 'react';
import { SupplierProvider } from '@automatize/screens/supplier/web';
import { useSuppliersData, toSupplierRow } from './hooks';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { data, isLoading, error } = useSuppliersData();
  const suppliers = useMemo(
    () => data?.suppliers.map(toSupplierRow) ?? [],
    [data]
  );

  return (
    <SupplierProvider
      initialSuppliers={suppliers}
      isLoading={isLoading}
      error={error ?? null}
    >
      {children}
    </SupplierProvider>
  );
}
