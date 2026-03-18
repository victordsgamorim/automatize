import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Text, FormField, Card, semanticColors } from '@automatize/ui';
import { useTranslation } from '@automatize/localization';
import type { SignInScreenProps } from './SignInScreen.types';
import { LanguageSwitcher } from './LanguageSwitcher.native';

const theme = semanticColors.light;

export const SignInScreen: React.FC<SignInScreenProps> = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  error,
  isLoading,
  onSignIn,
  onResetPassword,
}) => {
  const { t } = useTranslation();

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
            {t('app.title')}
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {t('app.subtitle')}
          </Text>
        </View>

        {/* Login Form Card */}
        <Card style={styles.card}>
          <Text variant="h2" color="primary" style={styles.title}>
            {t('sign-in.title')}
          </Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text variant="body" color="error">
                {error}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <FormField
            label={t('sign-in.email.label')}
            placeholder={t('sign-in.email.placeholder')}
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            testID="sign-in-email-input"
          />

          {/* Password Input */}
          <FormField
            label={t('sign-in.password.label')}
            placeholder={t('sign-in.password.placeholder')}
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            testID="sign-in-password-input"
          />

          {/* Toggle Password Visibility */}
          <Button
            variant="ghost"
            onPress={onToggleShowPassword}
            disabled={isLoading}
            testID="sign-in-toggle-password"
          >
            {showPassword
              ? t('sign-in.password.hide')
              : t('sign-in.password.show')}
          </Button>

          {/* Sign In Button */}
          <Button
            variant="primary"
            onPress={onSignIn}
            disabled={!email || !password || isLoading}
            isLoading={isLoading}
            testID="sign-in-submit-button"
            style={styles.submitButton}
          >
            {t('sign-in.submit')}
          </Button>

          {/* Forgot Password Link */}
          <Button
            variant="ghost"
            onPress={onResetPassword}
            disabled={isLoading}
            testID="sign-in-forgot-password"
          >
            {t('sign-in.forgot-password')}
          </Button>

          {/* Language Switcher */}
          <View style={styles.languageSwitcher}>
            <LanguageSwitcher />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  languageSwitcher: {
    alignItems: 'center',
    marginTop: 8,
  },
});
