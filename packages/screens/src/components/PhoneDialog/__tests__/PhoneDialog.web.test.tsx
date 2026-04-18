import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web to avoid Radix UI portal/pointer-event issues in jsdom
vi.mock('@automatize/ui/web', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@automatize/ui/web');
  const { createElement } = await import('react');

  type WithChildren = { children?: React.ReactNode };
  type _MenuItemProps = WithChildren & {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  };
  type _TriggerProps = WithChildren & { asChild?: boolean };

  const Dialog = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const DialogContent = ({ children }: WithChildren) =>
    createElement('div', { 'data-slot': 'dialog-content' }, children);
  const DialogHeader = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const DialogTitle = ({ children }: WithChildren) =>
    createElement('h2', null, children);
  const DialogDescription = ({ children }: WithChildren) =>
    createElement('p', null, children);
  const DialogFooter = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const Input = ({
    _label,
    value,
    onChange,
    placeholder,
    id,
  }: {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id: string;
  }) => {
    return createElement('input', {
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
    htmlFor?: string;
    color?: string;
    className?: string;
    children?: React.ReactNode;
  }) => {
    return createElement('label', { htmlFor, className }, children);
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
    return createElement(
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
  }) => createElement('select', { id }, children);
  const SelectValue = ({ placeholder }: { placeholder?: string }) =>
    createElement('option', {}, placeholder);
  const SelectContent = ({ children }: { children?: React.ReactNode }) =>
    createElement('div', null, children);
  const SelectItem = ({
    children,
    value,
  }: {
    children?: React.ReactNode;
    value: string;
  }) => createElement('option', { value }, children);
  const PrimaryButton = ({
    children,
    onClick,
    disabled,
    _shortcut,
  }: {
    children?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    shortcut?: string;
  }) =>
    createElement(
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
    _shortcut,
  }: {
    children?: React.ReactNode;
    onClick: () => void;
    shortcut?: string;
  }) => createElement('button', { onClick }, children);
  const cn = (...classes: string[]) => classes.join(' ');

  return {
    ...actual,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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

import { PhoneDialog } from '../PhoneDialog.web';
import type { PhoneFields } from '../usePhoneDialog';

function renderPhoneDialog(
  overrides: Partial<React.ComponentProps<typeof PhoneDialog>> = {}
) {
  const defaults: PhoneFields = {
    phoneType: 'mobile',
    number: '',
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
    title: 'Test Title',
    description: 'Test Description',
    saveLabel: 'Save',
    ...overrides,
  };

  const result = render(<PhoneDialog {...props} />);
  return { ...result, onChange, onSave, onOpenChange };
}

describe('PhoneDialog (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders dialog with title and description', () => {
    renderPhoneDialog();
    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
  });

  it('renders phone type toggle', () => {
    renderPhoneDialog();
    expect(
      screen.getByRole('button', { name: /client.phone.type.mobile/i })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: /client.phone.type.telephone/i })
    ).toBeDefined();
  });

  it('renders phone number field', () => {
    renderPhoneDialog();
    expect(screen.getByLabelText(/client.phone.number/i)).toBeDefined();
  });

  // ── Interaction ──────────────────────────────────────────────────────────────
  it('updates phone number value when input changes', () => {
    const { onChange } = renderPhoneDialog();
    const input = screen.getByLabelText(/client.phone.number/i);
    fireEvent.input(input, { target: { value: '(11) 99999-9999' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ number: '(11) 99999-9999' })
    );
  });

  it('toggles phone type between mobile and telephone', () => {
    const { onChange } = renderPhoneDialog();
    const mobileButton = screen.getByRole('button', {
      name: /client.phone.type.mobile/i,
    });
    const telephoneButton = screen.getByRole('button', {
      name: /client.phone.type.telephone/i,
    });

    // Click telephone button
    fireEvent.click(telephoneButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ phoneType: 'telephone' })
    );

    // Click mobile button
    fireEvent.click(mobileButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ phoneType: 'mobile' })
    );
  });

  it('calls onSave when Enter is pressed and number is not empty', () => {
    const { onSave } = renderPhoneDialog({
      data: { phoneType: 'mobile', number: '(11) 99999-9999' },
    });
    const input = screen.getByLabelText(/client.phone.number/i);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSave).toHaveBeenCalled();
  });

  it('does not call onSave when Enter is pressed and number is empty', () => {
    const { onSave } = renderPhoneDialog({
      data: { phoneType: 'mobile', number: '' },
    });
    const input = screen.getByLabelText(/client.phone.number/i);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const { onOpenChange } = renderPhoneDialog();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when cancel button is clicked', () => {
    const { onOpenChange } = renderPhoneDialog();
    const cancelButton = screen.getByRole('button', { name: /app.cancel/i });
    fireEvent.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onSave when save button is clicked', () => {
    const { onSave } = renderPhoneDialog({
      data: { phoneType: 'mobile', number: '(11) 99999-9999' },
    });
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalled();
  });

  it('disables save button when number is empty', () => {
    renderPhoneDialog({
      data: { phoneType: 'mobile', number: '' },
    });
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when number is not empty', () => {
    renderPhoneDialog({
      data: { phoneType: 'mobile', number: '(11) 99999-9999' },
    });
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).not.toBeDisabled();
  });
});
