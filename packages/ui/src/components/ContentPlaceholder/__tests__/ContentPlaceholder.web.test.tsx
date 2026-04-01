import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { ContentPlaceholder } from '../ContentPlaceholder.web';

describe('ContentPlaceholder (web)', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders title as an h2 element', () => {
    render(<ContentPlaceholder title="Dashboard" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toBe('Dashboard');
  });

  it('renders default subtitle "Coming soon"', () => {
    render(<ContentPlaceholder title="Invoices" />);
    expect(screen.getByText('Coming soon')).toBeDefined();
  });

  it('renders custom subtitle when provided', () => {
    render(
      <ContentPlaceholder title="Products" subtitle="Under construction" />
    );
    expect(screen.getByText('Under construction')).toBeDefined();
    expect(screen.queryByText('Coming soon')).toBeNull();
  });

  it('renders title text correctly', () => {
    render(<ContentPlaceholder title="Clients" />);
    expect(screen.getByText('Clients')).toBeDefined();
  });
});
