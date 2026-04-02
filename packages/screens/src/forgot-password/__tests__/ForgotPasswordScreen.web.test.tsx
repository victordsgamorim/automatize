import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock @automatize/core-localization
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'forgot-password.title': 'Reset your password',
        'forgot-password.subtitle':
          "Enter your email and we'll send you a link to reset your password",
        'forgot-password.email.label': 'Email',
        'forgot-password.email.placeholder': 'Enter your email',
        'forgot-password.submit': 'Send reset link',
        'forgot-password.submitting': 'Sending...',
        'forgot-password.success.title': 'Check your inbox',
        'forgot-password.success.message':
          "If an account exists for that email, we've sent a password reset link.",
        'forgot-password.back-to-sign-in': 'Back to sign in',
        'theme.switch-label': 'Change theme',
        'language.switch-label': 'Change language',
      };
      return translations[key] ?? key;
    },
    language: 'en',
    changeLanguage: vi.fn(),
  }),
}));

// Mock useForgotPassword hook
const mockHandleSubmit = vi.fn().mockResolvedValue({ success: true });
const mockSetEmail = vi.fn();

vi.mock('../useForgotPassword', () => ({
  useForgotPassword: vi.fn(() => ({
    email: '',
    setEmail: mockSetEmail,
    error: null,
    isLoading: false,
    isSuccess: false,
    handleSubmit: mockHandleSubmit,
  })),
}));

// Mock @automatize/ui/web
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
  }) => (
    <input
      onChange={onChange}
      value={value}
      disabled={disabled}
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      {...rest}
    />
  ),
  FormField: ({
    children,
    label,
    htmlFor,
    className,
  }: {
    children: React.ReactNode;
    label: string;
    htmlFor?: string;
    className?: string;
  }) => (
    <div className={className}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  ),
  AnimatedFadeIn: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useToasts: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../components/ThemeSwitcher/ThemeSwitcher.web', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock('../../components/LanguageSwitcher/LanguageSwitcher.web', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

import { useForgotPassword } from '../useForgotPassword';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen.web';

const mockedUseForgotPassword = vi.mocked(useForgotPassword);

const defaultProps = {
  onBackToSignIn: vi.fn(),
  locale: {
    languages: [{ code: 'en', label: 'English', ext: 'US' }],
    currentLanguage: 'en',
    onLanguageChange: vi.fn(),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseForgotPassword.mockReturnValue({
    email: '',
    setEmail: mockSetEmail,
    error: null,
    isLoading: false,
    isSuccess: false,
    handleSubmit: mockHandleSubmit,
  });
});

describe('ForgotPasswordScreen (web)', () => {
  describe('form state', () => {
    it('renders the title', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByText('Reset your password')).toBeDefined();
    });

    it('renders the subtitle', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(
        screen.getByText(
          "Enter your email and we'll send you a link to reset your password"
        )
      ).toBeDefined();
    });

    it('renders email input', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
    });

    it('renders submit button', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByText('Send reset link')).toBeDefined();
    });

    it('renders back to sign in link', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByText('Back to sign in')).toBeDefined();
    });

    it('renders language switcher', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByTestId('language-switcher')).toBeDefined();
    });
  });

  describe('success state', () => {
    beforeEach(() => {
      mockedUseForgotPassword.mockReturnValue({
        email: 'user@example.com',
        setEmail: mockSetEmail,
        error: null,
        isLoading: false,
        isSuccess: true,
        handleSubmit: mockHandleSubmit,
      });
    });

    it('renders success title', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByText('Check your inbox')).toBeDefined();
    });

    it('renders success message', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(
        screen.getByText(
          "If an account exists for that email, we've sent a password reset link."
        )
      ).toBeDefined();
    });

    it('renders back to sign in button', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByText('Back to sign in')).toBeDefined();
    });

    it('does not render the email input', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.queryByPlaceholderText('Enter your email')).toBeNull();
    });
  });

  describe('field state', () => {
    it('reflects email value from hook', () => {
      mockedUseForgotPassword.mockReturnValue({
        email: 'test@test.com',
        setEmail: mockSetEmail,
        error: null,
        isLoading: false,
        isSuccess: false,
        handleSubmit: mockHandleSubmit,
      });
      render(<ForgotPasswordScreen {...defaultProps} />);
      const input = screen.getByPlaceholderText(
        'Enter your email'
      ) as HTMLInputElement;
      expect(input.value).toBe('test@test.com');
    });
  });

  describe('submit button state', () => {
    it('is disabled when email is empty', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      const button = screen.getByText('Send reset link') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('is enabled when email is provided', () => {
      mockedUseForgotPassword.mockReturnValue({
        email: 'user@example.com',
        setEmail: mockSetEmail,
        error: null,
        isLoading: false,
        isSuccess: false,
        handleSubmit: mockHandleSubmit,
      });
      render(<ForgotPasswordScreen {...defaultProps} />);
      const button = screen.getByText('Send reset link') as HTMLButtonElement;
      expect(button.disabled).toBe(false);
    });

    it('is disabled when loading', () => {
      mockedUseForgotPassword.mockReturnValue({
        email: 'user@example.com',
        setEmail: mockSetEmail,
        error: null,
        isLoading: true,
        isSuccess: false,
        handleSubmit: mockHandleSubmit,
      });
      render(<ForgotPasswordScreen {...defaultProps} />);
      const button = screen.getByText('Sending...') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('shows loading text when submitting', () => {
      mockedUseForgotPassword.mockReturnValue({
        email: 'user@example.com',
        setEmail: mockSetEmail,
        error: null,
        isLoading: true,
        isSuccess: false,
        handleSubmit: mockHandleSubmit,
      });
      render(<ForgotPasswordScreen {...defaultProps} />);
      expect(screen.getByText('Sending...')).toBeDefined();
    });
  });

  describe('interactions', () => {
    it('calls setEmail on input change', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      const input = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(input, { target: { value: 'new@email.com' } });
      expect(mockSetEmail).toHaveBeenCalledWith('new@email.com');
    });

    it('calls handleSubmit on form submit', () => {
      mockedUseForgotPassword.mockReturnValue({
        email: 'user@example.com',
        setEmail: mockSetEmail,
        error: null,
        isLoading: false,
        isSuccess: false,
        handleSubmit: mockHandleSubmit,
      });
      render(<ForgotPasswordScreen {...defaultProps} />);
      const button = screen.getByText('Send reset link');
      fireEvent.click(button);
      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it('calls onBackToSignIn on back button click', () => {
      render(<ForgotPasswordScreen {...defaultProps} />);
      const backButton = screen.getByLabelText('Back to sign in');
      fireEvent.click(backButton);
      expect(defaultProps.onBackToSignIn).toHaveBeenCalled();
    });

    it('calls onBackToSignIn from success state', () => {
      mockedUseForgotPassword.mockReturnValue({
        email: 'user@example.com',
        setEmail: mockSetEmail,
        error: null,
        isLoading: false,
        isSuccess: true,
        handleSubmit: mockHandleSubmit,
      });
      render(<ForgotPasswordScreen {...defaultProps} />);
      const button = screen.getByText('Back to sign in');
      fireEvent.click(button);
      expect(defaultProps.onBackToSignIn).toHaveBeenCalled();
    });
  });
});
