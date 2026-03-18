'use client';

import { useRouter } from 'next/navigation';
import { SignInScreen, useSignIn } from '@automatize/sign-in/web';

export default function LoginPage() {
  const router = useRouter();
  const signIn = useSignIn();

  const handleSignIn = async () => {
    const result = await signIn.handleSignIn();
    if (result.success) {
      router.push('/');
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
      onResetPassword={() => router.push('/forgot-password')}
    />
  );
}
