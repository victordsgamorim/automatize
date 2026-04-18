'use client';

import React, { useState } from 'react';
import { useNavigation } from '@automatize/navigation';
import { InvoiceScreen } from '@automatize/screens/invoice/web';
import type { InvoiceRow } from '@automatize/screens/invoice/web';
import { getSavedInvoices, setInvoiceToEdit } from './invoiceStore';

export default function InvoicesPage(): React.JSX.Element {
  const { navigate } = useNavigation();

  const [invoices] = useState(() => getSavedInvoices());

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
