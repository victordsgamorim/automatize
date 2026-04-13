import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { AddressSection } from '../AddressSection.web';
import type {
  AddressSectionProps,
  NewAddressFields,
} from '../AddressSection.web';
import type { Address } from '../../../ClientFormScreen.types';

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@automatize/ui/web', () => ({
  Button: ({
    children,
    onClick,
    type,
    'aria-label': ariaLabel,
    variant,
    size,
    className,
    disabled,
    shortcut,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    'aria-label'?: string;
    variant?: string;
    size?: string;
    className?: string;
    disabled?: boolean;
    shortcut?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick}
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
      data-shortcut={shortcut}
    >
      {children}
    </button>
  ),
  Input: ({
    id,
    value,
    onChange,
    label,
    placeholder,
  }: {
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
  }) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  ),
  Text: ({
    children,
    _htmlFor,
    _color,
    className,
    variant,
  }: {
    children?: React.ReactNode;
    _htmlFor?: string;
    _color?: string;
    className?: string;
    variant?: string;
  }) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
  Card: ({
    children,
    _padding,
    className,
    onClick,
  }: {
    children?: React.ReactNode;
    _padding?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  ),
  Dialog: ({
    open,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
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
  Tabs: ({
    children,
    value,
    _onValueChange,
  }: {
    children?: React.ReactNode;
    value?: string;
    _onValueChange?: (val: string) => void;
  }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({
    children,
    variant,
    size,
  }: {
    children?: React.ReactNode;
    variant?: string;
    size?: string;
  }) => (
    <div data-testid="tabs-list" data-variant={variant} data-size={size}>
      {children}
    </div>
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
  Select: ({
    value,
    _onValueChange,
    children,
  }: {
    value?: string;
    _onValueChange?: (val: string) => void;
    children?: React.ReactNode;
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({
    id,
    className,
    children,
  }: {
    id?: string;
    className?: string;
    children?: React.ReactNode;
  }) => (
    <div id={id} className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value?: string;
    children?: React.ReactNode;
  }) => <div data-value={value}>{children}</div>,
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { count?: number }) => {
      const translations: Record<string, string> = {
        'client.addresses': 'Addresses',
        'client.address.add': 'Add Address',
        'client.address.remove': 'Remove address',
        'client.address.street': 'Street',
        'client.address.street.placeholder': 'Maple Avenue',
        'client.address.number': 'Number',
        'client.address.number.placeholder': '1A',
        'client.address.neighborhood': 'Neighborhood',
        'client.address.neighborhood.placeholder': 'Downtown',
        'client.address.city': 'City',
        'client.address.city.placeholder': 'Sao Paulo',
        'client.address.state': 'State',
        'client.address.state.placeholder': 'Select state',
        'client.address.info': 'Additional Info',
        'client.address.info.placeholder': 'Apt 201, Block B',
        'client.address.dialog.title': 'New Address',
        'client.address.dialog.editTitle': 'Edit Address',
        'client.address.save': 'Save Address',
        'client.address.empty': 'No addresses added yet',
        'client.address.allTitle': 'All Addresses',
        'client.address.viewMore': `View +${params?.count ?? 0}`,
        'client.address.type.residence': 'Residence',
        'client.address.type.establishment': 'Establishment',
        'app.cancel': 'Cancel',
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock('@automatize/ui/responsive', () => ({
  useResponsive: () => ({ isMobile: false }),
}));

// ── Test Data ───────────────────────────────────────────────────────────────

const sampleAddresses: Address[] = [
  {
    id: 'addr1',
    addressType: 'residence',
    street: '123 Main St',
    number: '10',
    neighborhood: 'Downtown',
    city: 'Sao Paulo',
    state: 'SP',
    info: 'Apt 201',
  },
  {
    id: 'addr2',
    addressType: 'establishment',
    street: '456 Business Ave',
    number: '20B',
    neighborhood: 'Financial District',
    city: 'Rio de Janeiro',
    state: 'RJ',
    info: '',
  },
  {
    id: 'addr3',
    addressType: 'residence',
    street: '789 Park Rd',
    number: '30',
    neighborhood: 'Green Valley',
    city: 'Belo Horizonte',
    state: 'MG',
    info: 'House with garden',
  },
  {
    id: 'addr4',
    addressType: 'establishment',
    street: '101 Industrial Blvd',
    number: '40',
    neighborhood: 'Industrial Zone',
    city: 'Porto Alegre',
    state: 'RS',
    info: 'Warehouse',
  },
  {
    id: 'addr5',
    addressType: 'residence',
    street: '202 Beach St',
    number: '50',
    neighborhood: 'Coastal Area',
    city: 'Florianopolis',
    state: 'SC',
    info: 'Near the beach',
  },
  {
    id: 'addr6',
    addressType: 'establishment',
    street: '303 Mountain Rd',
    number: '60',
    neighborhood: 'Highlands',
    city: 'Curitiba',
    state: 'PR',
    info: 'Office building',
  },
];

const defaultProps: AddressSectionProps = {
  addresses: [],
  addAddress: vi.fn(),
  removeAddress: vi.fn(),
  updateAddress: vi.fn(),
  isDialogOpen: false,
  onDialogOpenChange: vi.fn(),
  newAddress: {
    addressType: 'residence',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    info: '',
  },
  onNewAddressChange: vi.fn(),
  editingAddressId: null,
  onEditingAddressIdChange: vi.fn(),
  showAllAddresses: false,
  onShowAllAddressesChange: vi.fn(),
  isMobile: false,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('AddressSection', () => {
  it('renders empty state when no addresses', () => {
    render(<AddressSection {...defaultProps} />);

    expect(screen.getByText('No addresses added yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add Address' })).toBeTruthy();
  });

  it('renders addresses grid with up to 5 visible addresses', () => {
    const addresses = sampleAddresses.slice(0, 5);
    render(<AddressSection {...defaultProps} addresses={addresses} />);

    // Should show 5 address cards - use getAllByText since there are multiple
    const addressElements = screen.getAllByText('123 Main St, 10');
    expect(addressElements.length).toBeGreaterThan(0);

    // Should show "View +0" when exactly 5 addresses
    expect(screen.queryByText(/View \+/)).toBeNull();
  });

  it('shows "View More" card when more than 5 addresses', () => {
    render(<AddressSection {...defaultProps} addresses={sampleAddresses} />);

    expect(screen.getByText('View +1')).toBeTruthy();
  });

  it('calls onShowAllAddressesChange when "View More" is clicked', () => {
    const onShowAllAddressesChange = vi.fn();
    render(
      <AddressSection
        {...defaultProps}
        addresses={sampleAddresses}
        onShowAllAddressesChange={onShowAllAddressesChange}
      />
    );

    fireEvent.click(screen.getByText('View +1'));
    expect(onShowAllAddressesChange).toHaveBeenCalledWith(true);
  });

  it('opens dialog when add button is clicked', () => {
    const onDialogOpenChange = vi.fn();
    render(
      <AddressSection
        {...defaultProps}
        onDialogOpenChange={onDialogOpenChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Address' }));
    expect(onDialogOpenChange).toHaveBeenCalledWith(true);
  });

  it('resets form when opening dialog for new address', () => {
    const onNewAddressChange = vi.fn();
    const onEditingAddressIdChange = vi.fn();
    render(
      <AddressSection
        {...defaultProps}
        onNewAddressChange={onNewAddressChange}
        onEditingAddressIdChange={onEditingAddressIdChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Address' }));

    expect(onEditingAddressIdChange).toHaveBeenCalledWith(null);
    expect(onNewAddressChange).toHaveBeenCalledWith({
      addressType: 'residence',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      info: '',
    });
  });

  it('pre-fills form when editing existing address', () => {
    const address = sampleAddresses[0];
    const onNewAddressChange = vi.fn();
    const onEditingAddressIdChange = vi.fn();
    const onDialogOpenChange = vi.fn();

    render(
      <AddressSection
        {...defaultProps}
        addresses={[address]}
        onNewAddressChange={onNewAddressChange}
        onEditingAddressIdChange={onEditingAddressIdChange}
        onDialogOpenChange={onDialogOpenChange}
      />
    );

    // Click on address card to edit - use getAllByText and get the first one
    const addressElements = screen.getAllByText('123 Main St, 10');
    const addressCard = addressElements[0].closest('div');
    if (addressCard) {
      fireEvent.click(addressCard);
    }

    expect(onEditingAddressIdChange).toHaveBeenCalledWith('addr1');
    expect(onNewAddressChange).toHaveBeenCalledWith({
      addressType: 'residence',
      street: '123 Main St',
      number: '10',
      neighborhood: 'Downtown',
      city: 'Sao Paulo',
      state: 'SP',
      info: 'Apt 201',
    });
    expect(onDialogOpenChange).toHaveBeenCalledWith(true);
  });

  it('calls removeAddress when delete button is clicked', () => {
    const removeAddress = vi.fn();
    render(
      <AddressSection
        {...defaultProps}
        addresses={[sampleAddresses[0]]}
        removeAddress={removeAddress}
      />
    );

    // Find and click delete button (aria-label="Remove address") - use getAllByRole
    const deleteButtons = screen.getAllByRole('button', {
      name: 'Remove address',
    });
    fireEvent.click(deleteButtons[0]);

    expect(removeAddress).toHaveBeenCalledWith('addr1');
  });

  it('shows drawer for desktop when showAllAddresses is true', () => {
    render(
      <AddressSection
        {...defaultProps}
        addresses={sampleAddresses}
        showAllAddresses={true}
      />
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer.getAttribute('data-open')).toBe('true');
  });

  it('shows bottom sheet for mobile when showAllAddresses is true', () => {
    render(
      <AddressSection
        {...defaultProps}
        addresses={sampleAddresses}
        showAllAddresses={true}
        isMobile={true}
      />
    );

    const bottomSheet = screen.getByTestId('bottom-sheet');
    expect(bottomSheet.getAttribute('data-open')).toBe('true');
  });

  it('calls addAddress when saving new address', () => {
    const addAddress = vi.fn();
    const onDialogOpenChange = vi.fn();
    const newAddress: NewAddressFields = {
      addressType: 'residence',
      street: 'New Street',
      number: '100',
      neighborhood: 'New Neighborhood',
      city: 'New City',
      state: 'SP',
      info: 'New Info',
    };

    render(
      <AddressSection
        {...defaultProps}
        addAddress={addAddress}
        onDialogOpenChange={onDialogOpenChange}
        newAddress={newAddress}
        isDialogOpen={true}
      />
    );

    // Click save button in dialog
    const saveButton = screen.getByRole('button', { name: 'Save Address' });
    fireEvent.click(saveButton);

    expect(addAddress).toHaveBeenCalledWith(newAddress);
    expect(onDialogOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls updateAddress when saving edited address', () => {
    const updateAddress = vi.fn();
    const onDialogOpenChange = vi.fn();
    const newAddress: NewAddressFields = {
      addressType: 'establishment',
      street: 'Updated Street',
      number: '200',
      neighborhood: 'Updated Neighborhood',
      city: 'Updated City',
      state: 'RJ',
      info: 'Updated Info',
    };

    render(
      <AddressSection
        {...defaultProps}
        updateAddress={updateAddress}
        onDialogOpenChange={onDialogOpenChange}
        newAddress={newAddress}
        editingAddressId="addr1"
        isDialogOpen={true}
      />
    );

    // Click save button in dialog
    const saveButton = screen.getByRole('button', { name: 'Save Address' });
    fireEvent.click(saveButton);

    // Should update all fields
    expect(updateAddress).toHaveBeenCalledTimes(7); // 7 fields
    expect(updateAddress).toHaveBeenCalledWith(
      'addr1',
      'addressType',
      'establishment'
    );
    expect(updateAddress).toHaveBeenCalledWith(
      'addr1',
      'street',
      'Updated Street'
    );
    expect(onDialogOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables save button when street is empty', () => {
    const newAddress: NewAddressFields = {
      addressType: 'residence',
      street: '', // Empty street
      number: '100',
      neighborhood: 'Test',
      city: 'Test City',
      state: 'SP',
      info: '',
    };

    render(
      <AddressSection
        {...defaultProps}
        newAddress={newAddress}
        isDialogOpen={true}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save Address' });
    expect(saveButton.hasAttribute('disabled')).toBe(true);
  });

  it('enables save button when street is not empty', () => {
    const newAddress: NewAddressFields = {
      addressType: 'residence',
      street: 'Valid Street',
      number: '100',
      neighborhood: 'Test',
      city: 'Test City',
      state: 'SP',
      info: '',
    };

    render(
      <AddressSection
        {...defaultProps}
        newAddress={newAddress}
        isDialogOpen={true}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save Address' });
    expect(saveButton.hasAttribute('disabled')).toBe(false);
  });
});
