/**
 * Home Screen
 * Main dashboard for authenticated users
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@automatize/auth';
import { Button, Text, Card, semanticColors } from '@automatize/ui';

const theme = semanticColors.light;

export default function HomeScreen() {
  const { userProfile, currentTenant, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation handled by auth state change
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <Card style={styles.welcomeCard}>
        <Text variant="h2" color="primary">
          Welcome, {userProfile?.display_name || 'User'}!
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Current Workspace: {currentTenant?.name || 'No Tenant Selected'}
        </Text>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, styles.statCard1]}>
          <Text variant="h3" color="primary">
            0
          </Text>
          <Text variant="caption" color="secondary">
            Invoices
          </Text>
        </Card>

        <Card style={[styles.statCard, styles.statCard2]}>
          <Text variant="h3" color="primary">
            0
          </Text>
          <Text variant="caption" color="secondary">
            Clients
          </Text>
        </Card>

        <Card style={[styles.statCard, styles.statCard3]}>
          <Text variant="h3" color="primary">
            0
          </Text>
          <Text variant="caption" color="secondary">
            Products
          </Text>
        </Card>
      </View>

      {/* Features Placeholder */}
      <Card style={styles.featureCard}>
        <Text variant="h3" color="primary" style={styles.featureTitle}>
          Features Coming Soon
        </Text>
        <Text variant="body" color="secondary" style={styles.featureText}>
          • Invoice Management{'\n'}• Product Catalog{'\n'}• Client Management
          {'\n'}• Analytics & Reports
        </Text>
      </Card>

      {/* Logout Button */}
      <View style={styles.actionContainer}>
        <Button
          variant="danger"
          onPress={handleLogout}
          testID="home-logout-button"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginBottom: 24,
  },
  container: {
    backgroundColor: theme.background.primary,
    flex: 1,
    padding: 16,
  },
  featureCard: {
    backgroundColor: theme.background.secondary,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  featureText: {
    lineHeight: 24,
  },
  featureTitle: {
    marginBottom: 12,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  statCard1: {
    backgroundColor: theme.background.secondary,
  },
  statCard2: {
    backgroundColor: theme.background.secondary,
  },
  statCard3: {
    backgroundColor: theme.background.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
  },
  welcomeCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});
