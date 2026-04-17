import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useProfileForm } from '../useProfileForm';
import type { ProfileFormData } from '../ProfileScreen.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const savedData: ProfileFormData = {
  name: 'Alice',
  phones: [{ id: 'p1', phoneType: 'mobile', number: '11999999999' }],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useProfileForm', () => {
  describe('initial state (no initialData)', () => {
    it('starts with empty defaults', () => {
      const { result } = renderHook(() => useProfileForm());

      expect(result.current.name).toBe('');
      expect(result.current.phones).toHaveLength(0);
    });
  });

  describe('initialData', () => {
    it('restores all fields from initialData', () => {
      const { result } = renderHook(() =>
        useProfileForm({ initialData: savedData })
      );

      expect(result.current.name).toBe('Alice');
      expect(result.current.phones).toEqual(savedData.phones);
    });

    it('starts with empty arrays when initialData has none', () => {
      const { result } = renderHook(() =>
        useProfileForm({ initialData: { name: '', phones: [] } })
      );

      expect(result.current.phones).toHaveLength(0);
    });
  });

  describe('onDataChange', () => {
    it('does not fire on initial mount', () => {
      const onDataChange = vi.fn();
      renderHook(() => useProfileForm({ onDataChange }));

      expect(onDataChange).not.toHaveBeenCalled();
    });

    it('fires when name changes after mount', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useProfileForm({ onDataChange }));

      act(() => {
        result.current.setName('Bob');
      });

      expect(onDataChange).toHaveBeenCalledTimes(1);
      expect(onDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Bob' })
      );
    });

    it('fires when a phone is added', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useProfileForm({ onDataChange }));

      act(() => {
        result.current.addPhone();
      });

      expect(onDataChange).toHaveBeenCalledTimes(1);
    });

    it('fires on each successive change', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => useProfileForm({ onDataChange }));

      act(() => {
        result.current.setName('A');
      });
      act(() => {
        result.current.setName('AB');
      });

      expect(onDataChange).toHaveBeenCalledTimes(2);
      expect(onDataChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'AB' })
      );
    });
  });

  describe('resetForm', () => {
    it('resets name back to initialData value', () => {
      const { result } = renderHook(() =>
        useProfileForm({ initialData: { name: 'Alice', phones: [] } })
      );

      act(() => {
        result.current.setName('Bob');
      });
      expect(result.current.name).toBe('Bob');

      act(() => {
        result.current.resetForm();
      });
      expect(result.current.name).toBe('Alice');
    });

    it('resets phones back to initialData value', () => {
      const { result } = renderHook(() =>
        useProfileForm({ initialData: savedData })
      );

      act(() => {
        result.current.addPhone();
      });
      expect(result.current.phones).toHaveLength(2);

      act(() => {
        result.current.resetForm();
      });
      expect(result.current.phones).toEqual(savedData.phones);
    });

    it('resets to empty defaults when no initialData provided', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.setName('Bob');
      });
      act(() => {
        result.current.addPhone();
      });
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.name).toBe('');
      expect(result.current.phones).toHaveLength(0);
    });
  });

  describe('phone CRUD', () => {
    it('addPhone adds a new phone with mobile default', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.addPhone();
      });

      expect(result.current.phones).toHaveLength(1);
      expect(result.current.phones[0].phoneType).toBe('mobile');
      expect(result.current.phones[0].number).toBe('');
    });

    it('addPhone with data overrides defaults', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.addPhone({
          phoneType: 'telephone',
          number: '1133334444',
        });
      });

      expect(result.current.phones[0].phoneType).toBe('telephone');
      expect(result.current.phones[0].number).toBe('1133334444');
    });

    it('removePhone removes by id', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.addPhone();
      });
      act(() => {
        result.current.addPhone();
      });
      const firstId = result.current.phones[0].id;

      act(() => {
        result.current.removePhone(firstId);
      });

      expect(result.current.phones).toHaveLength(1);
      expect(result.current.phones[0].id).not.toBe(firstId);
    });

    it('removePhone with unknown id leaves list unchanged', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.addPhone();
      });
      act(() => {
        result.current.removePhone('nonexistent');
      });

      expect(result.current.phones).toHaveLength(1);
    });

    it('updatePhone updates a field by id', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.addPhone();
      });
      const id = result.current.phones[0].id;

      act(() => {
        result.current.updatePhone(id, 'number', '11999887766');
      });

      expect(result.current.phones[0].number).toBe('11999887766');
    });

    it('updatePhone does not affect other phones', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.addPhone({ number: 'first' });
      });
      act(() => {
        result.current.addPhone({ number: 'second' });
      });
      const secondId = result.current.phones[1].id;

      act(() => {
        result.current.updatePhone(secondId, 'number', 'updated');
      });

      expect(result.current.phones[0].number).toBe('first');
      expect(result.current.phones[1].number).toBe('updated');
    });

    it('insertPhoneAt re-inserts at specific index (undo pattern)', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.addPhone({ number: 'first' });
      });
      act(() => {
        result.current.addPhone({ number: 'second' });
      });
      const firstId = result.current.phones[0].id;

      act(() => {
        result.current.removePhone(firstId);
      });
      expect(result.current.phones).toHaveLength(1);
      expect(result.current.phones[0].number).toBe('second');

      act(() => {
        result.current.insertPhoneAt(0, {
          id: firstId,
          phoneType: 'mobile',
          number: 'first',
        });
      });

      expect(result.current.phones).toHaveLength(2);
      expect(result.current.phones[0].number).toBe('first');
      expect(result.current.phones[1].number).toBe('second');
    });
  });

  describe('getFormData', () => {
    it('returns a snapshot of all current form fields', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.setName('Maria');
      });
      act(() => {
        result.current.addPhone({ number: '11999887766' });
      });

      const data = result.current.getFormData();
      expect(data.name).toBe('Maria');
      expect(data.phones).toHaveLength(1);
      expect(data.phones[0].number).toBe('11999887766');
    });

    it('snapshot does not mutate when state later changes', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.setName('Carlos');
      });
      const snapshot = result.current.getFormData();

      act(() => {
        result.current.setName('Changed');
      });

      expect(snapshot.name).toBe('Carlos');
    });
  });
});
