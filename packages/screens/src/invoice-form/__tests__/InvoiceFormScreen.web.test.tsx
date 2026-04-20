import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', () => {
  type WithChildren = { children?: React.ReactNode };

  const Card = ({ children, padding }: WithChildren & { padding?: string }) =>
    React.createElement('div', { 'data-testid': 'card', padding }, children);

  const Dialog = ({
    children,
    open,
    _onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open
      ? React.createElement('div', { 'data-testid': 'dialog' }, children)
      : null;
  const DialogContent = ({ children }: WithChildren) =>
    React.createElement('div', { 'data-slot': 'dialog-content' }, children);
  const DialogHeader = ({ children }: WithChildren) =>
    React.createElement('div', null, children);
  const DialogTitle = ({ children }: WithChildren) =>
    React.createElement('h2', null, children);
  const DialogDescription = ({ children }: WithChildren) =>
    React.createElement('p', null, children);
  const DialogFooter = ({ children }: WithChildren) =>
    React.createElement('div', null, children);

  const PrimaryButton = ({
    children,
    onClick,
    disabled,
    type,
    _size,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    size?: string;
    className?: string;
  }) =>
    React.createElement(
      'button',
      { onClick, disabled, type, className },
      children
    );

  const SecondaryButton = ({
    children,
    onClick,
    type,
    _size,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    size?: string;
    className?: string;
  }) => React.createElement('button', { onClick, type, className }, children);

  const DestructiveButton = ({
    children,
    onClick,
    type,
    _size,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    size?: string;
    className?: string;
  }) => React.createElement('button', { onClick, type, className }, children);

  const Separator = () =>
    React.createElement('hr', { 'data-testid': 'separator' });

  const Kbd = ({
    keyLabel,
    control,
  }: {
    keyLabel?: string;
    control?: boolean;
  }) =>
    React.createElement('span', null, control ? `Ctrl+${keyLabel}` : keyLabel);

  const DestructiveKbd = ({
    keyLabel,
    control,
  }: {
    keyLabel?: string;
    control?: boolean;
  }) =>
    React.createElement('span', null, control ? `Ctrl+${keyLabel}` : keyLabel);

  const useToasts = () => ({
    success: vi.fn(),
    error: vi.fn(),
  });

  return {
    Card,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    PrimaryButton,
    SecondaryButton,
    DestructiveButton,
    Separator,
    Kbd,
    DestructiveKbd,
    useToasts,
  };
});

// Mock useResponsive
vi.mock('@automatize/ui/responsive', () => ({
  useResponsive: () => ({ isMobile: false, isTablet: false, isDesktop: true }),
}));

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock ClientSection
vi.mock(
  '../components/ClientSection/ClientSection.web',
  (): {
    ClientSection: (props: {
      onSelectClient?: (id: string) => void;
      onClearClient?: () => void;
    }) => React.ReactElement;
  } => ({
    ClientSection: ({
      onSelectClient,
      onClearClient,
    }: {
      onSelectClient?: (id: string) => void;
      onClearClient?: () => void;
    }) =>
      React.createElement(
        'div',
        { 'data-testid': 'client-section' },
        React.createElement(
          'button',
          {
            onClick: () => onSelectClient?.('1'),
            'data-testid': 'select-client',
          },
          'Select Client'
        ),
        React.createElement(
          'button',
          { onClick: () => onClearClient?.(), 'data-testid': 'clear-client' },
          'Clear Client'
        )
      ),
  })
);

// Mock ProductsSection
vi.mock('../components/ProductsSection/ProductsSection.web', () => ({
  ProductsSection: () =>
    React.createElement('div', { 'data-testid': 'products-section' }),
}));

// Mock TechniciansSection
vi.mock('../components/TechniciansSection/TechniciansSection.web', () => ({
  TechniciansSection: () =>
    React.createElement('div', { 'data-testid': 'technicians-section' }),
}));

// Mock WarrantySection
vi.mock('../components/WarrantySection/WarrantySection.web', () => ({
  WarrantySection: () =>
    React.createElement('div', { 'data-testid': 'warranty-section' }),
}));

