/**
 * Auth Error Handling
 * Utilities for handling and normalizing auth errors
 */

import type { AuthError } from "../types/auth.types";
import { AuthErrorCode } from "../types/auth.types";

/**
 * Create a structured auth error
 */
export function createAuthError(
  code: AuthErrorCode,
  message: string,
  details?: Record<string, unknown>
): AuthError {
  const error = new Error(message) as AuthError;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Parse Supabase auth errors and normalize them
 */
export function parseSupabaseError(error: unknown): AuthError {
  // Handle Supabase AuthApiError
  if (error && typeof error === "object" && "message" in error) {
    const msg = String(error.message);

    // Invalid credentials
    if (msg.includes("Invalid login credentials") || msg.includes("Email not confirmed")) {
      return createAuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Invalid email or password. Please try again."
      );
    }

    // User not found
    if (msg.includes("User not found") || msg.includes("No user found")) {
      return createAuthError(AuthErrorCode.USER_NOT_FOUND, "User account not found");
    }

    // Email not confirmed
    if (msg.includes("Email not confirmed")) {
      return createAuthError(
        AuthErrorCode.EMAIL_NOT_CONFIRMED,
        "Please confirm your email address before logging in"
      );
    }

    // Too many requests
    if (msg.includes("too many")) {
      return createAuthError(
        AuthErrorCode.TOO_MANY_REQUESTS,
        "Too many login attempts. Please try again later."
      );
    }

    // User already exists
    if (msg.includes("User already exists") || msg.includes("duplicate")) {
      return createAuthError(
        AuthErrorCode.USER_ALREADY_EXISTS,
        "An account with this email already exists"
      );
    }

    // MFA errors
    if (msg.includes("MFA")) {
      if (msg.includes("challenge")) {
        return createAuthError(
          AuthErrorCode.INVALID_MFA_CODE,
          "Invalid MFA code. Please try again."
        );
      }
      return createAuthError(AuthErrorCode.MFA_REQUIRED, "MFA verification required");
    }

    // Session/token errors
    if (msg.includes("session") || msg.includes("Session")) {
      return createAuthError(AuthErrorCode.SESSION_EXPIRED, "Your session has expired. Please log in again.");
    }

    if (msg.includes("refresh token") || msg.includes("invalid token")) {
      return createAuthError(AuthErrorCode.INVALID_TOKEN, "Invalid authentication token");
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
    return createAuthError(
      AuthErrorCode.NETWORK_ERROR,
      "Network connection failed. Please check your internet connection."
    );
  }

  // Handle timeout
  if (error instanceof Error && error.message.includes("timeout")) {
    return createAuthError(
      AuthErrorCode.TIMEOUT,
      "Request timed out. Please try again."
    );
  }

  // Default unknown error
  console.error("Unknown auth error:", error);
  return createAuthError(
    AuthErrorCode.UNKNOWN_ERROR,
    "An unexpected error occurred. Please try again."
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Parse validation errors from Zod
 */
export function parseValidationErrors(
  error: unknown
): Record<string, string> | null {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray(error.errors)
  ) {
    const fieldErrors: Record<string, string> = {};
    for (const err of error.errors) {
      if (
        err &&
        typeof err === "object" &&
        "path" in err &&
        "message" in err &&
        Array.isArray(err.path)
      ) {
        const field = String(err.path[0]);
        fieldErrors[field] = String(err.message);
      }
    }
    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
  }
  return null;
}

/**
 * Check if error is authentication-related
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    error instanceof Error &&
    "code" in error &&
    Object.values(AuthErrorCode).includes((error as AuthError).code)
  );
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (!isAuthError(error)) return false;

  // These errors are not recoverable without user action
  const unrecoverableErrors = [
    AuthErrorCode.USER_NOT_FOUND,
    AuthErrorCode.USER_ALREADY_EXISTS,
    AuthErrorCode.INVALID_CREDENTIALS,
  ];

  return !unrecoverableErrors.includes(error.code);
}

/**
 * Get retry delay for recoverable errors (exponential backoff with jitter)
 */
export function getRetryDelay(attempt: number): number {
  // Base delay: 1s
  const baseDelay = 1000;
  // Exponential: 1s, 2s, 4s, 8s, 16s, 32s, 60s (max)
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), 60000);
  // Add jitter (±10%)
  const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);
  return exponentialDelay + jitter;
}

/**
 * Redact PII from error details for logging
 */
export function redactPIIFromError(error: AuthError): AuthError {
  const redacted = { ...error };
  if (redacted.details) {
    redacted.details = {
      ...redacted.details,
      // Redact sensitive fields
      email: "[REDACTED]",
      password: "[REDACTED]",
      phone: "[REDACTED]",
      address: "[REDACTED]",
    };
  }
  return redacted;
}
