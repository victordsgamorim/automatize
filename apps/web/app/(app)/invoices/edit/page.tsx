'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation } from '@automatize/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  PrimaryButton,
  SecondaryButton,
  Kbd,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/localization';
import { InvoiceFormScreen } from '@automatize/screens/invoice-form/web';
import type {
  InvoiceFormData,
  WarrantyOption,
} from '@automatize/screens/invoice-form/web';
import type { InvoiceRow } from '@automatize/screens/invoice/web';
import type {
  ClientAddress,
  ClientPhone,
} from '@automatize/screens/client/web';
import {
  addAddressToClient,
  addPhoneToClient,
} from '../../clients/clientStore';
import { useClients } from '../../clients/useClients';
import {
  getSavedProducts,
  decrementProductStock,
  incrementProductStock,
} from '../../products/productStore';
import {
  getInvoiceIdToEdit,
  getInvoiceFormData,
  getInvoiceDate,
  updateSavedInvoice,
  clearInvoiceToEdit,
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

function toInvoiceRow(
  data: InvoiceFormData,
  id: string,
  originalDate: string
): InvoiceRow {
  return {
    id,
    clientName: data.clientName ?? 'Unknown',
    date: originalDate,
    warrantyMonths: data.warrantyMonths,
    total: data.total,
    clientPhones: data.clientPhones,
    clientAddresses: data.clientAddresses,
    products: data.products.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
    })),
    technicians: data.technicians
      .filter((tech) => tech.active)
      .map((tech) => ({ id: tech.id, name: tech.name })),
    additionalInfo: data.additionalInfo,
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

export default function EditInvoicePage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const invoiceId = getInvoiceIdToEdit();
  const [initialData] = useState<InvoiceFormData | undefined>(() => {
    if (invoiceId) return getInvoiceFormData(invoiceId);
    return formDraft as InvoiceFormData | undefined;
  });

  const clients = useClients();
  const [products] = useState(() => getSavedProducts());
  const [technicians, setTechnicians] =
    useState<TechnicianRow[]>(mergedTechnicians);
  const [warrantyOptions, setWarrantyOptions] = useState<WarrantyOption[]>(() =>
    getSavedWarrantyOptions()
  );

  const [pendingData, setPendingData] = useState<InvoiceFormData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = useCallback(() => {
    if (!invoiceId || !pendingData) return;
    const originalDate =
      getInvoiceDate(invoiceId) ?? new Date().toISOString().split('T')[0] ?? '';
    // Restore stock from the original invoice before applying the new quantities
    const oldData = getInvoiceFormData(invoiceId);
    if (oldData) {
      for (const item of oldData.products) {
        incrementProductStock(item.productId, item.quantity);
      }
    }
    for (const item of pendingData.products) {
      decrementProductStock(item.productId, item.quantity);
    }
    updateSavedInvoice(
      invoiceId,
      toInvoiceRow(pendingData, invoiceId, originalDate),
      pendingData
    );
    clearInvoiceToEdit();
    formDraft = undefined;
    navigate('/invoices');
  }, [invoiceId, pendingData, navigate]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingData(null);
  }, []);

  const handleBack = () => {
    formDraft = undefined;
    clearInvoiceToEdit();
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

  const handleSaveAddressToClient = useCallback(
    (_clientId: string, address: ClientAddress) => {
      addAddressToClient(_clientId, address);
    },
    []
  );

  const handleSavePhoneToClient = useCallback(
    (_clientId: string, phone: ClientPhone) => {
      addPhoneToClient(_clientId, phone);
    },
    []
  );

  // Keyboard shortcuts for the confirm dialog
  useEffect(() => {
    if (!showConfirmDialog) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelConfirm();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showConfirmDialog, handleConfirm, handleCancelConfirm]);

  return (
    <>
      <InvoiceFormScreen
        mode="edit"
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
        onSaveAddressToClient={handleSaveAddressToClient}
        onSavePhoneToClient={handleSavePhoneToClient}
        onAddWarrantyOption={handleAddWarrantyOption}
      />

      {/* Confirm edit dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          if (!open) handleCancelConfirm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('invoice.submit.edit')}</DialogTitle>
            <DialogDescription>
              {t('invoice.form.description.edit')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleCancelConfirm}>
              {t('invoice.cancel')}
              <Kbd keyLabel="Esc" />
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleConfirm}>
              {t('invoice.submit.edit')}
              <Kbd keyLabel="Enter" />
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
