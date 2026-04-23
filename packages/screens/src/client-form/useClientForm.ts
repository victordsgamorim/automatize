import { useState, useCallback, useEffect, useRef } from 'react';
import { generateId } from '@automatize/utils';
import type {
  ClientType,
  Address,
  Phone,
  ClientFormData,
} from './ClientFormScreen.types';

function createEmptyAddress(): Address {
  return {
    id: generateId(),
    addressType: 'residence',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    info: '',
  };
}

function createEmptyPhone(): Phone {
  return {
    id: generateId(),
    phoneType: 'mobile',
    number: '',
  };
}

export interface UseClientFormOptions {
  /** Initial data to populate the form (e.g. restored from storage) */
  initialData?: ClientFormData;
  /** Called whenever form data changes — use for persistence */
  onDataChange?: (data: ClientFormData) => void;
}

export interface UseClientFormResult {
  clientType: ClientType;
  setClientType: (type: ClientType) => void;
  name: string;
  setName: (name: string) => void;
  document: string;
  setDocument: (document: string) => void;
  addresses: Address[];
  addAddress: (data?: Partial<Omit<Address, 'id'>>) => void;
  removeAddress: (id: string) => void;
  /** Re-inserts a complete Address at a specific index (used for undo). */
  insertAddressAt: (index: number, address: Address) => void;
  updateAddress: (
    id: string,
    field: keyof Omit<Address, 'id'>,
    value: string
  ) => void;
  phones: Phone[];
  addPhone: (data?: Partial<Omit<Phone, 'id'>>) => void;
  removePhone: (id: string) => void;
  /** Re-inserts a complete Phone at a specific index (used for undo). */
  insertPhoneAt: (index: number, phone: Phone) => void;
  updatePhone: (
    id: string,
    field: keyof Omit<Phone, 'id'>,
    value: string
  ) => void;
  getFormData: () => ClientFormData;
  /** Resets all form fields to their empty defaults */
  resetForm: () => void;
}

export function useClientForm(
  options?: UseClientFormOptions
): UseClientFormResult {
  const { initialData, onDataChange } = options ?? {};

  const [clientType, setClientTypeState] = useState<ClientType>(
    initialData?.clientType ?? 'individual'
  );
  const [name, setName] = useState(initialData?.name ?? '');

  // Each type caches its own document so switching back restores the previous value.
  const [individualDoc, setIndividualDoc] = useState(
    initialData?.clientType !== 'business' ? (initialData?.document ?? '') : ''
  );
  const [businessDoc, setBusinessDoc] = useState(
    initialData?.clientType === 'business' ? (initialData?.document ?? '') : ''
  );

  const document = clientType === 'individual' ? individualDoc : businessDoc;
  const setDocument = useCallback(
    (value: string) => {
      if (clientType === 'individual') {
        setIndividualDoc(value);
      } else {
        setBusinessDoc(value);
      }
    },
    [clientType]
  );

  const [addresses, setAddresses] = useState<Address[]>(
    initialData?.addresses ?? []
  );
  const [phones, setPhones] = useState<Phone[]>(initialData?.phones ?? []);

  // Track whether we've mounted to avoid firing onDataChange with initial values
  const mountedRef = useRef(false);

  // Sync form state when initialData changes after mount (e.g. async remote load)
  const appliedInitialDataRef = useRef<ClientFormData | undefined>(initialData);
  useEffect(() => {
    if (!initialData || initialData === appliedInitialDataRef.current) return;
    appliedInitialDataRef.current = initialData;
    const type = initialData.clientType ?? 'individual';
    setClientTypeState(type);
    setName(initialData.name ?? '');
    if (type === 'business') {
      setBusinessDoc(initialData.document ?? '');
      setIndividualDoc('');
    } else {
      setIndividualDoc(initialData.document ?? '');
      setBusinessDoc('');
    }
    setAddresses(initialData.addresses ?? []);
    setPhones(initialData.phones ?? []);
  }, [initialData]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onDataChange?.({
      clientType,
      name,
      document: clientType === 'individual' ? individualDoc : businessDoc,
      addresses,
      phones,
    });
  }, [
    clientType,
    name,
    individualDoc,
    businessDoc,
    addresses,
    phones,
    onDataChange,
  ]);

  const setClientType = useCallback((type: ClientType) => {
    setClientTypeState(type);
    // No clearing — each type has its own cached document.
  }, []);

  const addAddress = useCallback((data?: Partial<Omit<Address, 'id'>>) => {
    setAddresses((prev) => [...prev, { ...createEmptyAddress(), ...data }]);
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const insertAddressAt = useCallback((index: number, address: Address) => {
    setAddresses((prev) => {
      const next = [...prev];
      next.splice(index, 0, address);
      return next;
    });
  }, []);

  const updateAddress = useCallback(
    (id: string, field: keyof Omit<Address, 'id'>, value: string) => {
      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
      );
    },
    []
  );

  const addPhone = useCallback((data?: Partial<Omit<Phone, 'id'>>) => {
    setPhones((prev) => [...prev, { ...createEmptyPhone(), ...data }]);
  }, []);

  const removePhone = useCallback((id: string) => {
    setPhones((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const insertPhoneAt = useCallback((index: number, phone: Phone) => {
    setPhones((prev) => {
      const next = [...prev];
      next.splice(index, 0, phone);
      return next;
    });
  }, []);

  const updatePhone = useCallback(
    (id: string, field: keyof Omit<Phone, 'id'>, value: string) => {
      setPhones((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    },
    []
  );

  const getFormData = useCallback(
    (): ClientFormData => ({
      clientType,
      name,
      document: clientType === 'individual' ? individualDoc : businessDoc,
      addresses,
      phones,
    }),
    [clientType, name, individualDoc, businessDoc, addresses, phones]
  );

  const resetForm = useCallback(() => {
    setClientTypeState('individual');
    setName('');
    setIndividualDoc('');
    setBusinessDoc('');
    setAddresses([]);
    setPhones([]);
  }, []);

  return {
    clientType,
    setClientType,
    name,
    setName,
    document,
    setDocument,
    addresses,
    addAddress,
    removeAddress,
    insertAddressAt,
    updateAddress,
    phones,
    addPhone,
    removePhone,
    insertPhoneAt,
    updatePhone,
    getFormData,
    resetForm,
  };
}
