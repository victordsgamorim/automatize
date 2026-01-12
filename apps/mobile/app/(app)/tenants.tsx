/**
 * Tenants Screen
 * Manage and switch between tenants
 */

import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTenant } from '@automatize/auth';
import {
  Button,
  Text,
  Card,
  FormField,
  Loading,
  semanticColors,
} from '@automatize/ui';

const theme = semanticColors.light;

export default function TenantsScreen() {
  const {
    tenants,
    currentTenant,
    isLoading,
    error,
    switchTenant,
    createTenant,
  } = useTenant();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateTenant = async () => {
    setCreateError(null);

    if (!newTenantName.trim()) {
      setCreateError('Please enter a tenant name');
      return;
    }

    setIsCreating(true);

    try {
      await createTenant(newTenantName);
      setNewTenantName('');
      setShowCreateForm(false);
      Alert.alert('Success', 'Tenant created successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tenant';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchTenant = async (tenantId: string) => {
    try {
      await switchTenant(tenantId);
      Alert.alert('Success', 'Tenant switched');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to switch tenant';
      Alert.alert('Error', message);
    }
  };

  if (isLoading && !tenants.length) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Text variant="h2" color="primary">
          Workspaces
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Manage your tenants and workspaces
        </Text>
      </Card>

      {/* Current Tenant */}
      {currentTenant && (
        <Card style={styles.currentTenantCard}>
          <View style={styles.currentTenantHeader}>
            <Text variant="h3" color="primary">
              Current Workspace
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.brand[600] },
              ]}
            >
              <Text variant="caption" color="white">
                Active
              </Text>
            </View>
          </View>
          <Text variant="body" color="primary" style={styles.tenantName}>
            {currentTenant.name}
          </Text>
          <Text variant="caption" color="secondary">
            {currentTenant.slug}
          </Text>
        </Card>
      )}

      {/* Tenants List */}
      {tenants.length > 0 && (
        <View style={styles.listContainer}>
          <Text variant="h3" color="primary" style={styles.listTitle}>
            Other Workspaces
          </Text>

          {tenants.map((tenant) => (
            <Card key={tenant.id} style={styles.tenantCard}>
              <View style={styles.tenantHeader}>
                <View style={styles.tenantInfo}>
                  <Text variant="body" color="primary" style={styles.tenantName}>
                    {tenant.name}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {tenant.slug}
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                onPress={() => handleSwitchTenant(tenant.id)}
                disabled={isLoading || currentTenant?.id === tenant.id}
                style={styles.switchButton}
              >
                {currentTenant?.id === tenant.id ? 'Active' : 'Switch'}
              </Button>
            </Card>
          ))}
        </View>
      )}

      {/* Create New Tenant */}
      {!showCreateForm ? (
        <View style={styles.actionContainer}>
          <Button
            variant="primary"
            onPress={() => setShowCreateForm(true)}
            disabled={isCreating}
            style={styles.button}
          >
            Create New Workspace
          </Button>
        </View>
      ) : (
        <Card style={styles.createCard}>
          <Text variant="h3" color="primary" style={styles.createTitle}>
            Create New Workspace
          </Text>

          {createError && (
            <View style={styles.errorContainer}>
              <Text variant="body" color="error">
                {createError}
              </Text>
            </View>
          )}

          <FormField
            label="Workspace Name"
            placeholder="e.g., My Company"
            value={newTenantName}
            onChangeText={setNewTenantName}
            editable={!isCreating}
          />

          <View style={styles.createActions}>
            <Button
              variant="primary"
              onPress={handleCreateTenant}
              disabled={!newTenantName.trim() || isCreating}
              style={styles.button}
            >
              {isCreating ? (
                <ActivityIndicator color="white" />
              ) : (
                'Create'
              )}
            </Button>

            <Button
              variant="ghost"
              onPress={() => {
                setShowCreateForm(false);
                setNewTenantName('');
                setCreateError(null);
              }}
              disabled={isCreating}
              style={styles.button}
            >
              Cancel
            </Button>
          </View>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card style={styles.errorCard}>
          <Text variant="body" color="error">
            {error}
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    padding: 16,
  },
  headerCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  subtitle: {
    marginTop: 8,
  },
  currentTenantCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.background.secondary,
    borderLeftWidth: 4,
    borderLeftColor: theme.brand[600],
  },
  currentTenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tenantName: {
    marginBottom: 4,
  },
  listContainer: {
    marginBottom: 24,
  },
  listTitle: {
    marginBottom: 12,
  },
  tenantCard: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tenantInfo: {
    flex: 1,
  },
  switchButton: {
    marginTop: 8,
  },
  createCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: theme.background.secondary,
  },
  createTitle: {
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: theme.background.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
  createActions: {
    marginTop: 16,
    gap: 8,
  },
  actionContainer: {
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: theme.background.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
});
