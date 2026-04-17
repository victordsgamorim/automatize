import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useProductForm } from '../useProductForm';
import type { ProductFormData } from '../ProductFormScreen.types';

describe('useProductForm', () => {
  describe('initial state (no initialData)', () => {
    it('starts with empty string fields', () => {
      const { result } = renderHook(() => useProductForm());
      expect(result.current.name).toBe('');
      expect(result.current.price).toBe('');
      expect(result.current.quantity).toBe('');
      expect(result.current.info).toBe('');
    });

    it('starts with undefined optional fields', () => {
      const { result } = renderHook(() => useProductForm());
      expect(result.current.photoUrl).toBeUndefined();
      expect(result.current.photoFile).toBeUndefined();
      expect(result.current.companyId).toBeUndefined();
    });
  });

  describe('initialData', () => {
    const savedData: ProductFormData = {
      name: 'Widget Pro',
      price: 49.99,
      quantity: 20,
      info: 'Best widget ever',
      photoUrl: 'https://example.com/photo.jpg',
      companyId: 'company-1',
    };

    it('restores all fields from initialData', () => {
      const { result } = renderHook(() =>
        useProductForm({ initialData: savedData })
      );
      expect(result.current.name).toBe('Widget Pro');
      expect(result.current.price).toBe('49.99');
      expect(result.current.quantity).toBe('20');
      expect(result.current.info).toBe('Best widget ever');
      expect(result.current.photoUrl).toBe('https://example.com/photo.jpg');
      expect(result.current.companyId).toBe('company-1');
    });

    it('converts price 0 to empty string when undefined', () => {
      const { result } = renderHook(() =>
        useProductForm({
          initialData: { name: 'A', price: 0, quantity: 0, info: '' },
        })
      );
      expect(result.current.price).toBe('0');
      expect(result.current.quantity).toBe('0');
    });
  });

  describe('onDataChange', () => {
    it('does not fire on initial mount', () => {
      const onDataChange = vi.fn();
      renderHook(() => useProductForm({ onDataChange }));
      expect(onDataChange).not.toHaveBeenCalled();
    });

    it('fires when name changes after mount', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useProductForm({ onDataChange }));
      act(() => {
        result.current.setName('New Name');
      });
      expect(onDataChange).toHaveBeenCalledTimes(1);
      expect(onDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Name' })
      );
    });

    it('fires with numeric price in callback', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useProductForm({ onDataChange }));
      act(() => {
        result.current.setPrice('12.50');
      });
      expect(onDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ price: 12.5 })
      );
    });

    it('fires with integer quantity in callback', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useProductForm({ onDataChange }));
      act(() => {
        result.current.setQuantity('7');
      });
      expect(onDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 7 })
      );
    });
  });

  describe('resetForm', () => {
    it('resets all fields to empty defaults', () => {
      const { result } = renderHook(() =>
        useProductForm({
          initialData: {
            name: 'Widget',
            price: 10,
            quantity: 5,
            info: 'info',
            photoUrl: 'https://example.com/photo.jpg',
            companyId: 'c1',
          },
        })
      );

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.name).toBe('');
      expect(result.current.price).toBe('');
      expect(result.current.quantity).toBe('');
      expect(result.current.info).toBe('');
      expect(result.current.photoUrl).toBeUndefined();
      expect(result.current.photoFile).toBeUndefined();
      expect(result.current.companyId).toBeUndefined();
    });
  });

  describe('state setters', () => {
    it('setName updates name', () => {
      const { result } = renderHook(() => useProductForm());
      act(() => {
        result.current.setName('Updated Name');
      });
      expect(result.current.name).toBe('Updated Name');
    });

    it('setPrice updates price string', () => {
      const { result } = renderHook(() => useProductForm());
      act(() => {
        result.current.setPrice('99.99');
      });
      expect(result.current.price).toBe('99.99');
    });

    it('setQuantity updates quantity string', () => {
      const { result } = renderHook(() => useProductForm());
      act(() => {
        result.current.setQuantity('42');
      });
      expect(result.current.quantity).toBe('42');
    });

    it('setInfo updates info', () => {
      const { result } = renderHook(() => useProductForm());
      act(() => {
        result.current.setInfo('New info text');
      });
      expect(result.current.info).toBe('New info text');
    });

    it('setCompanyId updates companyId', () => {
      const { result } = renderHook(() => useProductForm());
      act(() => {
        result.current.setCompanyId('company-42');
      });
      expect(result.current.companyId).toBe('company-42');
    });

    it('setPhotoUrl updates photoUrl', () => {
      const { result } = renderHook(() => useProductForm());
      act(() => {
        result.current.setPhotoUrl('blob:http://localhost/abc');
      });
      expect(result.current.photoUrl).toBe('blob:http://localhost/abc');
    });

    it('setPhotoFile updates photoFile', () => {
      const { result } = renderHook(() => useProductForm());
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      act(() => {
        result.current.setPhotoFile(file);
      });
      expect(result.current.photoFile).toBe(file);
    });
  });

  describe('getFormData', () => {
    it('returns snapshot with parsed numeric values', () => {
      const { result } = renderHook(() => useProductForm());

      act(() => {
        result.current.setName('Gadget');
        result.current.setPrice('19.95');
        result.current.setQuantity('3');
        result.current.setInfo('A cool gadget');
        result.current.setCompanyId('c-1');
      });

      const data = result.current.getFormData();
      expect(data).toEqual({
        name: 'Gadget',
        price: 19.95,
        quantity: 3,
        info: 'A cool gadget',
        photoUrl: undefined,
        photoFile: undefined,
        companyId: 'c-1',
      });
    });

    it('returns 0 for price and quantity when fields are empty', () => {
      const { result } = renderHook(() => useProductForm());
      const data = result.current.getFormData();
      expect(data.price).toBe(0);
      expect(data.quantity).toBe(0);
    });

    it('returns 0 for invalid price input', () => {
      const { result } = renderHook(() => useProductForm());
      act(() => {
        result.current.setPrice('abc');
      });
      expect(result.current.getFormData().price).toBe(0);
    });
  });

  describe('sessionStorage integration (page-level)', () => {
    const STORAGE_KEY = 'automatize:product-form-draft';

    beforeEach(() => {
      sessionStorage.clear();
    });

    it('round-trips form data through sessionStorage via onDataChange', () => {
      const handleChange = (data: Partial<ProductFormData>) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      };

      const { result } = renderHook(() =>
        useProductForm({ onDataChange: handleChange })
      );

      act(() => {
        result.current.setName('Stored Product');
        result.current.setPrice('25.00');
      });

      const raw = sessionStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const stored = JSON.parse(raw ?? '{}') as Partial<ProductFormData>;
      expect(stored.name).toBe('Stored Product');
      expect(stored.price).toBe(25);

      const { result: restored } = renderHook(() =>
        useProductForm({ initialData: stored })
      );

      expect(restored.current.name).toBe('Stored Product');
      expect(restored.current.price).toBe('25');
    });
  });
});
