/**
 * Workspace Invitation Screen
 * Handles joining a workspace via invitation link
 */

import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@automatize/auth';
import { Button, Text, Card, colors, semanticColors } from '@automatize/ui';

const theme = semanticColors.light;

export default function InviteScreen() {
  const {
    id,
    email: invitationEmail,
    code,
  } = useLocalSearchParams<{
    id?: string;
    email?: string;
    code?: string;
  }>();

  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'verify' | 'accept'>('verify');
  const [invitationData, setInvitationData] = useState<{
    tenantName: string;
    role: string;
    invitedBy: string;
  } | null>(null);

  const invitationId = id || code;

  // Check invitation validity on mount
  useEffect(() => {
    if (!invitationId) {
      setError('Invalid or missing invitation ID');
      return;
    }

    validateInvitation();
  }, [invitationId]);

  // If user is authenticated with different email, show logout prompt
  useEffect(() => {
    if (isAuthenticated && invitationEmail && user?.email !== invitationEmail) {
      setError(
        `You are signed in as ${user?.email}, but this invitation is for ${invitationEmail}. Please sign out first.`
      );
      setStep('verify');
    }
  }, [isAuthenticated, user, invitationEmail]);

  const validateInvitation = async () => {
    // In a real app, this would call an Edge Function to validate the invitation
    // For now, we'll assume it's valid and proceed to next step
    try {
      setIsLoading(true);

      // TODO: Call Edge Function to validate invitation
      // const { data, error } = await supabase.functions.invoke('validate-invitation', {
      //   body: { invitationId }
      // });

      // Mock data for now
      setInvitationData({
        tenantName: 'Sample Workspace',
        role: 'editor',
        invitedBy: 'admin@example.com',
      });

      setStep('accept');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to validate invitation';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      if (!invitationId) {
        setError('Invalid or missing invitation ID');
        return;
      }
      // Redirect to signup with invitation
      const params: Record<string, string> = { invitationId };
      if (invitationEmail) {
        params.email = invitationEmail;
      }
      router.push({
        pathname: '/(auth)/register',
        params,
      });
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Call Edge Function to accept invitation
      // const { error } = await supabase.functions.invoke('accept-invitation', {
      //   body: { invitationId, userId: user!.id }
      // });

      // Redirect to workspace/dashboard
      router.replace('/(app)');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to accept invitation';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Sign out current user
      router.replace('/(auth)/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
    }
  };

  if (!invitationId) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text variant="h2" color="primary" style={styles.title}>
            Invalid Invitation
          </Text>
          <Text variant="body" color="error">
            The invitation link is invalid or missing. Please check your email
            and try again.
          </Text>
          <Button
            variant="primary"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          >
            Back to Login
          </Button>
        </Card>
      </View>
    );
  }

  if (authLoading || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    );
  }

  if (error && step === 'verify') {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text variant="h2" color="primary" style={styles.title}>
            Invitation Error
          </Text>
          <Text variant="body" color="error">
            {error}
          </Text>
          {isAuthenticated && user?.email !== invitationEmail && (
            <>
              <Text variant="body" color="secondary" style={styles.subtitle}>
                Would you like to sign out and create a new account with the
                invited email?
              </Text>
              <Button
                variant="primary"
                onPress={handleSignOut}
                style={styles.button}
              >
                Sign Out
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          >
            Back to Login
          </Button>
        </Card>
      </View>
    );
  }

  if (step === 'accept' && invitationData) {
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
            <Text variant="h1" color="primary">
              Join Workspace
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              You've been invited to collaborate
            </Text>
          </View>

          <Card style={styles.card}>
            {/* Invitation Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Workspace
                </Text>
                <Text variant="h3" color="primary">
                  {invitationData.tenantName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Your Role
                </Text>
                <Text variant="body" color="primary">
                  {invitationData.role.charAt(0).toUpperCase() +
                    invitationData.role.slice(1)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Invited By
                </Text>
                <Text variant="body" color="primary">
                  {invitationData.invitedBy}
                </Text>
              </View>
            </View>

            {/* User Email */}
            {isAuthenticated && user && (
              <View style={styles.emailContainer}>
                <Text variant="caption" color="secondary">
                  Joining as
                </Text>
                <Text variant="body" color="primary">
                  {user.email}
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text variant="body" color="error">
                  {error}
                </Text>
              </View>
            )}

            {/* Accept Button */}
            <Button
              variant="primary"
              onPress={handleAcceptInvitation}
              disabled={isLoading}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : isAuthenticated ? (
                'Join Workspace'
              ) : (
                'Sign Up to Join'
              )}
            </Button>

            {/* Cancel Button */}
            <Button
              variant="secondary"
              onPress={() => router.replace('/(auth)/login')}
              disabled={isLoading}
              style={styles.button}
            >
              Cancel
            </Button>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.brand[600]} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
  card: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.background.primary,
    flex: 1,
    justifyContent: 'center',
  },
  detailRow: {
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  emailContainer: {
    backgroundColor: theme.background.secondary,
    borderLeftColor: theme.state.info,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  errorContainer: {
    backgroundColor: theme.background.error,
    borderLeftColor: theme.state.error,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  header: {
    marginBottom: 32,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  subtitle: {
    marginTop: 8,
  },
  title: {
    marginBottom: 16,
  },
});
