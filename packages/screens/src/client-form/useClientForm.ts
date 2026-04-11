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
  updateAddress: (
    id: string,
    field: keyof Omit<Address, 'id'>,
    value: string
  ) => void;
  phones: Phone[];
  addPhone: () => void;
  removePhone: (id: string) => void;
  updatePhone: (id: string, value: string) => void;
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
  const [document, setDocument] = useState(initialData?.document ?? '');
  const [addresses, setAddresses] = useState<Address[]>(
    initialData?.addresses ?? []
  );
  const [phones, setPhones] = useState<Phone[]>(
    initialData?.phones?.length ? initialData.phones : [createEmptyPhone()]
  );

  // Track whether we've mounted to avoid firing onDataChange with initial values
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onDataChange?.({ clientType, name, document, addresses, phones });
  }, [clientType, name, document, addresses, phones, onDataChange]);

  const setClientType = useCallback((type: ClientType) => {
    setClientTypeState(type);
    setDocument('');
  }, []);

  const addAddress = useCallback((data?: Partial<Omit<Address, 'id'>>) => {
    setAddresses((prev) => [...prev, { ...createEmptyAddress(), ...data }]);
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAddress = useCallback(
    (id: string, field: keyof Omit<Address, 'id'>, value: string) => {
      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
      );
    },
    []
  );

  const addPhone = useCallback(() => {
    setPhones((prev) => [...prev, createEmptyPhone()]);
  }, []);

  const removePhone = useCallback((id: string) => {
    setPhones((prev) =>
      prev.length > 1 ? prev.filter((p) => p.id !== id) : prev
    );
  }, []);

  const updatePhone = useCallback((id: string, value: string) => {
    setPhones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, number: value } : p))
    );
  }, []);

  const getFormData = useCallback(
    (): ClientFormData => ({
      clientType,
      name,
      document,
      addresses,
      phones,
    }),
    [clientType, name, document, addresses, phones]
  );

  const resetForm = useCallback(() => {
    setClientTypeState('individual');
    setName('');
    setDocument('');
    setAddresses([]);
    setPhones([createEmptyPhone()]);
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
    updateAddress,
    phones,
    addPhone,
    removePhone,
    updatePhone,
    getFormData,
    resetForm,
  };
}
