import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@automatize/ui/web');
  const { createElement } = await import('react');

  type WithChildren = { children?: React.ReactNode };

  const Popover = ({
    children,
    open,
    onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open
      ? createElement('div', { onClick: () => onOpenChange(false) }, children)
      : null;
  const PopoverTrigger = ({
    children,
    asChild,
  }: WithChildren & { asChild?: boolean }) => {
    if (asChild && React.isValidElement(children)) return children;
    return createElement('button', null, children);
  };
  const PopoverContent = ({
    children,
    className,
  }: WithChildren & { className?: string }) =>
    createElement('div', { className }, children);

  const Command = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandInput = ({
    placeholder,
    value,
    onChange,
    onKeyDown,
    _autoFocus,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    autoFocus?: boolean;
  }) =>
    createElement('input', {
      placeholder,
      value,
      onChange: (e: { target: { value: string } }) => onChange?.(e),
      onKeyDown,
    });
  const CommandList = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandEmpty = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandGroup = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandItem = ({
    children,
    onSelect,
  }: WithChildren & { onSelect?: () => void }) =>
    createElement('div', { onClick: onSelect }, children);
  const CommandSeparator = () =>
    createElement('hr', { 'data-testid': 'separator' });

  const PrimaryButton = ({
    children,
    onClick,
    disabled,
    _size,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: string;
    type?: string;
  }) => createElement('button', { onClick, disabled, type }, children);

  const SecondaryButton = ({
    children,
    onClick,
    _size,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    size?: string;
    type?: string;
  }) => createElement('button', { onClick, type }, children);

  const Input = ({
    _label,
    placeholder,
    value,
    onChange,
    onKeyDown,
    _autoFocus,
    inputMode,
  }: {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    autoFocus?: boolean;
    inputMode?: string;
  }) =>
    createElement('input', {
      placeholder,
      value,
      onChange: (e: { target: { value: string } }) => onChange?.(e),
      onKeyDown,
      inputMode,
    });

  const Text = ({
    variant,
    color,
    className,
    children,
  }: {
    variant?: string;
    color?: string;
    className?: string;
    children?: React.ReactNode;
  }) => createElement('span', { variant, color, className }, children);

  const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

  const Check = () => createElement('span', { 'data-testid': 'check-icon' });
  const ChevronsUpDown = () =>
    createElement('span', { 'data-testid': 'chevrons-icon' });
  const Plus = () => createElement('span', { 'data-testid': 'plus-icon' });

  return {
    ...actual,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    PrimaryButton,
    SecondaryButton,
    Input,
    Text,
    cn,
    Check,
    ChevronsUpDown,
    Plus,
  };
});

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { WarrantySection } from '../WarrantySection.web';
import type { WarrantyOption } from '../../InvoiceFormScreen.types';

const mockWarrantyOptions: WarrantyOption[] = [
  { id: 'custom-1', label: 'Custom 1 Month', months: 1 },
  { id: 'custom-3', label: 'Custom 3 Months', months: 3 },
];

function renderWarrantySection(
  overrides: Partial<React.ComponentProps<typeof WarrantySection>> = {}
) {
  const onWarrantyChange = vi.fn();
  const onAdditionalInfoChange = vi.fn();
  const onAddWarrantyOption = vi.fn();

  const props = {
    warrantyMonths: 0,
    onWarrantyChange,
    additionalInfo: '',
    onAdditionalInfoChange,
    warrantyOptions: undefined,
    onAddWarrantyOption: undefined,
    ...overrides,
  };

  const result = render(<WarrantySection {...props} />);
  return {
    ...result,
    onWarrantyChange,
    onAdditionalInfoChange,
    onAddWarrantyOption,
  };
}

