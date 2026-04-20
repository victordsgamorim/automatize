import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { generateId } from '@automatize/utils';
import type {
  ClientRow,
  ClientAddress,
  ClientPhone,
  ProductRow,
  TechnicianRow,
  InvoiceProductItem,
  InvoiceTechnician,
  InvoiceFormData,
} from './InvoiceFormScreen.types';

export interface UseInvoiceFormOptions {
  initialData?: Partial<InvoiceFormData>;
  onDataChange?: (data: Partial<InvoiceFormData>) => void;
}

export interface UseInvoiceFormResult {
  // Client
  clientId: string | undefined;
  clientName: string | undefined;
  clientAddresses: ClientAddress[];
  clientPhones: ClientPhone[];
  selectClient: (client: ClientRow) => void;
  clearClient: () => void;
  pickClientAddress: (address: ClientAddress) => void;
  addClientAddress: (data: Omit<ClientAddress, 'id'>) => void;
  removeClientAddress: (id: string) => void;
  pickClientPhone: (phone: ClientPhone) => void;
  addClientPhone: (data: Omit<ClientPhone, 'id'>) => void;
  removeClientPhone: (id: string) => void;

  // Products
  products: InvoiceProductItem[];
  addProduct: (product: ProductRow) => void;
  removeProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;
  incrementProductQuantity: (id: string) => void;
  decrementProductQuantity: (id: string) => void;

  // Technicians
  technicians: InvoiceTechnician[];
  addTechnician: (tech: TechnicianRow | { id: string; name: string }) => void;
  removeTechnician: (id: string) => void;
  toggleTechnician: (id: string) => void;
  addNewTechnician: (name: string) => void;

  // Warranty & info
  warrantyMonths: number;
  setWarrantyMonths: (months: number) => void;
  additionalInfo: string;
  setAdditionalInfo: (info: string) => void;

  // Derived
  total: number;

  // Form
  getFormData: () => InvoiceFormData;
  resetForm: () => void;
}

