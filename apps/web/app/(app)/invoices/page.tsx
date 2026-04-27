'use client';

import React from 'react';
import { useNavigation } from '@automatize/navigation';
import {
  InvoiceScreen,
  useInvoiceContext,
} from '@automatize/screens/invoice/web';
import type { InvoiceRow } from '@automatize/screens/invoice/web';

export default function InvoicesPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { invoices, setInvoiceToEdit } = useInvoiceContext();

  const handleEditInvoice = (invoice: InvoiceRow) => {
    setInvoiceToEdit(invoice.id);
    navigate('/invoices/edit');
  };

  return (
    <InvoiceScreen
      invoices={invoices}
      onAddInvoice={() => navigate('/invoices/new')}
      onEditInvoice={handleEditInvoice}
    />
  );
}