// Mock useInvoiceForm
vi.mock('../useInvoiceForm', () => ({
  useInvoiceForm: (_props?: {
    initialData?: Record<string, unknown>;
    onDataChange?: (data: Record<string, unknown>) => void;
  }) => ({
    clientId: '',
    clientName: '',
    clientAddresses: [],
    clientPhones: [],
    selectClient: vi.fn(),
    clearClient: vi.fn(),
    pickClientAddress: vi.fn(),
    addClientAddress: vi.fn(),
    removeClientAddress: vi.fn(),
    pickClientPhone: vi.fn(),
    addClientPhone: vi.fn(),
    removeClientPhone: vi.fn(),
    products: [],
    addProduct: vi.fn(),
    removeProduct: vi.fn(),
    updateProductQuantity: vi.fn(),
    incrementProductQuantity: vi.fn(),
    decrementProductQuantity: vi.fn(),
    technicians: [],
    addTechnician: vi.fn(),
    removeTechnician: vi.fn(),
    toggleTechnician: vi.fn(),
    addNewTechnician: vi.fn(),
    warrantyMonths: 0,
    setWarrantyMonths: vi.fn(),
    additionalInfo: '',
    setAdditionalInfo: vi.fn(),
    total: 0,
    getFormData: () => ({}),
    resetForm: vi.fn(),
  }),
}));

import { InvoiceFormScreen } from '../InvoiceFormScreen.web';
import type { InvoiceFormScreenProps } from '../InvoiceFormScreen.types';

function renderInvoiceFormScreen(
  overrides: Partial<InvoiceFormScreenProps> = {}
) {
  const onSubmit = vi.fn();
  const onBack = vi.fn();
  const onDataChange = vi.fn();

  const props: InvoiceFormScreenProps = {
    mode: 'create',
    onSubmit,
    onDataChange,
    onBack,
    availableClients: [],
    availableProducts: [],
    availableTechnicians: [],
    ...overrides,
  };

  const result = render(<InvoiceFormScreen {...props} />);
  return { ...result, onSubmit, onBack, onDataChange };
}

describe('InvoiceFormScreen (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders form with all sections', () => {
    renderInvoiceFormScreen();
    expect(screen.getByTestId('client-section')).toBeDefined();
    expect(screen.getByTestId('products-section')).toBeDefined();
    expect(screen.getByTestId('technicians-section')).toBeDefined();
    expect(screen.getByTestId('warranty-section')).toBeDefined();
  });

  it('renders header with title', () => {
    renderInvoiceFormScreen();
    expect(screen.getByText(/invoice.form.title/i)).toBeDefined();
  });

  it('renders reset button', () => {
    renderInvoiceFormScreen();
    expect(screen.getByText(/invoice.reset/i)).toBeDefined();
  });

  it('renders cancel and submit buttons', () => {
    renderInvoiceFormScreen();
    expect(screen.getByText(/invoice.cancel/i)).toBeDefined();
    expect(screen.getByText(/invoice.submit/i)).toBeDefined();
  });

  it('shows edit title when mode is edit', () => {
    renderInvoiceFormScreen({ mode: 'edit' });
    expect(screen.getByText(/invoice.form.title.edit/i)).toBeDefined();
  });

  // ── Interactions ───────────────────────────────────────────────────────────
  it('disables submit button when no client is selected', () => {
    renderInvoiceFormScreen();
    const submitButton = screen.getByRole('button', {
      name: /invoice.submit/i,
    });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('calls onBack when cancel is clicked', () => {
    const { onBack } = renderInvoiceFormScreen();
    const cancelButton = screen.getByRole('button', {
      name: /invoice.cancel/i,
    });
    fireEvent.click(cancelButton);
    expect(onBack).toHaveBeenCalled();
  });

  it('shows discard dialog when showDiscardDialog is true', () => {
    renderInvoiceFormScreen({ showDiscardDialog: true });
    expect(screen.getByTestId('dialog')).toBeDefined();
    expect(screen.getByText(/invoice.discard.title/i)).toBeDefined();
  });

  it('calls onBack when discard is confirmed', () => {
    const { onBack } = renderInvoiceFormScreen({ showDiscardDialog: true });
    const continueButton = screen.getByRole('button', {
      name: /invoice.discard.continue/i,
    });
    fireEvent.click(continueButton);
    expect(onBack).toHaveBeenCalled();
  });
});
