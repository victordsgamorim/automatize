import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

beforeAll(() => {
  // cmdk uses ResizeObserver internally for list measurement
  global.ResizeObserver = class {
    private _cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this._cb = cb;
    }
    observe() {
      // Trigger callback with empty entries so cmdk finishes initialization
      this._cb([], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  // cmdk calls scrollIntoView on selected items — jsdom doesn't support it
  Element.prototype.scrollIntoView = () => {};
});

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '../CommandPalette.web';

describe('CommandPalette primitives (web)', () => {
  // ── Command ───────────────────────────────────────────────────────────────

  it('renders Command with data-slot="command"', () => {
    render(<Command label="Test" />);
    expect(document.querySelector('[data-slot="command"]')).toBeTruthy();
  });

  it('applies custom className to Command', () => {
    render(<Command label="Test" className="my-class" />);
    expect(
      document.querySelector('[data-slot="command"]')?.className
    ).toContain('my-class');
  });

  // ── CommandDialog ─────────────────────────────────────────────────────────

  it('renders dialog overlay and content when open', () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Search..." />
      </CommandDialog>
    );
    expect(
      document.querySelector('[data-slot="command-dialog-overlay"]')
    ).toBeTruthy();
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeTruthy();
  });

  it('does not render dialog content when closed', () => {
    render(
      <CommandDialog open={false}>
        <CommandInput placeholder="Search..." />
      </CommandDialog>
    );
    expect(
      document.querySelector('[data-slot="command-dialog-content"]')
    ).toBeNull();
  });

  it('renders accessible title and description in dialog', () => {
    render(
      <CommandDialog open title="My Title" description="My Description">
        <CommandInput placeholder="Search..." />
      </CommandDialog>
    );
    expect(screen.getByText('My Title')).toBeTruthy();
    expect(screen.getByText('My Description')).toBeTruthy();
  });

  // ── CommandInput ──────────────────────────────────────────────────────────

  it('renders input wrapper with data-slot="command-input-wrapper"', () => {
    render(
      <Command label="Test">
        <CommandInput placeholder="Type here..." />
      </Command>
    );
    expect(
      document.querySelector('[data-slot="command-input-wrapper"]')
    ).toBeTruthy();
  });

  it('renders input with data-slot="command-input"', () => {
    render(
      <Command label="Test">
        <CommandInput placeholder="Type here..." />
      </Command>
    );
    expect(document.querySelector('[data-slot="command-input"]')).toBeTruthy();
  });

  it('renders input with placeholder text', () => {
    render(
      <Command label="Test">
        <CommandInput placeholder="Search items..." />
      </Command>
    );
    expect(screen.getByPlaceholderText('Search items...')).toBeTruthy();
  });

  it('applies custom className to input', () => {
    render(
      <Command label="Test">
        <CommandInput className="custom-input" />
      </Command>
    );
    expect(
      document.querySelector('[data-slot="command-input"]')?.className
    ).toContain('custom-input');
  });

  // ── CommandList ────────────────────────────────────────────────────────────

  it('renders list with data-slot="command-list"', async () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandItem>Item</CommandItem>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(document.querySelector('[data-slot="command-list"]')).toBeTruthy();
    });
  });

  // ── CommandEmpty ───────────────────────────────────────────────────────────

  it('renders empty with data-slot="command-empty"', () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-empty"]')).toBeTruthy();
  });

  it('renders empty text content', () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandEmpty>Nothing found.</CommandEmpty>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Nothing found.')).toBeTruthy();
  });

  // ── CommandGroup ──────────────────────────────────────────────────────────

  it('renders group with data-slot="command-group"', async () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandGroup heading="Section">
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="command-group"]')
      ).toBeTruthy();
    });
  });

  it('renders group heading text', async () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem>Run</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeTruthy();
    });
  });

  // ── CommandItem ───────────────────────────────────────────────────────────

  it('renders item with data-slot="command-item"', async () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandItem>Click me</CommandItem>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(document.querySelector('[data-slot="command-item"]')).toBeTruthy();
    });
  });

  it('renders item text content', async () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandItem>Open file</CommandItem>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(screen.getByText('Open file')).toBeTruthy();
    });
  });

  it('applies custom className to item', async () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandItem className="my-item">Item</CommandItem>
        </CommandList>
      </Command>
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="command-item"]')?.className
      ).toContain('my-item');
    });
  });

  // ── CommandSeparator ──────────────────────────────────────────────────────

  it('renders separator with data-slot="command-separator"', () => {
    render(
      <Command label="Test">
        <CommandInput />
        <CommandList>
          <CommandSeparator />
        </CommandList>
      </Command>
    );
    expect(
      document.querySelector('[data-slot="command-separator"]')
    ).toBeTruthy();
  });

  // ── CommandShortcut ───────────────────────────────────────────────────────

  it('renders shortcut with data-slot="command-shortcut"', () => {
    render(<CommandShortcut>⌘K</CommandShortcut>);
    expect(
      document.querySelector('[data-slot="command-shortcut"]')
    ).toBeTruthy();
  });

  it('renders shortcut text content', () => {
    render(<CommandShortcut>⌘K</CommandShortcut>);
    expect(
      document.querySelector('[data-slot="command-shortcut"]')?.textContent
    ).toBe('⌘K');
  });
});
