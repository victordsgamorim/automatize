import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { SignInScreen } from '../SignInScreen.web';
import type { SignInScreenProps } from '../SignInScreen.types';
import type { UseSignInResult } from '../useSignIn';

vi.mock('@automatize/ui/web', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    className?: string;
    variant?: string;
    size?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type as 'button' | 'submit' | 'reset'}
      className={className}
      {...rest}
    >
      {children}
    </button>
  ),
  Input: ({
    onChange,
    value,
    disabled,
    id,
    name,
    type,
    placeholder,
    className,
    label,
    ...rest
  }: {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
    type?: string;
    placeholder?: string;
    className?: string;
    label?: string;
  }) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        onChange={onChange}
        value={value}
        disabled={disabled}
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className={className}
        {...rest}
      />
    </div>
  ),
  Text: ({
    children,
    className,
    htmlFor,
    variant,
    color,
  }: {
    children: React.ReactNode;
    className?: string;
    htmlFor?: string;
    variant?: string;
    color?: string;
  }) =>
    htmlFor ? (
      <label className={className} htmlFor={htmlFor}>
        {children}
      </label>
    ) : (
      <span className={className} data-variant={variant} data-color={color}>
        {children}
      </span>
    ),
  Checkbox: ({ name }: { name?: string }) => (
    <input type="checkbox" role="checkbox" name={name} />
  ),
  Fade: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  useToasts: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../components/ThemeSwitcher/ThemeSwitcher.web', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock('../../components/LanguageSwitcher/LanguageSwitcher.web', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'sign-in.email.label': 'Email',
        'sign-in.email.placeholder': 'Enter your email',
        'sign-in.password.label': 'Password',
        'sign-in.password.placeholder': 'Enter your password',
        'sign-in.password.show': 'Show password',
        'sign-in.password.hide': 'Hide password',
        'sign-in.remember': 'Keep me signed in',
        'sign-in.reset-password': 'Reset password',
        'sign-in.submit': 'Sign In',
        'sign-in.submitting': 'Signing in...',
        'sign-in.welcome': 'Welcome',
        'sign-in.subtitle':
          'Access your account and continue your journey with us',
        'language.switch-label': 'Change language',
        'theme.switch-label': 'Change theme',
      })[key] ?? key,
    language: 'en',
    changeLanguage: vi.fn(),
  }),
}));

const mockHandleSignIn = vi.fn().mockResolvedValue({ success: false });

const mockSignIn: UseSignInResult = {
  email: '',
  setEmail: vi.fn(),
  password: '',
  setPassword: vi.fn(),
  showPassword: false,
  toggleShowPassword: vi.fn(),
  error: null,
  isLoading: false,
  handleSignIn: mockHandleSignIn,
};

vi.mock('../useSignIn', () => ({
  useSignIn: () => mockSignIn,
}));

const defaultProps: SignInScreenProps = {
  onSuccess: vi.fn(),
  onResetPassword: vi.fn(),
  locale: {
    languages: [
      { code: 'en', label: 'English', ext: 'US' },
      { code: 'pt-BR', label: 'Português', ext: 'BR' },
    ],
    currentLanguage: 'en',
    onLanguageChange: vi.fn(),
  },
  theme: {
    currentTheme: 'system',
    isDarkTheme: false,
    themeOptions: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ],
    onThemeChange: vi.fn(),
  },
};

async function renderScreen(props: Partial<SignInScreenProps> = {}) {
  render(<SignInScreen {...defaultProps} {...props} />);
  await waitFor(() => screen.getByLabelText('Email'));
}

function setMockState(overrides: Partial<UseSignInResult>) {
  Object.assign(mockSignIn, overrides);
}

