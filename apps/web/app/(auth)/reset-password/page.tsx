'use client';

/**
 * Web Reset Password Screen
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@automatize/supabase-auth';
import { semanticColors } from '@automatize/ui/tokens';

const theme = semanticColors.light;

export default function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const auth = useAuth() as any;
  const { updatePassword, isLoading, error } = auth;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLocalError(
        'Invalid or missing reset token. Please request a new password reset.'
      );
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!password) {
      setLocalError('Please enter a new password');
      return;
    }
    if (!confirmPassword) {
      setLocalError('Please confirm your password');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await updatePassword(password);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset password';
      setLocalError(message);
    }
  };

  const displayError = error || localError;

  if (!token) {
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
          <h1
            style={{
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Automatize
          </h1>
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
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: theme.background.secondary,
              borderRadius: '8px',
              padding: '32px 24px',
            }}
          >
            <h2
              style={{
                marginBottom: '24px',
                textAlign: 'center',
                color: theme.text.primary,
                fontSize: '24px',
                margin: 0,
              }}
            >
              Invalid Link
            </h2>
            <p style={{ marginBottom: '16px', color: '#dc2626' }}>
              {displayError}
            </p>
            <button
              onClick={() => router.push('/forgot-password')}
              style={{
                width: '100%',
                marginTop: '24px',
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
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {submitted ? 'Password Reset' : 'Create New Password'}
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
          onSubmit={handleResetPassword}
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
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border:
                      confirmPassword && password !== confirmPassword
                        ? `1px solid ${'#dc2626'}`
                        : `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: theme.background.primary,
                    color: theme.text.primary,
                    boxSizing: 'border-box',
                  }}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p
                    style={{
                      margin: '4px 0 0 0',
                      fontSize: '12px',
                      color: '#dc2626',
                    }}
                  >
                    Passwords do not match
                  </p>
                )}
              </div>

              <div
                style={{
                  backgroundColor: theme.background.secondary,
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: theme.text.secondary,
                  lineHeight: '1.6',
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>
                  Password must include:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword ||
                  isLoading
                }
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
                  cursor:
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    isLoading
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    isLoading
                      ? 0.6
                      : 1,
                }}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
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
                ✓ Success
              </h2>

              <div
                style={{
                  backgroundColor: theme.background.secondary,
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  borderLeft: `4px solid ${'#22c55e'}`,
                  color: theme.text.secondary,
                  fontSize: '14px',
                }}
              >
                Your password has been successfully reset. You can now log in
                with your new password.
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
            </>
          )}
        </form>
      </div>
    </div>
  );
}
