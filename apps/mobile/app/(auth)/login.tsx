/**
 * Login Screen
 * Email and password authentication using cross-platform SignInScreen
 */

import { router } from 'expo-router';
import { SignInScreen, useSignIn } from '@automatize/sign-in';

export default function LoginScreen() {
  const signIn = useSignIn();

  const handleSignIn = async () => {
    const result = await signIn.handleSignIn();
    if (result.success) {
      // Navigation handled by AuthProvider state change
    }
  };

  return (
    <SignInScreen
      email={signIn.email}
      onEmailChange={signIn.setEmail}
      password={signIn.password}
      onPasswordChange={signIn.setPassword}
      showPassword={signIn.showPassword}
      onToggleShowPassword={signIn.toggleShowPassword}
      error={signIn.error}
      isLoading={signIn.isLoading}
      onSignIn={handleSignIn}
      onResetPassword={() => router.push('/(auth)/forgot-password')}
    />
  );
}
