import { describe, it, expect, vi, beforeAll } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import React from 'react';

beforeAll(() => {
  global.ResizeObserver = class {
    private _cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this._cb = cb;
    }
    observe() {
      this._cb([], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  Element.prototype.scrollIntoView = () => {};
});

import { SearchBar } from '../SearchBar.web';
import {
  CommandGroup,
  CommandItem,
} from '../../CommandPalette/CommandPalette.web';

describe('SearchBar (web)', () => {
  // ── Trigger rendering ─────────────────────────────────────────────────────

  it('renders trigger button with data-slot="search-bar-trigger"', () => {
    render(<SearchBar />);
    expect(
      document.querySelector('[data-slot="search-bar-trigger"]')
    ).toBeTruthy();
  });

  it('renders default placeholder text', () => {
    render(<SearchBar />);
    expect(screen.getByText('Search...')).toBeTruthy();
  });

  it('renders custom placeholder text', () => {
    render(<SearchBar placeholder="Find items..." />);
    expect(screen.getByText('Find items...')).toBeTruthy();
  });

  it('renders keyboard shortcut badge with K', () => {
    render(<SearchBar />);
    const trigger = document.querySelector('[data-slot="search-bar-trigger"]');
    expect(trigger?.querySelector('kbd')).toBeTruthy();
    expect(trigger?.querySelector('kbd')?.textContent).toContain('K');
  });

  it('applies custom className to trigger button', () => {
    render(<SearchBar className="my-search" />);
    expect(
      document.querySelector('[data-slot="search-bar-trigger"]')?.className
    ).toContain('my-search');
  });

  it('renders trigger as a button element with type="button"', () => {
    render(<SearchBar />);
    const trigger = document.querySelector(
      '[data-slot="search-bar-trigger"]'
    ) as HTMLButtonElement;
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.type).toBe('button');
  });

  // ── Dialog open/close ─────────────────────────────────────────────────────

  it('does not render dialog initially', () => {
    render(<SearchBar />);
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeNull();
  });

  it('opens dialog when trigger is clicked', () => {
    render(<SearchBar />);
    const trigger = document.querySelector(
      '[data-slot="search-bar-trigger"]'
    ) as HTMLElement;
    fireEvent.click(trigger);
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeTruthy();
  });

  it('opens dialog on Ctrl+K keyboard shortcut', () => {
    render(<SearchBar />);
    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeTruthy();
  });

  it('opens dialog on Meta+K keyboard shortcut', () => {
    render(<SearchBar />);
    act(() => {
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
    });
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeTruthy();
  });

  it('does not open dialog on K without modifier', () => {
    render(<SearchBar />);
    act(() => {
      fireEvent.keyDown(document, { key: 'k' });
    });
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeNull();
  });

  it('toggles dialog closed on second Ctrl+K press', () => {
    render(<SearchBar />);
    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeTruthy();
    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeNull();
  });

  // ── Dialog content ────────────────────────────────────────────────────────

  it('renders search input inside open dialog', () => {
    render(<SearchBar />);
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    expect(document.querySelector('[data-slot="command-input"]')).toBeTruthy();
  });

  it('renders custom placeholder in dialog input', () => {
    render(<SearchBar placeholder="Find..." />);
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    expect(screen.getByPlaceholderText('Find...')).toBeTruthy();
  });

  it('renders default empty message', () => {
    render(<SearchBar />);
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    expect(screen.getByText('No results found.')).toBeTruthy();
  });

  it('renders custom empty message', () => {
    render(<SearchBar emptyMessage="Nothing here" />);
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  // ── Children rendering ────────────────────────────────────────────────────

  it('renders children inside the dialog results area', async () => {
    render(
      <SearchBar>
        <CommandGroup heading="Actions">
          <CommandItem>Open file</CommandItem>
          <CommandItem>Save</CommandItem>
        </CommandGroup>
      </SearchBar>
    );
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeTruthy();
      expect(
        document.querySelectorAll('[data-slot="command-item"]').length
      ).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Callback ──────────────────────────────────────────────────────────────

  it('calls onSearchChange when typing in the input', () => {
    const onSearchChange = vi.fn();
    render(<SearchBar onSearchChange={onSearchChange} />);
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    const input = document.querySelector(
      '[data-slot="command-input"]'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(onSearchChange).toHaveBeenCalledWith('hello');
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it('renders accessible dialog title when open', () => {
    render(<SearchBar placeholder="Search items" />);
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    // Title appears in trigger span + sr-only dialog heading — at least 2 matches
    expect(screen.getAllByText('Search items').length).toBeGreaterThanOrEqual(
      2
    );
  });

  it('renders accessible dialog description when open', () => {
    render(<SearchBar />);
    fireEvent.click(
      document.querySelector('[data-slot="search-bar-trigger"]') as HTMLElement
    );
    expect(screen.getByText('Press Escape to close')).toBeTruthy();
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────

  it('cleans up keyboard listener on unmount', () => {
    const spy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<SearchBar />);
    unmount();
    expect(spy.mock.calls.some(([event]) => event === 'keydown')).toBe(true);
    spy.mockRestore();
  });
});
