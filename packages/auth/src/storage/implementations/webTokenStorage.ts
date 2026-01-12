/**
 * Web Token Storage Implementation
 * Uses localStorage for web applications
 * Note: This is NOT recommended for production without encryption
 * Consider using @supabase/auth-js which handles this automatically
 */

import { type ITokenStorage, type StoredTokens } from "../../config";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth:access_token",
  REFRESH_TOKEN: "auth:refresh_token",
  EXPIRY: "auth:expiry",
  USER_ID: "auth:user_id",
} as const;

/**
 * Web-specific token storage using localStorage
 */
export class WebTokenStorage implements ITokenStorage {
  private isLocalStorageAvailable(): boolean {
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  async saveTokens(tokens: StoredTokens): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error("localStorage is not available");
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
    } catch (error) {
      console.error("Failed to save tokens:", error);
      throw new Error("Failed to save authentication tokens");
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return null;
      }
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error("Failed to retrieve access token:", error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return null;
      }
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error("Failed to retrieve refresh token:", error);
      return null;
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return null;
      }
      return localStorage.getItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error("Failed to retrieve user ID:", error);
      return null;
    }
  }

  async getTokenExpiry(): Promise<number | null> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return null;
      }
      const expiry = localStorage.getItem(STORAGE_KEYS.EXPIRY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error("Failed to retrieve token expiry:", error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return;
      }
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.EXPIRY);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
      throw new Error("Failed to clear authentication tokens");
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
