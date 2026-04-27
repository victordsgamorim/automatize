'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@automatize/navigation';
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
import { generateId } from '@automatize/utils';
import type { TechnicianRow } from '@automatize/screens/technician/web';
import {
  addAddressToClient,
  addPhoneToClient,
} from '../../clients/clientStore';
import { useClientsRows } from '../../clients/hooks';
import { useProductsRows } from '../../products/hooks';
import { useTechniciansRows } from '../../technician/hooks';
import {
  addSavedInvoice,
  getSavedWarrantyOptions,
  addSavedWarrantyOption,
} from '../invoiceStore';
import { addSavedTechnician as addTableTechnician } from '../../technician/technicianStore';
import { decrementProductStock } from '../../products/productStore';

let formDraft: Partial<InvoiceFormData> | undefined;

function toInvoiceRow(data: InvoiceFormData, id: string): InvoiceRow {
  return {
    id,
    clientName: data.clientName ?? 'Unknown',
    date: new Date().toISOString().split('T')[0] ?? '',
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

export default function NewInvoicePage(): React.JSX.Element {
  const { navigate } = useNavigation();

  const [initialData] = useState(() => formDraft);
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
      onSaveAddressToClient={handleSaveAddressToClient}
      onSavePhoneToClient={handleSavePhoneToClient}
      onAddWarrantyOption={handleAddWarrantyOption}
    />
  );
}
