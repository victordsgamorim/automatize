import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ProductFormScreen } from '../ProductFormScreen.web';
import type { ProductFormScreenProps } from '../ProductFormScreen.types';

vi.mock('@automatize/ui/web', () => ({
  PrimaryButton: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={disabled}
      type={type ?? 'button'}
    >
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    type,
    size: _size,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    size?: string;
  }) => (
    <button
      data-testid="secondary-button"
      onClick={onClick}
      type={type ?? 'button'}
    >
      {children}
    </button>
  ),
  DestructiveButton: ({
    children,
    onClick,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button
      data-testid="destructive-button"
      onClick={onClick}
      type={type ?? 'button'}
    >
      {children}
    </button>
  ),
  Card: ({
    children,
    padding: _padding,
  }: {
    children?: React.ReactNode;
    padding?: string;
  }) => <div data-testid="card">{children}</div>,
  Kbd: ({ keyLabel }: { keyLabel: string; control?: boolean }) => (
    <span>{keyLabel}</span>
  ),
  DestructiveKbd: ({ keyLabel }: { keyLabel: string; control?: boolean }) => (
    <span>{keyLabel}</span>
  ),
  Separator: () => <hr data-testid="separator" />,
  Dialog: ({
    open,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }) => (
    <div data-testid="dialog" data-open={String(!!open)}>
      {open ? children : null}
    </div>
  ),
  DialogContent: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'product.form.title': 'New Product',
        'product.form.title.edit': 'Edit Product',
        'product.form.description': 'Fill in the product details.',
        'product.form.description.edit': 'Edit the product details.',
        'product.submit': 'Create',
        'product.submit.edit': 'Save',
        'product.reset': 'Reset',
        'product.cancel': 'Cancel',
        'product.discard.title': 'Discard changes?',
        'product.discard.description': 'You have unsaved changes.',
        'product.discard.cancel': 'Keep editing',
        'product.discard.continue': 'Discard',
      })[key] ?? key,
  }),
}));

vi.mock('@automatize/ui/responsive', () => ({
  useResponsive: () => ({ isMobile: false }),
}));

vi.mock('../useProductForm', () => ({
  useProductForm: ({
    initialData,
    onDataChange,
  }: {
    initialData?: Record<string, unknown>;
    onDataChange?: (data: Record<string, unknown>) => void;
  }) => {
    const [state, setState] = React.useState({
      name: (initialData?.name as string) ?? '',
      price: initialData?.price !== undefined ? String(initialData.price) : '',
      quantity:
        initialData?.quantity !== undefined ? String(initialData.quantity) : '',
      info: (initialData?.info as string) ?? '',
      photoUrl: initialData?.photoUrl as string | undefined,
      photoFile: undefined as File | undefined,
      companyId: initialData?.companyId as string | undefined,
    });

    const createSetter = (field: string) => (value: string | undefined) => {
      setState((prev: typeof state) => {
        const next = { ...prev, [field]: value };
        onDataChange?.(next);
        return next;
      });
    };

    return {
      name: state.name,
      setName: createSetter('name'),
      price: state.price,
      setPrice: createSetter('price'),
      quantity: state.quantity,
      setQuantity: createSetter('quantity'),
      info: state.info,
      setInfo: createSetter('info'),
      photoUrl: state.photoUrl,
      setPhotoUrl: createSetter('photoUrl'),
      photoFile: state.photoFile,
      setPhotoFile: createSetter('photoFile'),
      companyId: state.companyId,
      setCompanyId: createSetter('companyId'),
      getFormData: () => ({
        name: state.name,
        price: parseFloat(state.price) || 0,
        quantity: parseInt(state.quantity, 10) || 0,
        info: state.info,
        photoUrl: state.photoUrl,
        photoFile: state.photoFile,
        companyId: state.companyId,
      }),
      resetForm: () =>
        setState({
          name: '',
          price: '',
          quantity: '',
          info: '',
          photoUrl: undefined,
          photoFile: undefined,
          companyId: undefined,
        }),
    };
  },
}));

vi.mock('../components/PhotoSection/PhotoSection.web', () => ({
  PhotoSection: ({
    photoUrl,
  }: {
    photoUrl?: string;
    onPhotoChange: () => void;
  }) => <div data-testid="photo-section">{photoUrl ?? 'No photo'}</div>,
}));

vi.mock(
  '../components/ProductDetailsSection/ProductDetailsSection.web',
  () => ({
    ProductDetailsSection: (props: Record<string, unknown>) => (
      <div data-testid="product-details-section">
        <input
          data-testid="name-input"
          value={props.name as string}
          onChange={(e) =>
            (props.onNameChange as (v: string) => void)(e.target.value)
          }
        />
      </div>
    ),
  })
);

vi.mock('../components/SupplierSection/SupplierSection.web', () => ({
  SupplierSection: ({
    suppliers,
    selectedSupplierId,
    onSupplierSelect,
    onAddSupplier,
  }: {
    suppliers: { id: string; name: string }[];
    selectedSupplierId?: string;
    onSupplierSelect: (id: string | undefined) => void;
    onAddSupplier?: (name: string) => void;
  }) => (
    <div data-testid="supplier-section">
      <span data-testid="suppliers-count">{suppliers.length}</span>
      <span data-testid="selected-supplier">
        {selectedSupplierId ?? 'none'}
      </span>
      <button
        data-testid="select-supplier-btn"
        onClick={() => onSupplierSelect('s1')}
      >
        Select supplier
      </button>
      {onAddSupplier && (
        <button
          data-testid="add-supplier-btn"
          onClick={() => onAddSupplier('New Supplier')}
        >
          Add supplier
        </button>
      )}
    </div>
  ),
}));

