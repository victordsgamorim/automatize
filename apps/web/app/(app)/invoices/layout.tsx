'use client';

import React, { useMemo } from 'react';
import { InvoiceProvider } from '@automatize/screens/invoice/web';
import { useInvoicesData, toInvoiceRow } from './hooks';

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { data, isLoading, error } = useInvoicesData();
  const invoices = useMemo(
    () => data?.invoices.map(toInvoiceRow) ?? [],
    [data]
  );

  return (
    <InvoiceProvider
      invoices={invoices}
      isLoading={isLoading}
      error={error ?? null}
    >
      {children}
    </InvoiceProvider>
  );
}
