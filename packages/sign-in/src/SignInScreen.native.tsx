import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { Button, Text, FormField, Card } from '@automatize/ui';
import { semanticColors } from '@automatize/ui/tokens';
import { useTranslation } from 'react-i18next';
import type { SignInScreenProps } from './SignInScreen.types';
import { useSignIn } from './useSignIn';

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSuccess,
  onResetPassword,
  locale,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = semanticColors[colorScheme];
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    error,
    isLoading,
    handleSignIn,
  } = useSignIn();

  const onSignIn = async () => {
    const result = await handleSignIn();
    if (result.success) onSuccess();
  };

  const styles = StyleSheet.create({
    card: {
      marginBottom: 24,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    container: {
      backgroundColor: themeColors.background.primary,
      flex: 1,
    },
    errorContainer: {
      backgroundColor: themeColors.background.error,
      borderLeftColor: themeColors.state.error,
      borderLeftWidth: 4,
      borderRadius: 8,
      marginBottom: 16,
      padding: 12,
    },
    header: {
      alignItems: 'center' as const,
      marginBottom: 32,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center' as const,
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
      alignItems: 'center' as const,
      marginTop: 8,
    },
  });

  const currentLangLabel =
    locale.languages.find((l) => l.code === locale.currentLanguage)?.label ??
    locale.currentLanguage;

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
            onChangeText={setEmail}
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
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            testID="sign-in-password-input"
          />

          {/* Toggle Password Visibility */}
          <Button
            variant="ghost"
            onPress={toggleShowPassword}
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
            <Button
              variant="ghost"
              onPress={() => {
                const idx = locale.languages.findIndex(
                  (l) => l.code === locale.currentLanguage
                );
                const next =
                  locale.languages[(idx + 1) % locale.languages.length];
                if (next) locale.onLanguageChange(next.code);
              }}
              testID="language-switcher"
              accessibilityLabel={t('language.switch-label')}
            >
              {currentLangLabel}
            </Button>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
