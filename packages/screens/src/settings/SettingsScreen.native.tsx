import React from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SecondaryButton, Text } from '@automatize/ui';
import { semanticColors } from '@automatize/ui/tokens';
import type { SettingsScreenProps } from './SettingsScreen.types';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  labels,
  locale,
  appVersion,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = semanticColors[colorScheme === 'dark' ? 'dark' : 'light'];

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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
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
          {labels.title}
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {labels.subtitle}
        </Text>
      </View>

      {/* Language */}
      <View style={styles.row}>
        <Text variant="body" color="primary">
          {labels.languageTitle}
        </Text>
        <SecondaryButton
          onPress={() => {
            const idx = locale.languages.findIndex(
              (l) => l.code === locale.currentLanguage
            );
            const next = locale.languages[(idx + 1) % locale.languages.length];
            if (next) locale.onLanguageChange(next.code);
          }}
          testID="settings-language-switcher"
          accessibilityLabel={labels.languageLabel}
        >
          {currentLangLabel}
        </SecondaryButton>
      </View>

      {/* About */}
      <View style={styles.row}>
        <Text variant="body" color="primary">
          {labels.aboutTitle}
        </Text>
        <Text variant="body" color="secondary">
          {labels.versionLabel}: {appVersion}
        </Text>
      </View>
    </ScrollView>
  );
};
