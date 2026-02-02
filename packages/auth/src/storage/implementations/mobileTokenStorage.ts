/**
 * Mobile Token Storage Implementation
 * Uses expo-secure-store for secure storage on iOS and Android
 *
 * This file should only be imported in mobile apps (not in web/Next.js)
 * because it imports expo-secure-store which is platform-specific
 */

import * as SecureStore from 'expo-secure-store';
import { type ITokenStorage, type StoredTokens } from '../../config';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth:access_token',
  REFRESH_TOKEN: 'auth:refresh_token',
  EXPIRY: 'auth:expiry',
  USER_ID: 'auth:user_id',
} as const;

/**
 * Mobile-specific token storage using expo-secure-store
 */
export class MobileTokenStorage implements ITokenStorage {
  async saveTokens(tokens: StoredTokens): Promise<void> {
    try {
      // Save access token
      await SecureStore.setItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN,
        tokens.accessToken
      );

      // Save refresh token if provided
      if (tokens.refreshToken) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          tokens.refreshToken
        );
      }

      // Save token expiry
      if (tokens.expiresIn) {
        const expiryTime = Date.now() + tokens.expiresIn * 1000;
        await SecureStore.setItemAsync(
          STORAGE_KEYS.EXPIRY,
          expiryTime.toString()
        );
      }

      // Save user ID
      if (tokens.userId) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, tokens.userId);
      }
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens securely');
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Failed to retrieve user ID:', error);
      return null;
    }
  }

  async getTokenExpiry(): Promise<number | null> {
    try {
      const expiry = await SecureStore.getItemAsync(STORAGE_KEYS.EXPIRY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Failed to retrieve token expiry:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
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

export const createMobileTokenStorage = (): ITokenStorage =>
  new MobileTokenStorage();
