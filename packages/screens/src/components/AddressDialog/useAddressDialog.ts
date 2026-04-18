import {
  useState,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

export type DialogAddressType = 'residence' | 'establishment';

export interface AddressFields {
  addressType?: DialogAddressType;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  info?: string;
}

export interface UseAddressDialogReturn<T extends AddressFields> {
  isOpen: boolean;
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  editingId: string | null;
  openNew: (overrides?: Partial<T>) => void;
  openEdit: (item: T & { id: string }) => void;
  close: () => void;
  reset: () => void;
}

export function useAddressDialog<T extends AddressFields>(
  defaults: T
): UseAddressDialogReturn<T> {
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T>(defaults);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openNew = useCallback((overrides?: Partial<T>) => {
    setEditingId(null);
    setData({ ...defaultsRef.current, ...overrides } as T);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: T & { id: string }) => {
    setEditingId(item.id);
    const { id: _id, ...fields } = item;
    setData(fields as unknown as T);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const reset = useCallback(() => {
    setIsOpen(false);
    setData(defaultsRef.current);
    setEditingId(null);
  }, []);

  return { isOpen, data, setData, editingId, openNew, openEdit, close, reset };
}
