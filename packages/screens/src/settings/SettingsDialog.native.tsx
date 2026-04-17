import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Text } from '@automatize/ui';
import { semanticColors } from '@automatize/ui/tokens';
import { X } from 'lucide-react-native';
import { SettingsScreen } from './SettingsScreen.native';
import type { SettingsDialogProps } from './SettingsScreen.types';

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  labels,
  locale,
  appVersion,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = semanticColors[colorScheme === 'dark' ? 'dark' : 'light'];

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: themeColors.border.default,
    },
    closeButton: {
      padding: 8,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Text variant="h1" color="primary">
            {labels.title}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close settings"
            accessibilityRole="button"
          >
            <X size={20} color={themeColors.text.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <SettingsScreen
            labels={labels}
            locale={locale}
            appVersion={appVersion}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};
