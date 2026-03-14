'use client';

/**
 * Web Register Screen
 * User registration for web
 */

import { useState } from 'react';
import Link from 'next/link';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { semanticColors } from '@automatize/ui/tokens';

const theme = semanticColors.light;

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 4) return { score, label: 'Strong', color: '#22c55e' };
  if (score === 3) return { score, label: 'Good', color: '#f59e0b' };
  return { score, label: 'Weak', color: '#dc2626' };
}

export default function RegisterScreen() {
  const { register, isLoading, error } = useUserAuthentication();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);
  const passwordMatch = password === confirmPassword && password.length > 0;

  const handleRegister = async () => {
    setLocalError(null);

    if (!displayName.trim()) {
      setLocalError('Display name is required');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    if (!passwordMatch) {
      setLocalError('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setLocalError('You must agree to the Terms of Service');
      return;
    }

    try {
      await register(email, password, displayName);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      setLocalError(message);
    }
  };

  const displayError = error || localError;
  const isValid =
    displayName.trim() &&
    email.trim() &&
    passwordMatch &&
    agreedToTerms &&
    !isLoading;

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
            Create Your Account
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
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
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
            Register
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
              Display Name
            </label>
            <input
              type="text"
              placeholder="e.g., John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
              Email
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

          {password && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  marginBottom: '4px',
                  backgroundColor: '#e5e7eb',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: passwordStrength.color,
                    width: `${(passwordStrength.score / 4) * 100}%`,
                    transition: 'width 0.2s',
                  }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: theme.text.secondary,
                }}
              >
                Password strength: {passwordStrength.label}
              </p>
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
                  confirmPassword && !passwordMatch
                    ? `1px solid ${'#dc2626'}`
                    : `1px solid ${theme.border || '#e5e7eb'}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                boxSizing: 'border-box',
              }}
            />
            {confirmPassword && !passwordMatch && (
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
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              gap: '8px',
            }}
          >
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isLoading}
              style={{
                marginTop: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            />
            <label
              style={{
                color: theme.text.secondary,
                fontSize: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            disabled={!isValid}
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
              cursor: !isValid ? 'not-allowed' : 'pointer',
              opacity: !isValid ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              color: theme.text.secondary,
              fontSize: '14px',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/(auth)/login"
              style={{
                color: '#6366f1',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
