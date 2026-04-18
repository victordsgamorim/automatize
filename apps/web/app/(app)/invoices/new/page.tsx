'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation } from '@automatize/navigation';
import { InvoiceFormScreen } from '@automatize/screens/invoice-form/web';
import type {
  InvoiceFormData,
  WarrantyOption,
} from '@automatize/screens/invoice-form/web';
import type { InvoiceRow } from '@automatize/screens/invoice/web';
import { generateId } from '@automatize/utils';
import { getSavedClients } from '../../clients/clientStore';
import {
  getSavedProducts,
  decrementProductStock,
} from '../../products/productStore';
import {
  addSavedInvoice,
  getSavedTechnicians as getInvoiceTechnicians,
  addSavedTechnician as addInvoiceTechnician,
  getSavedWarrantyOptions,
  addSavedWarrantyOption,
} from '../invoiceStore';
import {
  getSavedTechnicians as getTableTechnicians,
  addSavedTechnician as addTableTechnician,
} from '../../technician/technicianStore';
import type { TechnicianRow } from '@automatize/screens/technician/web';

/**
 * Module-level draft store. Survives SPA navigations;
 * cleared on page refresh (JS runtime restart).
 */
let formDraft: Partial<InvoiceFormData> | undefined;

function toInvoiceRow(data: InvoiceFormData, id: string): InvoiceRow {
  return {
    id,
    clientName: data.clientName ?? 'Unknown',
    date: new Date().toISOString().split('T')[0] ?? '',
    warrantyMonths: data.warrantyMonths,
    total: data.total,
  };
}

function mergedTechnicians(): TechnicianRow[] {
  const table = getTableTechnicians();
  const tableNames = new Set(table.map((t) => t.name.toLowerCase()));
  const invoiceOnly = getInvoiceTechnicians().filter(
    (t) => !tableNames.has(t.name.toLowerCase())
  );
  return [...table, ...invoiceOnly];
}

export default function NewInvoicePage(): React.JSX.Element {
  const { navigate } = useNavigation();

  const [initialData] = useState(() => formDraft);
  const [clients] = useState(() => getSavedClients());
  const [products] = useState(() => getSavedProducts());
  const [technicians, setTechnicians] =
    useState<TechnicianRow[]>(mergedTechnicians);
  const [warrantyOptions, setWarrantyOptions] = useState<WarrantyOption[]>(() =>
    getSavedWarrantyOptions()
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (!initialData && !formDraft) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowDiscardDialog(true);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDataChange = useCallback((data: Partial<InvoiceFormData>) => {
    formDraft = data;
  }, []);

  const handleSubmit = (data: InvoiceFormData) => {
    const id = generateId();
    addSavedInvoice(toInvoiceRow(data, id), data);
    for (const item of data.products) {
      decrementProductStock(item.productId, item.quantity);
    }
    formDraft = undefined;
    navigate('/invoices');
  };

  const handleBack = () => {
    formDraft = undefined;
    navigate('/invoices');
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
    window.history.pushState(null, '', window.location.href);
  };

  const handleAddTechnician = (name: string) => {
    // If already in the main table, skip adding to invoice-local store
    const inTable = getTableTechnicians().some(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (!inTable) {
      const tech = addInvoiceTechnician(name);
      setTechnicians((prev) =>
        prev.some((t) => t.name.toLowerCase() === name.toLowerCase())
          ? prev
          : [...prev, tech]
      );
    }
  };

  const handleSaveTechnicianToTable = (name: string) => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    const tech = addTableTechnician(name, today);
    setTechnicians((prev) =>
      prev.some((t) => t.name.toLowerCase() === name.toLowerCase())
        ? prev
        : [...prev, tech]
    );
  };

  const handleAddWarrantyOption = (label: string, months: number) => {
    const option = addSavedWarrantyOption(label, months);
    setWarrantyOptions((prev) => [...prev, option]);
  };

  return (
    <InvoiceFormScreen
      onSubmit={handleSubmit}
      initialData={initialData}
      onDataChange={handleDataChange}
      onBack={handleBack}
      showDiscardDialog={showDiscardDialog}
      onDiscardCancel={handleDiscardCancel}
      availableClients={clients}
      availableProducts={products}
      availableTechnicians={technicians}
      defaultWarrantyOptions={
        warrantyOptions.length > 0 ? warrantyOptions : undefined
      }
      onAddTechnician={handleAddTechnician}
      onSaveTechnicianToTable={handleSaveTechnicianToTable}
      onAddWarrantyOption={handleAddWarrantyOption}
    />
  );
}
