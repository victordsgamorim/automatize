import { useState, useCallback } from 'react';
import { useAuth } from '@automatize/auth';
import { resetPasswordFormSchema } from './resetPasswordFormSchema';

export interface UseForgotPasswordResult {
  email: string;
  setEmail: (value: string) => void;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  handleSubmit: () => Promise<{ success: boolean }>;
}

export function useForgotPassword(): UseForgotPasswordResult {
  const auth = useAuth();
  const resetPassword = useCallback(
    (email: string) => auth.resetPassword(email),
    [auth]
  );
  const authLoading = auth.isLoading;

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(async (): Promise<{ success: boolean }> => {
    setLocalError(null);

    const result = resetPasswordFormSchema.safeParse({ email });
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? 'Invalid input';
      setLocalError(firstError);
      return { success: false };
    }

    setIsSubmitting(true);
    try {
      await resetPassword(result.data.email);
      setIsSuccess(true);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send reset email';
      setLocalError(message);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [email, resetPassword]);

  return {
    email,
    setEmail,
    error: localError,
    isLoading: authLoading || isSubmitting,
    isSuccess,
    handleSubmit,
  };
}
