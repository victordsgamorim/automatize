/**
 * JWT Utilities
 * Helpers for parsing and validating JWT tokens
 */

import { jwtClaimsSchema, type JWTClaims } from "../schemas/auth.schemas";

/**
 * Decode base64 string
 * Works in both browser and Node.js environments
 */
function decodeBase64(str: string): string {
  if (typeof atob !== "undefined") {
    return atob(str);
  }
  // Node.js fallback
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64").toString("utf-8");
  }
  throw new Error("Unable to decode base64: atob and Buffer not available");
}

/**
 * Decode JWT payload (without verification)
 * NOTE: This only decodes the JWT. Always verify on the server side.
 */
export function decodeJWT<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1] as string;
    const decoded = JSON.parse(decodeBase64(payload));
    return decoded as T;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Get custom claims from JWT
 */
export function getJWTClaims(token: string): JWTClaims | null {
  const payload = decodeJWT<JWTClaims>(token);
  if (!payload) return null;

  try {
    return jwtClaimsSchema.parse(payload as JWTClaims);
  } catch (error) {
    console.error("Invalid JWT claims:", error);
    return null;
  }
}

/**
 * Get current tenant ID from JWT
 */
export function getCurrentTenantId(token: string): string | null {
  const claims = getJWTClaims(token);
  return claims?.tenant_id ?? null;
}

/**
 * Get current role from JWT
 */
export function getCurrentRole(token: string): string | null {
  const claims = getJWTClaims(token);
  return claims?.role ?? null;
}

/**
 * Get all tenant IDs from JWT
 */
export function getTenantIds(token: string): string[] {
  const claims = getJWTClaims(token);
  return claims?.tenant_ids ?? [];
}

/**
 * Check if JWT is expired
 */
export function isJWTExpired(token: string): boolean {
  try {
    const payload = decodeJWT<{ exp?: number }>(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Get JWT expiration time (milliseconds)
 */
export function getJWTExpirationTime(token: string): number | null {
  try {
    const payload = decodeJWT<{ exp?: number }>(token);
    if (!payload?.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

/**
 * Get JWT issued at time (milliseconds)
 */
export function getJWTIssuedAt(token: string): number | null {
  try {
    const payload = decodeJWT<{ iat?: number }>(token);
    if (!payload?.iat) return null;
    return payload.iat * 1000;
  } catch {
    return null;
  }
}

/**
 * Get time remaining until JWT expires (seconds)
 */
export function getJWTTimeRemaining(token: string): number {
  try {
    const expiryTime = getJWTExpirationTime(token);
    if (!expiryTime) return 0;
    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

/**
 * Check if JWT needs refresh (expired or about to expire)
 * Refresh if less than 5 minutes remaining
 */
export function shouldRefreshJWT(token: string, thresholdSeconds = 300): boolean {
  const timeRemaining = getJWTTimeRemaining(token);
  return timeRemaining < thresholdSeconds;
}
