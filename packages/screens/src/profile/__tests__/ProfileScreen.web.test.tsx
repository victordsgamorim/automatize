import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

import { ProfileScreen } from '../ProfileScreen.web';
import { ProfileProvider } from '../ProfileProvider';
import type { ProfileScreenProps } from '../ProfileScreen.types';
import type { ProfileData } from '../ProfileProvider';

// ── Mocks ────────────────────────────────────────────────────────────────────

const toastMessageMock = vi.fn();

vi.mock('@automatize/ui/web', () => ({
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
    size?: string;
    variant?: string;
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
    size,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    disabled?: boolean;
    shortcut?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      data-variant="default"
      data-shortcut={shortcut}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    type,
    'aria-label': ariaLabel,
    shortcut,
    size,
    className,
    disabled,
  }: {
    children?: React.ReactNode;
    onClick?: ((e: React.MouseEvent) => void) | (() => void);
    type?: string;
    'aria-label'?: string;
    shortcut?: string;
    size?: string;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick as React.MouseEventHandler}
      aria-label={ariaLabel}
      data-variant="secondary"
      data-shortcut={shortcut}
      data-size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  DestructiveButton: ({
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
      data-variant="destructive"
      data-shortcut={shortcut}
    >
      {children}
    </button>
  ),
  Input: ({
    id,
    label,
    value,
    onChange,
    type,
  }: {
    id?: string;
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
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
    </div>
  ),
  Text: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Card: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Separator: () => <hr />,
  Kbd: ({ children }: { children?: React.ReactNode }) => <kbd>{children}</kbd>,
  Tabs: ({
    children,
    value,
  }: {
    children?: React.ReactNode;
    value?: string;
    onValueChange?: (val: string) => void;
  }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children?: React.ReactNode;
    value?: string;
  }) => (
    <button data-testid="tabs-trigger" data-value={value}>
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
  Drawer: ({
    open,
    onClose,
    title,
    children,
  }: {
    open?: boolean;
    onClose?: () => void;
    title?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div data-testid="drawer" data-open={String(open)}>
      <div>{title}</div>
      <div>{children}</div>
      <button aria-label="Close" onClick={onClose} />
    </div>
  ),
  BottomSheet: ({
    open,
    onClose,
    title,
    children,
  }: {
    open?: boolean;
    onClose?: () => void;
    title?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div data-testid="bottom-sheet" data-open={String(open)}>
      <div>{title}</div>
      <div>{children}</div>
      <button aria-label="Close" onClick={onClose} />
    </div>
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
    t: (key: string, params?: { count?: number }) => {
      const map: Record<string, string> = {
        'profile.form.title': 'My Profile',
        'profile.form.description': 'Manage your account details',
        'profile.section.account': 'Account Information',
        'profile.section.personal': 'Personal Details',
        'profile.section.password': 'Password',
        'profile.email': 'Email',
        'profile.company': 'Company',
        'profile.name': 'Name',
        'profile.name.placeholder': 'Your name',
        'profile.cancel': 'Cancel',
        'profile.submit': 'Save Profile',
        'profile.saved': 'Profile saved successfully',
        'profile.discard.title': 'Discard changes?',
        'profile.discard.description': 'All changes will be lost.',
        'profile.discard.cancel': 'Cancel',
        'profile.discard.continue': 'Continue',
        'profile.password.label': 'Password',
        'profile.password.change': 'Change',
        'profile.password.dialog.title': 'Change Password',
        'profile.password.dialog.description': 'Enter your current password',
        'profile.password.current': 'Current Password',
        'profile.password.current.placeholder': 'Current password',
        'profile.password.new': 'New Password',
        'profile.password.new.placeholder': 'New password',
        'profile.password.confirm': 'Confirm Password',
        'profile.password.confirm.placeholder': 'Confirm password',
        'profile.password.mismatch': 'Passwords do not match',
        'profile.password.save': 'Update Password',
        'profile.password.saved': 'Password updated successfully',
        'client.phones': 'Phones',
        'client.phone.add': 'Add Phone',
        'client.phone.remove': 'Remove phone',
        'client.phone.removed': 'Phone removed',
        'client.phone.label': 'Phone',
        'client.phone.placeholder': '(11) 99999-9999',
        'client.phone.save': 'Save Phone',
        'client.phone.dialog.title': 'New Phone',
        'client.phone.dialog.editTitle': 'Edit Phone',
        'client.phone.empty': 'No phones added yet',
        'client.phone.allTitle': 'All Phones',
        'client.phone.viewMore': `View +${params?.count ?? 0}`,
        'client.phone.type.mobile': 'Mobile',
        'client.phone.type.telephone': 'Telephone',
        'sign-in.password.show': 'Show password',
        'sign-in.password.hide': 'Hide password',
        'app.cancel': 'Cancel',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('@automatize/ui/responsive', () => ({
  useResponsive: () => ({ isMobile: false }),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const defaultProps: ProfileScreenProps = {
  email: 'user@example.com',
  companyName: 'Acme Corp',
  onSubmit: vi.fn(),
  onChangePassword: vi.fn(),
};

function renderWithProvider(
  props: ProfileScreenProps = defaultProps,
  providerData?: ProfileData
) {
  if (providerData) {
    return render(
      <ProfileProvider initialData={providerData}>
        <ProfileScreen {...props} />
      </ProfileProvider>
    );
  }
  return render(<ProfileScreen {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProfileScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the account info section heading', () => {
      renderWithProvider();
      expect(screen.getByText('Account Information')).toBeTruthy();
    });

    it('renders the personal details section heading', () => {
      renderWithProvider();
      expect(screen.getByText('Personal Details')).toBeTruthy();
    });

    it('renders the password section heading', () => {
      renderWithProvider();
      expect(screen.getByText('Password')).toBeTruthy();
    });

    it('renders email from props', () => {
      renderWithProvider();
      expect(screen.getByText('user@example.com')).toBeTruthy();
    });

    it('renders company name from props', () => {
      renderWithProvider();
      expect(screen.getByText('Acme Corp')).toBeTruthy();
    });

    it('renders email from ProfileProvider context over props', () => {
      const providerData: ProfileData = {
        name: 'Bob',
        email: 'context@example.com',
        companyName: 'Context Corp',
        phones: [],
      };
      renderWithProvider(
        {
          ...defaultProps,
          email: 'props@example.com',
          companyName: 'Props Corp',
        },
        providerData
      );
      expect(screen.getByText('context@example.com')).toBeTruthy();
      expect(screen.queryByText('props@example.com')).toBeNull();
    });

    it('renders the name input', () => {
      renderWithProvider();
      expect(screen.getByLabelText('Name')).toBeTruthy();
    });

    it('renders footer Cancel and Save Profile buttons', () => {
      renderWithProvider();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Save Profile' })).toBeTruthy();
    });

    it('populates name input from initialData prop', () => {
      renderWithProvider({
        ...defaultProps,
        initialData: { name: 'Alice', phones: [] },
      });
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
        'Alice'
      );
    });

    it('populates name input from ProfileProvider context', () => {
      const providerData: ProfileData = {
        name: 'Context Name',
        email: 'a@b.com',
        companyName: 'Co',
        phones: [],
      };
      renderWithProvider(defaultProps, providerData);
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
        'Context Name'
      );
    });
  });

  // ── Submit button state ────────────────────────────────────────────────────

  describe('submit button', () => {
    it('is disabled when name is empty', () => {
      renderWithProvider();
      expect(
        screen
          .getByRole('button', { name: 'Save Profile' })
          .hasAttribute('disabled')
      ).toBe(true);
    });

    it('is enabled after name is entered', () => {
      renderWithProvider();
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'Alice' },
      });
      expect(
        screen
          .getByRole('button', { name: 'Save Profile' })
          .hasAttribute('disabled')
      ).toBe(false);
    });

    it('is enabled when initialData provides a name', () => {
      renderWithProvider({
        ...defaultProps,
        initialData: { name: 'Alice', phones: [] },
      });
      expect(
        screen
          .getByRole('button', { name: 'Save Profile' })
          .hasAttribute('disabled')
      ).toBe(false);
    });
  });

  // ── Form submission ────────────────────────────────────────────────────────

  describe('form submission', () => {
    it('calls onSubmit with current form data', () => {
      const onSubmit = vi.fn();
      renderWithProvider({
        ...defaultProps,
        onSubmit,
        initialData: { name: 'Alice', phones: [] },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice' })
      );
    });

    it('shows a success toast after saving', () => {
      const onSubmit = vi.fn();
      renderWithProvider({
        ...defaultProps,
        onSubmit,
        initialData: { name: 'Alice', phones: [] },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

      expect(toastMessageMock).toHaveBeenCalledWith({
        text: 'Profile saved successfully',
      });
    });

    it('calls updateProfile on the context with saved name', () => {
      const onSubmit = vi.fn();
      const providerData: ProfileData = {
        name: 'Old Name',
        email: 'a@b.com',
        companyName: 'Co',
        phones: [],
      };

      renderWithProvider({ ...defaultProps, onSubmit }, providerData);

      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'New Name' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Name' })
      );
    });

    it('does not call onSubmit when name is empty', () => {
      const onSubmit = vi.fn();
      renderWithProvider({ ...defaultProps, onSubmit });

      fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ── Cancel ────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('calls onBack when Cancel is clicked', () => {
      const onBack = vi.fn();
      renderWithProvider({ ...defaultProps, onBack });

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('does not crash when Cancel is clicked without onBack', () => {
      renderWithProvider();
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      }).not.toThrow();
    });
  });

  // ── Discard dialog (controlled) ────────────────────────────────────────────

  describe('discard dialog (controlled)', () => {
    it('shows dialog when showDiscardDialog is true', () => {
      renderWithProvider({
        ...defaultProps,
        showDiscardDialog: true,
        onBack: vi.fn(),
      });
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('does not show dialog when showDiscardDialog is false', () => {
      renderWithProvider({ ...defaultProps, showDiscardDialog: false });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('calls onBack when Continue is clicked in discard dialog', () => {
      const onBack = vi.fn();
      renderWithProvider({
        ...defaultProps,
        showDiscardDialog: true,
        onBack,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('calls onDiscardCancel when Cancel is clicked in discard dialog', () => {
      const onDiscardCancel = vi.fn();
      renderWithProvider({
        ...defaultProps,
        showDiscardDialog: true,
        onDiscardCancel,
      });
      // The dialog Cancel button is the second "Cancel" on screen
      const cancelBtns = screen.getAllByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelBtns[cancelBtns.length - 1]);
      expect(onDiscardCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ── Phone removal toast ───────────────────────────────────────────────────

  describe('phone removal toast with undo', () => {
    it('shows undo toast when a phone is removed', () => {
      renderWithProvider({
        ...defaultProps,
        initialData: {
          name: 'Alice',
          phones: [{ id: 'p1', phoneType: 'mobile', number: '11999999999' }],
        },
      });

      const deleteBtn = screen.getAllByRole('button', {
        name: 'Remove phone',
      })[0];
      fireEvent.click(deleteBtn);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect(toastMessageMock).toHaveBeenCalledWith({
        text: 'Phone removed',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onUndoAction: expect.any(Function),
      });
    });

    it('undo action re-inserts the removed phone', () => {
      renderWithProvider({
        ...defaultProps,
        initialData: {
          name: 'Alice',
          phones: [{ id: 'p1', phoneType: 'mobile', number: '11999999999' }],
        },
      });

      const deleteBtn = screen.getAllByRole('button', {
        name: 'Remove phone',
      })[0];
      fireEvent.click(deleteBtn);

      expect(screen.queryByText('11999999999')).toBeNull();

      // Invoke the undo callback
      const call = toastMessageMock.mock.calls[0][0] as {
        onUndoAction: () => void;
      };
      act(() => {
        call.onUndoAction();
      });

      expect(screen.getAllByText('11999999999').length).toBeGreaterThan(0);
    });
  });
});
