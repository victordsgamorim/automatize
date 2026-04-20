import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web to avoid Radix UI portal/pointer-event issues in jsdom
vi.mock('@automatize/ui/web', async () => {
  type WithChildren = { children?: React.ReactNode };

  const Dialog = ({
    children,
    onOpenChange,
  }: WithChildren & { open: boolean; onOpenChange: (open: boolean) => void }) =>
    React.createElement(
      'div',
      {
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Escape') onOpenChange(false);
        },
      },
      children
    );
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
  const TabsContext = React.createContext<{
    value: string;
    onValueChange: (v: string) => void;
  }>({ value: '', onValueChange: () => {} });
  const Tabs = ({
    children,
    value,
    onValueChange,
  }: {
    children?: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => {
    return React.createElement(
      TabsContext.Provider,
      { value: { value, onValueChange } },
      children
    );
  };
  const TabsList = ({
    children,
  }: {
    children?: React.ReactNode;
    variant?: string;
    size?: string;
  }) => React.createElement('div', null, children);
  const TabsTrigger = ({
    children,
    value,
  }: {
    children?: React.ReactNode;
    value: string;
  }) => {
    const ctx = React.useContext(TabsContext);
    return React.createElement(
      'button',
      {
        role: 'tab',
        'aria-selected': ctx.value === value ? 'true' : undefined,
        onClick: () => ctx.onValueChange(value),
      },
      children
    );
  };
  const Input = ({
    label,
    value,
    onChange,
    placeholder,
    id,
    _autoFocus,
  }: {
    label?: string;
    _label?: unknown;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
    id: string;
    autoFocus?: boolean;
    _autoFocus?: unknown;
  }) => {
    return React.createElement(
      'div',
      null,
      label ? React.createElement('label', { htmlFor: id }, label) : null,
      React.createElement('input', {
        id,
        value,
        onChange,
        placeholder,
      })
    );
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
    children,
    value,
    onValueChange,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children?: React.ReactNode;
  }) => {
    const triggerId = React.Children.toArray(children).find(
      (child): child is React.ReactElement<{ id: string }> =>
        React.isValidElement(child) &&
        (child.type as () => unknown).name === 'SelectTrigger'
    )?.props?.id;
    const items: Array<{ value: string; children?: React.ReactNode }> = [];
    const findItems = (el: React.ReactNode) => {
      React.Children.forEach(el, (child) => {
        if (!React.isValidElement(child)) return;
        if ((child.type as () => unknown).name === 'SelectItem') {
          items.push({
            value: (child.props as { value: string }).value,
            children: (child.props as { children?: React.ReactNode }).children,
          });
        }
        if ((child.props as { children?: React.ReactNode }).children) {
          findItems((child.props as { children?: React.ReactNode }).children);
        }
      });
    };
    findItems(children);
    return React.createElement(
      'select',
      {
        id: triggerId,
        value,
        onChange: (e: { target: { value: string } }) =>
          onValueChange(e.target.value),
      },
      ...items.map((item) =>
        React.createElement(
          'option',
          { key: item.value, value: item.value },
          item.children
        )
      )
    );
  };
  const SelectTrigger = ({
    id: _id,
    children: _children,
  }: {
    id: string;
    children?: React.ReactNode;
  }) => null;
  const SelectValue = ({
    placeholder: _placeholder,
  }: {
    placeholder?: string;
  }) => null;
  const SelectContent = ({
    children: _children,
  }: {
    children?: React.ReactNode;
  }) => null;
  const SelectItem = ({
    children: _children,
    value: _value,
  }: {
    children?: React.ReactNode;
    value: string;
  }) => null;
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

function renderAddressDialog(
  overrides: Partial<React.ComponentProps<typeof AddressDialog>> = {}
) {
  const onChange = vi.fn();
  const onSave = vi.fn();
  const onOpenChange = vi.fn();

  const props = {
    open: true,
    onOpenChange,
    data: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      info: undefined,
      addressType: 'residence' as const,
    },
    onChange,
    onSave,
    editingId: null,
    variant: 'tabs' as const,
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

    expect(residenceTab.getAttribute('aria-selected')).toBe('true');
    expect(establishmentTab.getAttribute('aria-selected')).toBeNull();

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
    expect(saveButton.disabled).toBe(true);
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
    expect(saveButton.disabled).toBe(false);
  });
});
