/**
 * Token Storage Utilities
 * Uses the platform-agnostic ITokenStorage interface
 * Actual implementation provided by apps via initializeAuth()
 */

import { getTokenStorage, type StoredTokens, type ITokenStorage } from "../config";

/**
 * Get the current token storage implementation
 * This is a convenience wrapper around getTokenStorage()
 */
export function tokenStorage(): ITokenStorage {
  return getTokenStorage();
}

/**
 * Check if token is expired
 */
export async function isTokenExpired(): Promise<boolean> {
  try {
    const storage = getTokenStorage();
    const expiry = await storage.getTokenExpiry();
    if (!expiry) return false; // If no expiry, assume valid
    return Date.now() >= expiry;
  } catch {
    return false;
  }
}

/**
 * Get token expiration time in seconds
 */
export async function getTokenExpiresIn(): Promise<number | null> {
  try {
    const storage = getTokenStorage();
    const expiry = await storage.getTokenExpiry();
    if (!expiry) return null;
    return Math.floor((expiry - Date.now()) / 1000);
  } catch {
    return null;
  }
}

/**
 * Type exports
 */
export type { ITokenStorage, StoredTokens };
