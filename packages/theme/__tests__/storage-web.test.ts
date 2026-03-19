import { describe, it, expect, beforeEach } from 'vitest';
import { createWebStorageAdapter } from '../src/storage/web';

describe('createWebStorageAdapter', () => {
  beforeEach(() => {
    // jsdom may not provide localStorage.clear — remove key manually
    localStorage.removeItem('theme-preference');
    localStorage.removeItem('my-key');
  });

  it('returns null when no stored value', async () => {
    const adapter = createWebStorageAdapter();
    const result = await adapter.get();
    expect(result).toBeNull();
  });

  it('reads a valid stored preference', async () => {
    localStorage.setItem('theme-preference', 'dark');
    const adapter = createWebStorageAdapter();
    const result = await adapter.get();
    expect(result).toBe('dark');
  });

  it('returns null for invalid stored value', async () => {
    localStorage.setItem('theme-preference', 'invalid');
    const adapter = createWebStorageAdapter();
    const result = await adapter.get();
    expect(result).toBeNull();
  });

  it('writes preference to localStorage', async () => {
    const adapter = createWebStorageAdapter();
    await adapter.set('dark');
    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('supports custom storage key', async () => {
    const adapter = createWebStorageAdapter('my-key');
    await adapter.set('light');
    expect(localStorage.getItem('my-key')).toBe('light');

    const result = await adapter.get();
    expect(result).toBe('light');
  });

  it('reads "system" as a valid preference', async () => {
    localStorage.setItem('theme-preference', 'system');
    const adapter = createWebStorageAdapter();
    const result = await adapter.get();
    expect(result).toBe('system');
  });
});
