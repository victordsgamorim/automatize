/**
 * Unit tests — SupabaseUser data model
 *
 * Tests cover:
 * - createSupabaseUser factory: field mapping, null normalisation, immutability
 * - Identity mapping
 * - Helper functions: isEmailConfirmed, isPhoneConfirmed, getPrimaryProvider, getProviders
 */

import { describe, it, expect } from 'vitest';
import {
  createSupabaseUser,
  isEmailConfirmed,
  isPhoneConfirmed,
  getPrimaryProvider,
  getProviders,
  type SupabaseUserSource,
} from './user.model';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function buildMinimalSource(
  overrides?: Partial<SupabaseUserSource>
): SupabaseUserSource {
  return {
    id: 'user-uuid-001',
    aud: 'authenticated',
    email: 'alice@example.com',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { display_name: 'Alice' },
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createSupabaseUser
// ---------------------------------------------------------------------------

describe('createSupabaseUser', () => {
  it('maps required fields from source', () => {
    const source = buildMinimalSource();
    const user = createSupabaseUser(source);

    expect(user.id).toBe('user-uuid-001');
    expect(user.aud).toBe('authenticated');
    expect(user.email).toBe('alice@example.com');
    expect(user.created_at).toBe('2024-01-01T00:00:00Z');
  });

  it('normalises undefined optional fields to null', () => {
    const source = buildMinimalSource();
    const user = createSupabaseUser(source);

    expect(user.role).toBeNull();
    expect(user.phone).toBeNull();
    expect(user.email_confirmed_at).toBeNull();
    expect(user.phone_confirmed_at).toBeNull();
    expect(user.updated_at).toBeNull();
    expect(user.last_sign_in_at).toBeNull();
    expect(user.confirmation_sent_at).toBeNull();
    expect(user.recovery_sent_at).toBeNull();
    expect(user.identities).toBeNull();
  });

  it('defaults is_anonymous to false when absent', () => {
    const user = createSupabaseUser(buildMinimalSource());
    expect(user.is_anonymous).toBe(false);
  });

  it('maps is_anonymous when explicitly true', () => {
    const user = createSupabaseUser(buildMinimalSource({ is_anonymous: true }));
    expect(user.is_anonymous).toBe(true);
  });

  it('preserves provided optional fields', () => {
    const source = buildMinimalSource({
      role: 'authenticated',
      phone: '+5511999999999',
      email_confirmed_at: '2024-01-02T00:00:00Z',
      phone_confirmed_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      last_sign_in_at: '2024-06-15T12:00:00Z',
      confirmation_sent_at: '2024-01-01T01:00:00Z',
      recovery_sent_at: '2024-05-01T00:00:00Z',
    });
    const user = createSupabaseUser(source);

    expect(user.role).toBe('authenticated');
    expect(user.phone).toBe('+5511999999999');
    expect(user.email_confirmed_at).toBe('2024-01-02T00:00:00Z');
    expect(user.phone_confirmed_at).toBe('2024-01-03T00:00:00Z');
    expect(user.updated_at).toBe('2024-06-01T00:00:00Z');
    expect(user.last_sign_in_at).toBe('2024-06-15T12:00:00Z');
    expect(user.confirmation_sent_at).toBe('2024-01-01T01:00:00Z');
    expect(user.recovery_sent_at).toBe('2024-05-01T00:00:00Z');
  });

  it('returns a frozen (immutable) object', () => {
    const user = createSupabaseUser(buildMinimalSource());
    expect(Object.isFrozen(user)).toBe(true);
  });

  it('returns frozen app_metadata and user_metadata', () => {
    const user = createSupabaseUser(buildMinimalSource());
    expect(Object.isFrozen(user.app_metadata)).toBe(true);
    expect(Object.isFrozen(user.user_metadata)).toBe(true);
  });

  it('maps user_metadata fields', () => {
    const user = createSupabaseUser(
      buildMinimalSource({
        user_metadata: { display_name: 'Alice', avatar: 'url' },
      })
    );
    expect(user.user_metadata['display_name']).toBe('Alice');
    expect(user.user_metadata['avatar']).toBe('url');
  });

  describe('identities mapping', () => {
    it('maps identities array', () => {
      const source = buildMinimalSource({
        identities: [
          {
            identity_id: 'ident-001',
            id: 'ident-001',
            user_id: 'user-uuid-001',
            provider: 'email',
            identity_data: { email: 'alice@example.com' },
            last_sign_in_at: '2024-06-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z',
            email: 'alice@example.com',
          },
        ],
      });
      const user = createSupabaseUser(source);

      expect(user.identities).toHaveLength(1);
      const identities = user.identities ?? [];
      const identity = identities[0];
      expect(identity?.identity_id).toBe('ident-001');
      expect(identity?.provider).toBe('email');
      expect(identity?.email).toBe('alice@example.com');
    });

    it('falls back to id when identity_id is absent', () => {
      const source = buildMinimalSource({
        identities: [
          {
            id: 'ident-fallback',
            provider: 'google',
            identity_data: null,
          },
        ],
      });
      const user = createSupabaseUser(source);
      expect((user.identities ?? [])[0]?.identity_id).toBe('ident-fallback');
    });

    it('falls back to parent user id when user_id is absent in identity', () => {
      const source = buildMinimalSource({
        identities: [
          {
            id: 'ident-001',
            provider: 'email',
            identity_data: null,
          },
        ],
      });
      const user = createSupabaseUser(source);
      expect((user.identities ?? [])[0]?.user_id).toBe('user-uuid-001');
    });

    it('normalises null optional identity fields', () => {
      const source = buildMinimalSource({
        identities: [
          {
            id: 'ident-001',
            provider: 'email',
            identity_data: null,
          },
        ],
      });
      const user = createSupabaseUser(source);
      const identity = (user.identities ?? [])[0];

      expect(identity?.last_sign_in_at).toBeNull();
      expect(identity?.created_at).toBeNull();
      expect(identity?.updated_at).toBeNull();
      expect(identity?.email).toBeNull();
    });

    it('handles multiple identities (email + google)', () => {
      const source = buildMinimalSource({
        identities: [
          { id: 'i1', provider: 'email', identity_data: null },
          {
            id: 'i2',
            provider: 'google',
            identity_data: { sub: 'google-sub-123' },
          },
        ],
      });
      const user = createSupabaseUser(source);
      expect(user.identities).toHaveLength(2);
      expect((user.identities ?? [])[1]?.provider).toBe('google');
    });
  });
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

describe('isEmailConfirmed', () => {
  it('returns false when email_confirmed_at is null', () => {
    const user = createSupabaseUser(buildMinimalSource());
    expect(isEmailConfirmed(user)).toBe(false);
  });

  it('returns true when email_confirmed_at is set', () => {
    const user = createSupabaseUser(
      buildMinimalSource({ email_confirmed_at: '2024-02-01T00:00:00Z' })
    );
    expect(isEmailConfirmed(user)).toBe(true);
  });
});

describe('isPhoneConfirmed', () => {
  it('returns false when phone_confirmed_at is null', () => {
    const user = createSupabaseUser(buildMinimalSource());
    expect(isPhoneConfirmed(user)).toBe(false);
  });

  it('returns true when phone_confirmed_at is set', () => {
    const user = createSupabaseUser(
      buildMinimalSource({ phone_confirmed_at: '2024-02-01T00:00:00Z' })
    );
    expect(isPhoneConfirmed(user)).toBe(true);
  });
});

describe('getPrimaryProvider', () => {
  it('returns provider from app_metadata', () => {
    const user = createSupabaseUser(
      buildMinimalSource({
        app_metadata: { provider: 'google', providers: ['google'] },
      })
    );
    expect(getPrimaryProvider(user)).toBe('google');
  });

  it('returns "email" as fallback when provider is absent', () => {
    const user = createSupabaseUser(buildMinimalSource({ app_metadata: {} }));
    expect(getPrimaryProvider(user)).toBe('email');
  });
});

describe('getProviders', () => {
  it('returns providers array from app_metadata', () => {
    const user = createSupabaseUser(
      buildMinimalSource({
        app_metadata: { provider: 'email', providers: ['email', 'google'] },
      })
    );
    expect(getProviders(user)).toEqual(['email', 'google']);
  });

  it('falls back to [primary] when providers array is absent', () => {
    const user = createSupabaseUser(
      buildMinimalSource({ app_metadata: { provider: 'github' } })
    );
    expect(getProviders(user)).toEqual(['github']);
  });

  it('falls back to ["email"] when app_metadata is empty', () => {
    const user = createSupabaseUser(buildMinimalSource({ app_metadata: {} }));
    expect(getProviders(user)).toEqual(['email']);
  });
});
