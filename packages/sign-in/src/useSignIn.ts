import { useState, useCallback } from 'react';
import { useAuth, loginSchema } from '@automatize/core';

export interface UseSignInResult {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  error: string | null;
  isLoading: boolean;
  handleSignIn: () => Promise<{ success: boolean }>;
}

export function useSignIn(): UseSignInResult {
  const { login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSignIn = useCallback(async (): Promise<{ success: boolean }> => {
    setLocalError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const firstError = result.error.errors[0]?.message ?? 'Invalid input';
      setLocalError(firstError);
      return { success: false };
    }

    setIsSubmitting(true);
    try {
      await login(result.data.email, result.data.password);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setLocalError(message);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    error: localError,
    isLoading: authLoading || isSubmitting,
    handleSignIn,
  };
}
