/**
 * useMFA Hook
 * Manages MFA (Multi-Factor Authentication) setup and verification
 */

import { useState, useCallback } from 'react';
import { supabase } from '../client';
import { generateBackupCodes } from '@automatize/core';
import { validateTOTPCode, validateBackupCode } from '@automatize/core';

export interface MFASetupState {
  secret?: string;
  qrCode?: string;
  backupCodes: string[];
}

/**
 * useMFA hook
 * Handles MFA setup and verification
 *
 * @example
 * ```tsx
 * function MFASetupScreen() {
 *   const { enrollMFA, isLoading, error } = useMFA();
 *   const [mfaState, setMFAState] = useState<MFASetupState | null>(null);
 *
 *   useEffect(() => {
 *     const setupMFA = async () => {
 *       const state = await enrollMFA();
 *       setMFAState(state);
 *     };
 *     setupMFA();
 *   }, [enrollMFA]);
 *
 *   return (
 *     <MFAQRCode data={mfaState} />
 *   );
 * }
 * ```
 */
export function useMFA() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Enroll in MFA (generate QR code and backup codes)
   */
  const enrollMFA = useCallback(async (): Promise<MFASetupState> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the authenticated user's session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      // Supabase doesn't have a direct TOTP enrollment endpoint in the JS client
      // In production, you'd use the MFA Admin API or a custom Edge Function
      // For now, we'll document the expected flow

      // Generate backup codes locally (will be stored after verification)
      const backupCodes = generateBackupCodes(10);

      // Return placeholder - real implementation would get QR from server
      return {
        backupCodes,
        // In production, get actual QR code from server:
        // qrCode: response.data.qr_code,
        // secret: response.data.secret,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to enroll in MFA';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify MFA setup (confirm TOTP code)
   */
  const verifyMFA = useCallback(
    async (totpCode: string, backupCodes: string[]): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate TOTP code
        const validationResult = validateTOTPCode(totpCode);
        if (!validationResult.valid) {
          throw new Error(validationResult.message || 'Invalid TOTP code');
        }

        // Validate backup codes
        for (const code of backupCodes) {
          const codeValidation = validateBackupCode(code);
          if (!codeValidation.valid) {
            throw new Error('One or more backup codes are invalid');
          }
        }

        // In production, send to Supabase MFA API
        // const { error } = await supabase.auth.mfa.verify({
        //   factorId: factorId,
        //   code: totpCode,
        // });

        // Store backup codes in database
        // This would be done via an Edge Function or API endpoint
        // For now, just acknowledge successful verification

        if (!totpCode) {
          throw new Error('TOTP code is required');
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to verify MFA';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Verify MFA challenge (for login)
   */
  const verifyChallengeWithTOTP = useCallback(
    async (factorId: string, totpCode: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const validationResult = validateTOTPCode(totpCode);
        if (!validationResult.valid) {
          throw new Error(validationResult.message || 'Invalid TOTP code');
        }

        // Send to Supabase MFA API
        // This requires the MFA factor ID from the authentication challenge
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: totpCode,
        });

        if (error) {
          throw error;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to verify TOTP code';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Verify MFA challenge with backup code
   */
  const verifyChallengeWithBackupCode = useCallback(
    async (factorId: string, backupCode: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const validationResult = validateBackupCode(backupCode);
        if (!validationResult.valid) {
          throw new Error(validationResult.message || 'Invalid backup code');
        }

        // Send to Supabase MFA API
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: backupCode,
        });

        if (error) {
          throw error;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to verify backup code';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Disable MFA (requires authentication)
   */
  const disableMFA = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, would call Supabase API to disable MFA
      // For now, just validate authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      // Would disable MFA here
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to disable MFA';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Regenerate backup codes
   */
  const regenerateBackupCodes = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const codes = generateBackupCodes(10);

      // In production, would save to database
      // const { error } = await api.post('/mfa/backup-codes', { codes });

      return codes;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to regenerate backup codes';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    enrollMFA,
    verifyMFA,
    verifyChallengeWithTOTP,
    verifyChallengeWithBackupCode,
    disableMFA,
    regenerateBackupCodes,
  };
}
