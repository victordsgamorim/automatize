'use client';

import { useRouter } from 'next/navigation';
import { SignInPage } from '@automatize/ui/web';
import { useUserAuthentication } from '@automatize/supabase-auth';

export default function LoginPage() {
  const { login } = useUserAuthentication();
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleResetPassword = () => {
    router.push('/forgot-password');
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <SignInPage
      onSignIn={handleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}
