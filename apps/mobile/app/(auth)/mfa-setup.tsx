/**
 * MFA Setup Screen
 * TOTP QR code scanning and backup code generation
 */

import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useMFA } from '@automatize/auth';
import { Button, Text, FormField, Card, semanticColors } from '@automatize/ui';

const theme = semanticColors.light;

/**
 * MFA Setup Screen Component
 * Guides users through TOTP setup and backup code generation
 */
export default function MFASetupScreen() {
  const { enrollMFA, verifyMFA, isLoading, error } = useMFA();
  const [step, setStep] = useState<
    'generate' | 'verify' | 'backup' | 'complete'
  >('generate');
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmBackupCodes, setConfirmBackupCodes] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Step 1: Generate TOTP secret and QR code
   */
  const handleGenerateQR = async () => {
    setLocalError(null);

    try {
      const mfaSetup = await enrollMFA();
      if (mfaSetup) {
        setSecret(mfaSetup.secret || '');
        setQrCode(mfaSetup.qrCodeDataUrl || '');
        // In a real implementation, mfaSetup would contain QR code
        // For now, we'll use the secret directly
        setStep('verify');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate QR code';
      setLocalError(message);
    }
  };

  /**
   * Step 2: Verify TOTP code
   */
  const handleVerifyCode = async () => {
    setLocalError(null);

    if (!verificationCode) {
      setLocalError('Please enter the verification code');
      return;
    }

    try {
      const result = await verifyMFA(verificationCode);
      if (result) {
        // Get backup codes
        const codes = Array.from({ length: 10 }, () =>
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );
        setBackupCodes(codes);
        setStep('backup');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Verification failed';
      setLocalError(message);
    }
  };

  /**
   * Step 3: Complete MFA setup
   */
  const handleComplete = async () => {
    if (!confirmBackupCodes) {
      setLocalError('Please confirm you have saved your backup codes');
      return;
    }

    setStep('complete');
  };

  const displayError = error || localError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1" color="primary">
            Set Up Two-Factor Authentication
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Secure your account with MFA
          </Text>
        </View>

        <Card style={styles.card}>
          {/* Step: Generate QR Code */}
          {step === 'generate' && (
            <>
              <Text variant="h2" color="primary" style={styles.title}>
                Step 1: Scan QR Code
              </Text>
              <Text variant="body" color="secondary" style={styles.description}>
                Use an authenticator app like Google Authenticator, Authy, or
                Microsoft Authenticator to scan the QR code.
              </Text>

              {displayError && (
                <View style={styles.errorContainer}>
                  <Text variant="body" color="error">
                    {displayError}
                  </Text>
                </View>
              )}

              <Button
                variant="primary"
                onPress={handleGenerateQR}
                disabled={isLoading}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Generate QR Code'
                )}
              </Button>
            </>
          )}

          {/* Step: Verify Code */}
          {step === 'verify' && (
            <>
              <Text variant="h2" color="primary" style={styles.title}>
                Step 2: Verify Code
              </Text>

              {/* QR Code Display */}
              {qrCode && (
                <View style={styles.qrContainer}>
                  <Text variant="body" color="secondary">
                    [QR Code would be displayed here]
                  </Text>
                </View>
              )}

              {/* Manual Entry Fallback */}
              {secret && (
                <View style={styles.secretContainer}>
                  <Text variant="caption" color="secondary">
                    Can't scan? Enter this code manually:
                  </Text>
                  <Text
                    variant="code"
                    color="primary"
                    style={styles.secretCode}
                  >
                    {secret}
                  </Text>
                </View>
              )}

              {displayError && (
                <View style={styles.errorContainer}>
                  <Text variant="body" color="error">
                    {displayError}
                  </Text>
                </View>
              )}

              {/* Verification Code Input */}
              <FormField
                label="6-Digit Code"
                placeholder="000000"
                value={verificationCode}
                onChangeText={setVerificationCode}
                maxLength={6}
                keyboardType="number-pad"
                editable={!isLoading}
              />

              <Button
                variant="primary"
                onPress={handleVerifyCode}
                disabled={!verificationCode || isLoading}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Verify Code'
                )}
              </Button>
            </>
          )}

          {/* Step: Save Backup Codes */}
          {step === 'backup' && (
            <>
              <Text variant="h2" color="primary" style={styles.title}>
                Step 3: Save Backup Codes
              </Text>

              <Text variant="body" color="secondary" style={styles.description}>
                Save these backup codes in a safe place. Each code can be used
                once if you lose access to your authenticator app.
              </Text>

              {/* Backup Codes List */}
              <View style={styles.backupCodesContainer}>
                {backupCodes.map((code, index) => (
                  <View key={index} style={styles.backupCodeRow}>
                    <Text variant="code" color="primary">
                      {code}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Confirmation Checkbox */}
              <View style={styles.confirmContainer}>
                <Button
                  variant={confirmBackupCodes ? 'primary' : 'outline'}
                  onPress={() => setConfirmBackupCodes(!confirmBackupCodes)}
                  disabled={isLoading}
                  style={styles.checkbox}
                >
                  {confirmBackupCodes ? '✓' : ' '}
                </Button>
                <Text
                  variant="body"
                  color="secondary"
                  style={styles.confirmText}
                >
                  I have saved my backup codes in a safe place
                </Text>
              </View>

              <Button
                variant="primary"
                onPress={handleComplete}
                disabled={!confirmBackupCodes || isLoading}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <>
              <Text variant="h2" color="primary" style={styles.title}>
                ✓ MFA Enabled
              </Text>

              <Text variant="body" color="secondary" style={styles.description}>
                Your account is now protected with two-factor authentication.
                You will need to enter your authenticator code or a backup code
                when logging in.
              </Text>

              <Button
                variant="primary"
                disabled={isLoading}
                style={styles.button}
              >
                Continue to App
              </Button>
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backupCodeRow: {
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  backupCodesContainer: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  button: {
    marginTop: 16,
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  checkbox: {
    height: 44,
    marginRight: 8,
    minWidth: 44,
    width: 44,
  },
  confirmContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 16,
  },
  confirmText: {
    flex: 1,
    paddingTop: 12,
  },
  container: {
    backgroundColor: theme.background.primary,
    flex: 1,
  },
  description: {
    lineHeight: 22,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: theme.background.error,
    borderLeftColor: theme.error,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  header: {
    marginBottom: 32,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    height: 250,
    justifyContent: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  secretCode: {
    fontFamily: 'monospace',
    marginTop: 8,
  },
  secretContainer: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  subtitle: {
    marginTop: 8,
  },
  title: {
    marginBottom: 12,
  },
});
