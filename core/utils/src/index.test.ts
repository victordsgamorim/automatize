import { describe, it, expect } from 'vitest';

import { generateId, getCurrentTimestamp, hashValue } from './index';

describe('generateId', () => {
  it('should generate a valid ULID', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(26);
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('getCurrentTimestamp', () => {
  it('should return a valid ISO 8601 timestamp', () => {
    const timestamp = getCurrentTimestamp();
    expect(timestamp).toBeTruthy();
    expect(typeof timestamp).toBe('string');
    expect(() => new Date(timestamp)).not.toThrow();
  });

  it('should return current time', () => {
    const before = Date.now();
    const timestamp = getCurrentTimestamp();
    const after = Date.now();
    const timestampMs = new Date(timestamp).getTime();

    expect(timestampMs).toBeGreaterThanOrEqual(before);
    expect(timestampMs).toBeLessThanOrEqual(after);
  });
});

describe('hashValue', () => {
  it('should hash a string value', () => {
    const value = 'sensitive-data';
    const hashed = hashValue(value);
    expect(hashed).toBeTruthy();
    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(value);
  });

  it('should produce consistent hashes', () => {
    const value = 'test';
    const hash1 = hashValue(value);
    const hash2 = hashValue(value);
    expect(hash1).toBe(hash2);
  });
});
