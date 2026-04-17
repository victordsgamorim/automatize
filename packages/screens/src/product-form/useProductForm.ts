import { useState, useCallback, useEffect, useRef } from 'react';
import type { ProductFormData } from './ProductFormScreen.types';

export interface UseProductFormOptions {
  initialData?: Partial<ProductFormData>;
  onDataChange?: (data: Partial<ProductFormData>) => void;
}

export interface UseProductFormResult {
  name: string;
  setName: (name: string) => void;
  /** Price as a string to support partial input (e.g. "10.") */
  price: string;
  setPrice: (price: string) => void;
  /** Quantity as a string to support partial input */
  quantity: string;
  setQuantity: (quantity: string) => void;
  info: string;
  setInfo: (info: string) => void;
  photoUrl: string | undefined;
  setPhotoUrl: (url: string | undefined) => void;
  photoFile: File | undefined;
  setPhotoFile: (file: File | undefined) => void;
  companyId: string | undefined;
  setCompanyId: (id: string | undefined) => void;
  getFormData: () => ProductFormData;
  /** Resets all fields to their empty defaults */
  resetForm: () => void;
}

export function useProductForm(
  options?: UseProductFormOptions
): UseProductFormResult {
  const { initialData, onDataChange } = options ?? {};

  const [name, setName] = useState(initialData?.name ?? '');
  const [price, setPrice] = useState(
    initialData?.price !== undefined ? String(initialData.price) : ''
  );
  const [quantity, setQuantity] = useState(
    initialData?.quantity !== undefined ? String(initialData.quantity) : ''
  );
  const [info, setInfo] = useState(initialData?.info ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    initialData?.photoUrl
  );
  const [photoFile, setPhotoFile] = useState<File | undefined>(
    initialData?.photoFile
  );
  const [companyId, setCompanyId] = useState<string | undefined>(
    initialData?.companyId
  );

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onDataChange?.({
      name,
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity, 10) || 0,
      info,
      photoUrl,
      photoFile,
      companyId,
    });
  }, [
    name,
    price,
    quantity,
    info,
    photoUrl,
    photoFile,
    companyId,
    onDataChange,
  ]);

  const getFormData = useCallback(
    (): ProductFormData => ({
      name,
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity, 10) || 0,
      info,
      photoUrl,
      photoFile,
      companyId,
    }),
    [name, price, quantity, info, photoUrl, photoFile, companyId]
  );

  const resetForm = useCallback(() => {
    setName('');
    setPrice('');
    setQuantity('');
    setInfo('');
    setPhotoUrl(undefined);
    setPhotoFile(undefined);
    setCompanyId(undefined);
  }, []);

  return {
    name,
    setName,
    price,
    setPrice,
    quantity,
    setQuantity,
    info,
    setInfo,
    photoUrl,
    setPhotoUrl,
    photoFile,
    setPhotoFile,
    companyId,
    setCompanyId,
    getFormData,
    resetForm,
  };
}
