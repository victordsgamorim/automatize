/**
 * Login Screen
 * Email and password authentication
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

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [useMfaCode, setUseMfaCode] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);

    try {
      const code = useMfaCode ? mfaCode : undefined;
      await login(email, password, code);
      // Navigation handled by AuthProvider state change
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLocalError(message);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleRegister = () => {
    router.replace('/(auth)/register');
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
            Automatize
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Invoice Management System
          </Text>
        </View>

        {/* Login Form Card */}
        <Card style={styles.card}>
          <Text variant="h2" color="primary" style={styles.title}>
            Login
          </Text>

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
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            testID="login-email-input"
          />

          {/* Password Input */}
          <FormField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
            testID="login-password-input"
          />

          {/* MFA Code or Backup Code Input */}
          {useMfaCode && (
            <FormField
              label={useBackupCode ? 'Backup Code' : 'MFA Code'}
              placeholder={
                useBackupCode
                  ? 'Enter 8-character backup code'
                  : 'Enter 6-digit code'
              }
              value={mfaCode}
              onChangeText={setMfaCode}
              maxLength={useBackupCode ? 8 : 6}
              keyboardType={useBackupCode ? 'default' : 'number-pad'}
              editable={!isLoading}
              testID="login-mfa-input"
            />
          )}

          {/* Use MFA Code Toggle */}
          {!useMfaCode && (
            <Button
              variant="ghost"
              onPress={() => setUseMfaCode(true)}
              disabled={isLoading}
              testID="login-use-mfa-button"
            >
              Have a MFA or backup code?
            </Button>
          )}

          {/* Use Backup Code Toggle */}
          {useMfaCode && !useBackupCode && (
            <Button
              variant="ghost"
              onPress={() => setUseBackupCode(true)}
              disabled={isLoading}
              testID="login-use-backup-button"
            >
              Use backup code instead
            </Button>
          )}

          {/* Hide MFA Toggle */}
          {useMfaCode && (
            <Button
              variant="ghost"
              onPress={() => {
                setUseMfaCode(false);
                setMfaCode('');
                setUseBackupCode(false);
              }}
              disabled={isLoading}
              testID="login-hide-mfa-button"
            >
              Back to password login
            </Button>
          )}

          {/* Login Button */}
          <Button
            variant="primary"
            onPress={handleLogin}
            disabled={
              !email || !password || (useMfaCode && !mfaCode) || isLoading
            }
            testID="login-submit-button"
            style={styles.submitButton}
          >
            {isLoading ? <ActivityIndicator color="white" /> : 'Login'}
          </Button>

          {/* Forgot Password Link */}
          <Button
            variant="ghost"
            onPress={handleForgotPassword}
            disabled={isLoading}
            testID="login-forgot-password-button"
          >
            Forgot your password?
          </Button>
        </Card>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text variant="body" color="secondary">
            Don't have an account?{' '}
          </Text>
          <Button
            variant="ghost"
            onPress={handleRegister}
            disabled={isLoading}
            testID="login-register-link"
          >
            Register here
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  submitButton: {
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    marginTop: 8,
  },
  title: {
    marginBottom: 20,
  },
});
