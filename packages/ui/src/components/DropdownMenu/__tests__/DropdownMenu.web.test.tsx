import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../DropdownMenu.web';

function OpenMenu({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu (web)', () => {
  // ── Trigger ────────────────────────────────────────────────────────────────

  it('renders trigger with data-slot="dropdown-menu-trigger"', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-trigger"]')
    ).toBeTruthy();
  });

  it('renders content with data-slot="dropdown-menu-content" when defaultOpen', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-content"]')
    ).toBeTruthy();
  });

  // ── Content ────────────────────────────────────────────────────────────────

  // ── Item ───────────────────────────────────────────────────────────────────

  it('renders item with data-slot="dropdown-menu-item"', () => {
    render(
      <OpenMenu>
        <DropdownMenuItem>Click me</DropdownMenuItem>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-item"]')
    ).toBeTruthy();
  });

  it('sets data-variant="default" on item by default', () => {
    render(
      <OpenMenu>
        <DropdownMenuItem>Default</DropdownMenuItem>
      </OpenMenu>
    );
    expect(
      document
        .querySelector('[data-slot="dropdown-menu-item"]')
        ?.getAttribute('data-variant')
    ).toBe('default');
  });

  it('sets data-variant="destructive" on item when variant="destructive"', () => {
    render(
      <OpenMenu>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </OpenMenu>
    );
    expect(
      document
        .querySelector('[data-slot="dropdown-menu-item"]')
        ?.getAttribute('data-variant')
    ).toBe('destructive');
  });

  it('sets data-inset on item when inset=true', () => {
    render(
      <OpenMenu>
        <DropdownMenuItem inset>Inset</DropdownMenuItem>
      </OpenMenu>
    );
    expect(
      document
        .querySelector('[data-slot="dropdown-menu-item"]')
        ?.getAttribute('data-inset')
    ).toBeTruthy();
  });

  it('calls onClick handler when item is clicked', () => {
    const onClick = vi.fn();
    render(
      <OpenMenu>
        <DropdownMenuItem onClick={onClick}>Click</DropdownMenuItem>
      </OpenMenu>
    );
    const item = document.querySelector(
      '[data-slot="dropdown-menu-item"]'
    ) as HTMLElement;
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies custom className to item', () => {
    render(
      <OpenMenu>
        <DropdownMenuItem className="my-class">Item</DropdownMenuItem>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-item"]')?.className
    ).toContain('my-class');
  });

  // ── Label ──────────────────────────────────────────────────────────────────

  it('renders label with data-slot="dropdown-menu-label"', () => {
    render(
      <OpenMenu>
        <DropdownMenuLabel>Section</DropdownMenuLabel>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-label"]')
    ).toBeTruthy();
  });

  it('sets data-inset on label when inset=true', () => {
    render(
      <OpenMenu>
        <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
      </OpenMenu>
    );
    expect(
      document
        .querySelector('[data-slot="dropdown-menu-label"]')
        ?.getAttribute('data-inset')
    ).toBeTruthy();
  });

  it('renders label text content', () => {
    render(
      <OpenMenu>
        <DropdownMenuLabel>My Section</DropdownMenuLabel>
      </OpenMenu>
    );
    expect(screen.getByText('My Section')).toBeDefined();
  });

  // ── Separator ──────────────────────────────────────────────────────────────

  it('renders separator with data-slot="dropdown-menu-separator"', () => {
    render(
      <OpenMenu>
        <DropdownMenuSeparator />
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-separator"]')
    ).toBeTruthy();
  });

  // ── Shortcut ───────────────────────────────────────────────────────────────

  it('renders shortcut with data-slot="dropdown-menu-shortcut"', () => {
    render(
      <OpenMenu>
        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-shortcut"]')
    ).toBeTruthy();
  });

  it('renders shortcut text content', () => {
    render(
      <OpenMenu>
        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-shortcut"]')
        ?.textContent
    ).toBe('⌘K');
  });

  // ── Checkbox item ──────────────────────────────────────────────────────────

  it('renders checkbox item with data-slot="dropdown-menu-checkbox-item"', () => {
    render(
      <OpenMenu>
        <DropdownMenuCheckboxItem>Option</DropdownMenuCheckboxItem>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-checkbox-item"]')
    ).toBeTruthy();
  });

  it('reflects checked state on checkbox item', () => {
    render(
      <OpenMenu>
        <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
      </OpenMenu>
    );
    const item = document.querySelector(
      '[data-slot="dropdown-menu-checkbox-item"]'
    );
    expect(item?.getAttribute('data-state')).toBe('checked');
  });

  // ── Radio group ────────────────────────────────────────────────────────────

  it('renders radio group with data-slot="dropdown-menu-radio-group"', () => {
    render(
      <OpenMenu>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-radio-group"]')
    ).toBeTruthy();
  });

  it('renders radio items with data-slot="dropdown-menu-radio-item"', () => {
    render(
      <OpenMenu>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </OpenMenu>
    );
    expect(
      document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]')
    ).toHaveLength(2);
  });

  // ── Group ──────────────────────────────────────────────────────────────────

  it('renders group with data-slot="dropdown-menu-group"', () => {
    render(
      <OpenMenu>
        <DropdownMenuGroup>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuGroup>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-group"]')
    ).toBeTruthy();
  });

  // ── Sub menu ───────────────────────────────────────────────────────────────

  it('renders sub-trigger with data-slot="dropdown-menu-sub-trigger"', () => {
    render(
      <OpenMenu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Sub item</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </OpenMenu>
    );
    expect(
      document.querySelector('[data-slot="dropdown-menu-sub-trigger"]')
    ).toBeTruthy();
  });

  it('sets data-inset on sub-trigger when inset=true', () => {
    render(
      <OpenMenu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Sub item</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </OpenMenu>
    );
    expect(
      document
        .querySelector('[data-slot="dropdown-menu-sub-trigger"]')
        ?.getAttribute('data-inset')
    ).toBeTruthy();
  });
});
