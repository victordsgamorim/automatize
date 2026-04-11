import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Drawer } from '../Drawer.web';

describe('Drawer (web)', () => {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Drawer',
    children: <div data-testid="drawer-content">Content here</div>,
  };

  it('renders children when open', () => {
    render(<Drawer {...defaults} />);
    expect(screen.getByTestId('drawer-content')).toBeTruthy();
    expect(screen.getByText('Content here')).toBeTruthy();
  });

  it('renders title in header', () => {
    render(<Drawer {...defaults} />);
    expect(screen.getByText('Test Drawer')).toBeTruthy();
  });

  it('applies translate-x-0 when open', () => {
    render(<Drawer {...defaults} />);
    const panel = screen.getByText('Content here').closest('[class*="fixed"]');
    expect(panel?.className).toContain('translate-x-0');
    expect(panel?.className).not.toContain('translate-x-full');
  });

  it('applies translate-x-full when closed', () => {
    render(<Drawer {...defaults} open={false} />);
    const panel = screen.getByText('Content here').closest('[class*="fixed"]');
    expect(panel?.className).toContain('translate-x-full');
    expect(panel?.className).not.toContain('translate-x-0');
  });

  it('renders overlay when open', () => {
    render(<Drawer {...defaults} />);
    const overlay = document.querySelector('.bg-black\\/20');
    expect(overlay).toBeTruthy();
  });

  it('does not render overlay when closed', () => {
    render(<Drawer {...defaults} open={false} />);
    const overlay = document.querySelector('.bg-black\\/20');
    expect(overlay).toBeNull();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<Drawer {...defaults} onClose={onClose} />);
    const overlay = document.querySelector('.bg-black\\/20') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Drawer {...defaults} onClose={onClose} />);
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies transition classes', () => {
    render(<Drawer {...defaults} />);
    const panel = screen.getByText('Content here').closest('[class*="fixed"]');
    expect(panel?.className).toContain('transition-transform');
    expect(panel?.className).toContain('duration-300');
    expect(panel?.className).toContain('ease-in-out');
  });

  it('applies default width w-80', () => {
    render(<Drawer {...defaults} />);
    const panel = screen.getByText('Content here').closest('[class*="fixed"]');
    expect(panel?.className).toContain('w-80');
  });

  it('merges custom className', () => {
    render(<Drawer {...defaults} className="my-custom" />);
    const panel = screen.getByText('Content here').closest('[class*="fixed"]');
    expect(panel?.className).toContain('my-custom');
  });

  it('still renders children when closed (hidden via transform)', () => {
    render(<Drawer {...defaults} open={false} />);
    expect(screen.getByText('Content here')).toBeTruthy();
  });

  it('renders close button with X icon', () => {
    render(<Drawer {...defaults} />);
    const closeBtn = screen.getByLabelText('Close');
    expect(closeBtn).toBeTruthy();
  });

  it('has scrollable content area', () => {
    render(<Drawer {...defaults} />);
    const contentWrapper = screen
      .getByTestId('drawer-content')
      .closest('[class*="overflow-y-auto"]');
    expect(contentWrapper).toBeTruthy();
  });
});
