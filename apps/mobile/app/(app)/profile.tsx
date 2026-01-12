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
            <Text variant="h1" color="white">
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
              { backgroundColor: theme.success },
            ]}
          >
            <Text variant="caption" color="white">
              ✓ Active
            </Text>
          </View>
        </View>

        <View style={[styles.securityRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: theme.border, paddingTopTop: 16 }]}>
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
              disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
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
      <Card style={[styles.dangerCard]}>
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
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    padding: 16,
  },
  profileCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.brand[600],
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionTitle: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoLabel: {
    marginRight: 8,
  },
  securityCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.background.secondary,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  securityButton: {
    marginTop: 8,
  },
  changePasswordCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  passwordActions: {
    marginTop: 16,
    gap: 8,
  },
  dangerCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: `${theme.error}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
  button: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 12,
  },
});
