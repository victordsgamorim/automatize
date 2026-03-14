'use client';

/**
 * Web Login Screen
 * Email and password authentication for web
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { semanticColors } from '@automatize/ui/tokens';

const theme = semanticColors.light;

export default function LoginScreen() {
  const { login, isLoading, error } = useUserAuthentication();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [useMfaCode, setUseMfaCode] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      const code = useMfaCode ? mfaCode : undefined;
      await login(email, password, code);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
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
      {/* Left Panel - Branding */}
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
            Invoice Management System
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
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
          onSubmit={handleLogin}
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
            Login
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
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              data-testid="login-email-input"
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
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              data-testid="login-password-input"
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

          {useMfaCode && (
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
                {useBackupCode ? 'Backup Code' : 'MFA Code'}
              </label>
              <input
                type={useBackupCode ? 'text' : 'number'}
                placeholder={
                  useBackupCode
                    ? 'Enter 8-character backup code'
                    : 'Enter 6-digit code'
                }
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={useBackupCode ? 8 : 6}
                disabled={isLoading}
                data-testid="login-mfa-input"
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
          )}

          {!useMfaCode && (
            <button
              onClick={() => setUseMfaCode(true)}
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
              Have a MFA or backup code?
            </button>
          )}

          {useMfaCode && !useBackupCode && (
            <button
              onClick={() => setUseBackupCode(true)}
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
              Use backup code instead
            </button>
          )}

          {useMfaCode && (
            <button
              onClick={() => {
                setUseMfaCode(false);
                setMfaCode('');
                setUseBackupCode(false);
              }}
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
              Back to password login
            </button>
          )}

          <button
            type="submit"
            disabled={
              !email || !password || (useMfaCode && !mfaCode) || isLoading
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
                isLoading || !email || !password ? 'not-allowed' : 'pointer',
              opacity: isLoading || !email || !password ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <Link
            href="/(auth)/forgot-password"
            style={{
              display: 'block',
              marginTop: '8px',
              padding: '10px',
              textAlign: 'center',
              color: '#6366f1',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Forgot your password?
          </Link>

          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              color: theme.text.secondary,
              fontSize: '14px',
            }}
          >
            Don&apos;t have an account?{' '}
            <Link
              href="/(auth)/register"
              style={{
                color: '#6366f1',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
