'use client';

import React, { useMemo } from 'react';
import { AnalyticsScreen } from '@automatize/screens/analytics/web';
import type { InvoiceFormData } from '@automatize/screens/invoice-form/web';
import {
  useInvoicesData,
  toInvoiceRow,
  invoiceToFormData,
} from './invoices/hooks';
import { useClientsData, toClientRow } from './clients/hooks';
import { useProductsData, toProductRow } from './products/hooks';

export default function DashboardPage(): React.JSX.Element {
  const { data: invoicesData } = useInvoicesData();
  const { data: clientsData } = useClientsData();
  const { data: productsData } = useProductsData();

  const invoices = useMemo(
    () => invoicesData?.invoices.map(toInvoiceRow) ?? [],
    [invoicesData]
  );
  const clients = useMemo(
    () => clientsData?.clients.map(toClientRow) ?? [],
    [clientsData]
  );
  const products = useMemo(
    () => productsData?.products.map(toProductRow) ?? [],
    [productsData]
  );

  const invoiceDetails = useMemo(() => {
    const map = new Map<string, InvoiceFormData>();
    if (!invoicesData?.invoices) return map;
    for (const invoice of invoicesData.invoices) {
      map.set(invoice.id, invoiceToFormData(invoice));
    }
    return map;
  }, [invoicesData]);

  return (
    <AnalyticsScreen
      invoices={invoices}
      invoiceDetails={invoiceDetails}
      clients={clients}
      products={products}
    />
  );
}
