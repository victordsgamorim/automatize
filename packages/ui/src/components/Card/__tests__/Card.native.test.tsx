import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import type { View as RNView } from 'react-native';

vi.mock('react-native', async () => {
  const { forwardRef, createElement } = await import('react');
  return {
    View: forwardRef<
      HTMLDivElement,
      React.HTMLAttributes<HTMLDivElement> & { testID?: string }
    >(({ children, testID, style, ...rest }, ref) =>
      createElement(
        'div',
        { ref, 'data-testid': testID, style, ...rest },
        children
      )
    ),
    StyleSheet: {
      create: <T extends Record<string, React.CSSProperties>>(s: T) => s,
    },
  };
});

import { Card } from '../Card.native';

describe('Card (native)', () => {
  it('renders children', () => {
    const { getByText } = render(<Card>Card content</Card>);
    expect(getByText('Card content')).toBeDefined();
  });

  it('renders without error with default props', () => {
    const { container } = render(<Card>Hello</Card>);
    expect(container.firstChild).toBeDefined();
  });

  it('has displayName "Card"', () => {
    expect(Card.displayName).toBe('Card');
  });

  it('accepts testID via ViewProps', () => {
    const { getByTestId } = render(<Card testID="my-card">Content</Card>);
    expect(getByTestId('my-card')).toBeDefined();
  });

  it('forwards ref to the underlying View', () => {
    const ref = React.createRef<RNView>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeDefined();
  });

  it.each(['sm', 'md', 'lg'] as const)(
    'renders with padding="%s" without error',
    (padding) => {
      const { container } = render(<Card padding={padding}>Content</Card>);
      expect(container.firstChild).toBeDefined();
    }
  );

  it.each([0, 1, 2, 3] as const)(
    'renders with elevation=%d without error',
    (elevation) => {
      const { container } = render(<Card elevation={elevation}>Content</Card>);
      expect(container.firstChild).toBeDefined();
    }
  );

  it('renders multiple children', () => {
    const { getByText } = render(
      <Card>
        <span>First</span>
        <span>Second</span>
      </Card>
    );
    expect(getByText('First')).toBeDefined();
    expect(getByText('Second')).toBeDefined();
  });
});
