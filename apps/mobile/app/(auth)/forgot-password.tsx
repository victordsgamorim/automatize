/**
 * Forgot Password Screen
 * Request password reset email
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
import { router } from 'expo-router';
import { useAuth } from '@automatize/auth';
import { Button, Text, FormField, Card, semanticColors } from '@automatize/ui';

const theme = semanticColors.light;

export default function ForgotPasswordScreen() {
  const { resetPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send reset email';
      setLocalError(message);
    }
  };

  const handleBackToLogin = () => {
    router.back();
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
            {submitted ? 'Check Your Email' : 'Reset Password'}
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {submitted
              ? 'Follow the instructions we sent to your email'
              : 'Enter your email to receive a password reset link'}
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

              {/* Email Input */}
              <FormField
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                testID="forgot-password-email-input"
              />

              {/* Submit Button */}
              <Button
                variant="primary"
                onPress={handleSubmit}
                disabled={!email || isLoading}
                style={styles.button}
                testID="forgot-password-submit-button"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {/* Back to Login */}
              <Button
                variant="ghost"
                onPress={handleBackToLogin}
                disabled={isLoading}
                testID="forgot-password-back-button"
              >
                Back to Login
              </Button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <View style={styles.successContainer}>
                <Text variant="h3" color="success" style={styles.successTitle}>
                  ✓ Email Sent
                </Text>
                <Text
                  variant="body"
                  color="secondary"
                  style={styles.successMessage}
                >
                  We've sent a password reset link to:{'\n'}
                  <Text
                    variant="body"
                    color="primary"
                    style={styles.emailHighlight}
                  >
                    {email}
                  </Text>
                </Text>
              </View>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text
                  variant="body"
                  color="secondary"
                  style={styles.instructionTitle}
                >
                  What's next?
                </Text>
                <Text
                  variant="body"
                  color="secondary"
                  style={styles.instructionText}
                >
                  1. Check your email (including spam folder){'\n'}
                  2. Click the password reset link{'\n'}
                  3. Create a new password{'\n'}
                  4. Log in with your new password
                </Text>
              </View>

              {/* Back to Login */}
              <Button
                variant="primary"
                onPress={handleBackToLogin}
                style={styles.button}
                testID="forgot-password-back-to-login-button"
              >
                Back to Login
              </Button>

              {/* Resend Button */}
              <Button
                variant="outline"
                onPress={handleSubmit}
                disabled={isLoading}
                style={styles.button}
                testID="forgot-password-resend-button"
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.brand[600]} />
                ) : (
                  "Didn't receive email? Resend"
                )}
              </Button>
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
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
  emailHighlight: {
    fontWeight: '600',
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
  instructionText: {
    lineHeight: 24,
  },
  instructionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsContainer: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
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
    borderLeftColor: theme.success,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  successMessage: {
    marginBottom: 8,
  },
  successTitle: {
    marginBottom: 8,
  },
});
