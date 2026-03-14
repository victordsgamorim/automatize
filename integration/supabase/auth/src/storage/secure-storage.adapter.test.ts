/**
 * Unit tests — Secure Storage Adapters
 *
 * Tests cover:
 * - InMemoryStorageAdapter: get/set/remove/clear lifecycle
 * - CookieStorageAdapter: delegates all operations to provided callbacks
 * - Factory helpers: createInMemoryStorage, createCookieStorage
 */

import { describe, it, expect, vi } from 'vitest';
import {
  InMemoryStorageAdapter,
  CookieStorageAdapter,
  createInMemoryStorage,
  createCookieStorage,
  type CookieCallbacks,
} from './secure-storage.adapter';

// ---------------------------------------------------------------------------
// InMemoryStorageAdapter
// ---------------------------------------------------------------------------

describe('InMemoryStorageAdapter', () => {
  it('returns null for a missing key', () => {
    const storage = new InMemoryStorageAdapter();
    expect(storage.getItem('missing')).toBeNull();
  });

  it('stores and retrieves an item', () => {
    const storage = new InMemoryStorageAdapter();
    storage.setItem('token', 'abc123');
    expect(storage.getItem('token')).toBe('abc123');
  });

  it('overwrites an existing item', () => {
    const storage = new InMemoryStorageAdapter();
    storage.setItem('token', 'first');
    storage.setItem('token', 'second');
    expect(storage.getItem('token')).toBe('second');
  });

  it('removes an item', () => {
    const storage = new InMemoryStorageAdapter();
    storage.setItem('token', 'abc123');
    storage.removeItem('token');
    expect(storage.getItem('token')).toBeNull();
  });

  it('removing a non-existent key is a no-op', () => {
    const storage = new InMemoryStorageAdapter();
    expect(() => storage.removeItem('ghost')).not.toThrow();
  });

  it('clear removes all items', () => {
    const storage = new InMemoryStorageAdapter();
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    storage.clear();
    expect(storage.getItem('a')).toBeNull();
    expect(storage.getItem('b')).toBeNull();
    expect(storage.size).toBe(0);
  });

  it('size reflects stored item count', () => {
    const storage = new InMemoryStorageAdapter();
    expect(storage.size).toBe(0);
    storage.setItem('x', '1');
    storage.setItem('y', '2');
    expect(storage.size).toBe(2);
    storage.removeItem('x');
    expect(storage.size).toBe(1);
  });

  it('isolates different instances', () => {
    const a = new InMemoryStorageAdapter();
    const b = new InMemoryStorageAdapter();
    a.setItem('shared-key', 'from-a');
    expect(b.getItem('shared-key')).toBeNull();
  });

  it('stores complex serialised JSON strings', () => {
    const storage = new InMemoryStorageAdapter();
    const session = JSON.stringify({ access_token: 'tok', expires_in: 3600 });
    storage.setItem('supabase.auth.session', session);
    expect(storage.getItem('supabase.auth.session')).toBe(session);
  });
});

// ---------------------------------------------------------------------------
// CookieStorageAdapter
// ---------------------------------------------------------------------------

describe('CookieStorageAdapter', () => {
  function buildCallbacks(overrides?: Partial<CookieCallbacks>): {
    callbacks: CookieCallbacks;
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  } {
    const get = vi.fn().mockReturnValue(null);
    const set = vi.fn();
    const remove = vi.fn();
    const callbacks: CookieCallbacks = { get, set, remove, ...overrides };
    return { callbacks, get, set, remove };
  }

  it('calls get callback with the key', () => {
    const getOverride = vi.fn().mockReturnValue('cookie-value');
    const { callbacks } = buildCallbacks({ get: getOverride });
    const adapter = new CookieStorageAdapter(callbacks);
    const result = adapter.getItem('some-key');
    expect(getOverride).toHaveBeenCalledWith('some-key');
    expect(result).toBe('cookie-value');
  });

  it('returns null when get callback returns null', () => {
    const { callbacks } = buildCallbacks();
    const adapter = new CookieStorageAdapter(callbacks);
    expect(adapter.getItem('absent')).toBeNull();
  });

  it('returns null when get callback returns undefined', () => {
    const { callbacks } = buildCallbacks({
      get: vi.fn().mockReturnValue(undefined),
    });
    const adapter = new CookieStorageAdapter(callbacks);
    expect(adapter.getItem('absent')).toBeNull();
  });

  it('calls set callback with key and value', () => {
    const { callbacks, set } = buildCallbacks();
    const adapter = new CookieStorageAdapter(callbacks);
    adapter.setItem('session', 'tok123');
    expect(set).toHaveBeenCalledWith('session', 'tok123');
  });

  it('calls remove callback with the key', () => {
    const { callbacks, remove } = buildCallbacks();
    const adapter = new CookieStorageAdapter(callbacks);
    adapter.removeItem('session');
    expect(remove).toHaveBeenCalledWith('session');
  });

  it('does not call other callbacks on getItem', () => {
    const { callbacks, set, remove } = buildCallbacks();
    const adapter = new CookieStorageAdapter(callbacks);
    adapter.getItem('key');
    expect(set).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not call other callbacks on setItem', () => {
    const { callbacks, get, remove } = buildCallbacks();
    const adapter = new CookieStorageAdapter(callbacks);
    adapter.setItem('key', 'val');
    expect(get).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not call other callbacks on removeItem', () => {
    const { callbacks, get, set } = buildCallbacks();
    const adapter = new CookieStorageAdapter(callbacks);
    adapter.removeItem('key');
    expect(get).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

describe('createInMemoryStorage', () => {
  it('returns an InMemoryStorageAdapter instance', () => {
    const storage = createInMemoryStorage();
    expect(storage).toBeInstanceOf(InMemoryStorageAdapter);
  });

  it('each call returns a new independent instance', () => {
    const a = createInMemoryStorage();
    const b = createInMemoryStorage();
    a.setItem('k', 'v');
    expect(b.getItem('k')).toBeNull();
  });
});

describe('createCookieStorage', () => {
  it('returns a CookieStorageAdapter instance', () => {
    const storage = createCookieStorage({
      get: () => null,
      set: () => undefined,
      remove: () => undefined,
    });
    expect(storage).toBeInstanceOf(CookieStorageAdapter);
  });
});
