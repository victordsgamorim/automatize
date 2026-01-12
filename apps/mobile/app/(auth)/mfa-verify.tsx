/**
 * MFA Verify Screen
 * Verification of TOTP code during login
 */

import { useState, useEffect } from 'react';
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

export default function MFAVerifyScreen() {
  const { verifyChallengeWithTOTP, verifyChallengeWithBackupCode, isLoading, error } =
    useMFA();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Auto-focus next field when code is complete
   */
  useEffect(() => {
    if (!useBackupCode && code.length === 6) {
      handleVerify();
    }
  }, [code, useBackupCode]);

  const handleVerify = async () => {
    setLocalError(null);

    if (!code) {
      setLocalError('Please enter a code');
      return;
    }

    try {
      if (useBackupCode) {
        await verifyChallengeWithBackupCode(code);
      } else {
        await verifyChallengeWithTOTP(code);
      }
      // Navigation handled by auth context
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setLocalError(message);
      setCode('');
    }
  };

  const handleToggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setCode('');
    setLocalError(null);
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
            Verify Your Identity
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {useBackupCode ? 'Enter your backup code' : 'Enter the code from your authenticator'}
          </Text>
        </View>

        <Card style={styles.card}>
          {displayError && (
            <View style={styles.errorContainer}>
              <Text variant="body" color="error">
                {displayError}
              </Text>
            </View>
          )}

          {/* Code Input */}
          <FormField
            label={useBackupCode ? 'Backup Code' : 'Authenticator Code'}
            placeholder={useBackupCode ? 'Enter 8-character code' : 'Enter 6-digit code'}
            value={code}
            onChangeText={setCode}
            maxLength={useBackupCode ? 8 : 6}
            keyboardType={useBackupCode ? 'default' : 'number-pad'}
            editable={!isLoading}
            testID="mfa-verify-code-input"
            autoComplete={useBackupCode ? 'off' : 'off'}
            autoFocus
          />

          {/* Verify Button */}
          {useBackupCode || code.length < 6 ? (
            <Button
              variant="primary"
              onPress={handleVerify}
              disabled={!code || isLoading}
              style={styles.button}
              testID="mfa-verify-submit"
            >
              {isLoading ? <ActivityIndicator color="white" /> : 'Verify'}
            </Button>
          ) : null}

          {/* Toggle Backup Code */}
          <Button
            variant="ghost"
            onPress={handleToggleBackupCode}
            disabled={isLoading}
            style={styles.toggleButton}
            testID="mfa-verify-toggle-backup"
          >
            {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
          </Button>
        </Card>

        {/* Info */}
        <Card style={[styles.card, styles.infoCard]}>
          <Text variant="caption" color="secondary">
            {useBackupCode
              ? 'Backup codes are one-time use only. After using a code, it cannot be used again.'
              : 'The code will be 6 digits and updates every 30 seconds.'}
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  errorContainer: {
    backgroundColor: theme.background.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
  button: {
    marginTop: 16,
  },
  toggleButton: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: theme.background.secondary,
  },
});
