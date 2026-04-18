import {
  useState,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

export type DialogPhoneType = 'mobile' | 'telephone';

export interface PhoneFields {
  phoneType?: DialogPhoneType;
  number: string;
}

export interface UsePhoneDialogReturn<T extends PhoneFields> {
  isOpen: boolean;
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  editingId: string | null;
  openNew: (overrides?: Partial<T>) => void;
  openEdit: (item: T & { id: string }) => void;
  close: () => void;
  reset: () => void;
}

export function usePhoneDialog<T extends PhoneFields>(
  defaults: T
): UsePhoneDialogReturn<T> {
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
