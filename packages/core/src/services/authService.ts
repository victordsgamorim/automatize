/**
 * Auth Service
 * Platform-agnostic authentication business logic
 */

/**
 * Password strength validation rules
 */
export interface PasswordStrengthOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

const DEFAULT_PASSWORD_OPTIONS: Required<PasswordStrengthOptions> = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Password strength validation result
 */
export interface PasswordStrengthResult {
  isStrong: boolean;
  score: number; // 0-5
  feedback: string[];
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(
  password: string,
  options: PasswordStrengthOptions = {}
): PasswordStrengthResult {
  const opts = { ...DEFAULT_PASSWORD_OPTIONS, ...options };
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length >= opts.minLength) {
    score += 1;
  } else {
    feedback.push(`Password must be at least ${opts.minLength} characters`);
  }

  // Check for uppercase
  if (!opts.requireUppercase || /[A-Z]/.test(password)) {
    if (/[A-Z]/.test(password)) score += 1;
  } else {
    feedback.push("Password must contain at least one uppercase letter");
  }

  // Check for lowercase
  if (!opts.requireLowercase || /[a-z]/.test(password)) {
    if (/[a-z]/.test(password)) score += 1;
  } else {
    feedback.push("Password must contain at least one lowercase letter");
  }

  // Check for numbers
  if (!opts.requireNumbers || /[0-9]/.test(password)) {
    if (/[0-9]/.test(password)) score += 1;
  } else {
    feedback.push("Password must contain at least one number");
  }

  // Check for special characters
  if (!opts.requireSpecialChars || /[^a-zA-Z0-9]/.test(password)) {
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  } else {
    feedback.push("Password must contain at least one special character");
  }

  return {
    isStrong: score >= 4,
    score: Math.min(score, 5),
    feedback,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  const trimmed = email.trim().toLowerCase();

  // Basic format check
  if (!trimmed.includes("@")) {
    return { valid: false, message: "Email must contain @" };
  }

  const [localPart, domain] = trimmed.split("@");

  if (!localPart || localPart.length === 0) {
    return { valid: false, message: "Email must have a local part" };
  }

  if (!domain || domain.length === 0) {
    return { valid: false, message: "Email must have a domain" };
  }

  if (!domain.includes(".")) {
    return { valid: false, message: "Email domain must contain a dot" };
  }

  // RFC 5322 simplified check
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  if (!validEmail) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Generate random backup code (8 chars: A-Z, 0-9)
 */
export function generateBackupCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate multiple backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateBackupCode());
  }
  return Array.from(codes);
}

/**
 * Format backup codes for display (groups of 4)
 */
export function formatBackupCodes(codes: string[]): string {
  return codes
    .map((code, index) => {
      // Group codes in pairs (4 + 4 chars per line)
      if (index % 2 === 0 && index !== 0) {
        return `\n${code}`;
      }
      return code;
    })
    .join(" ");
}

/**
 * TOTP validation helper (just validation, actual TOTP generation handled by auth provider)
 */
export function validateTOTPCode(code: string): { valid: boolean; message?: string } {
  // Must be exactly 6 digits
  if (!/^\d{6}$/.test(code)) {
    return { valid: false, message: "TOTP code must be exactly 6 digits" };
  }

  return { valid: true };
}

/**
 * Validate backup code format
 */
export function validateBackupCode(code: string): { valid: boolean; message?: string } {
  const trimmed = code.toUpperCase().trim();

  // Must be exactly 8 chars
  if (trimmed.length !== 8) {
    return { valid: false, message: "Backup code must be exactly 8 characters" };
  }

  // Must be alphanumeric uppercase
  if (!/^[A-Z0-9]{8}$/.test(trimmed)) {
    return { valid: false, message: "Backup code must contain only uppercase letters and numbers" };
  }

  return { valid: true };
}

/**
 * Session configuration
 */
export interface SessionConfig {
  accessTokenMaxAge: number; // seconds
  refreshTokenMaxAge: number; // seconds
  refreshThreshold: number; // seconds before expiry to trigger refresh
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  accessTokenMaxAge: 3600, // 1 hour
  refreshTokenMaxAge: 604800, // 7 days
  refreshThreshold: 300, // refresh if <5 min remaining
};

/**
 * Check if session needs refresh
 */
export function shouldRefreshSession(
  issuedAt: number,
  expiresAt: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): boolean {
  const now = Date.now() / 1000; // Convert to seconds
  const timeRemaining = expiresAt - now;
  return timeRemaining < config.refreshThreshold;
}

/**
 * Get session time remaining (seconds)
 */
export function getSessionTimeRemaining(expiresAt: number): number {
  const now = Date.now() / 1000;
  return Math.max(0, expiresAt - now);
}

/**
 * Check if session is completely expired
 */
export function isSessionExpired(expiresAt: number): boolean {
  const now = Date.now() / 1000;
  return now >= expiresAt;
}
