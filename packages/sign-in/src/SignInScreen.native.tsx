import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { Button, Text, FormField, Card, AnimatedFadeIn } from '@automatize/ui';
import { semanticColors, animation } from '@automatize/ui/tokens';
import { useTranslation } from '@automatize/core-localization';
import type { SignInScreenProps } from './SignInScreen.types';
import { useSignIn } from './useSignIn';

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSuccess,
  onResetPassword,
  locale,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = semanticColors[colorScheme === 'dark' ? 'dark' : 'light'];
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
          <AnimatedFadeIn delay={animation.delay[100]}>
            <Text variant="h1" color="primary">
              {t('app.title')}
            </Text>
          </AnimatedFadeIn>
          <AnimatedFadeIn delay={animation.delay[200]}>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              {t('app.subtitle')}
            </Text>
          </AnimatedFadeIn>
        </View>

        {/* Login Form Card */}
        <AnimatedFadeIn delay={animation.delay[300]}>
          <Card style={styles.card}>
            <AnimatedFadeIn delay={animation.delay[400]}>
              <Text variant="h2" color="primary" style={styles.title}>
                {t('sign-in.title')}
              </Text>
            </AnimatedFadeIn>

            {/* Error Message */}
            {error && (
              <AnimatedFadeIn>
                <View style={styles.errorContainer}>
                  <Text variant="body" color="error">
                    {error}
                  </Text>
                </View>
              </AnimatedFadeIn>
            )}

            {/* Email Input */}
            <AnimatedFadeIn delay={animation.delay[500]}>
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
            </AnimatedFadeIn>

            {/* Password Input */}
            <AnimatedFadeIn delay={animation.delay[600]}>
              <FormField
                label={t('sign-in.password.label')}
                placeholder={t('sign-in.password.placeholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                testID="sign-in-password-input"
              />
            </AnimatedFadeIn>

            {/* Toggle Password Visibility */}
            <AnimatedFadeIn delay={animation.delay[700]}>
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
            </AnimatedFadeIn>

            {/* Sign In Button */}
            <AnimatedFadeIn delay={animation.delay[800]}>
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
            </AnimatedFadeIn>

            {/* Forgot Password Link */}
            <AnimatedFadeIn delay={animation.delay[900]}>
              <Button
                variant="ghost"
                onPress={onResetPassword}
                disabled={isLoading}
                testID="sign-in-forgot-password"
              >
                {t('sign-in.forgot-password')}
              </Button>
            </AnimatedFadeIn>

            {/* Language Switcher */}
            <AnimatedFadeIn delay={animation.delay[1000]}>
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
            </AnimatedFadeIn>
          </Card>
        </AnimatedFadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
