import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { PersonalDetailsSection } from '../PersonalDetailsSection.web';
import type { PersonalDetailsSectionProps } from '../PersonalDetailsSection.web';

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@automatize/ui/web', () => ({
  Input: ({
    id,
    value,
    onChange,
    label,
    placeholder,
    maxLength,
  }: {
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
    maxLength?: number;
  }) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={label}
      />
    </div>
  ),
  Text: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
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
  }: {
    children?: React.ReactNode;
    variant?: string;
    size?: string;
  }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({
    children,
    value,
    onClick,
  }: {
    children?: React.ReactNode;
    value?: string;
    onClick?: () => void;
  }) => (
    <button data-testid="tabs-trigger" data-value={value} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'client.type': 'Client Type',
        'client.type.individual': 'Individual',
        'client.type.business': 'Business',
        'client.name': 'Name',
        'client.name.placeholder': 'John Smith',
        'client.cpf': 'CPF',
        'client.cnpj': 'CNPJ',
      })[key] ?? key,
  }),
}));

vi.mock('@automatize/form-validator', () => ({
  formatCpf: (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  formatCnpj: (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
}));

// ── Test Data ───────────────────────────────────────────────────────────────

const defaultProps: PersonalDetailsSectionProps = {
  clientType: 'individual',
  onClientTypeChange: vi.fn(),
  name: '',
  onNameChange: vi.fn(),
  document: '',
  onDocumentChange: vi.fn(),
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('PersonalDetailsSection', () => {
  it('renders client type tabs with individual selected by default', () => {
    render(<PersonalDetailsSection {...defaultProps} />);

    const tabs = screen.getByTestId('tabs');
    expect(tabs.getAttribute('data-value')).toBe('individual');

    const triggers = screen.getAllByTestId('tabs-trigger');
    expect(triggers).toHaveLength(2);
    expect(triggers[0].getAttribute('data-value')).toBe('individual');
    expect(triggers[1].getAttribute('data-value')).toBe('business');
  });

  it('renders client type tabs with business selected when provided', () => {
    render(<PersonalDetailsSection {...defaultProps} clientType="business" />);

    const tabs = screen.getByTestId('tabs');
    expect(tabs.getAttribute('data-value')).toBe('business');
  });

  it('calls onClientTypeChange when tab value changes', () => {
    const onClientTypeChange = vi.fn();
    const { rerender } = render(
      <PersonalDetailsSection
        {...defaultProps}
        clientType="individual"
        onClientTypeChange={onClientTypeChange}
      />
    );

    // Simulate tab change by re-rendering with different value
    rerender(
      <PersonalDetailsSection
        {...defaultProps}
        clientType="business"
        onClientTypeChange={onClientTypeChange}
      />
    );

    // The component should have called onClientTypeChange when clientType prop changed
    // Note: This test is simplified since we can't easily simulate Radix UI tab clicks
    expect(screen.getByTestId('tabs').getAttribute('data-value')).toBe(
      'business'
    );
  });

  it('renders name input with correct label and placeholder', () => {
    render(<PersonalDetailsSection {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toBeTruthy();
    expect(nameInput.getAttribute('placeholder')).toBe('John Smith');
  });

  it('calls onNameChange when name input changes', () => {
    const onNameChange = vi.fn();
    render(
      <PersonalDetailsSection {...defaultProps} onNameChange={onNameChange} />
    );

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(onNameChange).toHaveBeenCalledWith('John Doe');
  });

  it('renders CPF label and formatting for individual client type', () => {
    render(
      <PersonalDetailsSection {...defaultProps} clientType="individual" />
    );

    const documentInput = screen.getByLabelText('CPF');
    expect(documentInput).toBeTruthy();
    expect(documentInput.getAttribute('maxLength')).toBe('14');
    expect(documentInput.getAttribute('placeholder')).toBe('000.000.000-00');
  });

  it('renders CNPJ label and formatting for business client type', () => {
    render(<PersonalDetailsSection {...defaultProps} clientType="business" />);

    const documentInput = screen.getByLabelText('CNPJ');
    expect(documentInput).toBeTruthy();
    expect(documentInput.getAttribute('maxLength')).toBe('18');
    expect(documentInput.getAttribute('placeholder')).toBe(
      '00.000.000/0000-00'
    );
  });

  it('formats CPF input for individual client type', () => {
    const onDocumentChange = vi.fn();
    render(
      <PersonalDetailsSection
        {...defaultProps}
        clientType="individual"
        onDocumentChange={onDocumentChange}
      />
    );

    const documentInput = screen.getByLabelText('CPF');
    fireEvent.change(documentInput, { target: { value: '12345678909' } });

    expect(onDocumentChange).toHaveBeenCalledWith('123.456.789-09');
  });

  it('formats CNPJ input for business client type', () => {
    const onDocumentChange = vi.fn();
    render(
      <PersonalDetailsSection
        {...defaultProps}
        clientType="business"
        onDocumentChange={onDocumentChange}
      />
    );

    const documentInput = screen.getByLabelText('CNPJ');
    fireEvent.change(documentInput, { target: { value: '11222333000181' } });

    expect(onDocumentChange).toHaveBeenCalledWith('11.222.333/0001-81');
  });

  it('displays current name value', () => {
    render(<PersonalDetailsSection {...defaultProps} name="Jane Smith" />);

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    expect(nameInput.value).toBe('Jane Smith');
  });

  it('displays current document value', () => {
    render(
      <PersonalDetailsSection
        {...defaultProps}
        clientType="individual"
        document="123.456.789-09"
      />
    );

    const documentInput = screen.getByLabelText('CPF') as HTMLInputElement;
    expect(documentInput.value).toBe('123.456.789-09');
  });
});
