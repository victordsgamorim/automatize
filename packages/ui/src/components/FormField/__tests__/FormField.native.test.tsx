import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

vi.mock('react-native', async () => {
  const { forwardRef, createElement } = await import('react');

  type ViewProps = React.HTMLAttributes<HTMLDivElement> & { testID?: string };
  type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    testID?: string;
  };

  return {
    View: ({ children, style, testID }: ViewProps) =>
      createElement('div', { style, 'data-testid': testID }, children),
    Text: ({ children, style }: React.HTMLAttributes<HTMLSpanElement>) =>
      createElement('span', { style }, children),
    TextInput: forwardRef<HTMLInputElement, InputProps>(
      ({ testID, placeholder, value }, ref) =>
        createElement('input', {
          ref,
          'data-testid': testID,
          placeholder,
          value,
        })
    ),
    TouchableOpacity: ({
      children,
      onClick,
      style,
    }: React.HTMLAttributes<HTMLButtonElement>) =>
      createElement('button', { onClick, style }, children),
    StyleSheet: {
      create: <T extends Record<string, React.CSSProperties>>(s: T) => s,
    },
  };
});

import { FormField } from '../FormField.native';

describe('FormField (native)', () => {
  it('renders without error', () => {
    const { container } = render(<FormField />);
    expect(container.firstChild).toBeDefined();
  });

  it('has displayName "FormField"', () => {
    expect(FormField.displayName).toBe('FormField');
  });

  it('forwards ref to the underlying Input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<FormField ref={ref} />);
    expect(ref.current).toBeDefined();
  });

  it('renders a label when label prop is provided', () => {
    const { getByText } = render(<FormField label="Email" />);
    expect(getByText('Email')).toBeDefined();
  });

  it('renders an error message when error prop is provided', () => {
    const { getByText } = render(<FormField error="Required field" />);
    expect(getByText('Required field')).toBeDefined();
  });

  it('renders a placeholder via the underlying input', () => {
    const { container } = render(<FormField placeholder="Enter value" />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter value');
  });

  it('does not render helperText when error is present', () => {
    const { queryByText } = render(
      <FormField helperText="Hint text" error="Required" />
    );
    expect(queryByText('Hint text')).toBeNull();
  });
});
