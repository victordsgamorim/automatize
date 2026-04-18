import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web to avoid Radix UI portal/pointer-event issues in jsdom
vi.mock('@automatize/ui/web', async () => {
  const actual =
    await vi.importActual<Record<string, React.ReactNode>>(
      '@automatize/ui/web'
    );
  // Keep React imported for side effects
  await import('react');

  type WithChildren = { children?: React.ReactNode };

  const Dialog = ({ children }: WithChildren) =>
    React.createElement('div', null, children);
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
  const Tabs = ({
    children,
    value: _value,
    onValueChange: _onValueChange,
  }: {
    children?: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => {
    return React.createElement('div', null, children);
  };
  const TabsList = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', null, children);
  const TabsTrigger = ({
    children,
    value,
    onValueChange,
  }: {
    children?: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => {
    return React.createElement(
      'button',
      {
        'aria-selected': value === 'residence' ? true : undefined,
        onClick: () => onValueChange(value),
      },
      children
    );
  };
  const Input = ({
    _label,
    value,
    onChange,
    placeholder,
    id,
    _autoFocus,
  }: {
    _label?: unknown;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id: string;
    _autoFocus?: unknown;
    autoFocus?: boolean;
  }) => {
    return React.createElement('input', {
      id,
      value,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      placeholder,
    });
  };
  const Text = ({
    htmlFor,
    _color,
    className,
    children,
  }: {
    _color?: unknown;
    htmlFor?: string;
    color?: string;
    className?: string;
    children?: React.ReactNode;
  }) => {
    return React.createElement('label', { htmlFor, className }, children);
  };
  const Select = ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children?: React.ReactNode;
  }) => {
    return React.createElement(
      'select',
      {
        value,
        onChange: (e: { target: { value: string } }) =>
          onValueChange(e.target.value),
      },
      children
    );
  };
  const SelectTrigger = ({
    id,
    children,
  }: {
    id: string;
    children?: React.ReactNode;
  }) => React.createElement('select', { id }, children);
  const SelectValue = ({ placeholder }: { placeholder?: string }) =>
    React.createElement('option', {}, placeholder);
  const SelectContent = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', null, children);
  const SelectItem = ({
    children,
    value,
  }: {
    children?: React.ReactNode;
    value: string;
  }) => React.createElement('option', { value }, children);
  const PrimaryButton = ({
    children,
    onClick,
    disabled,
  }: {
    _shortcut?: unknown;
    children?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    shortcut?: string;
  }) =>
    React.createElement(
      'button',
      {
        onClick,
        disabled,
      },
      children
    );
  const SecondaryButton = ({
    children,
    onClick,
  }: {
    _shortcut?: unknown;
    children?: React.ReactNode;
    onClick: () => void;
    shortcut?: string;
  }) => React.createElement('button', { onClick }, children);
  const cn = (...classes: string[]): string => classes.join(' ');

  return {
    ...actual,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Tabs,
    TabsList,
    TabsTrigger,
    Input,
    Text,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    PrimaryButton,
    SecondaryButton,
    cn,
  };
});

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { AddressDialog } from '../AddressDialog.web';
import type { AddressFields } from '../useAddressDialog';

function renderAddressDialog(
  overrides: Partial<React.ComponentProps<typeof AddressDialog>> = {}
) {
  const defaults: AddressFields = {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    info: undefined,
    addressType: 'residence',
  };

  const onChange = vi.fn();
  const onSave = vi.fn();
  const onOpenChange = vi.fn();

  const props = {
    open: true,
    onOpenChange,
    data: defaults,
    onChange,
    onSave,
    editingId: null,
    variant: 'tabs',
    title: 'Test Title',
    description: 'Test Description',
    saveLabel: 'Save',
    ...overrides,
  };

  const result = render(<AddressDialog {...props} />);
  return { ...result, onChange, onSave, onOpenChange };
}

describe('AddressDialog (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders dialog with title and description', () => {
    renderAddressDialog();
    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
  });

  it('renders address type toggle in tabs mode', () => {
    renderAddressDialog();
    expect(
      screen.getByRole('tab', { name: /client.address.type.residence/i })
    ).toBeDefined();
    expect(
      screen.getByRole('tab', { name: /client.address.type.establishment/i })
    ).toBeDefined();
  });

  it('renders address type toggle in buttons mode', () => {
    renderAddressDialog({ variant: 'buttons' });
    expect(
      screen.getByRole('button', { name: /client.address.type.residence/i })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: /client.address.type.establishment/i })
    ).toBeDefined();
  });

  it('renders all address fields', () => {
    renderAddressDialog();
    expect(screen.getByLabelText(/client.address.street/i)).toBeDefined();
    expect(screen.getByLabelText(/client.address.number/i)).toBeDefined();
    expect(screen.getByLabelText(/client.address.neighborhood/i)).toBeDefined();
    expect(screen.getByLabelText(/client.address.city/i)).toBeDefined();
    expect(screen.getByLabelText(/client.address.state/i)).toBeDefined();
    expect(screen.getByLabelText(/client.address.info/i)).toBeDefined();
  });

  // ── Interaction ──────────────────────────────────────────────────────────────
  it('updates street value when input changes', () => {
    const { onChange } = renderAddressDialog();
    const input = screen.getByLabelText(/client.address.street/i);
    fireEvent.input(input, { target: { value: 'Rua Test' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ street: 'Rua Test' })
    );
  });

  it('updates number value when input changes', () => {
    const { onChange } = renderAddressDialog();
    const input = screen.getByLabelText(/client.address.number/i);
    fireEvent.input(input, { target: { value: '123' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ number: '123' })
    );
  });

  it('updates neighborhood value when input changes', () => {
    const { onChange } = renderAddressDialog();
    const input = screen.getByLabelText(/client.address.neighborhood/i);
    fireEvent.input(input, { target: { value: 'Bairro Test' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ neighborhood: 'Bairro Test' })
    );
  });

  it('updates city value when input changes', () => {
    const { onChange } = renderAddressDialog();
    const input = screen.getByLabelText(/client.address.city/i);
    fireEvent.input(input, { target: { value: 'Cidade Test' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Cidade Test' })
    );
  });

  it('updates state value when select changes', () => {
    const { onChange } = renderAddressDialog();
    const select = screen.getByLabelText(/client.address.state/i);
    fireEvent.change(select, { target: { value: 'SP' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'SP' })
    );
  });

  it('updates info value when input changes', () => {
    const { onChange } = renderAddressDialog();
    const input = screen.getByLabelText(/client.address.info/i);
    fireEvent.input(input, { target: { value: 'Info Test' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ info: 'Info Test' })
    );
  });

  it('toggles address type between residence and establishment in tabs mode', () => {
    const { onChange } = renderAddressDialog();
    const residenceTab = screen.getByRole('tab', {
      name: /client.address.type.residence/i,
    });
    const establishmentTab = screen.getByRole('tab', {
      name: /client.address.type.establishment/i,
    });

    expect(residenceTab).toHaveAttribute('aria-selected', 'true');
    expect(establishmentTab).not.toHaveAttribute('aria-selected');

    // Click establishment tab
    fireEvent.click(establishmentTab);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressType: 'establishment' })
    );

    // Click residence tab
    fireEvent.click(residenceTab);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressType: 'residence' })
    );
  });

  it('toggles address type between residence and establishment in buttons mode', () => {
    const { onChange } = renderAddressDialog({ variant: 'buttons' });
    const residenceButton = screen.getByRole('button', {
      name: /client.address.type.residence/i,
    });
    const establishmentButton = screen.getByRole('button', {
      name: /client.address.type.establishment/i,
    });

    // Click establishment button
    fireEvent.click(establishmentButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressType: 'establishment' })
    );

    // Click residence button
    fireEvent.click(residenceButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressType: 'residence' })
    );
  });

  it('calls onSave when Enter is pressed and street is not empty', () => {
    const { onSave } = renderAddressDialog({
      data: {
        street: 'Rua Test',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        info: undefined,
        addressType: 'residence',
      },
    });
    const input = screen.getByLabelText(/client.address.street/i);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSave).toHaveBeenCalled();
  });

  it('does not call onSave when Enter is pressed and street is empty', () => {
    const { onSave } = renderAddressDialog({
      data: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        info: undefined,
        addressType: 'residence',
      },
    });
    const input = screen.getByLabelText(/client.address.street/i);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const { onOpenChange } = renderAddressDialog();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when cancel button is clicked', () => {
    const { onOpenChange } = renderAddressDialog();
    const cancelButton = screen.getByRole('button', { name: /app.cancel/i });
    fireEvent.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onSave when save button is clicked', () => {
    const { onSave } = renderAddressDialog({
      data: {
        street: 'Rua Test',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        info: undefined,
        addressType: 'residence',
      },
    });
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalled();
  });

  it('disables save button when street is empty', () => {
    renderAddressDialog({
      data: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        info: undefined,
        addressType: 'residence',
      },
    });
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when street is not empty', () => {
    renderAddressDialog({
      data: {
        street: 'Rua Test',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        info: undefined,
        addressType: 'residence',
      },
    });
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).not.toBeDisabled();
  });
});