export function useInvoiceForm(
  options?: UseInvoiceFormOptions
): UseInvoiceFormResult {
  const { initialData, onDataChange } = options ?? {};

  const [clientId, setClientId] = useState<string | undefined>(
    initialData?.clientId
  );
  const [clientName, setClientName] = useState<string | undefined>(
    initialData?.clientName
  );
  const [clientAddresses, setClientAddresses] = useState<ClientAddress[]>(
    initialData?.clientAddresses ?? []
  );
  const [clientPhones, setClientPhones] = useState<ClientPhone[]>(
    initialData?.clientPhones ?? []
  );
  const [products, setProducts] = useState<InvoiceProductItem[]>(
    initialData?.products ?? []
  );
  const [technicians, setTechnicians] = useState<InvoiceTechnician[]>(
    initialData?.technicians ?? []
  );
  const [warrantyMonths, setWarrantyMonths] = useState<number>(
    initialData?.warrantyMonths ?? 0
  );
  const [additionalInfo, setAdditionalInfo] = useState<string>(
    initialData?.additionalInfo ?? ''
  );

  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0),
    [products]
  );

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onDataChange?.({
      clientId,
      clientName,
      clientAddresses,
      clientPhones,
      products,
      technicians,
      warrantyMonths,
      additionalInfo,
      total,
    });
  }, [
    clientId,
    clientName,
    clientAddresses,
    clientPhones,
    products,
    technicians,
    warrantyMonths,
    additionalInfo,
    total,
    onDataChange,
  ]);

  // ── Client ────────────────────────────────────────────────────────────────

  const selectClient = useCallback((client: ClientRow) => {
    setClientId(client.id);
    setClientName(client.name);
    // Don't auto-copy: user selects addresses and phones via dropdowns
    setClientAddresses([]);
    setClientPhones([]);
  }, []);

  const clearClient = useCallback(() => {
    setClientId(undefined);
    setClientName(undefined);
    setClientAddresses([]);
    setClientPhones([]);
  }, []);

  /** Select one address from client's saved list (preserves ID, replaces any existing). */
  const pickClientAddress = useCallback((address: ClientAddress) => {
    setClientAddresses([address]);
  }, []);

  /** Add a custom address entered via dialog (replaces any existing — single address UX). */
  const addClientAddress = useCallback((data: Omit<ClientAddress, 'id'>) => {
    setClientAddresses([{ ...data, id: generateId() }]);
  }, []);

  const removeClientAddress = useCallback((id: string) => {
    setClientAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  /** Toggle a phone from client's saved list (preserves ID, multi-select). */
  const pickClientPhone = useCallback((phone: ClientPhone) => {
    setClientPhones((prev) => {
      const exists = prev.some((p) => p.number === phone.number);
      if (exists) return prev.filter((p) => p.number !== phone.number);
      return [...prev, phone];
    });
  }, []);

  const addClientPhone = useCallback((data: Omit<ClientPhone, 'id'>) => {
    setClientPhones((prev) => [...prev, { ...data, id: generateId() }]);
  }, []);

  const removeClientPhone = useCallback((id: string) => {
    setClientPhones((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Products ──────────────────────────────────────────────────────────────

  const addProduct = useCallback((product: ProductRow) => {
    setProducts((prev) => {
      if (prev.some((p) => p.productId === product.id)) return prev;
      const item: InvoiceProductItem = {
        id: generateId(),
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: 1,
        availableStock: product.quantity,
        totalPrice: product.price,
      };
      return [...prev, item];
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProductQuantity = useCallback((id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const clamped = Math.max(1, Math.min(quantity, p.availableStock));
        return { ...p, quantity: clamped, totalPrice: p.unitPrice * clamped };
      })
    );
  }, []);

  const incrementProductQuantity = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = Math.min(p.quantity + 1, p.availableStock);
        return { ...p, quantity: next, totalPrice: p.unitPrice * next };
      })
    );
  }, []);

  const decrementProductQuantity = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = Math.max(p.quantity - 1, 1);
        return { ...p, quantity: next, totalPrice: p.unitPrice * next };
      })
    );
  }, []);

  // ── Technicians ───────────────────────────────────────────────────────────

  const addTechnician = useCallback(
    (tech: TechnicianRow | { id: string; name: string }) => {
      setTechnicians((prev) => {
        if (prev.some((t) => t.id === tech.id)) return prev;
        return [...prev, { id: tech.id, name: tech.name, active: true }];
      });
    },
    []
  );

  const removeTechnician = useCallback((id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTechnician = useCallback((id: string) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  }, []);

  const addNewTechnician = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTechnicians((prev) => [
      ...prev,
      { id: generateId(), name: trimmed, active: true },
    ]);
  }, []);

  // ── Form ──────────────────────────────────────────────────────────────────

  const getFormData = useCallback(
    (): InvoiceFormData => ({
      clientId,
      clientName,
      clientAddresses,
      clientPhones,
      products,
      technicians,
      warrantyMonths,
      additionalInfo,
      total,
    }),
    [
      clientId,
      clientName,
      clientAddresses,
      clientPhones,
      products,
      technicians,
      warrantyMonths,
      additionalInfo,
      total,
    ]
  );

  const resetForm = useCallback(() => {
    setClientId(undefined);
    setClientName(undefined);
    setClientAddresses([]);
    setClientPhones([]);
    setProducts([]);
    setTechnicians([]);
    setWarrantyMonths(0);
    setAdditionalInfo('');
  }, []);

  return {
    clientId,
    clientName,
    clientAddresses,
    clientPhones,
    selectClient,
    clearClient,
    pickClientAddress,
    addClientAddress,
    removeClientAddress,
    pickClientPhone,
    addClientPhone,
    removeClientPhone,
    products,
    addProduct,
    removeProduct,
    updateProductQuantity,
    incrementProductQuantity,
    decrementProductQuantity,
    technicians,
    addTechnician,
    removeTechnician,
    toggleTechnician,
    addNewTechnician,
    warrantyMonths,
    setWarrantyMonths,
    additionalInfo,
    setAdditionalInfo,
    total,
    getFormData,
    resetForm,
  };
}
