import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SupplierSection } from '../SupplierSection.web';
import type { SupplierSectionProps } from '../SupplierSection.web';

vi.mock('@automatize/ui/web', () => ({
  Popover: ({
    children,
    open,
    onOpenChange,
  }: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="popover" data-open={open}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{
              onOpenChange?: (open: boolean) => void;
              open?: boolean;
            }>,
            { onOpenChange, open }
          );
        }
        return child;
      })}
    </div>
  ),
  PopoverTrigger: ({
    children,
    onOpenChange,
    open,
    asChild,
  }: {
    children?: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
    asChild?: boolean;
  }) => {
    const child = React.Children.only(children) as React.ReactElement<{
      onClick?: () => void;
      'aria-expanded'?: boolean;
    }>;
    if (asChild && React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: () => onOpenChange?.(!open),
        'aria-expanded': open,
      });
    }
    return <button onClick={() => onOpenChange?.(!open)}>{children}</button>;
  },
  PopoverContent: ({
    children,
  }: {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    align?: string;
  }) => <div data-testid="popover-content">{children}</div>,
  Command: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="command">{children}</div>
  ),
  CommandInput: ({
    placeholder,
    ...rest
  }: {
    placeholder?: string;
    [key: string]: unknown;
  }) => (
    <input data-testid="command-input" placeholder={placeholder} {...rest} />
  ),
  CommandList: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="command-list">{children}</div>
  ),
  CommandEmpty: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="command-empty">{children}</div>
  ),
  CommandGroup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="command-group">{children}</div>
  ),
  CommandItem: ({
    children,
    onSelect,
    value,
  }: {
    children?: React.ReactNode;
    onSelect?: () => void;
    value?: string;
  }) => (
    <div
      data-testid={`command-item-${value ?? 'unknown'}`}
      role="option"
      onClick={onSelect}
    >
      {children}
    </div>
  ),
  CommandSeparator: () => <hr data-testid="command-separator" />,
  SecondaryButton: ({
    children,
    onClick,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    size?: string;
    disabled?: boolean;
  }) => (
    <button type={type as never} onClick={onClick} data-variant="secondary">
      {children}
    </button>
  ),
  PrimaryButton: ({
    children,
    onClick,
    type,
    disabled,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    size?: string;
    disabled?: boolean;
  }) => (
    <button
      type={type as never}
      onClick={onClick}
      disabled={disabled}
      data-variant="primary"
    >
      {children}
    </button>
  ),
  Input: ({
    value,
    onChange,
    placeholder,
    onKeyDown,
    autoFocus: _autoFocus,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
  }) => (
    <input
      data-testid="add-supplier-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
    />
  ),
  Text: ({
    children,
  }: {
    children?: React.ReactNode;
    variant?: string;
    color?: string;
  }) => <span>{children}</span>,
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'product.supplier': 'Supplier',
        'product.supplier.placeholder': 'Select a supplier',
        'product.supplier.search': 'Search suppliers...',
        'product.supplier.empty': 'No suppliers found',
        'product.supplier.add': 'Add supplier',
        'product.supplier.addNew': 'Add new supplier',
        'product.supplier.new': 'New supplier name',
        'product.supplier.new.placeholder': 'Enter supplier name',
        'product.cancel': 'Cancel',
      })[key] ?? key,
  }),
}));

const mockSuppliers = [
  { id: 's1', name: 'Acme Corp' },
  { id: 's2', name: 'TechCo' },
];

const defaultProps: SupplierSectionProps = {
  suppliers: mockSuppliers,
  selectedSupplierId: undefined,
  onSupplierSelect: vi.fn(),
  onAddSupplier: vi.fn(),
};

function renderSection(props: Partial<SupplierSectionProps> = {}) {
  return render(<SupplierSection {...defaultProps} {...props} />);
}

describe('SupplierSection (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the section label', () => {
      renderSection();
      expect(screen.getByText('Supplier')).toBeDefined();
    });

    it('shows placeholder when no supplier is selected', () => {
      renderSection();
      expect(screen.getByText('Select a supplier')).toBeDefined();
    });

    it('shows selected supplier name when one is selected', () => {
      renderSection({ selectedSupplierId: 's1' });
      const trigger = screen.getByRole('combobox');
      expect(trigger.textContent?.includes('Acme Corp')).toBe(true);
    });
  });

  describe('popover trigger', () => {
    it('opens popover when trigger is clicked', () => {
      renderSection();
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);
      expect(screen.getByTestId('popover-content')).toBeDefined();
    });

    it('shows supplier list when popover is open', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByTestId('command')).toBeDefined();
    });

    it('shows search input in popover', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByPlaceholderText('Search suppliers...')).toBeDefined();
    });

    it('shows "No suppliers found" empty message', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('No suppliers found')).toBeDefined();
    });
  });

  describe('supplier selection', () => {
    it('calls onSupplierSelect when a supplier item is clicked', () => {
      const onSupplierSelect = vi.fn();
      renderSection({ onSupplierSelect });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByTestId('command-item-Acme Corp'));
      expect(onSupplierSelect).toHaveBeenCalledWith('s1');
    });

    it('calls onSupplierSelect with undefined when clicking the already-selected supplier', () => {
      const onSupplierSelect = vi.fn();
      renderSection({ selectedSupplierId: 's1', onSupplierSelect });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByTestId('command-item-Acme Corp'));
      expect(onSupplierSelect).toHaveBeenCalledWith(undefined);
    });
  });

  describe('add new supplier', () => {
    it('shows "Add new supplier" option when onAddSupplier is provided', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Add new supplier')).toBeDefined();
    });

    it('does not show "Add new supplier" when onAddSupplier is undefined', () => {
      renderSection({ onAddSupplier: undefined });
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByText('Add new supplier')).toBeNull();
    });

    it('switches to add mode when "Add new supplier" is clicked', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new supplier'));
      expect(screen.getByTestId('add-supplier-input')).toBeDefined();
      expect(screen.getByText('New supplier name')).toBeDefined();
    });

    it('"Add supplier" button is disabled when input is empty', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new supplier'));
      const addBtn = screen
        .getAllByRole('button')
        .find((b) => b.textContent === 'Add supplier');
      expect((addBtn as HTMLButtonElement)?.disabled).toBe(true);
    });

    it('calls onAddSupplier with trimmed name when form is submitted', () => {
      const onAddSupplier = vi.fn();
      renderSection({ onAddSupplier });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new supplier'));
      fireEvent.change(screen.getByTestId('add-supplier-input'), {
        target: { value: '  New Supplier  ' },
      });
      const addBtn = screen
        .getAllByRole('button')
        .find((b) => b.textContent === 'Add supplier');
      expect(addBtn).toBeDefined();
      fireEvent.click(addBtn as HTMLButtonElement);
      expect(onAddSupplier).toHaveBeenCalledWith('New Supplier');
    });

    it('returns to list mode when Cancel is clicked in add form', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new supplier'));
      expect(screen.getByTestId('add-supplier-input')).toBeDefined();
      const cancelBtn = screen
        .getAllByRole('button')
        .find((b) => b.textContent === 'Cancel');
      expect(cancelBtn).toBeDefined();
      fireEvent.click(cancelBtn as HTMLButtonElement);
      expect(screen.queryByTestId('add-supplier-input')).toBeNull();
    });
  });
});
