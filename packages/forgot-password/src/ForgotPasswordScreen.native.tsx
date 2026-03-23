import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { Button, Text, FormField, Card, AnimateIn } from '@automatize/ui';
import { semanticColors, animation } from '@automatize/ui/tokens';
import { useTranslation } from 'react-i18next';
import type { ForgotPasswordScreenProps } from './ForgotPasswordScreen.types';
import { useForgotPassword } from './useForgotPassword';

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToSignIn,
  locale,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = semanticColors[colorScheme];
  const { t } = useTranslation();
  const { email, setEmail, error, isLoading, isSuccess, handleSubmit } =
    useForgotPassword();

  const onSubmit = async () => {
    await handleSubmit();
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
    successContainer: {
      alignItems: 'center' as const,
      gap: 16,
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
          <AnimateIn delay={animation.delay[100]}>
            <Text variant="h1" color="primary">
              {t('app.title')}
            </Text>
          </AnimateIn>
          <AnimateIn delay={animation.delay[200]}>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              {t('app.subtitle')}
            </Text>
          </AnimateIn>
        </View>

        <AnimateIn delay={animation.delay[300]}>
          <Card style={styles.card}>
            {isSuccess ? (
              <AnimateIn type="fadeSlideIn">
                <View style={styles.successContainer}>
                  <Text variant="h2" color="primary">
                    {t('forgot-password.success.title')}
                  </Text>
                  <Text variant="body" color="secondary">
                    {t('forgot-password.success.message')}
                  </Text>
                  <Button
                    variant="primary"
                    onPress={onBackToSignIn}
                    testID="forgot-password-back-to-sign-in"
                    style={styles.submitButton}
                  >
                    {t('forgot-password.back-to-sign-in')}
                  </Button>
                </View>
              </AnimateIn>
            ) : (
              <>
                <AnimateIn delay={animation.delay[400]}>
                  <Text variant="h2" color="primary" style={styles.title}>
                    {t('forgot-password.title')}
                  </Text>
                </AnimateIn>

                {error && (
                  <AnimateIn>
                    <View style={styles.errorContainer}>
                      <Text variant="body" color="error">
                        {error}
                      </Text>
                    </View>
                  </AnimateIn>
                )}

                <AnimateIn delay={animation.delay[500]}>
                  <FormField
                    label={t('forgot-password.email.label')}
                    placeholder={t('forgot-password.email.placeholder')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    testID="forgot-password-email-input"
                  />
                </AnimateIn>

                <AnimateIn delay={animation.delay[600]}>
                  <Button
                    variant="primary"
                    onPress={onSubmit}
                    disabled={!email || isLoading}
                    isLoading={isLoading}
                    testID="forgot-password-submit-button"
                    style={styles.submitButton}
                  >
                    {t('forgot-password.submit')}
                  </Button>
                </AnimateIn>

                <AnimateIn delay={animation.delay[700]}>
                  <Button
                    variant="ghost"
                    onPress={onBackToSignIn}
                    disabled={isLoading}
                    testID="forgot-password-back-button"
                  >
                    {t('forgot-password.back-to-sign-in')}
                  </Button>
                </AnimateIn>

                {/* Language Switcher */}
                <AnimateIn delay={animation.delay[800]}>
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
                </AnimateIn>
              </>
            )}
          </Card>
        </AnimateIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