describe('SignInScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockState({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      showPassword: false,
      toggleShowPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSignIn: mockHandleSignIn,
    });
    mockHandleSignIn.mockResolvedValue({ success: false });
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
      setMockState({ email: 'u@e.com', password: 'pass' });
      await renderScreen();
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
  });

  describe('field state', () => {
    it('reflects email value from hook', async () => {
      setMockState({ email: 'user@example.com' });
      await renderScreen();
      const input = screen.getByLabelText('Email');
      expect((input as HTMLInputElement).value).toBe('user@example.com');
    });

    it('reflects password value from hook', async () => {
      setMockState({ password: 'mypassword' });
      await renderScreen();
      const input = screen.getByLabelText('Password');
      expect((input as HTMLInputElement).value).toBe('mypassword');
    });

    it('renders password as type="password" when showPassword is false', async () => {
      setMockState({ showPassword: false });
      await renderScreen();
      const input = screen.getByLabelText('Password');
      expect((input as HTMLInputElement).type).toBe('password');
    });

    it('renders password as type="text" when showPassword is true', async () => {
      setMockState({ showPassword: true });
      await renderScreen();
      const input = screen.getByLabelText('Password');
      expect((input as HTMLInputElement).type).toBe('text');
    });
  });

  describe('submit button state', () => {
    it('is disabled when email is empty', async () => {
      setMockState({ email: '', password: 'pass123' });
      await renderScreen();
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });

    it('is disabled when password is empty', async () => {
      setMockState({ email: 'user@example.com', password: '' });
      await renderScreen();
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });

    it('is enabled when both email and password are provided', async () => {
      setMockState({ email: 'user@example.com', password: 'pass123' });
      await renderScreen();
      const btn = screen.getByRole('button', {
        name: 'Sign In',
      });
      expect((btn as HTMLButtonElement).disabled).toBe(false);
    });

    it('is disabled and shows "Signing in..." when isLoading is true', async () => {
      setMockState({
        email: 'user@example.com',
        password: 'pass123',
        isLoading: true,
      });
      await renderScreen();
      const btn = screen.getByRole('button', {
        name: 'Signing in...',
      });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe('interactions', () => {
    it('calls setEmail when email input changes', async () => {
      const setEmail = vi.fn();
      setMockState({ setEmail });
      await renderScreen();
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'new@example.com' },
      });
      expect(setEmail).toHaveBeenCalledWith('new@example.com');
    });

    it('calls setPassword when password input changes', async () => {
      const setPassword = vi.fn();
      setMockState({ setPassword });
      await renderScreen();
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'newpass' },
      });
      expect(setPassword).toHaveBeenCalledWith('newpass');
    });

    it('calls handleSignIn when the form is submitted', async () => {
      setMockState({ email: 'u@e.com', password: 'pass123' });
      await renderScreen();
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);
      expect(mockHandleSignIn).toHaveBeenCalledOnce();
    });

    it('calls onSuccess when sign-in succeeds', async () => {
      mockHandleSignIn.mockResolvedValue({ success: true });
      const onSuccess = vi.fn();
      setMockState({ email: 'u@e.com', password: 'pass123' });
      await renderScreen({ onSuccess });
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);
      await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    });

    it('does not call onSuccess when sign-in fails', async () => {
      mockHandleSignIn.mockResolvedValue({ success: false });
      const onSuccess = vi.fn();
      setMockState({ email: 'u@e.com', password: 'pass123' });
      await renderScreen({ onSuccess });
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);
      await waitFor(() => expect(mockHandleSignIn).toHaveBeenCalledOnce());
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls onResetPassword when Reset password is clicked', async () => {
      const onResetPassword = vi.fn();
      await renderScreen({ onResetPassword });
      fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
      expect(onResetPassword).toHaveBeenCalledOnce();
    });

    it('calls toggleShowPassword when the password visibility button is clicked', async () => {
      const toggleShowPassword = vi.fn();
      setMockState({ toggleShowPassword });
      await renderScreen();
      const passwordInput = screen.getByLabelText('Password');
      const wrapper = passwordInput.closest('.relative') as HTMLElement;
      const toggleBtn = wrapper.querySelector('button') as HTMLButtonElement;
      fireEvent.click(toggleBtn);
      expect(toggleShowPassword).toHaveBeenCalledOnce();
    });
  });
});
