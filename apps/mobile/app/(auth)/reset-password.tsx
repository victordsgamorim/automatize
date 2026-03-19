/**
 * Reset Password Screen
 * Handles password reset from deep link in email
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
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@automatize/supabase-auth';
import { Button, Text, FormField, Card } from '@automatize/ui';
import { useTheme } from '@automatize/theme';

export default function ResetPasswordScreen() {
  const { colors: theme } = useTheme();
  const { token } = useLocalSearchParams();
  const { updatePassword, isLoading, error } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Check if token is available
  useEffect(() => {
    if (!token) {
      setLocalError(
        'Invalid or missing reset token. Please request a new password reset.'
      );
    }
  }, [token]);

  const handleResetPassword = async () => {
    setLocalError(null);

    // Validation
    if (!password) {
      setLocalError('Please enter a new password');
      return;
    }

    if (!confirmPassword) {
      setLocalError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await updatePassword(password);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset password';
      setLocalError(message);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  const displayError = error || localError;

  const styles = StyleSheet.create({
    button: {
      marginTop: 16,
    },
    card: {
      marginBottom: 24,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    container: {
      backgroundColor: theme.background.primary,
      flex: 1,
    },
    errorContainer: {
      backgroundColor: theme.background.error,
      borderLeftColor: theme.state.error,
      borderLeftWidth: 4,
      borderRadius: 8,
      marginBottom: 16,
      padding: 12,
    },
    header: {
      marginBottom: 32,
    },
    requirementsContainer: {
      backgroundColor: theme.background.secondary,
      borderRadius: 8,
      marginBottom: 16,
      padding: 12,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 16,
    },
    subtitle: {
      marginTop: 8,
    },
    successContainer: {
      backgroundColor: theme.background.secondary,
      borderLeftColor: theme.state.success,
      borderLeftWidth: 4,
      borderRadius: 8,
      marginBottom: 16,
      padding: 16,
    },
    successTitle: {
      marginBottom: 8,
    },
    title: {
      marginBottom: 16,
    },
  });

  if (!token) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text variant="h2" color="primary" style={styles.title}>
            Invalid Link
          </Text>
          <Text variant="body" color="error">
            {displayError}
          </Text>
          <Button
            variant="primary"
            onPress={() => router.replace('/(auth)/forgot-password')}
            style={styles.button}
          >
            Request New Reset Link
          </Button>
        </Card>
      </View>
    );
  }

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
            {submitted ? 'Password Reset' : 'Create New Password'}
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {submitted
              ? 'Your password has been successfully reset'
              : 'Enter a new password for your account'}
          </Text>
        </View>

        <Card style={styles.card}>
          {!submitted ? (
            <>
              {/* Error Message */}
              {displayError && (
                <View style={styles.errorContainer}>
                  <Text variant="body" color="error">
                    {displayError}
                  </Text>
                </View>
              )}

              {/* New Password Input */}
              <FormField
                label="New Password"
                placeholder="At least 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
                testID="reset-password-input"
              />

              {/* Confirm Password Input */}
              <FormField
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
                error={
                  confirmPassword && password !== confirmPassword
                    ? 'Passwords do not match'
                    : undefined
                }
                testID="reset-password-confirm-input"
              />

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text variant="caption" color="secondary">
                  Password must include:
                </Text>
                <Text variant="caption" color="secondary">
                  • At least 8 characters
                </Text>
                <Text variant="caption" color="secondary">
                  • At least one uppercase letter
                </Text>
                <Text variant="caption" color="secondary">
                  • At least one number
                </Text>
                <Text variant="caption" color="secondary">
                  • At least one special character
                </Text>
              </View>

              {/* Submit Button */}
              <Button
                variant="primary"
                onPress={handleResetPassword}
                disabled={
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword ||
                  isLoading
                }
                style={styles.button}
                testID="reset-password-submit-button"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <View style={styles.successContainer}>
                <Text variant="h3" color="success" style={styles.successTitle}>
                  ✓ Success
                </Text>
                <Text variant="body" color="secondary">
                  Your password has been successfully reset. You can now log in
                  with your new password.
                </Text>
              </View>

              {/* Back to Login */}
              <Button
                variant="primary"
                onPress={handleBackToLogin}
                style={styles.button}
                testID="reset-password-back-to-login"
              >
                Back to Login
              </Button>
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
