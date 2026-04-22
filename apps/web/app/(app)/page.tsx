'use client';

import React, { useState, useMemo } from 'react';
import { AnalyticsScreen } from '@automatize/screens/analytics/web';
import { getSavedInvoices, getInvoiceFormData } from './invoices/invoiceStore';
import { getSavedClients } from './clients/clientStore';
import { getSavedProducts } from './products/productStore';
import { getSavedTechnicians } from './invoices/invoiceStore';

export default function DashboardPage(): React.JSX.Element {
  const invoices = useState(() => getSavedInvoices())[0];
  const clients = useState(() => getSavedClients())[0];
  const products = useState(() => getSavedProducts())[0];
  const technicians = useState(() => getSavedTechnicians())[0];

  const invoiceDetails = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<ReturnType<typeof getInvoiceFormData>>
    >();
    for (const inv of invoices) {
      const detail = getInvoiceFormData(inv.id);
      if (detail) map.set(inv.id, detail);
    }
    return map;
  }, [invoices]);

  return (
    <AnalyticsScreen
      invoices={invoices}
      invoiceDetails={invoiceDetails}
      clients={clients}
      products={products}
      technicians={technicians}
    />
  );
}
