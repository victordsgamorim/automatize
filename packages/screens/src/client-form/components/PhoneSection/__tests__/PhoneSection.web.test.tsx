import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { PhoneSection } from '../PhoneSection.web';
import type { PhoneSectionProps } from '../PhoneSection.web';
import type { Phone } from '../../../ClientFormScreen.types';

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
    onClick?: ((e: React.MouseEvent) => void) | (() => void);
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
      onClick={onClick as React.MouseEventHandler}
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
  PrimaryButton: ({
    children,
    onClick,
    type,
    'aria-label': ariaLabel,
    size,
    className,
    disabled,
    shortcut,
  }: {
    children?: React.ReactNode;
    onClick?: ((e: React.MouseEvent) => void) | (() => void);
    type?: string;
    'aria-label'?: string;
    size?: string;
    className?: string;
    disabled?: boolean;
    shortcut?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick as React.MouseEventHandler}
      aria-label={ariaLabel}
      data-variant="default"
      data-size={size}
      className={className}
      disabled={disabled}
      data-shortcut={shortcut}
    >
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    type,
    'aria-label': ariaLabel,
    size,
    className,
    disabled,
    shortcut,
  }: {
    children?: React.ReactNode;
    onClick?: ((e: React.MouseEvent) => void) | (() => void);
    type?: string;
    'aria-label'?: string;
    size?: string;
    className?: string;
    disabled?: boolean;
    shortcut?: string;
  }) => (
    <button
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      onClick={onClick as React.MouseEventHandler}
      aria-label={ariaLabel}
      data-variant="secondary"
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

const samplePhones: Phone[] = [
  { id: 'phone1', phoneType: 'mobile', number: '(11) 99999-9999' },
  { id: 'phone2', phoneType: 'telephone', number: '(11) 3333-4444' },
  { id: 'phone3', phoneType: 'mobile', number: '(11) 88888-8888' },
  { id: 'phone4', phoneType: 'telephone', number: '(11) 2222-3333' },
  { id: 'phone5', phoneType: 'mobile', number: '(11) 77777-7777' },
  { id: 'phone6', phoneType: 'telephone', number: '(11) 1111-2222' },
];

const defaultProps: PhoneSectionProps = {
  phones: [],
  addPhone: vi.fn(),
  removePhone: vi.fn(),
  updatePhone: vi.fn(),
  isMobile: false,
};

describe('PhoneSection', () => {
  it('renders empty state when no phones', () => {
    render(<PhoneSection {...defaultProps} />);

    expect(screen.getByText('No phones added yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add Phone' })).toBeTruthy();
  });

  it('renders phones with up to 5 visible phones', () => {
    const phones = samplePhones.slice(0, 5);
    render(<PhoneSection {...defaultProps} phones={phones} />);

    const phoneElements1 = screen.getAllByText('(11) 99999-9999');
    expect(phoneElements1.length).toBeGreaterThan(0);

    expect(screen.queryByText(/View \+/)).toBeNull();
  });

  it('shows "View More" card when more than 5 phones', () => {
    render(<PhoneSection {...defaultProps} phones={samplePhones} />);

    expect(screen.getByText('View +1')).toBeTruthy();
  });

  it('opens drawer when "View More" is clicked', () => {
    render(<PhoneSection {...defaultProps} phones={samplePhones} />);

    expect(screen.getByTestId('drawer').getAttribute('data-open')).toBe(
      'false'
    );
    fireEvent.click(screen.getByText('View +1'));
    expect(screen.getByTestId('drawer').getAttribute('data-open')).toBe('true');
  });

  it('opens dialog when add button is clicked', () => {
    render(<PhoneSection {...defaultProps} />);

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Add Phone' }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('New Phone')).toBeTruthy();
  });

  it('calls addPhone when saving new phone through dialog', () => {
    const addPhone = vi.fn();
    render(<PhoneSection {...defaultProps} addPhone={addPhone} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Phone' }));

    const phoneInput = screen.getByLabelText('Phone');
    fireEvent.change(phoneInput, { target: { value: '(11) 55555-5555' } });

    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    fireEvent.click(saveButton);

    expect(addPhone).toHaveBeenCalledTimes(1);
    expect(addPhone).toHaveBeenCalledWith(
      expect.objectContaining({ number: '(11) 55555-5555' })
    );
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

    const deleteButtons = screen.getAllByRole('button', {
      name: 'Remove phone',
    });
    fireEvent.click(deleteButtons[0]);

    expect(removePhone).toHaveBeenCalledWith('phone1');
  });

  it('calls updatePhone when saving edited phone through dialog', () => {
    const updatePhone = vi.fn();
    const phone = samplePhones[0];
    render(
      <PhoneSection
        {...defaultProps}
        phones={[phone]}
        updatePhone={updatePhone}
      />
    );

    const phoneElements = screen.getAllByText('(11) 99999-9999');
    const phoneCard = phoneElements[0].closest('div');
    if (phoneCard) {
      fireEvent.click(phoneCard);
    }

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Edit Phone')).toBeTruthy();

    const phoneInput = screen.getByLabelText('Phone');
    fireEvent.change(phoneInput, { target: { value: '(11) 4444-5555' } });

    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    fireEvent.click(saveButton);

    expect(updatePhone).toHaveBeenCalledWith(
      'phone1',
      'number',
      '(11) 4444-5555'
    );
  });

  it('disables save button when phone number is empty', () => {
    render(<PhoneSection {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Phone' }));

    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    expect(saveButton.hasAttribute('disabled')).toBe(true);
  });

  it('enables save button when phone number is not empty', () => {
    render(<PhoneSection {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Phone' }));

    const phoneInput = screen.getByLabelText('Phone');
    fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } });

    const saveButton = screen.getByRole('button', { name: 'Save Phone' });
    expect(saveButton.hasAttribute('disabled')).toBe(false);
  });

  it('shows mobile tab as selected by default in dialog', () => {
    render(<PhoneSection {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Phone' }));

    const tabs = screen.getByTestId('tabs');
    expect(tabs.getAttribute('data-value')).toBe('mobile');
  });
});
