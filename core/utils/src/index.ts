/**
 * Core utility functions
 */

import { ulid } from 'ulid';

/**
 * Generate a new ULID
 */
export function generateId(): string {
  return ulid();
}

/**
 * Get current ISO 8601 timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Hash a value for privacy (basic implementation)
 * In production, use a proper hashing algorithm with salt
 */
export function hashValue(value: string): string {
  // This is a placeholder - should use proper hashing in production
  return Buffer.from(value).toString('base64');
}
