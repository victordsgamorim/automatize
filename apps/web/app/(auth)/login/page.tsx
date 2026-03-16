'use client';

/**
 * Web Login Screen
 *
 * Email/password authentication with optional MFA (TOTP / backup code).
 * Uses @automatize/ui/web components exclusively — no inline styles.
 * Validates via Zod + react-hook-form using the shared loginSchema.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { useUserAuthentication, loginSchema } from '@automatize/supabase-auth';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Alert,
  AlertDescription,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Separator,
  useForm,
} from '@automatize/ui/web';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading, error: authError } = useUserAuthentication();
  const router = useRouter();
  const [mfaStep, setMfaStep] = useState<'credentials' | 'totp' | 'backup'>(
    'credentials'
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      mfaCode: undefined,
      backupCode: undefined,
    },
  });

  const displayError = authError || submitError;

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);

    try {
      const code =
        mfaStep === 'totp'
          ? values.mfaCode
          : mfaStep === 'backup'
            ? values.backupCode
            : undefined;

      await login(values.email, values.password, code);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setSubmitError(message);
    }
  };

  const handleShowMfa = () => {
    setMfaStep('totp');
    form.setValue('mfaCode', '');
  };

  const handleSwitchToBackup = () => {
    setMfaStep('backup');
    form.setValue('mfaCode', undefined);
    form.setValue('backupCode', '');
  };

  const handleBackToCredentials = () => {
    setMfaStep('credentials');
    form.setValue('mfaCode', undefined);
    form.setValue('backupCode', undefined);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Automatize
        </CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>

      <CardContent>
        {displayError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      disabled={isLoading}
                      data-testid="login-email-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      data-testid="login-password-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MFA: TOTP Code */}
            {mfaStep === 'totp' && (
              <FormField
                control={form.control}
                name="mfaCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authentication Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        disabled={isLoading}
                        data-testid="login-mfa-input"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* MFA: Backup Code */}
            {mfaStep === 'backup' && (
              <FormField
                control={form.control}
                name="backupCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Backup Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="8-character backup code"
                        maxLength={8}
                        autoCapitalize="characters"
                        disabled={isLoading}
                        data-testid="login-backup-input"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* MFA toggle buttons */}
            <div className="flex flex-col gap-1">
              {mfaStep === 'credentials' && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto justify-start p-0 text-muted-foreground"
                  onClick={handleShowMfa}
                  disabled={isLoading}
                >
                  <ShieldCheck className="size-3.5" />
                  Have an MFA code?
                </Button>
              )}

              {mfaStep === 'totp' && (
                <>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto justify-start p-0 text-muted-foreground"
                    onClick={handleSwitchToBackup}
                    disabled={isLoading}
                  >
                    <KeyRound className="size-3.5" />
                    Use backup code instead
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto justify-start p-0 text-muted-foreground"
                    onClick={handleBackToCredentials}
                    disabled={isLoading}
                  >
                    Back to password login
                  </Button>
                </>
              )}

              {mfaStep === 'backup' && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto justify-start p-0 text-muted-foreground"
                  onClick={handleBackToCredentials}
                  disabled={isLoading}
                >
                  Back to password login
                </Button>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={isLoading}
              data-testid="login-submit-button"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col gap-3 pt-6">
        <Link
          href="/(auth)/forgot-password"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Forgot your password?
        </Link>

        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/(auth)/register"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
