import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

import {
  ProfileProvider,
  useProfile,
  useProfileSafe,
} from '../ProfileProvider';
import type { ProfileData } from '../ProfileProvider';

// ── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL: ProfileData = {
  name: 'Alice',
  email: 'alice@example.com',
  companyName: 'Acme',
  phones: [],
};

function makeWrapper(data: ProfileData = INITIAL) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <ProfileProvider initialData={data}>{children}</ProfileProvider>;
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProfileProvider', () => {
  describe('useProfile', () => {
    it('provides initial profile data to children', () => {
      const Consumer = () => {
        const { profile } = useProfile();
        return (
          <>
            <span data-testid="name">{profile.name}</span>
            <span data-testid="email">{profile.email}</span>
            <span data-testid="company">{profile.companyName}</span>
          </>
        );
      };

      render(
        <ProfileProvider initialData={INITIAL}>
          <Consumer />
        </ProfileProvider>
      );

      expect(screen.getByTestId('name').textContent).toBe('Alice');
      expect(screen.getByTestId('email').textContent).toBe('alice@example.com');
      expect(screen.getByTestId('company').textContent).toBe('Acme');
    });

    it('updateProfile updates the given fields', () => {
      const Consumer = () => {
        const { profile, updateProfile } = useProfile();
        return (
          <>
            <span data-testid="name">{profile.name}</span>
            <button onClick={() => updateProfile({ name: 'Bob' })}>
              Update
            </button>
          </>
        );
      };

      render(
        <ProfileProvider initialData={INITIAL}>
          <Consumer />
        </ProfileProvider>
      );

      expect(screen.getByTestId('name').textContent).toBe('Alice');
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));
      expect(screen.getByTestId('name').textContent).toBe('Bob');
    });

    it('updateProfile does not overwrite unrelated fields', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: makeWrapper(),
      });

      act(() => {
        result.current.updateProfile({ name: 'Carol' });
      });

      expect(result.current.profile.name).toBe('Carol');
      expect(result.current.profile.email).toBe('alice@example.com');
      expect(result.current.profile.companyName).toBe('Acme');
      expect(result.current.profile.phones).toHaveLength(0);
    });

    it('updateProfile can update phones', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: makeWrapper(),
      });

      const newPhone = {
        id: 'p1',
        phoneType: 'mobile' as const,
        number: '111',
      };
      act(() => {
        result.current.updateProfile({ phones: [newPhone] });
      });

      expect(result.current.profile.phones).toHaveLength(1);
      expect(result.current.profile.phones[0].number).toBe('111');
    });

    it('throws when called outside a ProfileProvider', () => {
      expect(() => {
        renderHook(() => useProfile());
      }).toThrow('useProfile must be used within a ProfileProvider');
    });
  });

  describe('useProfileSafe', () => {
    it('returns null when outside a ProfileProvider', () => {
      const { result } = renderHook(() => useProfileSafe());
      expect(result.current).toBeNull();
    });

    it('returns context value when inside a ProfileProvider', () => {
      const { result } = renderHook(() => useProfileSafe(), {
        wrapper: makeWrapper(),
      });

      expect(result.current).not.toBeNull();
      expect(result.current?.profile.name).toBe('Alice');
    });

    it('reflects updates made via updateProfile', () => {
      const { result } = renderHook(() => useProfileSafe(), {
        wrapper: makeWrapper(),
      });

      act(() => {
        result.current?.updateProfile({ name: 'Dave' });
      });

      expect(result.current?.profile.name).toBe('Dave');
    });

    it('does not throw — safe to call without provider', () => {
      expect(() => {
        renderHook(() => useProfileSafe());
      }).not.toThrow();
    });
  });

  describe('multiple updates', () => {
    it('accumulates sequential updates correctly', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: makeWrapper(),
      });

      act(() => {
        result.current.updateProfile({ name: 'Step1' });
      });
      act(() => {
        result.current.updateProfile({ email: 'new@email.com' });
      });

      expect(result.current.profile.name).toBe('Step1');
      expect(result.current.profile.email).toBe('new@email.com');
      expect(result.current.profile.companyName).toBe('Acme');
    });
  });
});