const baseLocale: ProductFormScreenProps['locale'] = {
  languages: [{ code: 'en', label: 'English', ext: 'US' }],
  currentLanguage: 'en',
  onLanguageChange: vi.fn(),
};

const mockSuppliers = [
  { id: 's1', name: 'Acme Corp' },
  { id: 's2', name: 'TechCo' },
];

const defaultProps: ProductFormScreenProps = {
  onSubmit: vi.fn(),
  locale: baseLocale,
  suppliers: mockSuppliers,
  onAddSupplier: vi.fn(),
};

function renderScreen(props: Partial<ProductFormScreenProps> = {}) {
  return render(<ProductFormScreen {...defaultProps} {...props} />);
}

describe('ProductFormScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the card container', () => {
      renderScreen();
      expect(screen.getByTestId('card')).toBeDefined();
    });

    it('renders create title by default', () => {
      renderScreen();
      expect(screen.getByText('New Product')).toBeDefined();
    });

    it('renders edit title when mode is edit', () => {
      renderScreen({ mode: 'edit' });
      expect(screen.getByText('Edit Product')).toBeDefined();
    });

    it('renders submit button with correct label for create mode', () => {
      renderScreen();
      const submitBtn = screen
        .getAllByRole('button')
        .find((b) => b.textContent?.includes('Create'));
      expect(submitBtn).toBeDefined();
    });

    it('renders submit button with correct label for edit mode', () => {
      renderScreen({ mode: 'edit' });
      const submitBtn = screen
        .getAllByRole('button')
        .find((b) => b.textContent?.includes('Save'));
      expect(submitBtn).toBeDefined();
    });

    it('renders reset button', () => {
      renderScreen();
      const resetBtn = screen.getByTestId('destructive-button');
      expect(resetBtn).toBeDefined();
    });

    it('renders photo section', () => {
      renderScreen();
      expect(screen.getByTestId('photo-section')).toBeDefined();
    });

    it('renders product details section', () => {
      renderScreen();
      expect(screen.getByTestId('product-details-section')).toBeDefined();
    });

    it('renders separators', () => {
      renderScreen();
      expect(screen.getAllByTestId('separator').length).toBeGreaterThanOrEqual(
        3
      );
    });
  });

  describe('supplier integration', () => {
    it('renders supplier section', () => {
      renderScreen();
      expect(screen.getByTestId('supplier-section')).toBeDefined();
    });

    it('passes suppliers to supplier section', () => {
      renderScreen();
      expect(screen.getByTestId('suppliers-count').textContent).toBe('2');
    });

    it('passes no selected supplier by default', () => {
      renderScreen();
      expect(screen.getByTestId('selected-supplier').textContent).toBe('none');
    });

    it('passes onAddSupplier callback to supplier section', () => {
      renderScreen();
      expect(screen.getByTestId('add-supplier-btn')).toBeDefined();
    });

    it('calls onAddSupplier when supplier section triggers it', () => {
      const onAddSupplier = vi.fn();
      renderScreen({ onAddSupplier });
      fireEvent.click(screen.getByTestId('add-supplier-btn'));
      expect(onAddSupplier).toHaveBeenCalledWith('New Supplier');
    });

    it('does not render add supplier button when onAddSupplier is undefined', () => {
      renderScreen({ onAddSupplier: undefined });
      expect(screen.queryByTestId('add-supplier-btn')).toBeNull();
    });

    it('defaults to empty suppliers when not provided', () => {
      renderScreen({ suppliers: undefined });
      expect(screen.getByTestId('suppliers-count').textContent).toBe('0');
    });
  });

  describe('form submission', () => {
    it('calls onSubmit when form is submitted', () => {
      const onSubmit = vi.fn();
      renderScreen({ onSubmit });
      const form = screen.getByTestId('card').querySelector('form');
      if (!form) throw new Error('Form not found');
      fireEvent.submit(form);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel and back', () => {
    it('calls onBack when cancel button is clicked', () => {
      const onBack = vi.fn();
      renderScreen({ onBack });
      fireEvent.click(screen.getByTestId('secondary-button'));
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('discard dialog', () => {
    it('shows discard dialog when showDiscardDialog is true', () => {
      renderScreen({ showDiscardDialog: true });
      expect(screen.getByTestId('dialog').dataset.open).toBe('true');
    });

    it('hides discard dialog when showDiscardDialog is false', () => {
      renderScreen({ showDiscardDialog: false });
      expect(screen.getByTestId('dialog').dataset.open).toBe('false');
    });

    it('calls onBack when discard continue is clicked', () => {
      const onBack = vi.fn();
      renderScreen({ showDiscardDialog: true, onBack });
      fireEvent.click(screen.getByText('Discard'));
      expect(onBack).toHaveBeenCalled();
    });

    it('calls onDiscardCancel when keep editing is clicked', () => {
      const onDiscardCancel = vi.fn();
      renderScreen({
        showDiscardDialog: true,
        onDiscardCancel,
      });
      fireEvent.click(screen.getByText('Keep editing'));
      expect(onDiscardCancel).toHaveBeenCalled();
    });
  });
});