describe('WarrantySection (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders warranty section header', () => {
    renderWarrantySection();
    expect(screen.getByText(/invoice.warranty/i)).toBeDefined();
  });

  it('renders warranty combobox with placeholder', () => {
    renderWarrantySection();
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText(/invoice.warranty.placeholder/i)).toBeDefined();
  });

  it('renders additional info textarea', () => {
    renderWarrantySection();
    expect(screen.getByText(/invoice.additionalInfo/i)).toBeDefined();
    expect(
      screen.getByPlaceholderText(/invoice.additionalInfo.placeholder/i)
    ).toBeDefined();
  });

  // ── Warranty Selection ─────────────────────────────────────────────────────
  it('shows default warranty options in dropdown', () => {
    renderWarrantySection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText(/invoice.warranty.1m/i)).toBeDefined();
    expect(screen.getByText(/invoice.warranty.3m/i)).toBeDefined();
    expect(screen.getByText(/invoice.warranty.6m/i)).toBeDefined();
    expect(screen.getByText(/invoice.warranty.12m/i)).toBeDefined();
  });

  it('shows custom warranty options when provided', () => {
    renderWarrantySection({ warrantyOptions: mockWarrantyOptions });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText('Custom 1 Month')).toBeDefined();
    expect(screen.getByText('Custom 3 Months')).toBeDefined();
  });

  it('calls onWarrantyChange when selecting an option', () => {
    const { onWarrantyChange } = renderWarrantySection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const option = screen.getByText(/invoice.warranty.3m/i);
    fireEvent.click(option);

    expect(onWarrantyChange).toHaveBeenCalledWith(3);
  });

  it('toggles off warranty when selecting already selected option', () => {
    const { onWarrantyChange } = renderWarrantySection({ warrantyMonths: 3 });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const option = screen.getByText(/invoice.warranty.3m/i);
    fireEvent.click(option);

    expect(onWarrantyChange).toHaveBeenCalledWith(0);
  });

  // ── Add New Option ─────────────────────────────────────────────────────────
  it('shows add new option when onAddWarrantyOption is provided', () => {
    renderWarrantySection({
      onAddWarrantyOption: vi.fn(),
    });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText(/invoice.warranty.addNew/i)).toBeDefined();
  });

  it('switches to add mode when add new is clicked', () => {
    renderWarrantySection({
      onAddWarrantyOption: vi.fn(),
    });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const addNewButton = screen.getByText(/invoice.warranty.addNew/i);
    fireEvent.click(addNewButton);

    expect(
      screen.getByPlaceholderText(/invoice.warranty.new.labelPlaceholder/i)
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText(/invoice.warranty.new.monthsPlaceholder/i)
    ).toBeDefined();
  });

  it('calls onAddWarrantyOption when adding new custom option', () => {
    const { onAddWarrantyOption, onWarrantyChange } = renderWarrantySection({
      onAddWarrantyOption: vi.fn(),
    });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const addNewButton = screen.getByText(/invoice.warranty.addNew/i);
    fireEvent.click(addNewButton);

    const labelInput = screen.getByPlaceholderText(
      /invoice.warranty.new.labelPlaceholder/i
    );
    fireEvent.input(labelInput, { target: { value: 'Custom Warranty' } });

    const monthsInput = screen.getByPlaceholderText(
      /invoice.warranty.new.monthsPlaceholder/i
    );
    fireEvent.input(monthsInput, { target: { value: '6' } });

    const addButton = screen.getByRole('button', {
      name: /invoice.warranty.add/i,
    });
    fireEvent.click(addButton);

    expect(onAddWarrantyOption).toHaveBeenCalledWith('Custom Warranty', 6);
    expect(onWarrantyChange).toHaveBeenCalledWith(6);
  });

  // ── Additional Info ───────────────────────────────────────────────────────
  it('calls onAdditionalInfoChange when textarea changes', () => {
    const { onAdditionalInfoChange } = renderWarrantySection();
    const textarea = screen.getByPlaceholderText(
      /invoice.additionalInfo.placeholder/i
    );
    fireEvent.input(textarea, { target: { value: 'Some additional info' } });
    expect(onAdditionalInfoChange).toHaveBeenCalledWith('Some additional info');
  });

  it('displays current additional info value', () => {
    renderWarrantySection({ additionalInfo: 'Current info' });
    const textarea = screen.getByPlaceholderText(
      /invoice.additionalInfo.placeholder/i
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Current info');
  });

  // ── Display Label ──────────────────────────────────────────────────────────
  it('displays selected warranty option', () => {
    renderWarrantySection({ warrantyMonths: 3 });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    // The selected option should have a checkmark (visible check icon)
    expect(screen.getByTestId('check-icon')).toBeDefined();
  });
});
