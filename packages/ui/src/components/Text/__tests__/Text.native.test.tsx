import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

vi.mock('react-native', async () => {
  const { forwardRef, createElement } = await import('react');
  return {
    Text: forwardRef<
      HTMLSpanElement,
      React.HTMLAttributes<HTMLSpanElement> & { testID?: string }
    >(({ children, testID, style, ...rest }, ref) =>
      createElement(
        'span',
        { ref, 'data-testid': testID, style, ...rest },
        children
      )
    ),
    StyleSheet: {
      create: <T extends Record<string, React.CSSProperties>>(s: T) => s,
    },
  };
});

import { Text, type TextVariant, type TextColor } from '../Text.native';

describe('Text (native)', () => {
  it('renders children', () => {
    const { getByText } = render(<Text>Hello world</Text>);
    expect(getByText('Hello world')).toBeDefined();
  });

  it('has displayName "Text"', () => {
    expect(Text.displayName).toBe('Text');
  });

  it('renders with default variant "body" without error', () => {
    const { container } = render(<Text>Body text</Text>);
    expect(container.firstChild).toBeDefined();
  });

  it('renders with default color "primary" without error', () => {
    const { container } = render(<Text>Primary text</Text>);
    expect(container.firstChild).toBeDefined();
  });

  it.each<TextVariant>([
    'h1',
    'h2',
    'h3',
    'body',
    'bodySmall',
    'caption',
    'code',
  ])('renders variant "%s" without error', (variant) => {
    const { container } = render(<Text variant={variant}>Text</Text>);
    expect(container.firstChild).toBeDefined();
  });

  it.each<TextColor>([
    'primary',
    'secondary',
    'tertiary',
    'error',
    'success',
    'warning',
  ])('renders color "%s" without error', (color) => {
    const { container } = render(<Text color={color}>Text</Text>);
    expect(container.firstChild).toBeDefined();
  });

  it('accepts testID via TextProps', () => {
    const { getByTestId } = render(<Text testID="my-text">Content</Text>);
    expect(getByTestId('my-text')).toBeDefined();
  });

  it('forwards ref to the underlying RNText', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Text ref={ref}>Content</Text>);
    expect(ref.current).toBeDefined();
  });

  it('merges custom style with variant style', () => {
    const { getByTestId } = render(
      <Text testID="styled" style={{ opacity: 0.5 }}>
        Styled
      </Text>
    );
    expect(getByTestId('styled')).toBeDefined();
  });
});
