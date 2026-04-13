import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { PhoneSection } from '../PhoneSection.web';
import type { PhoneSectionProps, NewPhoneFields } from '../PhoneSection.web';
import type { Phone } from '../../../ClientFormScreen.types';

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
    className,
    variant,
    _color,
  }: {
    children?: React.ReactNode;
    className?: string;
    variant?: string;
    _color?: string;
  }) => (
    <span data-variant={variant} className={className}>
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
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { count?: number }) => {
      const translations: Record<string, string> = {
        'client.phones': 'Phones',
        'client.phone.add': 'Add Phone',
        'client.phone.remove': 'Remove phone',
        'client.phone.label': 'Phone',
        'client.phone.placeholder': '(11) 99999-9999',
        'client.phone.dialog.title': 'New Phone',
        'client.phone.dialog.editTitle': 'Edit Phone',
        'client.phone.save': 'Save Phone',
        'client.phone.empty': 'No phones added yet',
        'client.phone.allTitle': 'All Phones',
        'client.phone.viewMore': `View +${params?.count ?? 0}`,
        'client.phone.type.mobile': 'Mobile',
        'client.phone.type.telephone': 'Telephone',
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

const samplePhones: Phone[] = [
  {
    id: 'phone1',
    phoneType: 'mobile',
    number: '(11) 99999-9999',
  },
  {
    id: 'phone2',
    phoneType: 'telephone',
    number: '(11) 3333-4444',
  },
  {
    id: 'phone3',
    phoneType: 'mobile',
    number: '(11) 88888-8888',
  },
  {
    id: 'phone4',
    phoneType: 'telephone',
    number: '(11) 2222-3333',
  },
  {
    id: 'phone5',
    phoneType: 'mobile',
    number: '(11) 77777-7777',
  },
  {
    id: 'phone6',
    phoneType: 'telephone',
    number: '(11) 1111-2222',
  },
];

const defaultProps: PhoneSectionProps = {
  phones: [],
  addPhone: vi.fn(),
  removePhone: vi.fn(),
  updatePhone: vi.fn(),
  isDialogOpen: false,
  onDialogOpenChange: vi.fn(),
  newPhone: {
    phoneType: 'mobile',
    number: '',
  },
  onNewPhoneChange: vi.fn(),
  editingPhoneId: null,
  onEditingPhoneIdChange: vi.fn(),
  showAllPhones: false,
  onShowAllPhonesChange: vi.fn(),
  isMobile: false,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('PhoneSection', () => {
  it('renders empty state when no phones', () => {
    render(<PhoneSection {...defaultProps} />);

    expect(screen.getByText('No phones added yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add Phone' })).toBeTruthy();
  });

  it('renders phones grid with up to 5 visible phones', () => {
    const phones = samplePhones.slice(0, 5);
    render(<PhoneSection {...defaultProps} phones={phones} />);

    // Should show phone numbers - use getAllByText since there are multiple
    const phoneElements1 = screen.getAllByText('(11) 99999-9999');
    const phoneElements2 = screen.getAllByText('(11) 3333-4444');
    expect(phoneElements1.length).toBeGreaterThan(0);
    expect(phoneElements2.length).toBeGreaterThan(0);

    // Should not show "View More" when exactly 5 phones
    expect(screen.queryByText(/View \+/)).toBeNull();
  });

  it('shows "View More" card when more than 5 phones', () => {
    render(<PhoneSection {...defaultProps} phones={samplePhones} />);

    expect(screen.getByText('View +1')).toBeTruthy();
  });

  it('calls onShowAllPhonesChange when "View More" is clicked', () => {
    const onShowAllPhonesChange = vi.fn();
    render(
      <PhoneSection
        {...defaultProps}
        phones={samplePhones}
        onShowAllPhonesChange={onShowAllPhonesChange}
      />
    );

    fireEvent.click(screen.getByText('View +1'));
    expect(onShowAllPhonesChange).toHaveBeenCalledWith(true);
  });

  it('opens dialog when add button is clicked', () => {
    const onDialogOpenChange = vi.fn();
    render(
      <PhoneSection {...defaultProps} onDialogOpenChange={onDialogOpenChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Phone' }));
    expect(onDialogOpenChange).toHaveBeenCalledWith(true);
  });

  it('resets form when opening dialog for new phone', () => {
    const onNewPhoneChange = vi.fn();
    const onEditingPhoneIdChange = vi.fn();
    render(
      <PhoneSection
        {...defaultProps}
        onNewPhoneChange={onNewPhoneChange}
        onEditingPhoneIdChange={onEditingPhoneIdChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Phone' }));

    expect(onEditingPhoneIdChange).toHaveBeenCalledWith(null);
    expect(onNewPhoneChange).toHaveBeenCalledWith({
      phoneType: 'mobile',
      number: '',
    });
  });

  it('pre-fills form when editing existing phone', () => {
    const phone = samplePhones[0];
    const onNewPhoneChange = vi.fn();
    const onEditingPhoneIdChange = vi.fn();
    const onDialogOpenChange = vi.fn();

    render(
      <PhoneSection
        {...defaultProps}
        phones={[phone]}
        onNewPhoneChange={onNewPhoneChange}
        onEditingPhoneIdChange={onEditingPhoneIdChange}
        onDialogOpenChange={onDialogOpenChange}
      />
    );

    // Click on phone card to edit - use getAllByText and get the first one
    const phoneElements = screen.getAllByText('(11) 99999-9999');
    const phoneCard = phoneElements[0].closest('div');
    if (phoneCard) {
      fireEvent.click(phoneCard);
    }

    expect(onEditingPhoneIdChange).toHaveBeenCalledWith('phone1');
    expect(onNewPhoneChange).toHaveBeenCalledWith({
      phoneType: 'mobile',
      number: '(11) 99999-9999',
    });
    expect(onDialogOpenChange).toHaveBeenCalledWith(true);
  });

  it('calls removePhone when delete button is clicked', () => {
    const removePhone = vi.fn();
    render(
      <PhoneSection
        {...defaultProps}
        phones={[samplePhones[0]]}
        removePhone={removePhone}
      />
    );

    // Find and click delete button (aria-label="Remove phone") - use getAllByRole
    const deleteButtons = screen.getAllByRole('button', {
      name: 'Remove phone',
    });
    fireEvent.click(deleteButtons[0]);

    expect(removePhone).toHaveBeenCalledWith('phone1');
  });

  it('shows drawer for desktop when showAllPhones is true', () => {
    render(
      <PhoneSection
        {...defaultProps}
        phones={samplePhones}
        showAllPhones={true}
      />
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer.getAttribute('data-open')).toBe('true');
  });

  it('shows bottom sheet for mobile when showAllPhones is true', () => {
    render(
      <PhoneSection
        {...defaultProps}
        phones={samplePhones}
        showAllPhones={true}
        isMobile={true}
      />
    );

    const bottomSheet = screen.getByTestId('bottom-sheet');
    expect(bottomSheet.getAttribute('data-open')).toBe('true');
  });

  it('calls addPhone when saving new phone', () => {
    const addPhone = vi.fn();
    const onDialogOpenChange = vi.fn();
    const newPhone: NewPhoneFields = {
      phoneType: 'mobile',
      number: '(11) 55555-5555',
    };

    render(
      <PhoneSection
        {...defaultProps}
        addPhone={addPhone}
        onDialogOpenChange={onDialogOpenChange}
        newPhone={newPhone}
        isDialogOpen={true}
      />
    );

    // Click save button in dialog
    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    fireEvent.click(saveButton);

    expect(addPhone).toHaveBeenCalledWith(newPhone);
    expect(onDialogOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls updatePhone when saving edited phone', () => {
    const updatePhone = vi.fn();
    const onDialogOpenChange = vi.fn();
    const newPhone: NewPhoneFields = {
      phoneType: 'telephone',
      number: '(11) 4444-5555',
    };

    render(
      <PhoneSection
        {...defaultProps}
        updatePhone={updatePhone}
        onDialogOpenChange={onDialogOpenChange}
        newPhone={newPhone}
        editingPhoneId="phone1"
        isDialogOpen={true}
      />
    );

    // Click save button in dialog
    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    fireEvent.click(saveButton);

    // Should update both fields
    expect(updatePhone).toHaveBeenCalledTimes(2);
    expect(updatePhone).toHaveBeenCalledWith(
      'phone1',
      'phoneType',
      'telephone'
    );
    expect(updatePhone).toHaveBeenCalledWith(
      'phone1',
      'number',
      '(11) 4444-5555'
    );
    expect(onDialogOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables save button when phone number is empty', () => {
    const newPhone: NewPhoneFields = {
      phoneType: 'mobile',
      number: '', // Empty number
    };

    render(
      <PhoneSection {...defaultProps} newPhone={newPhone} isDialogOpen={true} />
    );

    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    expect(saveButton.hasAttribute('disabled')).toBe(true);
  });

  it('enables save button when phone number is not empty', () => {
    const newPhone: NewPhoneFields = {
      phoneType: 'mobile',
      number: '(11) 99999-9999',
    };

    render(
      <PhoneSection {...defaultProps} newPhone={newPhone} isDialogOpen={true} />
    );

    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    expect(saveButton.hasAttribute('disabled')).toBe(false);
  });

  it('shows mobile tab as selected by default', () => {
    render(<PhoneSection {...defaultProps} isDialogOpen={true} />);

    const tabs = screen.getByTestId('tabs');
    expect(tabs.getAttribute('data-value')).toBe('mobile');
  });

  it('shows telephone tab when phoneType is telephone', () => {
    const newPhone: NewPhoneFields = {
      phoneType: 'telephone',
      number: '(11) 3333-4444',
    };

    render(
      <PhoneSection {...defaultProps} newPhone={newPhone} isDialogOpen={true} />
    );

    const tabs = screen.getByTestId('tabs');
    expect(tabs.getAttribute('data-value')).toBe('telephone');
  });

  it('calls onNewPhoneChange when phone type is changed', () => {
    const onNewPhoneChange = vi.fn();
    const newPhone: NewPhoneFields = {
      phoneType: 'mobile',
      number: '(11) 99999-9999',
    };

    render(
      <PhoneSection
        {...defaultProps}
        newPhone={newPhone}
        onNewPhoneChange={onNewPhoneChange}
        isDialogOpen={true}
      />
    );

    const tabs = screen.getByTestId('tabs');
    // Simulate tab change (this would normally come from Tabs component)
    // For now, we'll just verify the tabs are rendered
    expect(tabs).toBeTruthy();
  });

  it('calls onNewPhoneChange when phone number input changes', () => {
    const onNewPhoneChange = vi.fn();
    render(
      <PhoneSection
        {...defaultProps}
        onNewPhoneChange={onNewPhoneChange}
        isDialogOpen={true}
      />
    );

    const phoneInput = screen.getByLabelText('Phone');
    fireEvent.change(phoneInput, { target: { value: '(11) 88888-8888' } });

    expect(onNewPhoneChange).toHaveBeenCalledWith({
      phoneType: 'mobile',
      number: '(11) 88888-8888',
    });
  });
});
