'use client';

import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  InvoiceProductItem,
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
import {
  useClientsRows,
  addAddressToClientInCache,
  addPhoneToClientInCache,
} from '../../clients/hooks';
import {
  useProductsRows,
  adjustProductStockInCache,
} from '../../products/hooks';
import {
  useTechniciansRows,
  addTechnicianToCache,
} from '../../technician/hooks';
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
import { useInvoice, invoiceToFormData, updateInvoiceInCache } from '../hooks';
import { generateId } from '@automatize/utils';

let formDraft: Partial<InvoiceFormData> | undefined;

function invoiceRowToFormData(row: InvoiceRow): InvoiceFormData {
  const result: InvoiceFormData = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    clientId: row.clientId,
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
  return result;
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
  const queryClient = useQueryClient();

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
  const [formKey, setFormKey] = useState(0);
  const remoteResolvedRef = useRef(!!getInvoiceFormData(invoiceIdToEdit ?? ''));

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

  const prevDraftProductsRef = useRef<InvoiceProductItem[]>(
    initialData?.products ?? []
  );
  // Net stock delta applied during this edit session — used to reverse on cancel.
  const sessionDeltaRef = useRef<Map<string, number>>(new Map());

  // Resolve full initial data (clientId + correct productId/availableStock) once both
  // remote invoice and product catalog are loaded.
  useEffect(() => {
    if (remoteResolvedRef.current) return;
    if (!invoiceIdToEdit || !remoteInvoice || products.length === 0) return;

    remoteResolvedRef.current = true;
    const formData = invoiceToFormData(remoteInvoice);
    const resolvedProducts = formData.products.map((p) => {
      const catalogProduct = products.find((pr) => pr.id === p.productId);
      return catalogProduct
        ? { ...p, availableStock: catalogProduct.quantity }
        : p;
    });

    setInitialData({ ...formData, products: resolvedProducts });
    setFormKey((k) => k + 1);
  }, [invoiceIdToEdit, remoteInvoice, products]);

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

    const nextProducts = data.products ?? [];
    const prevProducts = prevDraftProductsRef.current;
    const prevMap = new Map(prevProducts.map((p) => [p.productId, p.quantity]));
    const nextMap = new Map(nextProducts.map((p) => [p.productId, p.quantity]));

    for (const [productId, qty] of prevMap) {
      if (!nextMap.has(productId)) {
        incrementProductStock(productId, qty);
        sessionDeltaRef.current.set(
          productId,
          (sessionDeltaRef.current.get(productId) ?? 0) + qty
        );
      }
    }
    for (const [productId, qty] of nextMap) {
      if (!prevMap.has(productId)) {
        decrementProductStock(productId, qty);
        sessionDeltaRef.current.set(
          productId,
          (sessionDeltaRef.current.get(productId) ?? 0) - qty
        );
      }
    }
    for (const [productId, nextQty] of nextMap) {
      const prevQty = prevMap.get(productId);
      if (prevQty !== undefined && prevQty !== nextQty) {
        const diff = nextQty - prevQty;
        if (diff > 0) {
          decrementProductStock(productId, diff);
          sessionDeltaRef.current.set(
            productId,
            (sessionDeltaRef.current.get(productId) ?? 0) - diff
          );
        } else {
          incrementProductStock(productId, -diff);
          sessionDeltaRef.current.set(
            productId,
            (sessionDeltaRef.current.get(productId) ?? 0) + -diff
          );
        }
      }
    }

    prevDraftProductsRef.current = nextProducts;
  }, []);

  const handleSubmit = (data: InvoiceFormData) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingData(null);

    if (!invoiceIdToEdit || !pendingData) {
      clearInvoiceToEdit();
      formDraft = undefined;
      navigate('/invoices');
      return;
    }

    try {
      const originalDate =
        getInvoiceDate(invoiceIdToEdit) ??
        new Date().toISOString().split('T')[0] ??
        '';

      // Stock already adjusted incrementally in handleDataChange.
      // Sync the net session delta into the RQ cache now.
      for (const [productId, delta] of sessionDeltaRef.current) {
        adjustProductStockInCache(queryClient, productId, delta);
      }

      updateSavedInvoice(
        invoiceIdToEdit,
        toInvoiceRow(pendingData, invoiceIdToEdit, originalDate),
        pendingData
      );

      if (remoteInvoice) {
        updateInvoiceInCache(queryClient, invoiceIdToEdit, {
          ...remoteInvoice,
          clientId: pendingData.clientId,
          clientName: pendingData.clientName ?? remoteInvoice.clientName,
          warrantyMonths: pendingData.warrantyMonths,
          total: pendingData.total,
          additionalInfo: pendingData.additionalInfo,
          clientAddresses: pendingData.clientAddresses.map((a) => ({ ...a })),
          clientPhones: pendingData.clientPhones.map((p) => ({ ...p })),
          products: pendingData.products.map((p) => ({
            id: p.id,
            productId: p.productId,
            name: p.name,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            totalPrice: p.totalPrice,
          })),
          technicians: pendingData.technicians
            .filter((tech) => tech.active)
            .map((tech) => ({ id: tech.id, name: tech.name })),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      console.error('Failed to update invoice');
    }

    sessionDeltaRef.current = new Map();
    prevDraftProductsRef.current = [];
    clearInvoiceToEdit();
    formDraft = undefined;
    navigate('/invoices');
  }, [
    invoiceIdToEdit,
    pendingData,
    remoteInvoice,
    queryClient,
    clearInvoiceToEdit,
    navigate,
  ]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingData(null);
  }, []);

  const handleBack = () => {
    // Reverse all stock changes made during this edit session.
    for (const [productId, delta] of sessionDeltaRef.current) {
      if (delta < 0) incrementProductStock(productId, -delta);
      else if (delta > 0) decrementProductStock(productId, delta);
    }
    sessionDeltaRef.current = new Map();
    prevDraftProductsRef.current = [];
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
    addTechnicianToCache(queryClient, name, today);
    setLocalTechs((prev) =>
      prev.filter((t) => t.name.toLowerCase() !== name.toLowerCase())
    );
  };

  const handleAddWarrantyOption = (label: string, months: number) => {
    const option = addSavedWarrantyOption(label, months);
    setWarrantyOptions((prev) => [...prev, option]);
  };

  // Both update the local clientStore (for store-based lookups) and the React Query
  // cache so that the client profile page and the address dropdown reflect the change.
  const handleSaveAddressToClient = useCallback(
    (clientId: string, address: ClientAddress) => {
      addAddressToClient(clientId, address);
      addAddressToClientInCache(queryClient, clientId, address);
    },
    [queryClient]
  );

  const handleSavePhoneToClient = useCallback(
    (clientId: string, phone: ClientPhone) => {
      addPhoneToClient(clientId, phone);
      addPhoneToClientInCache(queryClient, clientId, phone);
    },
    [queryClient]
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
        key={formKey}
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
