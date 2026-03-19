'use client';

/**
 * Web Forgot Password Screen
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { useTheme } from '@automatize/theme';

export default function ForgotPasswordScreen() {
  const { colors: theme } = useTheme();
  const router = useRouter();
  const { resetPassword, isLoading, error } = useUserAuthentication();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send reset email';
      setLocalError(message);
    }
  };

  const displayError = error || localError;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div
        style={{
          flex: 1,
          backgroundColor: '#6366f1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'white',
              margin: 0,
            }}
          >
            Automatize
          </h1>
          <p
            style={{
              fontSize: '18px',
              opacity: 0.9,
              color: 'white',
              margin: 0,
            }}
          >
            {submitted ? 'Check Your Email' : 'Reset Password'}
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: theme.background.secondary,
            borderRadius: '8px',
            padding: '32px 24px',
          }}
        >
          {!submitted ? (
            <>
              <h2
                style={{
                  marginBottom: '24px',
                  textAlign: 'center',
                  color: theme.text.primary,
                  fontSize: '24px',
                  margin: 0,
                }}
              >
                Reset Password
              </h2>

              {displayError && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    borderLeft: `4px solid ${'#dc2626'}`,
                    color: '#dc2626',
                    fontSize: '14px',
                  }}
                >
                  {displayError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: theme.text.primary,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: theme.background.primary,
                    color: theme.text.primary,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!email || isLoading}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: !email || isLoading ? 'not-allowed' : 'pointer',
                  opacity: !email || isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                onClick={() => router.back()}
                disabled={isLoading}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#6366f1',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <h2
                style={{
                  marginBottom: '24px',
                  textAlign: 'center',
                  color: theme.text.primary,
                  fontSize: '24px',
                  margin: 0,
                }}
              >
                Email Sent
              </h2>

              <div
                style={{
                  backgroundColor: theme.background.secondary,
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  borderLeft: `4px solid ${'#22c55e'}`,
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px 0',
                    color: theme.text.secondary,
                    fontSize: '14px',
                  }}
                >
                  We&apos;ve sent a password reset link to:
                </p>
                <p
                  style={{
                    margin: '8px 0 0 0',
                    fontWeight: '600',
                    color: theme.text.primary,
                    fontSize: '14px',
                  }}
                >
                  {email}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: theme.background.secondary,
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: theme.text.secondary,
                  lineHeight: '24px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                1. Check your email (including spam folder)
                {'\n'}2. Click the password reset link
                {'\n'}3. Create a new password
                {'\n'}4. Log in with your new password
              </div>

              <button
                onClick={() => router.push('/login')}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Back to Login
              </button>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#6366f1',
                  border: `1px solid ${'#6366f1'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Sending...' : "Didn't receive email? Resend"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
