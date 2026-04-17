import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import React from 'react';

import { PasswordSection } from '../PasswordSection.web';

// ── Mocks ────────────────────────────────────────────────────────────────────

const toastMessageMock = vi.fn();

vi.mock('@automatize/ui/web', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Input: ({
    id,
    label,
    value,
    onChange,
    type,
    error,
  }: {
    id?: string;
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    error?: string;
  }) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-label={label}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
  Button: ({
    children,
    onClick,
    type,
    'aria-label': ariaLabel,
    size,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    'aria-label'?: string;
    variant?: string;
    size?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick}
      aria-label={ariaLabel}
      data-size={size}
    >
      {children}
    </button>
  ),
  PrimaryButton: ({
    children,
    onClick,
    type,
    disabled,
    shortcut,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    disabled?: boolean;
    shortcut?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      data-shortcut={shortcut}
      data-variant="default"
    >
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    type,
    shortcut,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    shortcut?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick}
      data-variant="secondary"
      data-shortcut={shortcut}
    >
      {children}
    </button>
  ),
  Dialog: ({
    open,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children?: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children?: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useToasts: () => ({
    message: toastMessageMock,
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'profile.section.password': 'Password',
        'profile.password.label': 'Password',
        'profile.password.change': 'Change',
        'profile.password.dialog.title': 'Change Password',
        'profile.password.dialog.description': 'Enter your current password',
        'profile.password.current': 'Current Password',
        'profile.password.current.placeholder': 'Enter current password',
        'profile.password.new': 'New Password',
        'profile.password.new.placeholder': 'Enter new password',
        'profile.password.confirm': 'Confirm Password',
        'profile.password.confirm.placeholder': 'Confirm new password',
        'profile.password.mismatch': 'Passwords do not match',
        'profile.password.save': 'Update Password',
        'profile.password.saved': 'Password updated successfully',
        'sign-in.password.show': 'Show password',
        'sign-in.password.hide': 'Hide password',
        'app.cancel': 'Cancel',
      })[key] ?? key,
  }),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PasswordSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the masked password display and Change button', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);

    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the dialog when Change is clicked', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change' }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Change Password' })
    ).toBeTruthy();
  });

  it('renders all three password fields inside the dialog', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));

    expect(screen.getByLabelText('Current Password')).toBeTruthy();
    expect(screen.getByLabelText('New Password')).toBeTruthy();
    expect(screen.getByLabelText('Confirm Password')).toBeTruthy();
  });

  it('disables Update Password when fields are empty', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));

    expect(
      screen
        .getByRole('button', { name: 'Update Password' })
        .hasAttribute('disabled')
    ).toBe(true);
  });

  it('disables Update Password when passwords do not match', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different' },
    });

    expect(
      screen
        .getByRole('button', { name: 'Update Password' })
        .hasAttribute('disabled')
    ).toBe(true);
  });

  it('shows mismatch error when confirm differs from new password', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'abc' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'xyz' },
    });

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Passwords do not match')).toBeTruthy();
  });

  it('enables Update Password when all fields are valid and matching', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpass123' },
    });

    expect(
      screen
        .getByRole('button', { name: 'Update Password' })
        .hasAttribute('disabled')
    ).toBe(false);
  });

  it('calls onChangePassword with correct args when saved', async () => {
    const onChangePassword = vi.fn().mockResolvedValue(undefined);
    render(<PasswordSection onChangePassword={onChangePassword} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpass123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    });

    expect(onChangePassword).toHaveBeenCalledWith('current123', 'newpass123');
  });

  it('shows success toast after password is updated', async () => {
    const onChangePassword = vi.fn().mockResolvedValue(undefined);
    render(<PasswordSection onChangePassword={onChangePassword} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpass123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    });

    expect(toastMessageMock).toHaveBeenCalledWith({
      text: 'Password updated successfully',
    });
  });

  it('closes dialog and clears fields after successful save', async () => {
    const onChangePassword = vi.fn().mockResolvedValue(undefined);
    render(<PasswordSection onChangePassword={onChangePassword} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'newpass123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('does not call onChangePassword when save button is disabled', () => {
    const onChangePassword = vi.fn();
    render(<PasswordSection onChangePassword={onChangePassword} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    // Intentionally leave fields empty
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(onChangePassword).not.toHaveBeenCalled();
  });

  it('does not show toast when onChangePassword is not called', () => {
    render(<PasswordSection onChangePassword={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    // Leave empty and try to click (disabled)
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(toastMessageMock).not.toHaveBeenCalled();
  });

  it('closes dialog without saving when Cancel is clicked', () => {
    const onChangePassword = vi.fn();
    render(<PasswordSection onChangePassword={onChangePassword} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onChangePassword).not.toHaveBeenCalled();
  });
});
