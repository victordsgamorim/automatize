/**
 * Web Token Storage Implementation (Legacy / Development only)
 *
 * @deprecated
 * This implementation uses `localStorage`, which is accessible to any
 * JavaScript on the page and therefore **vulnerable to XSS attacks**.
 *
 * For production web deployments, use `CookieStorageAdapter` from
 * `../secure-storage.adapter` instead, backed by httpOnly cookies managed
 * on the server side.
 *
 * This file is kept for:
 * - Local development when a cookie endpoint is unavailable.
 * - Reference / migration guide.
 *
 * Usage (production-safe alternative):
 * ```ts
 * import { CookieStorageAdapter } from '../secure-storage.adapter';
 * ```
 */

import { type ITokenStorage, type StoredTokens } from '../../config';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth:access_token',
  REFRESH_TOKEN: 'auth:refresh_token',
  EXPIRY: 'auth:expiry',
  USER_ID: 'auth:user_id',
} as const;

/**
 * Web-specific token storage using localStorage
 */
export class WebTokenStorage implements ITokenStorage {
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  saveTokens(tokens: StoredTokens): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('localStorage is not available');
      }

      // Save access token
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);

      // Save refresh token if provided
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }

      // Save token expiry
      if (tokens.expiresIn) {
        const expiryTime = Date.now() + tokens.expiresIn * 1000;
        localStorage.setItem(STORAGE_KEYS.EXPIRY, expiryTime.toString());
      }

      // Save user ID
      if (tokens.userId) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, tokens.userId);
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  getAccessToken(): Promise<string | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return Promise.resolve(null);
      }
      return Promise.resolve(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return Promise.resolve(null);
    }
  }

  getRefreshToken(): Promise<string | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return Promise.resolve(null);
      }
      return Promise.resolve(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN));
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return Promise.resolve(null);
    }
  }

  getUserId(): Promise<string | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return Promise.resolve(null);
      }
      return Promise.resolve(localStorage.getItem(STORAGE_KEYS.USER_ID));
    } catch (error) {
      console.error('Failed to retrieve user ID:', error);
      return Promise.resolve(null);
    }
  }

  getTokenExpiry(): Promise<number | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return Promise.resolve(null);
      }
      const expiry = localStorage.getItem(STORAGE_KEYS.EXPIRY);
      return Promise.resolve(expiry ? parseInt(expiry, 10) : null);
    } catch (error) {
      console.error('Failed to retrieve token expiry:', error);
      return Promise.resolve(null);
    }
  }

  clearTokens(): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return Promise.resolve();
      }
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.EXPIRY);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      throw new Error('Failed to clear authentication tokens');
    }
  }

  async hasTokens(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      return !!accessToken;
    } catch {
      return false;
    }
  }
}

export const createWebTokenStorage = (): ITokenStorage => new WebTokenStorage();
