import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import {
  PrimaryButton,
  SecondaryButton,
  Text,
  Input,
  Card,
  Fade,
} from '@automatize/ui';
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

  const onSignIn = () => {
    void handleSignIn().then((result) => {
      if (result.success) onSuccess();
    });
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
          <Fade delay={animation.delay[100]}>
            <Text variant="h1" color="primary">
              {t('app.title')}
            </Text>
          </Fade>
          <Fade delay={animation.delay[200]}>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              {t('app.subtitle')}
            </Text>
          </Fade>
        </View>

        {/* Login Form Card */}
        <Fade delay={animation.delay[300]}>
          <Card style={styles.card}>
            <Fade delay={animation.delay[400]}>
              <Text variant="h2" color="primary" style={styles.title}>
                {t('sign-in.title')}
              </Text>
            </Fade>

            {/* Error Message */}
            {error && (
              <Fade>
                <View style={styles.errorContainer}>
                  <Text variant="body" color="error">
                    {error}
                  </Text>
                </View>
              </Fade>
            )}

            {/* Email Input */}
            <Fade delay={animation.delay[500]}>
              <Input
                label={t('sign-in.email.label')}
                placeholder={t('sign-in.email.placeholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                testID="sign-in-email-input"
              />
            </Fade>

            {/* Password Input */}
            <Fade delay={animation.delay[600]}>
              <Input
                label={t('sign-in.password.label')}
                placeholder={t('sign-in.password.placeholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                testID="sign-in-password-input"
              />
            </Fade>

            {/* Toggle Password Visibility */}
            <Fade delay={animation.delay[700]}>
              <SecondaryButton
                onPress={toggleShowPassword}
                disabled={isLoading}
                testID="sign-in-toggle-password"
              >
                {showPassword
                  ? t('sign-in.password.hide')
                  : t('sign-in.password.show')}
              </SecondaryButton>
            </Fade>

            {/* Sign In Button */}
            <Fade delay={animation.delay[800]}>
              <PrimaryButton
                onPress={onSignIn}
                disabled={!email || !password || isLoading}
                isLoading={isLoading}
                testID="sign-in-submit-button"
                style={styles.submitButton}
              >
                {t('sign-in.submit')}
              </PrimaryButton>
            </Fade>

            {/* Forgot Password Link */}
            <Fade delay={animation.delay[900]}>
              <SecondaryButton
                onPress={onResetPassword}
                disabled={isLoading}
                testID="sign-in-forgot-password"
              >
                {t('sign-in.forgot-password')}
              </SecondaryButton>
            </Fade>

            {/* Language Switcher */}
            <Fade delay={animation.delay[1000]}>
              <View style={styles.languageSwitcher}>
                <SecondaryButton
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
                </SecondaryButton>
              </View>
            </Fade>
          </Card>
        </Fade>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
