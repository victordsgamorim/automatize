/**
 * Login Screen
 * Email and password authentication using cross-platform SignInScreen
 */

import { router } from 'expo-router';
import { SignInScreen } from '@automatize/sign-in';

export default function LoginScreen() {
  return (
    <SignInScreen
      onSuccess={() => {
        // Navigation handled by AuthProvider state change
      }}
      onResetPassword={() => router.push('/(auth)/forgot-password')}
    />
  );
}
