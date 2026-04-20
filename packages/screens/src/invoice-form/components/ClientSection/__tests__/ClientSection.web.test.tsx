import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', () => {
  type WithChildren = { children?: React.ReactNode };

  const Popover = ({
    children,
    open: _open,
    onOpenChange: _onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => React.createElement('div', null, children);
  const PopoverTrigger = ({
    children,
    asChild,
  }: WithChildren & { asChild?: boolean }) => {
    if (asChild && React.isValidElement(children)) return children;
    return React.createElement('button', null, children);
  };
  const PopoverContent = ({
    children,
    className,
  }: WithChildren & { className?: string }) =>
    React.createElement('div', { className }, children);

  const Command = ({ children }: WithChildren) =>
    React.createElement('div', null, children);
  const CommandInput = ({ placeholder }: { placeholder?: string }) =>
    React.createElement('input', { placeholder });
  const CommandList = ({ children }: WithChildren) =>
    React.createElement('div', null, children);
  const CommandEmpty = ({ children }: WithChildren) =>
    React.createElement('div', null, children);
  const CommandGroup = ({ children }: WithChildren) =>
    React.createElement('div', null, children);
  const CommandItem = ({
    children,
    onSelect,
  }: WithChildren & { onSelect?: () => void }) =>
    React.createElement('div', { onClick: onSelect }, children);

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
  }) => React.createElement('span', { variant, color, className }, children);

  const Separator = () =>
    React.createElement('hr', { 'data-testid': 'separator' });

  const cn = (...classes: string[]): string =>
    classes.filter(Boolean).join(' ');

  const Check = () =>
    React.createElement('span', { 'data-testid': 'check-icon' });
  const ChevronsUpDown = () =>
    React.createElement('span', { 'data-testid': 'chevrons-icon' });
  const X = () => React.createElement('span', { 'data-testid': 'x-icon' });
  const MapPin = () =>
    React.createElement('span', { 'data-testid': 'map-pin-icon' });
  const Phone = () =>
    React.createElement('span', { 'data-testid': 'phone-icon' });
  const Plus = () =>
    React.createElement('span', { 'data-testid': 'plus-icon' });
  const Home = () =>
    React.createElement('span', { 'data-testid': 'home-icon' });
  const Building2 = () =>
    React.createElement('span', { 'data-testid': 'building-icon' });
  const Smartphone = () =>
    React.createElement('span', { 'data-testid': 'smartphone-icon' });

  const SecondaryChip = ({
    children,
    onRemove,
  }: {
    children?: React.ReactNode;
    onRemove?: () => void;
    size?: string;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'secondary-chip' },
      children,
      onRemove
        ? React.createElement(
            'button',
            { onClick: onRemove, 'data-testid': 'chip-remove' },
            'Remove'
          )
        : null
    );

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
    Text,
    Separator,
    SecondaryChip,
    cn,
    Check,
    ChevronsUpDown,
    X,
    MapPin,
    Phone,
    Plus,
    Home,
    Building2,
    Smartphone,
  };
});

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock AddressDialog
vi.mock('../../../../components/AddressDialog/AddressDialog.web', () => ({
  AddressDialog: ({
    open,
    onSave,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Record<string, unknown>;
    onChange: (data: Record<string, unknown>) => void;
    onSave: () => void;
  }) =>
    open
      ? React.createElement(
          'div',
          { 'data-testid': 'address-dialog' },
          React.createElement(
            'button',
            { onClick: onSave, 'data-testid': 'address-save' },
            'Save'
          )
        )
      : null,
}));

// Mock PhoneDialog
vi.mock('../../../../components/PhoneDialog/PhoneDialog.web', () => ({
  PhoneDialog: ({
    open,
    onSave,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Record<string, unknown>;
    onChange: (data: Record<string, unknown>) => void;
    onSave: () => void;
  }) =>
    open
      ? React.createElement(
          'div',
          { 'data-testid': 'phone-dialog' },
          React.createElement(
            'button',
            { onClick: onSave, 'data-testid': 'phone-save' },
            'Save'
          )
        )
      : null,
}));

// Mock SaveToProfileDialog
vi.mock(
  '../../../../components/SaveToProfileDialog/SaveToProfileDialog.web',
  () => ({
    SaveToProfileDialog: ({
      open,
      onConfirm,
      onSkip,
    }: {
      open: boolean;
      onConfirm: () => void;
      onSkip: () => void;
    }) =>
      open
        ? React.createElement(
            'div',
            { 'data-testid': 'save-profile-dialog' },
            React.createElement(
              'button',
              { onClick: onConfirm, 'data-testid': 'confirm' },
              'Confirm'
            ),
            React.createElement(
              'button',
              { onClick: onSkip, 'data-testid': 'skip' },
              'Skip'
            )
          )
        : null,
  })
);

// Mock useAddressDialog hook
vi.mock('../../../../components/AddressDialog/useAddressDialog', () => ({
  useAddressDialog: () => ({
    isOpen: false,
    data: {
      addressType: 'residence',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      info: '',
    },
    setData: vi.fn(),
    editingId: null,
    openNew: vi.fn(),
    openEdit: vi.fn(),
    close: vi.fn(),
    reset: vi.fn(),
  }),
}));

// Mock usePhoneDialog hook
vi.mock('../../../../components/PhoneDialog/usePhoneDialog', () => ({
  usePhoneDialog: () => ({
    isOpen: false,
    data: { phoneType: 'mobile', number: '' },
    setData: vi.fn(),
    editingId: null,
    openNew: vi.fn(),
    openEdit: vi.fn(),
    close: vi.fn(),
    reset: vi.fn(),
  }),
}));

