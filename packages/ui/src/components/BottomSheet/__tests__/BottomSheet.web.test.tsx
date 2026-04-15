import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { BottomSheet } from '../BottomSheet.web';

describe('BottomSheet (web)', () => {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Sheet',
    children: <div data-testid="sheet-content">Sheet content</div>,
  };

  it('renders children when open', () => {
    render(<BottomSheet {...defaults} />);
    expect(screen.getByTestId('sheet-content')).toBeTruthy();
    expect(screen.getByText('Sheet content')).toBeTruthy();
  });

  it('renders title in header', () => {
    render(<BottomSheet {...defaults} />);
    expect(screen.getByText('Test Sheet')).toBeTruthy();
  });

  it('applies translate-y-0 when open', () => {
    render(<BottomSheet {...defaults} />);
    const panel = screen.getByText('Sheet content').closest('[class*="fixed"]');
    expect(panel?.className).toContain('translate-y-0');
    expect(panel?.className).not.toContain('translate-y-[calc(100%+2rem)]');
  });

  it('applies translate-y-[calc(100%+2rem)] when closed', () => {
    render(<BottomSheet {...defaults} open={false} />);
    const panel = screen.getByText('Sheet content').closest('[class*="fixed"]');
    expect(panel?.className).toContain('translate-y-[calc(100%+2rem)]');
    expect(panel?.className).not.toContain('translate-y-0');
  });

  it('renders overlay when open', () => {
    render(<BottomSheet {...defaults} />);
    const overlay = document.querySelector('.bg-black\\/20');
    expect(overlay).toBeTruthy();
  });

  it('does not render overlay when closed', () => {
    render(<BottomSheet {...defaults} open={false} />);
    const overlay = document.querySelector('.bg-black\\/20');
    expect(overlay).toBeNull();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<BottomSheet {...defaults} onClose={onClose} />);
    const overlay = document.querySelector('.bg-black\\/20') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<BottomSheet {...defaults} onClose={onClose} />);
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies transition classes', () => {
    render(<BottomSheet {...defaults} />);
    const panel = screen.getByText('Sheet content').closest('[class*="fixed"]');
    expect(panel?.className).toContain('transition-transform');
    expect(panel?.className).toContain('duration-300');
    expect(panel?.className).toContain('ease-in-out');
  });

  it('applies rounded top corners', () => {
    render(<BottomSheet {...defaults} />);
    const panel = screen.getByText('Sheet content').closest('[class*="fixed"]');
    expect(panel?.className).toContain('rounded-t-2xl');
  });

  it('applies default maxHeight of 75vh', () => {
    render(<BottomSheet {...defaults} />);
    const panel = screen
      .getByText('Sheet content')
      .closest('[class*="fixed"]') as HTMLElement | null;
    expect(panel?.style.maxHeight).toBe('75vh');
  });

  it('applies custom maxHeight', () => {
    render(<BottomSheet {...defaults} maxHeight="60vh" />);
    const panel = screen
      .getByText('Sheet content')
      .closest('[class*="fixed"]') as HTMLElement | null;
    expect(panel?.style.maxHeight).toBe('60vh');
  });

  it('merges custom className', () => {
    render(<BottomSheet {...defaults} className="my-custom" />);
    const panel = screen.getByText('Sheet content').closest('[class*="fixed"]');
    expect(panel?.className).toContain('my-custom');
  });

  it('still renders children when closed (hidden via transform)', () => {
    render(<BottomSheet {...defaults} open={false} />);
    expect(screen.getByText('Sheet content')).toBeTruthy();
  });

  it('has scrollable content area', () => {
    render(<BottomSheet {...defaults} />);
    const contentWrapper = screen
      .getByTestId('sheet-content')
      .closest('[class*="overflow-y-auto"]');
    expect(contentWrapper).toBeTruthy();
  });
});
