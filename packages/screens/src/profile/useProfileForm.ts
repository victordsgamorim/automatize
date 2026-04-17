import { useState, useCallback, useEffect, useRef } from 'react';
import { generateId } from '@automatize/utils';
import type { Phone, ProfileFormData } from './ProfileScreen.types';

function createEmptyPhone(): Phone {
  return {
    id: generateId(),
    phoneType: 'mobile',
    number: '',
  };
}

export interface UseProfileFormOptions {
  /** Initial data to populate the form */
  initialData?: ProfileFormData;
  /** Called whenever form data changes — use for persistence */
  onDataChange?: (data: ProfileFormData) => void;
}

export interface UseProfileFormResult {
  name: string;
  setName: (name: string) => void;
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
  getFormData: () => ProfileFormData;
  /** Resets all fields back to initialData values */
  resetForm: () => void;
}

export function useProfileForm(
  options?: UseProfileFormOptions
): UseProfileFormResult {
  const { initialData, onDataChange } = options ?? {};

  const [name, setName] = useState(initialData?.name ?? '');
  const [phones, setPhones] = useState<Phone[]>(initialData?.phones ?? []);

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onDataChange?.({ name, phones });
  }, [name, phones, onDataChange]);

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
    (): ProfileFormData => ({ name, phones }),
    [name, phones]
  );

  const resetForm = useCallback(() => {
    setName(initialData?.name ?? '');
    setPhones(initialData?.phones ?? []);
  }, [initialData]);

  return {
    name,
    setName,
    phones,
    addPhone,
    removePhone,
    insertPhoneAt,
    updatePhone,
    getFormData,
    resetForm,
  };
}
