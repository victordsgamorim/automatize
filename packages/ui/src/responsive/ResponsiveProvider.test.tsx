import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { ResponsiveProvider } from './ResponsiveProvider';
import { useResponsive } from './useResponsive';

function ResponsiveConsumer() {
  const { isSm, isMd, isLg, isXl, is2xl, isMobile } = useResponsive();
  return (
    <div>
      <span data-testid="isSm">{String(isSm)}</span>
      <span data-testid="isMd">{String(isMd)}</span>
      <span data-testid="isLg">{String(isLg)}</span>
      <span data-testid="isXl">{String(isXl)}</span>
      <span data-testid="is2xl">{String(is2xl)}</span>
      <span data-testid="isMobile">{String(isMobile)}</span>
    </div>
  );
}

describe('ResponsiveProvider', () => {
  beforeEach(() => {
    const listeners: Array<(e: { matches: boolean }) => void> = [];
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        const match = query.match(/min-width:\s*(\d+)/);
        const minWidth = match ? parseInt(match[1], 10) : 0;
        const matches = minWidth === 0;

        return {
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(
            (_event: string, handler: (e: { matches: boolean }) => void) => {
              listeners.push(handler);
            }
          ),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });
  });

  it('renders children', async () => {
    await act(async () => {
      render(
        <ResponsiveProvider>
          <div data-testid="child">Hello</div>
        </ResponsiveProvider>
      );
    });

    expect(screen.getByTestId('child').textContent).toBe('Hello');
  });

  it('throws when useResponsive is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ResponsiveConsumer />);
    }).toThrow(
      '[responsive] useResponsive() must be used within <ResponsiveProvider>.'
    );

    spy.mockRestore();
  });

  it('returns all breakpoints as false by default (narrow viewport)', async () => {
    await act(async () => {
      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );
    });

    expect(screen.getByTestId('isSm').textContent).toBe('false');
    expect(screen.getByTestId('isMd').textContent).toBe('false');
    expect(screen.getByTestId('isLg').textContent).toBe('false');
    expect(screen.getByTestId('isXl').textContent).toBe('false');
    expect(screen.getByTestId('is2xl').textContent).toBe('false');
    expect(screen.getByTestId('isMobile').textContent).toBe('true');
  });

  it('isMobile is true when isLg is false', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        const match = query.match(/min-width:\s*(\d+)/);
        const minWidth = match ? parseInt(match[1], 10) : 0;
        const viewportWidth = 800;
        const matches = viewportWidth >= minWidth;

        return {
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });

    await act(async () => {
      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );
    });

    expect(screen.getByTestId('isSm').textContent).toBe('true');
    expect(screen.getByTestId('isMd').textContent).toBe('true');
    expect(screen.getByTestId('isLg').textContent).toBe('false');
    expect(screen.getByTestId('isMobile').textContent).toBe('true');
  });

  it('isMobile is false when isLg is true (desktop viewport)', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        const match = query.match(/min-width:\s*(\d+)/);
        const minWidth = match ? parseInt(match[1], 10) : 0;
        const viewportWidth = 1440;
        const matches = viewportWidth >= minWidth;

        return {
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });

    await act(async () => {
      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );
    });

    expect(screen.getByTestId('isSm').textContent).toBe('true');
    expect(screen.getByTestId('isMd').textContent).toBe('true');
    expect(screen.getByTestId('isLg').textContent).toBe('true');
    expect(screen.getByTestId('isXl').textContent).toBe('true');
    expect(screen.getByTestId('is2xl').textContent).toBe('false');
    expect(screen.getByTestId('isMobile').textContent).toBe('false');
  });
});
