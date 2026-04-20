import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@automatize/ui/web', async () => {
  const { createElement } = await import('react');

  type WithChildren = { children?: React.ReactNode };

  const Dialog = ({
    children,
    open,
    onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    createElement(
      'div',
      {
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Escape') onOpenChange(false);
        },
      },
      children
    );
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
  const Tabs = ({
    children,
    value,
    onValueChange,
  }: {
    children?: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) =>
    createElement(
      TabsContext.Provider,
      { value: { value, onValueChange } },
      children
    );
  const TabsList = ({
    children,
  }: {
    children?: React.ReactNode;
    variant?: string;
    size?: string;
  }) => createElement('div', null, children);
  const TabsTrigger = ({
    children,
    value,
  }: {
    children?: React.ReactNode;
    value: string;
  }) => {
    const ctx = React.useContext(TabsContext);
    return createElement(
      'button',
      {
        onClick: () => ctx.onValueChange(value),
      },
      children
    );
  };
  const TabsContext = React.createContext<{
    value: string;
    onValueChange: (v: string) => void;
  }>({ value: '', onValueChange: () => {} });
  const Input = ({
    label,
    value,
    onChange,
    placeholder,
    id,
    autoFocus: _autoFocus,
  }: {
    label?: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
    id: string;
    autoFocus?: boolean;
  }) => {
    return createElement(
      'div',
      null,
      label ? createElement('label', { htmlFor: id }, label) : null,
      createElement('input', {
        id,
        value,
        onChange,
        placeholder,
      })
    );
  };
  const PrimaryButton = ({
    children,
    onClick,
    disabled,
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
  }: {
    children?: React.ReactNode;
    onClick: () => void;
    shortcut?: string;
  }) => createElement('button', { onClick }, children);
  const cn = (...classes: string[]) => classes.join(' ');

  return {
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
    PrimaryButton,
    SecondaryButton,
    cn,
  };
});

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
    expect(screen.getByLabelText(/client.phone.label/i)).toBeDefined();
  });

  it('updates phone number value when input changes', () => {
    const { onChange } = renderPhoneDialog();
    const input = screen.getByLabelText(/client.phone.label/i);
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

    fireEvent.click(telephoneButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ phoneType: 'telephone' })
    );

    fireEvent.click(mobileButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ phoneType: 'mobile' })
    );
  });

  it('calls onSave when Enter is pressed and number is not empty', () => {
    const { onSave } = renderPhoneDialog({
      data: { phoneType: 'mobile', number: '(11) 99999-9999' },
    });
    const input = screen.getByLabelText(/client.phone.label/i);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSave).toHaveBeenCalled();
  });

  it('does not call onSave when Enter is pressed and number is empty', () => {
    const { onSave } = renderPhoneDialog({
      data: { phoneType: 'mobile', number: '' },
    });
    const input = screen.getByLabelText(/client.phone.label/i);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSave).not.toHaveBeenCalled();
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
    const saveButton = screen.getByRole('button', {
      name: /Save/i,
    }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('enables save button when number is not empty', () => {
    renderPhoneDialog({
      data: { phoneType: 'mobile', number: '(11) 99999-9999' },
    });
    const saveButton = screen.getByRole('button', {
      name: /Save/i,
    }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
  });
});
