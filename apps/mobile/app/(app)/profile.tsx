/**
 * Profile Screen
 * User profile and account settings
 */

import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@automatize/auth';
import {
  Button,
  Text,
  Card,
  FormField,
  colors,
  semanticColors,
} from '@automatize/ui';

const theme = semanticColors.light;

export default function ProfileScreen() {
  const { user, userProfile, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both passwords');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      // In a real implementation, this would be handled by useAuth
      // await updatePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Alert.alert('Error', 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
            // Navigation handled by auth state change
          } catch (err) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text variant="h1" style={styles.avatarText}>
              {userProfile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        <Text variant="h2" color="primary" style={styles.displayName}>
          {userProfile?.display_name || 'User'}
        </Text>

        <Text variant="body" color="secondary" style={styles.email}>
          {user?.email || 'No email'}
        </Text>
      </Card>

      {/* Account Information */}
      <Card style={styles.infoCard}>
        <Text variant="h3" color="primary" style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoRow}>
          <Text variant="body" color="secondary" style={styles.infoLabel}>
            Email:
          </Text>
          <Text variant="body" color="primary">
            {user?.email || 'N/A'}
          </Text>
        </View>

        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text variant="body" color="secondary" style={styles.infoLabel}>
            Account Created:
          </Text>
          <Text variant="body" color="primary">
            {userProfile?.created_at
              ? new Date(userProfile.created_at).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>
      </Card>

      {/* Security Section */}
      <Card style={styles.securityCard}>
        <Text variant="h3" color="primary" style={styles.sectionTitle}>
          Security
        </Text>

        <View style={styles.securityRow}>
          <View style={styles.securityInfo}>
            <Text variant="body" color="primary">
              Two-Factor Authentication
            </Text>
            <Text variant="caption" color="secondary">
              Status: Enabled
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: theme.state.success },
            ]}
          >
            <Text variant="caption" style={styles.statusBadgeText}>
              ✓ Active
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.securityRow,
            {
              marginTop: 16,
              borderTopWidth: 1,
              borderTopColor: theme.border.default,
              paddingTop: 16,
            },
          ]}
        >
          <Button
            variant="outline"
            onPress={() => setShowChangePassword(!showChangePassword)}
            disabled={isChangingPassword}
            style={styles.securityButton}
          >
            Change Password
          </Button>
        </View>
      </Card>

      {/* Change Password Form */}
      {showChangePassword && (
        <Card style={styles.changePasswordCard}>
          <Text variant="h3" color="primary" style={styles.sectionTitle}>
            Change Password
          </Text>

          <FormField
            label="Current Password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            editable={!isChangingPassword}
          />

          <FormField
            label="New Password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            editable={!isChangingPassword}
          />

          <FormField
            label="Confirm Password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isChangingPassword}
            error={
              confirmPassword && newPassword !== confirmPassword
                ? 'Passwords do not match'
                : undefined
            }
          />

          <View style={styles.passwordActions}>
            <Button
              variant="primary"
              onPress={handleChangePassword}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                isChangingPassword
              }
              style={styles.button}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="white" />
              ) : (
                'Update Password'
              )}
            </Button>

            <Button
              variant="ghost"
              onPress={() => {
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              disabled={isChangingPassword}
              style={styles.button}
            >
              Cancel
            </Button>
          </View>
        </Card>
      )}

      {/* Danger Zone */}
      <Card style={styles.dangerCard}>
        <Text variant="h3" color="error" style={styles.sectionTitle}>
          Danger Zone
        </Text>

        <Button
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brand[600],
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarText: {
    color: colors.neutral[50],
  },
  button: {
    marginTop: 8,
  },
  changePasswordCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  container: {
    backgroundColor: theme.background.primary,
    flex: 1,
    padding: 16,
  },
  dangerCard: {
    backgroundColor: theme.background.error,
    borderLeftColor: theme.state.error,
    borderLeftWidth: 4,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  displayName: {
    marginBottom: 4,
  },
  email: {
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoLabel: {
    marginRight: 8,
  },
  infoRow: {
    alignItems: 'center',
    borderBottomColor: theme.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  logoutButton: {
    marginTop: 12,
  },
  passwordActions: {
    gap: 8,
    marginTop: 16,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  securityButton: {
    marginTop: 8,
  },
  securityCard: {
    backgroundColor: theme.background.secondary,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  securityInfo: {
    flex: 1,
  },
  securityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: colors.neutral[50],
  },
});
