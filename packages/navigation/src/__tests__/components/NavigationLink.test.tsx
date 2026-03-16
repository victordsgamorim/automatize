import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} data-testid="next-link" {...props}>
      {children}
    </a>
  ),
}));

import { NavigationLink } from '../../components/NavigationLink.web';

describe('NavigationLink (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a Next.js Link for internal routes', () => {
    render(<NavigationLink href="/invoices">Invoices</NavigationLink>);
    const link = screen.getByTestId('next-link');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/invoices');
    expect(link.textContent).toBe('Invoices');
  });

  it('renders an external <a> with target="_blank" when external=true', () => {
    render(
      <NavigationLink href="https://example.com" external>
        External
      </NavigationLink>
    );
    const link = screen.getByText('External');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('passes accessibilityLabel as aria-label', () => {
    render(
      <NavigationLink href="/clients" accessibilityLabel="Go to clients">
        Clients
      </NavigationLink>
    );
    const link = screen.getByTestId('next-link');
    expect(link.getAttribute('aria-label')).toBe('Go to clients');
  });

  it('calls onPress when clicked', () => {
    const onPress = vi.fn();
    render(
      <NavigationLink href="/products" onPress={onPress}>
        Products
      </NavigationLink>
    );
    fireEvent.click(screen.getByTestId('next-link'));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('applies className to the link', () => {
    render(
      <NavigationLink href="/analytics" className="custom-class">
        Analytics
      </NavigationLink>
    );
    const link = screen.getByTestId('next-link');
    expect(link.className).toContain('custom-class');
  });
});
