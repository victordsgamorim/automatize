/**
 * Auth Service Tests
 */

import { describe, it, expect } from "vitest";
import {
  validatePasswordStrength,
  validateEmail,
  generateBackupCode,
  generateBackupCodes,
  validateTOTPCode,
  validateBackupCode,
  shouldRefreshSession,
  getSessionTimeRemaining,
  isSessionExpired,
} from "../../services/authService";

describe("Auth Service", () => {
  describe("validatePasswordStrength", () => {
    it("should accept strong passwords", () => {
      const result = validatePasswordStrength("StrongPassword123!");
      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.feedback).toHaveLength(0);
    });

    it("should reject weak passwords", () => {
      const result = validatePasswordStrength("weak");
      expect(result.isStrong).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it("should provide feedback for missing requirements", () => {
      const result = validatePasswordStrength("Password");
      expect(result.feedback).toContain(
        "Password must contain at least one number"
      );
      expect(result.feedback).toContain(
        "Password must contain at least one special character"
      );
    });

    it("should check for uppercase requirement", () => {
      const result = validatePasswordStrength("password123!");
      expect(result.feedback).toContain(
        "Password must contain at least one uppercase letter"
      );
    });

    it("should check for lowercase requirement", () => {
      const result = validatePasswordStrength("PASSWORD123!");
      expect(result.feedback).toContain(
        "Password must contain at least one lowercase letter"
      );
    });

    it("should allow custom password options", () => {
      const result = validatePasswordStrength("short", {
        minLength: 3,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
      });
      expect(result.isStrong).toBe(true);
      expect(result.feedback).toHaveLength(0);
    });
  });

  describe("validateEmail", () => {
    it("should accept valid emails", () => {
      expect(validateEmail("test@example.com").valid).toBe(true);
      expect(validateEmail("john.doe@company.co.uk").valid).toBe(true);
      expect(validateEmail("user+tag@domain.org").valid).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid").valid).toBe(false);
      expect(validateEmail("@example.com").valid).toBe(false);
      expect(validateEmail("user@").valid).toBe(false);
      expect(validateEmail("user@.com").valid).toBe(false);
      expect(validateEmail("user@domain").valid).toBe(false);
    });

    it("should trim and lowercase emails", () => {
      // Note: validateEmail uses trimmed/lowercased version internally
      const result = validateEmail("  TEST@EXAMPLE.COM  ");
      expect(result.valid).toBe(true);
    });
  });

  describe("generateBackupCode", () => {
    it("should generate 8-character codes", () => {
      const code = generateBackupCode();
      expect(code).toHaveLength(8);
    });

    it("should use only uppercase letters and numbers", () => {
      const code = generateBackupCode();
      expect(/^[A-Z0-9]{8}$/.test(code)).toBe(true);
    });

    it("should generate different codes", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateBackupCode());
      }
      // At least 95% should be unique (very high probability)
      expect(codes.size).toBeGreaterThan(95);
    });
  });

  describe("generateBackupCodes", () => {
    it("should generate multiple codes", () => {
      const codes = generateBackupCodes(10);
      expect(codes).toHaveLength(10);
    });

    it("should generate unique codes", () => {
      const codes = generateBackupCodes(10);
      const unique = new Set(codes);
      expect(unique.size).toBe(10);
    });

    it("should use default count of 10", () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(10);
    });

    it("should generate different counts", () => {
      expect(generateBackupCodes(5)).toHaveLength(5);
      expect(generateBackupCodes(20)).toHaveLength(20);
    });
  });

  describe("validateTOTPCode", () => {
    it("should accept valid TOTP codes", () => {
      expect(validateTOTPCode("123456").valid).toBe(true);
      expect(validateTOTPCode("000000").valid).toBe(true);
      expect(validateTOTPCode("999999").valid).toBe(true);
    });

    it("should reject non-numeric codes", () => {
      expect(validateTOTPCode("12345a").valid).toBe(false);
      expect(validateTOTPCode("ABCDEF").valid).toBe(false);
    });

    it("should reject incorrect length codes", () => {
      expect(validateTOTPCode("12345").valid).toBe(false); // 5 digits
      expect(validateTOTPCode("1234567").valid).toBe(false); // 7 digits
      expect(validateTOTPCode("").valid).toBe(false);
    });
  });

  describe("validateBackupCode", () => {
    it("should accept valid backup codes", () => {
      expect(validateBackupCode("ABCD1234").valid).toBe(true);
      expect(validateBackupCode("12345678").valid).toBe(true);
    });

    it("should accept codes with leading/trailing spaces", () => {
      expect(validateBackupCode("  ABCD1234  ").valid).toBe(true);
    });

    it("should ignore case in validation", () => {
      expect(validateBackupCode("abcd1234").valid).toBe(true);
      expect(validateBackupCode("AbCd1234").valid).toBe(true);
    });

    it("should reject invalid backup codes", () => {
      expect(validateBackupCode("ABCD123").valid).toBe(false); // 7 chars
      expect(validateBackupCode("ABCD12345").valid).toBe(false); // 9 chars
      expect(validateBackupCode("ABCD-234").valid).toBe(false); // contains hyphen
      expect(validateBackupCode("").valid).toBe(false);
    });
  });

  describe("Session management", () => {
    const now = Date.now() / 1000; // Current time in seconds

    it("should check if session needs refresh", () => {
      const expiresIn1Hour = now + 3600;
      const expiresIn2Minutes = now + 120;

      // Doesn't need refresh (>5 min remaining)
      expect(shouldRefreshSession(now, expiresIn1Hour)).toBe(false);

      // Needs refresh (<5 min remaining)
      expect(shouldRefreshSession(now, expiresIn2Minutes)).toBe(true);
    });

    it("should calculate session time remaining", () => {
      const expiresIn1Hour = now + 3600;
      const remaining = getSessionTimeRemaining(expiresIn1Hour);

      // Should be approximately 3600 seconds (±10 for test execution time)
      expect(remaining).toBeGreaterThan(3590);
      expect(remaining).toBeLessThanOrEqual(3600);
    });

    it("should handle expired sessions", () => {
      const expiredTime = now - 100;
      expect(getSessionTimeRemaining(expiredTime)).toBe(0);
    });

    it("should check if session is expired", () => {
      const futureTime = now + 3600;
      const pastTime = now - 100;

      expect(isSessionExpired(futureTime)).toBe(false);
      expect(isSessionExpired(pastTime)).toBe(true);
    });
  });
});
