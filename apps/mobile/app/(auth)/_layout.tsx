/**
 * Auth Layout
 * Stack layout for authentication screens (login, register, MFA, etc.)
 */

import { Stack } from 'expo-router';
import { useTheme } from '@automatize/theme';

export default function AuthLayout() {
  const { colors: theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background.primary,
        },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="mfa-setup" />
      <Stack.Screen name="mfa-verify" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
