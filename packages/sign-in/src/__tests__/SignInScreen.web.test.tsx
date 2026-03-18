import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  LocalizationProvider,
  initLocalization,
  _resetLocalization,
  createLocalLoader,
} from '@automatize/localization';

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

async function renderScreen(props: Partial<SignInScreenProps> = {}) {
  render(
    <LocalizationProvider>
      <SignInScreen {...defaultProps} {...props} />
    </LocalizationProvider>
  );
  // Wait for i18next to initialize — LocalizationProvider renders null until ready
  await waitFor(() => screen.getByLabelText('Email'));
}

describe('SignInScreen (web)', () => {
  beforeEach(() => {
    _resetLocalization();
    initLocalization(createLocalLoader(), 'en');
    vi.clearAllMocks();
  });

  afterEach(() => {
    _resetLocalization();
  });

  describe('rendering', () => {
    it('renders the email input', async () => {
      await renderScreen();
      expect(screen.getByLabelText('Email')).toBeDefined();
    });

    it('renders the password input', async () => {
      await renderScreen();
      expect(screen.getByLabelText('Password')).toBeDefined();
    });

    it('renders the Sign In submit button', async () => {
      await renderScreen({ email: 'u@e.com', password: 'pass' });
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined();
    });

    it('renders the Reset password link button', async () => {
      await renderScreen();
      expect(
        screen.getByRole('button', { name: 'Reset password' })
      ).toBeDefined();
    });

    it('renders the "Keep me signed in" checkbox', async () => {
      await renderScreen();
      expect(screen.getByRole('checkbox')).toBeDefined();
    });

    it('does not render an error element when error is null', async () => {
      await renderScreen({ error: null });
      expect(screen.queryByText(/invalid|error|failed/i)).toBeNull();
    });

    it('renders the error message when error is set', async () => {
      await renderScreen({ error: 'Invalid credentials' });
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });
  });

  describe('field state', () => {
    it('reflects email value from props', async () => {
      await renderScreen({ email: 'user@example.com' });
      const input = screen.getByLabelText('Email') as HTMLInputElement;
      expect(input.value).toBe('user@example.com');
    });

    it('reflects password value from props', async () => {
      await renderScreen({ password: 'mypassword' });
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.value).toBe('mypassword');
    });

    it('renders password as type="password" when showPassword is false', async () => {
      await renderScreen({ showPassword: false });
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('renders password as type="text" when showPassword is true', async () => {
      await renderScreen({ showPassword: true });
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.type).toBe('text');
    });
  });

  describe('submit button state', () => {
    it('is disabled when email is empty', async () => {
      await renderScreen({ email: '', password: 'pass123' });
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('is disabled when password is empty', async () => {
      await renderScreen({ email: 'user@example.com', password: '' });
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('is enabled when both email and password are provided', async () => {
      await renderScreen({ email: 'user@example.com', password: 'pass123' });
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      }) as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    it('is disabled and shows "Signing in..." when isLoading is true', async () => {
      await renderScreen({
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
    it('calls onEmailChange when email input changes', async () => {
      const onEmailChange = vi.fn();
      await renderScreen({ onEmailChange });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'new@example.com' },
      });
      expect(onEmailChange).toHaveBeenCalledWith('new@example.com');
    });

    it('calls onPasswordChange when password input changes', async () => {
      const onPasswordChange = vi.fn();
      await renderScreen({ onPasswordChange });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'newpass' },
      });
      expect(onPasswordChange).toHaveBeenCalledWith('newpass');
    });

    it('calls onSignIn when the form is submitted', async () => {
      const onSignIn = vi.fn();
      await renderScreen({ email: 'u@e.com', password: 'pass123', onSignIn });
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);
      expect(onSignIn).toHaveBeenCalledOnce();
    });

    it('calls onResetPassword when Reset password is clicked', async () => {
      const onResetPassword = vi.fn();
      await renderScreen({ onResetPassword });
      fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
      expect(onResetPassword).toHaveBeenCalledOnce();
    });

    it('calls onToggleShowPassword when the password visibility button is clicked', async () => {
      const onToggleShowPassword = vi.fn();
      await renderScreen({ onToggleShowPassword });
      // The toggle button lives inside the relative wrapper around the password input
      const passwordInput = screen.getByLabelText('Password');
      const wrapper = passwordInput.closest('.relative') as HTMLElement;
      const toggleBtn = wrapper.querySelector('button') as HTMLButtonElement;
      fireEvent.click(toggleBtn);
      expect(onToggleShowPassword).toHaveBeenCalledOnce();
    });
  });
});
