import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', async () => {
  const { createElement } = await import('react');

  type WithChildren = { children?: React.ReactNode };

  const Popover = ({
    children,
    open: _open,
    onOpenChange: _onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => createElement('div', null, children);
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
    disabled,
    className,
  }: WithChildren & {
    onSelect?: () => void;
    disabled?: boolean;
    className?: string;
  }) =>
    createElement(
      'div',
      { onClick: disabled ? undefined : onSelect, className },
      children
    );
  const CommandSeparator = () =>
    createElement('hr', { 'data-testid': 'separator' });

  const Dialog = ({
    children,
    open,
    _onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? createElement('div', { 'data-testid': 'dialog' }, children) : null;
  const DialogContent = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const DialogHeader = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const DialogTitle = ({ children }: WithChildren) =>
    createElement('h2', null, children);
  const DialogDescription = ({ children }: WithChildren) =>
    createElement('p', null, children);
  const DialogFooter = ({ children }: WithChildren) =>
    createElement('div', null, children);

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
  const X = () => createElement('span', { 'data-testid': 'x-icon' });
  const Wrench = () => createElement('span', { 'data-testid': 'wrench-icon' });

  return {
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    PrimaryButton,
    SecondaryButton,
    Input,
    Text,
    cn,
    Check,
    ChevronsUpDown,
    Plus,
    X,
    Wrench,
  };
});

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { TechniciansSection } from '../TechniciansSection.web';
import type {
  TechnicianRow,
  InvoiceTechnician,
} from '../../../InvoiceFormScreen.types';

const mockTechnicians: TechnicianRow[] = [
  { id: 'tech-1', name: 'John Doe', entryDate: '2024-01-01' },
  { id: 'tech-2', name: 'Jane Smith', entryDate: '2024-02-01' },
  { id: 'tech-3', name: 'Bob Wilson', entryDate: '2024-03-01' },
];

const mockSelectedTechnicians: InvoiceTechnician[] = [
  { id: 'tech-1', name: 'John Doe', active: true },
];

function renderTechniciansSection(
  overrides: Partial<React.ComponentProps<typeof TechniciansSection>> = {}
) {
  const onAddTechnician = vi.fn();
  const onToggleTechnician = vi.fn();
  const onRemoveTechnician = vi.fn();
  const onAddNewTechnician = vi.fn();
  const onSaveTechnicianToTable = vi.fn();

  const props = {
    availableTechnicians: mockTechnicians,
    selectedTechnicians: [],
    onAddTechnician,
    onToggleTechnician,
    onRemoveTechnician,
    onAddNewTechnician,
    onSaveTechnicianToTable,
    ...overrides,
  };

  const result = render(<TechniciansSection {...props} />);
  return {
    ...result,
    onAddTechnician,
    onToggleTechnician,
    onRemoveTechnician,
    onAddNewTechnician,
    onSaveTechnicianToTable,
  };
}

describe('TechniciansSection (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders technicians section header', () => {
    renderTechniciansSection();
    const elements = screen.getAllByText(/invoice.technicians/i);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders technician combobox', () => {
    renderTechniciansSection();
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText(/invoice.technicians.select/i)).toBeDefined();
  });

  it('shows selected count when technicians are selected', () => {
    renderTechniciansSection({ selectedTechnicians: mockSelectedTechnicians });
    expect(
      screen.getByText(/invoice.technicians.selected.count/i)
    ).toBeDefined();
  });

  // ── Technician Selection ────────────────────────────────────────────────────
  it('shows available technicians in dropdown', () => {
    renderTechniciansSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('Bob Wilson')).toBeDefined();
  });

  it('calls onAddTechnician when selecting a technician', () => {
    const { onAddTechnician } = renderTechniciansSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const techItem = screen.getByText('Jane Smith');
    fireEvent.click(techItem);

    expect(onAddTechnician).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tech-2', name: 'Jane Smith' })
    );
  });

  // ── Add New Technician ────────────────────────────────────────────────────
  it('shows add new option in dropdown', () => {
    renderTechniciansSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText(/invoice.technicians.addNew/i)).toBeDefined();
  });

  it('switches to add mode when add new is clicked', () => {
    renderTechniciansSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const addNewButton = screen.getByText(/invoice.technicians.addNew/i);
    fireEvent.click(addNewButton);

    expect(
      screen.getByPlaceholderText(/invoice.technicians.addPlaceholder/i)
    ).toBeDefined();
  });

  // ── Selected Technicians ──────────────────────────────────────────────────
  it('displays selected technicians as tags', () => {
    renderTechniciansSection({ selectedTechnicians: mockSelectedTechnicians });
    const tags = screen.getAllByText('John Doe');
    expect(tags.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onRemoveTechnician when remove button is clicked', () => {
    const { onRemoveTechnician } = renderTechniciansSection({
      selectedTechnicians: mockSelectedTechnicians,
    });
    const removeButton = screen.getByRole('button', {
      name: /invoice.technicians.remove/i,
    });
    fireEvent.click(removeButton);
    expect(onRemoveTechnician).toHaveBeenCalledWith('tech-1');
  });

  it('calls onToggleTechnician when technician tag is clicked', () => {
    const { onToggleTechnician } = renderTechniciansSection({
      selectedTechnicians: mockSelectedTechnicians,
    });
    const techElements = screen.getAllByText('John Doe');
    const techTag = techElements.find(
      (el) =>
        el.closest('button')?.getAttribute('type') === 'button' &&
        el.closest('button')?.getAttribute('aria-label') ===
          'invoice.technicians.toggle'
    );
    expect(techTag).toBeDefined();
    fireEvent.click((techTag as HTMLElement).closest('button') as Element);
    expect(onToggleTechnician).toHaveBeenCalledWith('tech-1');
  });

  // ── Save to Table Dialog ───────────────────────────────────────────────────
  it('shows save to table dialog when adding new technician', () => {
    renderTechniciansSection();

    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const addNewButton = screen.getByText(/invoice.technicians.addNew/i);
    fireEvent.click(addNewButton);

    const input = screen.getByPlaceholderText(
      /invoice.technicians.addPlaceholder/i
    );
    fireEvent.input(input, { target: { value: 'New Technician' } });

    const addButton = screen.getByRole('button', {
      name: /invoice.technicians.add/i,
    });
    fireEvent.click(addButton);

    // Dialog should appear
    expect(screen.getByTestId('dialog')).toBeDefined();
  });

  it('calls onSaveTechnicianToTable when confirming save to table', () => {
    const { onAddNewTechnician, onSaveTechnicianToTable } =
      renderTechniciansSection();

    // First add a new technician (simulate add mode)
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    const addNewButton = screen.getByText(/invoice.technicians.addNew/i);
    fireEvent.click(addNewButton);

    const input = screen.getByPlaceholderText(
      /invoice.technicians.addPlaceholder/i
    );
    fireEvent.input(input, { target: { value: 'New Technician' } });

    const addButton = screen.getByRole('button', {
      name: /invoice.technicians.add/i,
    });
    fireEvent.click(addButton);

    // Now confirm in dialog
    const confirmButton = screen.getByRole('button', {
      name: /invoice.technicians.saveToTable.confirm/i,
    });
    fireEvent.click(confirmButton);

    expect(onSaveTechnicianToTable).toHaveBeenCalledWith('New Technician');
    expect(onAddNewTechnician).toHaveBeenCalledWith('New Technician');
  });
});
