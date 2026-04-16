import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useClientForm } from '../useClientForm';
import type { ClientFormData } from '../ClientFormScreen.types';

describe('useClientForm', () => {
  describe('initial state (no initialData)', () => {
    it('starts with default values', () => {
      const { result } = renderHook(() => useClientForm());

      expect(result.current.clientType).toBe('individual');
      expect(result.current.name).toBe('');
      expect(result.current.document).toBe('');
      expect(result.current.addresses).toHaveLength(0);
      expect(result.current.phones).toHaveLength(0);
    });
  });

  describe('initialData', () => {
    const savedData: ClientFormData = {
      clientType: 'business',
      name: 'Acme Corp',
      document: '12.345.678/0001-90',
      addresses: [
        {
          id: 'addr-1',
          addressType: 'residence' as const,
          street: 'Rua A',
          number: '100',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          info: 'Sala 5',
        },
      ],
      phones: [{ id: 'phone-1', phoneType: 'mobile', number: '11999999999' }],
    };

    it('restores all fields from initialData', () => {
      const { result } = renderHook(() =>
        useClientForm({ initialData: savedData })
      );

      expect(result.current.clientType).toBe('business');
      expect(result.current.name).toBe('Acme Corp');
      expect(result.current.document).toBe('12.345.678/0001-90');
      expect(result.current.addresses).toEqual(savedData.addresses);
      expect(result.current.phones).toEqual(savedData.phones);
    });

    it('falls back to empty arrays when initialData has empty arrays', () => {
      const { result } = renderHook(() =>
        useClientForm({
          initialData: {
            clientType: 'individual',
            name: '',
            document: '',
            addresses: [],
            phones: [],
          },
        })
      );

      expect(result.current.addresses).toHaveLength(0);
      expect(result.current.phones).toHaveLength(0);
    });
  });

  describe('onDataChange', () => {
    it('does not fire on initial mount', () => {
      const onDataChange = vi.fn();
      renderHook(() => useClientForm({ onDataChange }));

      expect(onDataChange).not.toHaveBeenCalled();
    });

    it('fires when a field changes after mount', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useClientForm({ onDataChange }));

      act(() => {
        result.current.setName('João');
      });

      expect(onDataChange).toHaveBeenCalledTimes(1);
      expect(onDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'João' })
      );
    });

    it('fires with updated data on each change', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useClientForm({ onDataChange }));

      act(() => {
        result.current.setName('Ana');
      });
      act(() => {
        result.current.setDocument('123');
      });

      expect(onDataChange).toHaveBeenCalledTimes(2);
      expect(onDataChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'Ana', document: '123' })
      );
    });
  });

  describe('resetForm', () => {
    it('resets all fields to defaults', () => {
      const { result } = renderHook(() =>
        useClientForm({
          initialData: {
            clientType: 'business',
            name: 'Test',
            document: '123',
            addresses: [
              {
                id: 'a1',
                addressType: 'residence' as const,
                street: 'R',
                number: '1',
                neighborhood: 'N',
                city: 'C',
                state: 'SP',
                info: '',
              },
            ],
            phones: [{ id: 'p1', phoneType: 'mobile', number: '999' }],
          },
        })
      );

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.clientType).toBe('individual');
      expect(result.current.name).toBe('');
      expect(result.current.document).toBe('');
      expect(result.current.addresses).toHaveLength(0);
      expect(result.current.phones).toHaveLength(0);
    });
  });

  describe('state setters', () => {
    it('setClientType changes type and clears document', () => {
      const { result } = renderHook(() => useClientForm());

      act(() => {
        result.current.setDocument('123.456.789-01');
      });
      act(() => {
        result.current.setClientType('business');
      });

      expect(result.current.clientType).toBe('business');
      expect(result.current.document).toBe('');
    });

    it('addAddress adds a new empty address', () => {
      const { result } = renderHook(() => useClientForm());

      act(() => {
        result.current.addAddress();
      });

      expect(result.current.addresses).toHaveLength(1);
      expect(result.current.addresses[0].street).toBe('');
    });

    it('removeAddress removes by id', () => {
      const { result } = renderHook(() => useClientForm());
      act(() => {
        result.current.addAddress();
      });
      const firstId = result.current.addresses[0].id;

      act(() => {
        result.current.addAddress();
      });
      expect(result.current.addresses).toHaveLength(2);

      act(() => {
        result.current.removeAddress(firstId);
      });
      expect(result.current.addresses).toHaveLength(1);
      expect(result.current.addresses[0].id).not.toBe(firstId);
    });

    it('updateAddress updates a specific field', () => {
      const { result } = renderHook(() => useClientForm());
      act(() => {
        result.current.addAddress();
      });
      const id = result.current.addresses[0].id;

      act(() => {
        result.current.updateAddress(id, 'street', 'Rua Nova');
      });

      expect(result.current.addresses[0].street).toBe('Rua Nova');
    });

    it('addPhone adds a new empty phone', () => {
      const { result } = renderHook(() => useClientForm());

      act(() => {
        result.current.addPhone();
      });

      expect(result.current.phones).toHaveLength(1);
    });

    it('removePhone removes by id', () => {
      const { result } = renderHook(() => useClientForm());
      act(() => {
        result.current.addPhone();
      });
      const firstId = result.current.phones[0].id;

      act(() => {
        result.current.addPhone();
      });
      expect(result.current.phones).toHaveLength(2);

      act(() => {
        result.current.removePhone(firstId);
      });
      expect(result.current.phones).toHaveLength(1);
      expect(result.current.phones[0].id).not.toBe(firstId);
    });

    it('insertAddressAt re-inserts address at specific index', () => {
      const { result } = renderHook(() => useClientForm());
      act(() => {
        result.current.addAddress();
      });
      act(() => {
        result.current.updateAddress(
          result.current.addresses[0].id,
          'street',
          'First'
        );
      });
      const firstId = result.current.addresses[0].id;

      act(() => {
        result.current.addAddress();
      });
      act(() => {
        result.current.updateAddress(
          result.current.addresses[1].id,
          'street',
          'Second'
        );
      });

      act(() => {
        result.current.removeAddress(firstId);
      });
      expect(result.current.addresses).toHaveLength(1);
      expect(result.current.addresses[0].street).toBe('Second');

      act(() => {
        result.current.insertAddressAt(0, {
          id: firstId,
          addressType: 'residence',
          street: 'First',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          info: '',
        });
      });
      expect(result.current.addresses).toHaveLength(2);
      expect(result.current.addresses[0].street).toBe('First');
      expect(result.current.addresses[1].street).toBe('Second');
    });

    it('insertPhoneAt re-inserts phone at specific index', () => {
      const { result } = renderHook(() => useClientForm());
      act(() => {
        result.current.addPhone();
      });
      act(() => {
        result.current.updatePhone(
          result.current.phones[0].id,
          'number',
          '111'
        );
      });
      const firstId = result.current.phones[0].id;

      act(() => {
        result.current.addPhone();
      });
      act(() => {
        result.current.updatePhone(
          result.current.phones[1].id,
          'number',
          '222'
        );
      });

      act(() => {
        result.current.removePhone(firstId);
      });
      expect(result.current.phones).toHaveLength(1);
      expect(result.current.phones[0].number).toBe('222');

      act(() => {
        result.current.insertPhoneAt(0, {
          id: firstId,
          phoneType: 'mobile',
          number: '111',
        });
      });
      expect(result.current.phones).toHaveLength(2);
      expect(result.current.phones[0].number).toBe('111');
      expect(result.current.phones[1].number).toBe('222');
    });

    it('updatePhone updates phone number by id', () => {
      const { result } = renderHook(() => useClientForm());
      act(() => {
        result.current.addPhone();
      });
      const id = result.current.phones[0].id;

      act(() => {
        result.current.updatePhone(id, 'number', '11999887766');
      });

      expect(result.current.phones[0].number).toBe('11999887766');
    });
  });

  describe('getFormData', () => {
    it('returns a snapshot of all current form data', () => {
      const { result } = renderHook(() => useClientForm());

      act(() => {
        result.current.setName('Maria');
        result.current.setDocument('111');
      });

      const data = result.current.getFormData();
      expect(data).toEqual({
        clientType: 'individual',
        name: 'Maria',
        document: '111',
        addresses: result.current.addresses,
        phones: result.current.phones,
      });
    });
  });

  describe('sessionStorage integration (page-level)', () => {
    const STORAGE_KEY = 'automatize:client-form-draft';

    beforeEach(() => {
      sessionStorage.clear();
    });

    it('round-trips form data through sessionStorage via onDataChange', () => {
      const handleChange = (data: ClientFormData) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      };

      const { result } = renderHook(() =>
        useClientForm({ onDataChange: handleChange })
      );

      act(() => {
        result.current.setName('Carlos');
        result.current.setDocument('987.654.321-00');
      });

      const raw = sessionStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const stored = JSON.parse(raw ?? '{}') as ClientFormData;
      expect(stored.name).toBe('Carlos');
      expect(stored.document).toBe('987.654.321-00');

      const { result: restored } = renderHook(() =>
        useClientForm({ initialData: stored })
      );

      expect(restored.current.name).toBe('Carlos');
      expect(restored.current.document).toBe('987.654.321-00');
      expect(restored.current.clientType).toBe('individual');
    });
  });
});
