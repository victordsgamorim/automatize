import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('lucide-react', () => ({
  ArrowUpRight: () =>
    React.createElement('span', { 'data-testid': 'icon-arrow-up' }),
  ArrowDownRight: () =>
    React.createElement('span', { 'data-testid': 'icon-arrow-down' }),
  Minus: () => React.createElement('span', { 'data-testid': 'icon-minus' }),
}));

import { TrendChip } from '../components/TrendChip.web';

describe('TrendChip', () => {
  it('renders an up arrow and signed positive percentage for positive delta', () => {
    render(<TrendChip pct={0.125} label="vs last month" />);
    expect(screen.getByTestId('icon-arrow-up')).toBeDefined();
    // Intl.NumberFormat percent formats may use NBSP or spaces depending on locale
    const chip = screen.getByLabelText(/vs last month/i);
    expect(chip.textContent).toMatch(/\+12\.5\s?%/);
  });

  it('renders a down arrow and signed negative percentage for negative delta', () => {
    render(<TrendChip pct={-0.084} label="vs last month" />);
    expect(screen.getByTestId('icon-arrow-down')).toBeDefined();
    const chip = screen.getByLabelText(/vs last month/i);
    expect(chip.textContent).toMatch(/-8\.4\s?%/);
  });

  it('renders a flat icon and unsigned zero for a zero delta', () => {
    render(<TrendChip pct={0} label="vs last month" />);
    expect(screen.getByTestId('icon-minus')).toBeDefined();
    const chip = screen.getByLabelText(/vs last month/i);
    // signDisplay: 'exceptZero' means no plus sign for zero
    expect(chip.textContent).toMatch(/0\.0\s?%/);
    expect(chip.textContent).not.toMatch(/\+0/);
  });

  it('exposes an aria-label combining the formatted percent and the label', () => {
    render(<TrendChip pct={0.2} label="vs last month" />);
    const chip = screen.getByLabelText(/vs last month/i);
    expect(chip.getAttribute('aria-label')).toMatch(/\+20\.0\s?%/);
    expect(chip.getAttribute('aria-label')).toMatch(/vs last month/i);
  });
});
