import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { CompanySection } from '../CompanySection.web';
import type { CompanySectionProps } from '../CompanySection.web';

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
      data-testid="add-company-input"
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
        'product.company': 'Company',
        'product.company.placeholder': 'Select a company',
        'product.company.search': 'Search companies...',
        'product.company.empty': 'No companies found',
        'product.company.add': 'Add company',
        'product.company.addNew': 'Add new company',
        'product.company.new': 'New company name',
        'product.company.new.placeholder': 'Enter company name',
        'product.cancel': 'Cancel',
      })[key] ?? key,
  }),
}));

const mockCompanies = [
  { id: 'c1', name: 'Acme Corp' },
  { id: 'c2', name: 'TechCo' },
];

const defaultProps: CompanySectionProps = {
  companies: mockCompanies,
  selectedCompanyId: undefined,
  onCompanySelect: vi.fn(),
  onAddCompany: vi.fn(),
};

function renderSection(props: Partial<CompanySectionProps> = {}) {
  return render(<CompanySection {...defaultProps} {...props} />);
}

describe('CompanySection (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the section label', () => {
      renderSection();
      expect(screen.getByText('Company')).toBeDefined();
    });

    it('shows placeholder when no company is selected', () => {
      renderSection();
      expect(screen.getByText('Select a company')).toBeDefined();
    });

    it('shows selected company name when one is selected', () => {
      renderSection({ selectedCompanyId: 'c1' });
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

    it('shows company list when popover is open', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByTestId('command')).toBeDefined();
    });

    it('shows search input in popover', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByPlaceholderText('Search companies...')).toBeDefined();
    });

    it('shows "No companies found" empty message', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('No companies found')).toBeDefined();
    });
  });

  describe('company selection', () => {
    it('calls onCompanySelect when a company item is clicked', () => {
      const onCompanySelect = vi.fn();
      renderSection({ onCompanySelect });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByTestId('command-item-Acme Corp'));
      expect(onCompanySelect).toHaveBeenCalledWith('c1');
    });

    it('calls onCompanySelect with undefined when clicking the already-selected company', () => {
      const onCompanySelect = vi.fn();
      renderSection({ selectedCompanyId: 'c1', onCompanySelect });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByTestId('command-item-Acme Corp'));
      expect(onCompanySelect).toHaveBeenCalledWith(undefined);
    });
  });

  describe('add new company', () => {
    it('shows "Add new company" option when onAddCompany is provided', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Add new company')).toBeDefined();
    });

    it('does not show "Add new company" when onAddCompany is undefined', () => {
      renderSection({ onAddCompany: undefined });
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByText('Add new company')).toBeNull();
    });

    it('switches to add mode when "Add new company" is clicked', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new company'));
      expect(screen.getByTestId('add-company-input')).toBeDefined();
      expect(screen.getByText('New company name')).toBeDefined();
    });

    it('"Add company" button is disabled when input is empty', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new company'));
      const addBtn = screen
        .getAllByRole('button')
        .find((b) => b.textContent === 'Add company');
      expect((addBtn as HTMLButtonElement)?.disabled).toBe(true);
    });

    it('calls onAddCompany with trimmed name when form is submitted', () => {
      const onAddCompany = vi.fn();
      renderSection({ onAddCompany });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new company'));
      fireEvent.change(screen.getByTestId('add-company-input'), {
        target: { value: '  New Company  ' },
      });
      fireEvent.click(
        screen
          .getAllByRole('button')
          .find((b) => b.textContent === 'Add company')!
      );
      expect(onAddCompany).toHaveBeenCalledWith('New Company');
    });

    it('returns to list mode when Cancel is clicked in add form', () => {
      renderSection();
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Add new company'));
      expect(screen.getByTestId('add-company-input')).toBeDefined();
      fireEvent.click(
        screen.getAllByRole('button').find((b) => b.textContent === 'Cancel')!
      );
      expect(screen.queryByTestId('add-company-input')).toBeNull();
    });
  });
});
