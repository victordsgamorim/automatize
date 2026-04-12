import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ClientFormScreen } from '../ClientFormScreen.web';
import type {
  ClientFormScreenProps,
  ClientFormData,
} from '../ClientFormScreen.types';

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@automatize/ui/web', () => ({
  Button: ({
    children,
    onClick,
    type,
    'aria-label': ariaLabel,
    variant,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    'aria-label'?: string;
    variant?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick}
      aria-label={ariaLabel}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Input: ({
    id,
    value,
    onChange,
    label,
  }: {
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
  }) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} value={value} onChange={onChange} />
    </div>
  ),
  Text: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Card: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Separator: () => <hr />,
  Select: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  RadioGroup: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  RadioGroupItem: ({ value }: { value?: string }) => (
    <input type="radio" value={value} />
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
    <div data-testid="drawer" data-open={open}>
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
    <div data-testid="bottom-sheet" data-open={open}>
      <div>{title}</div>
      <div>{children}</div>
      <button aria-label="Close" onClick={onClose} />
    </div>
  ),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'client.back': 'Back',
        'client.reset': 'Reset form',
        'client.submit': 'Save Client',
        'client.type': 'Client Type',
        'client.type.individual': 'Individual',
        'client.type.business': 'Business',
        'client.name': 'Name',
        'client.name.placeholder': 'John Smith',
        'client.cpf': 'CPF',
        'client.cnpj': 'CNPJ',
        'client.addresses': 'Addresses',
        'client.address.add': 'Add Address',
        'client.address.remove': 'Remove address',
        'client.address.street': 'Street',
        'client.address.number': 'Number',
        'client.address.neighborhood': 'Neighborhood',
        'client.address.city': 'City',
        'client.address.state': 'State',
        'client.address.info': 'Additional Info',
        'client.phones': 'Phones',
        'client.phone.add': 'Add Phone',
        'client.phone.remove': 'Remove phone',
        'client.phone.label': 'Phone',
        'client.discard.title': 'Discard new client?',
        'client.discard.description':
          'If you continue, all data will be reset.',
        'client.discard.cancel': 'Cancel',
        'client.discard.continue': 'Continue',
      })[key] ?? key,
  }),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

const defaultProps: ClientFormScreenProps = {
  onSubmit: vi.fn(),
  locale: {
    languages: [],
    currentLanguage: 'en',
    onLanguageChange: vi.fn(),
  },
};

const sampleData: ClientFormData = {
  clientType: 'individual',
  name: 'Alice',
  document: '',
  addresses: [
    {
      id: 'a1',
      addressType: 'residence' as const,
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      info: '',
    },
  ],
  phones: [{ id: 'p1', number: '' }],
};

describe('ClientFormScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Discard dialog (controlled by props) ─────────────────────────────────

  describe('discard dialog (controlled)', () => {
    it('shows dialog when showDiscardDialog is true', () => {
      render(
        <ClientFormScreen
          {...defaultProps}
          showDiscardDialog={true}
          onBack={vi.fn()}
        />
      );
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('does not show dialog when showDiscardDialog is false', () => {
      render(<ClientFormScreen {...defaultProps} showDiscardDialog={false} />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('calls onBack when Continue is clicked', () => {
      const onBack = vi.fn();
      render(
        <ClientFormScreen
          {...defaultProps}
          showDiscardDialog={true}
          onBack={onBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('calls onDiscardCancel when Cancel is clicked', () => {
      const onDiscardCancel = vi.fn();
      render(
        <ClientFormScreen
          {...defaultProps}
          showDiscardDialog={true}
          onDiscardCancel={onDiscardCancel}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onDiscardCancel).toHaveBeenCalledTimes(1);
    });

    it('does not crash when Continue is clicked without onBack', () => {
      render(<ClientFormScreen {...defaultProps} showDiscardDialog={true} />);
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(screen.queryByRole('dialog')).toBeTruthy();
    });
  });

  // ── Manual reset button ──────────────────────────────────────────────────

  describe('manual reset button', () => {
    it('renders a destructive reset button', () => {
      render(<ClientFormScreen {...defaultProps} />);
      const btn = screen.getByRole('button', { name: 'Reset form' });
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('data-variant')).toBe('destructive');
    });

    it('clears form fields when clicked, without opening the dialog', () => {
      render(<ClientFormScreen {...defaultProps} initialData={sampleData} />);
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
        'Alice'
      );

      fireEvent.click(screen.getByRole('button', { name: 'Reset form' }));

      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
        ''
      );
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('does not call onBack when reset is clicked', () => {
      const onBack = vi.fn();
      render(
        <ClientFormScreen
          {...defaultProps}
          initialData={sampleData}
          onBack={onBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Reset form' }));
      expect(onBack).not.toHaveBeenCalled();
    });
  });
});
