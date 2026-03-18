import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SignInScreen } from '../SignInScreen.web';
import type { SignInScreenProps } from '../SignInScreen.types';

const defaultProps: SignInScreenProps = {
  email: '',
  onEmailChange: vi.fn(),
  password: '',
  onPasswordChange: vi.fn(),
  showPassword: false,
  onToggleShowPassword: vi.fn(),
  error: null,
  isLoading: false,
  onSignIn: vi.fn(),
  onResetPassword: vi.fn(),
};

function renderScreen(props: Partial<SignInScreenProps> = {}) {
  return render(<SignInScreen {...defaultProps} {...props} />);
}

describe('SignInScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the email input', () => {
      renderScreen();
      expect(screen.getByLabelText('Email Address')).toBeDefined();
    });

    it('renders the password input', () => {
      renderScreen();
      expect(screen.getByLabelText('Password')).toBeDefined();
    });

    it('renders the Sign In submit button', () => {
      renderScreen({ email: 'u@e.com', password: 'pass' });
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined();
    });

    it('renders the Reset password link button', () => {
      renderScreen();
      expect(
        screen.getByRole('button', { name: 'Reset password' })
      ).toBeDefined();
    });

    it('renders the "Keep me signed in" checkbox', () => {
      renderScreen();
      expect(screen.getByRole('checkbox')).toBeDefined();
    });

    it('does not render an error element when error is null', () => {
      renderScreen({ error: null });
      expect(screen.queryByText(/invalid|error|failed/i)).toBeNull();
    });

    it('renders the error message when error is set', () => {
      renderScreen({ error: 'Invalid credentials' });
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });
  });

  describe('field state', () => {
    it('reflects email value from props', () => {
      renderScreen({ email: 'user@example.com' });
      const input = screen.getByLabelText('Email Address') as HTMLInputElement;
      expect(input.value).toBe('user@example.com');
    });

    it('reflects password value from props', () => {
      renderScreen({ password: 'mypassword' });
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.value).toBe('mypassword');
    });

    it('renders password as type="password" when showPassword is false', () => {
      renderScreen({ showPassword: false });
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('renders password as type="text" when showPassword is true', () => {
      renderScreen({ showPassword: true });
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.type).toBe('text');
    });
  });

  describe('submit button state', () => {
    it('is disabled when email is empty', () => {
      renderScreen({ email: '', password: 'pass123' });
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('is disabled when password is empty', () => {
      renderScreen({ email: 'user@example.com', password: '' });
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('is enabled when both email and password are provided', () => {
      renderScreen({ email: 'user@example.com', password: 'pass123' });
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      }) as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    it('is disabled and shows "Signing in..." when isLoading is true', () => {
      renderScreen({
        email: 'user@example.com',
        password: 'pass123',
        isLoading: true,
      });
      const btn = screen.getByRole('button', {
        name: 'Signing in...',
      }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('interactions', () => {
    it('calls onEmailChange when email input changes', () => {
      const onEmailChange = vi.fn();
      renderScreen({ onEmailChange });
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'new@example.com' },
      });
      expect(onEmailChange).toHaveBeenCalledWith('new@example.com');
    });

    it('calls onPasswordChange when password input changes', () => {
      const onPasswordChange = vi.fn();
      renderScreen({ onPasswordChange });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'newpass' },
      });
      expect(onPasswordChange).toHaveBeenCalledWith('newpass');
    });

    it('calls onSignIn when the form is submitted', () => {
      const onSignIn = vi.fn();
      renderScreen({ email: 'u@e.com', password: 'pass123', onSignIn });
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);
      expect(onSignIn).toHaveBeenCalledOnce();
    });

    it('calls onResetPassword when Reset password is clicked', () => {
      const onResetPassword = vi.fn();
      renderScreen({ onResetPassword });
      fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
      expect(onResetPassword).toHaveBeenCalledOnce();
    });

    it('calls onToggleShowPassword when the password visibility button is clicked', () => {
      const onToggleShowPassword = vi.fn();
      renderScreen({ onToggleShowPassword });
      // The toggle button lives inside the relative wrapper around the password input
      const passwordInput = screen.getByLabelText('Password');
      const wrapper = passwordInput.closest('.relative') as HTMLElement;
      const toggleBtn = wrapper.querySelector('button') as HTMLButtonElement;
      fireEvent.click(toggleBtn);
      expect(onToggleShowPassword).toHaveBeenCalledOnce();
    });
  });
});
