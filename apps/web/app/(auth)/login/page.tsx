'use client';

import { useRouter } from 'next/navigation';
import { SignInScreen } from '@automatize/sign-in/web';

export default function LoginPage() {
  const router = useRouter();

  return (
    <SignInScreen
      onSuccess={() => router.push('/')}
      onResetPassword={() => router.push('/forgot-password')}
    />
  );
}
