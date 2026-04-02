import { useState, useCallback } from 'react';
import { generateId } from '@automatize/utils';
import type {
  ClientType,
  Address,
  Phone,
  ClientFormData,
} from './ClientScreen.types';

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

export interface UseClientResult {
  clientType: ClientType;
  setClientType: (type: ClientType) => void;
  name: string;
  setName: (name: string) => void;
  document: string;
  setDocument: (document: string) => void;
  addresses: Address[];
  addAddress: () => void;
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
}

export function useClient(): UseClientResult {
  const [clientType, setClientTypeState] = useState<ClientType>('individual');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([createEmptyAddress()]);
  const [phones, setPhones] = useState<Phone[]>([createEmptyPhone()]);

  const setClientType = useCallback((type: ClientType) => {
    setClientTypeState(type);
    setDocument('');
  }, []);

  const addAddress = useCallback(() => {
    setAddresses((prev) => [...prev, createEmptyAddress()]);
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.length > 1 ? prev.filter((a) => a.id !== id) : prev
    );
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
  };
}
