import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '@automatize/theme';

export default function Index() {
  const { colors: theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.background.primary,
      flex: 1,
      justifyContent: 'center',
    },
    subtitle: {
      color: theme.text.secondary,
      fontSize: 16,
    },
    title: {
      color: theme.text.primary,
      fontSize: 30,
      fontWeight: '700',
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Automatize</Text>
      <Text style={styles.subtitle}>Invoice Management System</Text>
    </View>
  );
}
