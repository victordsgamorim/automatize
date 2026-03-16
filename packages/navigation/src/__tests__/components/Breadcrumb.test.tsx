import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { BreadcrumbSegment } from '../../types';

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
    <a href={href} data-testid={`link-${href}`} {...props}>
      {children}
    </a>
  ),
}));

import { Breadcrumb } from '../../components/Breadcrumb.web';

const segments: BreadcrumbSegment[] = [
  { label: 'Home', href: '/' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'INV-001' }, // current page — no href
];

describe('Breadcrumb (web)', () => {
  it('renders all segments', () => {
    render(<Breadcrumb segments={segments} />);
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Invoices')).toBeDefined();
    expect(screen.getByText('INV-001')).toBeDefined();
  });

  it('renders linkable segments as links', () => {
    render(<Breadcrumb segments={segments} />);
    const homeLink = screen.getByTestId('link-/');
    expect(homeLink.tagName).toBe('A');
    expect(homeLink.getAttribute('href')).toBe('/');

    const invoicesLink = screen.getByTestId('link-/invoices');
    expect(invoicesLink.tagName).toBe('A');
  });

  it('renders the last segment as non-linkable text', () => {
    render(<Breadcrumb segments={segments} />);
    const currentPage = screen.getByText('INV-001');
    expect(currentPage.tagName).toBe('SPAN');
    expect(currentPage.getAttribute('aria-current')).toBe('page');
  });

  it('renders separators between segments', () => {
    const { container } = render(<Breadcrumb segments={segments} />);
    // Default separator is "/"
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    // 2 separators for 3 segments
    expect(separators.length).toBe(2);
  });

  it('accepts a custom separator', () => {
    render(
      <Breadcrumb
        segments={segments}
        separator={<span data-testid="custom-sep">{'>'}</span>}
      />
    );
    const customSeps = screen.getAllByTestId('custom-sep');
    expect(customSeps.length).toBe(2);
  });

  it('has role="navigation" with Breadcrumb aria-label', () => {
    const { container } = render(<Breadcrumb segments={segments} />);
    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('handles a single segment (current page only)', () => {
    render(<Breadcrumb segments={[{ label: 'Dashboard' }]} />);
    const page = screen.getByText('Dashboard');
    expect(page.getAttribute('aria-current')).toBe('page');
  });
});
