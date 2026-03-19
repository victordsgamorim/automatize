/**
 * Register Screen
 * New user registration with email, password, and display name
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
import { useAuth } from '@automatize/supabase-auth';
import { Button, Text, FormField, Card } from '@automatize/ui';
import { useTheme } from '@automatize/theme';

import type { ThemeContextValue } from '@automatize/theme';

/**
 * Password strength indicators
 */
function getPasswordStrength(
  password: string,
  theme: ThemeContextValue['colors']
): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  let label = 'Weak';
  let color: string = theme.state.error;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 4) {
    label = 'Strong';
    color = theme.state.success;
  } else if (score === 3) {
    label = 'Good';
    color = theme.state.warning;
  }

  return { score: Math.min(score, 4), label, color };
}

export default function RegisterScreen() {
  const { colors: theme } = useTheme();
  const { register, isLoading, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password, theme);
  const passwordMatch = password === confirmPassword && password.length > 0;

  const handleRegister = async () => {
    setLocalError(null);

    // Validation
    if (!displayName.trim()) {
      setLocalError('Display name is required');
      return;
    }

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    if (!password) {
      setLocalError('Password is required');
      return;
    }

    if (!passwordMatch) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setLocalError('You must agree to the Terms of Service');
      return;
    }

    try {
      await register(email, password, displayName);
      // On success, the AuthProvider will redirect to MFA setup or app home
      // Navigation is handled by the auth context
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      setLocalError(message);
    }
  };

  const handleLogin = () => {
    router.replace('/(auth)/login');
  };

  const displayError = error || localError;
  const isValid =
    displayName.trim() &&
    email.trim() &&
    passwordMatch &&
    agreedToTerms &&
    !isLoading;

  const styles = StyleSheet.create({
    card: {
      marginBottom: 24,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    checkbox: {
      height: 44,
      marginRight: 8,
      minWidth: 44,
      width: 44,
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
    footer: {
      alignItems: 'center',
      marginTop: 16,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 16,
    },
    strengthBar: {
      borderRadius: 2,
      height: 4,
      marginBottom: 4,
    },
    strengthContainer: {
      marginBottom: 16,
    },
    strengthLabel: {
      marginTop: 4,
    },
    submitButton: {
      marginBottom: 8,
      marginTop: 16,
    },
    subtitle: {
      marginTop: 8,
    },
    termsContainer: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginBottom: 16,
    },
    termsText: {
      flex: 1,
      paddingTop: 12,
    },
    title: {
      marginBottom: 20,
    },
  });

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
            Automatize
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Create Your Account
          </Text>
        </View>

        {/* Register Form Card */}
        <Card style={styles.card}>
          <Text variant="h2" color="primary" style={styles.title}>
            Register
          </Text>

          {/* Error Message */}
          {displayError && (
            <View style={styles.errorContainer}>
              <Text variant="body" color="error">
                {displayError}
              </Text>
            </View>
          )}

          {/* Display Name Input */}
          <FormField
            label="Display Name"
            placeholder="e.g., John Doe"
            value={displayName}
            onChangeText={setDisplayName}
            editable={!isLoading}
            testID="register-display-name-input"
          />

          {/* Email Input */}
          <FormField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            testID="register-email-input"
          />

          {/* Password Input */}
          <FormField
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
            testID="register-password-input"
          />

          {/* Password Strength Indicator */}
          {password && (
            <View style={styles.strengthContainer}>
              <View
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor: passwordStrength.color,
                    width: `${(passwordStrength.score / 4) * 100}%`,
                  },
                ]}
              />
              <Text
                variant="caption"
                color="secondary"
                style={styles.strengthLabel}
              >
                Password strength: {passwordStrength.label}
              </Text>
            </View>
          )}

          {/* Confirm Password Input */}
          <FormField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
            error={
              confirmPassword && !passwordMatch
                ? 'Passwords do not match'
                : undefined
            }
            testID="register-confirm-password-input"
          />

          {/* Terms Agreement */}
          <View style={styles.termsContainer}>
            <Button
              variant={agreedToTerms ? 'primary' : 'outline'}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              disabled={isLoading}
              testID="register-terms-checkbox"
              style={styles.checkbox}
            >
              {agreedToTerms ? '✓' : ' '}
            </Button>
            <Text variant="body" color="secondary" style={styles.termsText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </View>

          {/* Register Button */}
          <Button
            variant="primary"
            onPress={handleRegister}
            disabled={!isValid}
            testID="register-submit-button"
            style={styles.submitButton}
          >
            {isLoading ? <ActivityIndicator color="white" /> : 'Create Account'}
          </Button>
        </Card>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text variant="body" color="secondary">
            Already have an account?{' '}
          </Text>
          <Button
            variant="ghost"
            onPress={handleLogin}
            disabled={isLoading}
            testID="register-login-link"
          >
            Login here
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
