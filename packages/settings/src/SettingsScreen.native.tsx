import React from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Button, Text, Card } from '@automatize/ui';
import { semanticColors } from '@automatize/ui/tokens';
import { useTranslation } from '@automatize/core-localization';
import type { SettingsScreenProps } from './SettingsScreen.types';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  locale,
  appVersion,
  onSignOut,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = semanticColors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.background.primary,
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    subtitle: {
      marginTop: 4,
    },
    sectionCard: {
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    sectionTitle: {
      marginBottom: 4,
    },
    sectionDescription: {
      marginBottom: 12,
    },
    separator: {
      height: 1,
      backgroundColor: themeColors.border.default,
      marginVertical: 8,
    },
    signOutButton: {
      marginTop: 8,
    },
  });

  const currentLangLabel =
    locale.languages.find((l) => l.code === locale.currentLanguage)?.label ??
    locale.currentLanguage;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1" color="primary">
          {t('settings.title')}
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {t('settings.subtitle')}
        </Text>
      </View>

      {/* Language Section */}
      <Card style={styles.sectionCard}>
        <Text variant="h3" color="primary" style={styles.sectionTitle}>
          {t('settings.language.title')}
        </Text>
        <Text
          variant="bodySmall"
          color="secondary"
          style={styles.sectionDescription}
        >
          {t('settings.language.description')}
        </Text>
        <Button
          variant="ghost"
          onPress={() => {
            const idx = locale.languages.findIndex(
              (l) => l.code === locale.currentLanguage
            );
            const next = locale.languages[(idx + 1) % locale.languages.length];
            if (next) locale.onLanguageChange(next.code);
          }}
          testID="settings-language-switcher"
          accessibilityLabel={t('settings.language.language-label')}
        >
          {currentLangLabel}
        </Button>
      </Card>

      {/* Separator */}
      <View style={styles.separator} />

      {/* About Section */}
      <Card style={styles.sectionCard}>
        <Text variant="h3" color="primary" style={styles.sectionTitle}>
          {t('settings.about.title')}
        </Text>
        <Text variant="body" color="secondary">
          {t('settings.about.version')}: {appVersion}
        </Text>
      </Card>

      {/* Sign Out */}
      <Button
        variant="primary"
        onPress={onSignOut}
        testID="settings-sign-out"
        style={styles.signOutButton}
      >
        {t('settings.account.sign-out')}
      </Button>
    </ScrollView>
  );
};
