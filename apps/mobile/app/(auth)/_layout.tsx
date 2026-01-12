/**
 * Auth Layout
 * Stack layout for authentication screens (login, register, MFA, etc.)
 */

import { Stack } from 'expo-router';
import { semanticColors } from '@automatize/ui';

const theme = semanticColors.light;

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
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
