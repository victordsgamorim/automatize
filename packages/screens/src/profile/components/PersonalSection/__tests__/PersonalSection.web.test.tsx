import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', async () => {
  const { createElement } = await import('react');

  type _WithChildren = { children?: React.ReactNode };

  const Input = ({
    label,
    value,
    onChange,
    placeholder,
    id,
    required,
  }: {
    label?: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
    id: string;
    required?: boolean;
  }) =>
    createElement(
      'div',
      null,
      label ? createElement('label', { htmlFor: id }, label) : null,
      createElement('input', {
        id,
        value,
        onChange: (e) => onChange(e),
        placeholder,
        required,
      })
    );

  const Text = ({
    variant,
    children,
  }: {
    variant?: string;
    children?: React.ReactNode;
  }) => createElement('div', { 'data-variant': variant }, children);

  return {
    Input,
    Text,
  };
});

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock PhoneSection - must use vi.fn() and return a function that creates elements
vi.mock(
  '../../../../client-form/components/PhoneSection/PhoneSection.web',
  () => ({
    PhoneSection: ({ phones }: { phones: Array<{ id: string }> }) =>
      React.createElement('div', {
        'data-testid': 'phone-section',
        'data-phones-count': phones.length,
      }),
  })
);

import { PersonalSection } from '../PersonalSection.web';
import type { Phone } from '../../../ProfileScreen.types';

function renderPersonalSection(
  overrides: Partial<React.ComponentProps<typeof PersonalSection>> = {}
) {
  const onNameChange = vi.fn();
  const addPhone = vi.fn();
  const removePhone = vi.fn();
  const updatePhone = vi.fn();

  const phones: Phone[] = [
    { id: 'phone-1', phoneType: 'mobile', number: '11999999999' },
  ];

  const props = {
    name: 'John Doe',
    onNameChange,
    phones,
    addPhone,
    removePhone,
    updatePhone,
    isMobile: false,
    ...overrides,
  };

  const result = render(<PersonalSection {...props} />);
  return { ...result, onNameChange, addPhone, removePhone, updatePhone };
}

describe('PersonalSection (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders section title', () => {
    renderPersonalSection();
    expect(screen.getByText(/profile.section.personal/i)).toBeDefined();
  });

  it('renders name input', () => {
    renderPersonalSection();
    expect(screen.getByLabelText(/profile.name/i)).toBeDefined();
  });

  it('renders PhoneSection', () => {
    renderPersonalSection();
    expect(screen.getByTestId('phone-section')).toBeDefined();
  });

  // ── Interactions ───────────────────────────────────────────────────────────
  it('calls onNameChange when name input changes', () => {
    const { onNameChange } = renderPersonalSection();
    const input = screen.getByLabelText(/profile.name/i);
    fireEvent.input(input, { target: { value: 'Jane Doe' } });
    expect(onNameChange).toHaveBeenCalledWith('Jane Doe');
  });

  it('displays current name value', () => {
    renderPersonalSection({ name: 'Test Name' });
    const input = screen.getByLabelText(/profile.name/i) as HTMLInputElement;
    expect(input.value).toBe('Test Name');
  });
});
