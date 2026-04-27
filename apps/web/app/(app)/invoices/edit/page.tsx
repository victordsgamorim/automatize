'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
import { useInvoiceContext } from '@automatize/screens/invoice/web';
import type {
  ClientAddress,
  ClientPhone,
} from '@automatize/screens/client/web';
import type { TechnicianRow } from '@automatize/screens/technician/web';
import {
  addAddressToClient,
  addPhoneToClient,
} from '../../clients/clientStore';
import { useClientsRows } from '../../clients/hooks';
import { useProductsRows } from '../../products/hooks';
import { useTechniciansRows } from '../../technician/hooks';
import {
  getInvoiceFormData,
  getInvoiceDate,
  updateSavedInvoice,
  getSavedWarrantyOptions,
  addSavedWarrantyOption,
} from '../invoiceStore';
import { addSavedTechnician as addTableTechnician } from '../../technician/technicianStore';
import {
  decrementProductStock,
  incrementProductStock,
} from '../../products/productStore';
import { useInvoice, invoiceToFormData } from '../hooks';
import { generateId } from '@automatize/utils';

let formDraft: Partial<InvoiceFormData> | undefined;

function invoiceRowToFormData(row: InvoiceRow): InvoiceFormData {
  return {
    clientName: row.clientName,
    clientAddresses: (row.clientAddresses ?? []).map((a) => ({
      id: a.id,
      addressType: a.addressType ?? 'residence',
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      info: a.info ?? '',
    })),
    clientPhones: (row.clientPhones ?? []).map((p) => ({
      id: p.id,
      phoneType: p.phoneType ?? 'mobile',
      number: p.number,
    })),
    products: (row.products ?? []).map((p) => ({
      id: p.id,
      productId: p.id,
      name: p.name,
      unitPrice: p.unitPrice,
      quantity: p.quantity,
      availableStock: p.quantity,
      totalPrice: p.totalPrice,
    })),
    technicians: (row.technicians ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      active: true,
    })),
    warrantyMonths: row.warrantyMonths,
    additionalInfo: row.additionalInfo ?? '',
    total: row.total,
  };
}

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

export default function EditInvoicePage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const { invoiceIdToEdit, clearInvoiceToEdit, invoices } = useInvoiceContext();
  const { data: remoteInvoice } = useInvoice(invoiceIdToEdit ?? '');

  const [initialData, setInitialData] = useState<InvoiceFormData | undefined>(
    () => {
      if (invoiceIdToEdit) {
        const fromStore = getInvoiceFormData(invoiceIdToEdit);
        if (fromStore) return fromStore;
        const fromList = invoices.find((inv) => inv.id === invoiceIdToEdit);
        if (fromList) return invoiceRowToFormData(fromList);
      }
      return formDraft as InvoiceFormData | undefined;
    }
  );

  useEffect(() => {
    if (invoiceIdToEdit && remoteInvoice && !initialData) {
      setInitialData(invoiceToFormData(remoteInvoice));
    }
  }, [invoiceIdToEdit, remoteInvoice, initialData]);

  const clients = useClientsRows();
  const products = useProductsRows();
  const remoteTechs = useTechniciansRows();
  const [localTechs, setLocalTechs] = useState<TechnicianRow[]>([]);
  const technicians = useMemo(() => {
    const names = new Set(remoteTechs.map((t) => t.name.toLowerCase()));
    return [
      ...remoteTechs,
      ...localTechs.filter((t) => !names.has(t.name.toLowerCase())),
    ];
  }, [remoteTechs, localTechs]);

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
    if (!invoiceIdToEdit || !pendingData) return;
    const originalDate =
      getInvoiceDate(invoiceIdToEdit) ??
      new Date().toISOString().split('T')[0] ??
      '';
    const oldData = getInvoiceFormData(invoiceIdToEdit);
    if (oldData) {
      for (const item of oldData.products) {
        incrementProductStock(item.productId, item.quantity);
      }
    }
    for (const item of pendingData.products) {
      decrementProductStock(item.productId, item.quantity);
    }
    updateSavedInvoice(
      invoiceIdToEdit,
      toInvoiceRow(pendingData, invoiceIdToEdit, originalDate),
      pendingData
    );
    clearInvoiceToEdit();
    formDraft = undefined;
    navigate('/invoices');
  }, [invoiceIdToEdit, pendingData, clearInvoiceToEdit, navigate]);

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
    const alreadyInList = technicians.some(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (!alreadyInList) {
      setLocalTechs((prev) => [
        ...prev,
        {
          id: generateId(),
          name,
          entryDate: new Date().toISOString().split('T')[0] ?? '',
        },
      ]);
    }
  };

  const handleSaveTechnicianToTable = (name: string) => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    addTableTechnician(name, today);
    setLocalTechs((prev) =>
      prev.filter((t) => t.name.toLowerCase() !== name.toLowerCase())
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
