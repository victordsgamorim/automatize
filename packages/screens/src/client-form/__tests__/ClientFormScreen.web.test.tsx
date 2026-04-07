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

  // ── Back button ──────────────────────────────────────────────────────────

  describe('back button', () => {
    it('renders the back button', () => {
      render(<ClientFormScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
    });

    it('calls onBack directly when form is empty', () => {
      const onBack = vi.fn();
      render(<ClientFormScreen {...defaultProps} onBack={onBack} />);
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(onBack).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('opens the discard dialog when form has data', () => {
      const onBack = vi.fn();
      render(
        <ClientFormScreen
          {...defaultProps}
          initialData={sampleData}
          onBack={onBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getByText('Discard new client?')).toBeTruthy();
      expect(onBack).not.toHaveBeenCalled();
    });

    it('detects data in phones (not just name)', () => {
      const onBack = vi.fn();
      const dataInPhone: ClientFormData = {
        ...sampleData,
        name: '',
        phones: [{ id: 'p1', number: '11999' }],
      };
      render(
        <ClientFormScreen
          {...defaultProps}
          initialData={dataInPhone}
          onBack={onBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(onBack).not.toHaveBeenCalled();
    });

    it('detects data in addresses (street)', () => {
      const onBack = vi.fn();
      const dataInAddr: ClientFormData = {
        ...sampleData,
        name: '',
        addresses: [
          {
            id: 'a1',
            street: 'Main St',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            info: '',
          },
        ],
      };
      render(
        <ClientFormScreen
          {...defaultProps}
          initialData={dataInAddr}
          onBack={onBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(onBack).not.toHaveBeenCalled();
    });
  });

  // ── Discard dialog ───────────────────────────────────────────────────────

  describe('discard dialog', () => {
    it('is not rendered by default', () => {
      render(<ClientFormScreen {...defaultProps} initialData={sampleData} />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes without calling onBack when Cancel is clicked', () => {
      const onBack = vi.fn();
      render(
        <ClientFormScreen
          {...defaultProps}
          initialData={sampleData}
          onBack={onBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('dialog')).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(onBack).not.toHaveBeenCalled();
    });

    it('calls onBack and closes the dialog when Continue is clicked', () => {
      const onBack = vi.fn();
      render(
        <ClientFormScreen
          {...defaultProps}
          initialData={sampleData}
          onBack={onBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(onBack).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('does not crash when Continue is clicked without onBack prop', () => {
      render(<ClientFormScreen {...defaultProps} initialData={sampleData} />);
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(screen.queryByRole('dialog')).toBeNull();
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
