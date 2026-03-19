import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    View: ({
      children,
      testID,
      style,
    }: React.HTMLAttributes<HTMLDivElement> & { testID?: string }) =>
      createElement('div', { 'data-testid': testID, style }, children),
    StyleSheet: {
      create: <T extends Record<string, React.CSSProperties>>(s: T) => s,
    },
  };
});

import {
  HomeIcon,
  UserIcon,
  BuildingIcon,
  LogOutIcon,
  type IconProps,
} from '../Icon';

const icons: [string, React.ComponentType<IconProps>][] = [
  ['HomeIcon', HomeIcon],
  ['UserIcon', UserIcon],
  ['BuildingIcon', BuildingIcon],
  ['LogOutIcon', LogOutIcon],
];

describe.each(icons)('%s (native)', (_name, Icon) => {
  it('renders without error', () => {
    const { container } = render(<Icon />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders with default size (24) without error', () => {
    const { container } = render(<Icon size={24} />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders with custom size without error', () => {
    const { container } = render(<Icon size={32} />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders with custom color without error', () => {
    const { container } = render(<Icon color="#ff0000" />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders with custom style without error', () => {
    const { container } = render(<Icon style={{ opacity: 0.5 }} />);
    expect(container.firstChild).toBeDefined();
  });
});