import { ClientSection } from '../ClientSection.web';
import type {
  ClientRow,
  ClientAddress,
  ClientPhone,
} from '../../../InvoiceFormScreen.types';

const mockClients: ClientRow[] = [
  {
    id: 'client-1',
    name: 'John Doe',
    document: '12345678901',
    addresses: [],
    phones: [],
  },
  {
    id: 'client-2',
    name: 'Jane Smith',
    document: '98765432109',
    addresses: [],
    phones: [],
  },
];

const mockAddresses: ClientAddress[] = [
  {
    id: 'addr-1',
    street: 'Street 1',
    number: '123',
    neighborhood: 'Neighborhood',
    city: 'City',
    state: 'SP',
  },
];

const mockPhones: ClientPhone[] = [
  { id: 'phone-1', phoneType: 'mobile', number: '11999999999' },
];

function renderClientSection(
  overrides: Partial<React.ComponentProps<typeof ClientSection>> = {}
) {
  const onSelectClient = vi.fn();
  const onClearClient = vi.fn();
  const onSelectAddress = vi.fn();
  const onAddAddress = vi.fn();
  const onRemoveAddress = vi.fn();
  const onTogglePhone = vi.fn();
  const onAddPhone = vi.fn();
  const onRemovePhone = vi.fn();

  const props = {
    availableClients: mockClients,
    selectedClientId: undefined,
    selectedClientName: undefined,
    clientAddresses: [],
    clientPhones: [],
    onSelectClient,
    onClearClient,
    onSelectAddress,
    onAddAddress,
    onRemoveAddress,
    onTogglePhone,
    onAddPhone,
    onRemovePhone,
    ...overrides,
  };

  const result = render(<ClientSection {...props} />);
  return {
    ...result,
    onSelectClient,
    onClearClient,
    onSelectAddress,
    onAddAddress,
    onRemoveAddress,
    onTogglePhone,
    onAddPhone,
    onRemovePhone,
  };
}

describe('ClientSection (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders client section header', () => {
    renderClientSection();
    const elements = screen.getAllByText(/invoice.client/i);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders client selector when no client is selected', () => {
    renderClientSection();
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText(/invoice.client.placeholder/i)).toBeDefined();
  });

  it('renders all available clients in dropdown', () => {
    renderClientSection();
    // Click on the combobox to open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
  });

  // ── Client Selection ───────────────────────────────────────────────────────
  it('calls onSelectClient when a client is selected', () => {
    const { onSelectClient } = renderClientSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const clientItem =
      screen.getByText('John Doe').closest('[role="option"]') ||
      screen.getByText('John Doe');
    fireEvent.click(clientItem);

    expect(onSelectClient).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'client-1', name: 'John Doe' })
    );
  });

  // ── Selected Client View ───────────────────────────────────────────────────
  it('shows selected client name when client is selected', () => {
    renderClientSection({
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
    });
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('shows clear button for selected client', () => {
    renderClientSection({
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
    });
    expect(
      screen.getByRole('button', { name: /invoice.client.clear/i })
    ).toBeDefined();
  });

  it('calls onClearClient when clear button is clicked', () => {
    const { onClearClient } = renderClientSection({
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
    });
    const clearButton = screen.getByRole('button', {
      name: /invoice.client.clear/i,
    });
    fireEvent.click(clearButton);
    expect(onClearClient).toHaveBeenCalled();
  });

  // ── Addresses Section ─────────────────────────────────────────────────────
  it('shows addresses section header', () => {
    renderClientSection({
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
    });
    expect(screen.getByText(/invoice.client.addresses/i)).toBeDefined();
  });

  it('shows addresses from client data', () => {
    const clientWithAddresses: ClientRow = {
      id: 'client-1',
      name: 'John Doe',
      document: '12345678901',
      addresses: mockAddresses,
      phones: [],
    };

    renderClientSection({
      availableClients: [clientWithAddresses],
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
      clientAddresses: mockAddresses,
    });

    expect(screen.getAllByText(/Street 1/i).length).toBeGreaterThanOrEqual(1);
  });

  // ── Phones Section ────────────────────────────────────────────────────────
  it('shows phones section header', () => {
    renderClientSection({
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
    });
    expect(screen.getByText(/invoice.client.phones/i)).toBeDefined();
  });

  it('shows phone numbers from client data', () => {
    const clientWithPhones: ClientRow = {
      id: 'client-1',
      name: 'John Doe',
      document: '12345678901',
      addresses: [],
      phones: mockPhones,
    };

    renderClientSection({
      availableClients: [clientWithPhones],
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
      clientPhones: mockPhones,
    });

    expect(screen.getAllByText('11999999999').length).toBeGreaterThanOrEqual(1);
  });

  it('renders phone numbers as SecondaryChip components', () => {
    const clientWithPhones: ClientRow = {
      id: 'client-1',
      name: 'John Doe',
      document: '12345678901',
      addresses: [],
      phones: mockPhones,
    };

    renderClientSection({
      availableClients: [clientWithPhones],
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
      clientPhones: mockPhones,
    });

    const chips = screen.getAllByTestId('secondary-chip');
    expect(chips.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onRemovePhone when chip remove button is clicked', () => {
    const clientWithPhones: ClientRow = {
      id: 'client-1',
      name: 'John Doe',
      document: '12345678901',
      addresses: [],
      phones: mockPhones,
    };

    const { onRemovePhone } = renderClientSection({
      availableClients: [clientWithPhones],
      selectedClientId: 'client-1',
      selectedClientName: 'John Doe',
      clientPhones: mockPhones,
    });

    const removeButton = screen.getByTestId('chip-remove');
    fireEvent.click(removeButton);

    expect(onRemovePhone).toHaveBeenCalledWith('phone-1');
  });
});
