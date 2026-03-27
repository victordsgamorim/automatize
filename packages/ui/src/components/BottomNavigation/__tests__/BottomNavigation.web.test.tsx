import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { BottomNavigation } from '../BottomNavigation.web';
import type { BottomNavigationProps } from '../BottomNavigation.web';

/* ─── Test data ────────────────────────────────────────────────────────────── */

function makeItems(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    icon: <span data-testid={`icon-${i}`}>icon{i}</span>,
    label: `Item ${i}`,
    onTap: vi.fn(),
  }));
}

function renderNav(props: Partial<BottomNavigationProps> = {}) {
  const items = props.items ?? makeItems();
  return render(<BottomNavigation items={items} activeIndex={0} {...props} />);
}

/* ─── Setup / teardown ─────────────────────────────────────────────────────── */

afterEach(() => {
  vi.restoreAllMocks();
});

/* ─── Rendering ────────────────────────────────────────────────────────────── */

describe('BottomNavigation — rendering', () => {
  it('renders a <nav> element', () => {
    renderNav();
    const nav = document.querySelector(
      '[data-slot="bottom-navigation"]'
    ) as HTMLElement;
    expect(nav).toBeTruthy();
    expect(nav.tagName).toBe('NAV');
  });

  it('has role="navigation"', () => {
    renderNav();
    expect(
      screen.getByRole('navigation', { name: 'Bottom navigation' })
    ).toBeTruthy();
  });

  it('has aria-label="Bottom navigation"', () => {
    renderNav();
    const nav = document.querySelector(
      '[data-slot="bottom-navigation"]'
    ) as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Bottom navigation');
  });

  it('renders one button per item', () => {
    renderNav({ items: makeItems(4) });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    );
    expect(buttons).toHaveLength(4);
  });

  it('renders item labels', () => {
    renderNav({ items: makeItems(3) });
    expect(screen.getByText('Item 0')).toBeTruthy();
    expect(screen.getByText('Item 1')).toBeTruthy();
    expect(screen.getByText('Item 2')).toBeTruthy();
  });

  it('renders item icons', () => {
    renderNav({ items: makeItems(2) });
    expect(screen.getByTestId('icon-0')).toBeTruthy();
    expect(screen.getByTestId('icon-1')).toBeTruthy();
  });

  it('applies a custom className to the nav element', () => {
    renderNav({ className: 'my-bottom-nav' });
    const nav = document.querySelector(
      '[data-slot="bottom-navigation"]'
    ) as HTMLElement;
    expect(nav.className).toContain('my-bottom-nav');
  });

  it('renders an empty nav when items array is empty', () => {
    renderNav({ items: [], activeIndex: 0 });
    const nav = document.querySelector(
      '[data-slot="bottom-navigation"]'
    ) as HTMLElement;
    expect(nav).toBeTruthy();
    expect(nav.querySelectorAll('button')).toHaveLength(0);
  });
});

/* ─── Accessibility ────────────────────────────────────────────────────────── */

describe('BottomNavigation — accessibility', () => {
  it('each button has an aria-label matching its item label', () => {
    const items = makeItems(3);
    renderNav({ items });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    buttons.forEach((btn, i) => {
      expect(btn.getAttribute('aria-label')).toBe(`Item ${i}`);
    });
  });

  it('each button has type="button"', () => {
    renderNav({ items: makeItems(2) });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLButtonElement>;
    buttons.forEach((btn) => {
      expect(btn.type).toBe('button');
    });
  });
});

/* ─── Active state ─────────────────────────────────────────────────────────── */

describe('BottomNavigation — active state', () => {
  it('sets aria-current="page" on the active button', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 1 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    expect(buttons[1].getAttribute('aria-current')).toBe('page');
  });

  it('does not set aria-current on inactive buttons', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    expect(buttons[1].getAttribute('aria-current')).toBeNull();
    expect(buttons[2].getAttribute('aria-current')).toBeNull();
  });

  it('only one button has aria-current="page" at a time', () => {
    const items = makeItems(4);
    renderNav({ items, activeIndex: 2 });
    const active = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button[aria-current="page"]'
    );
    expect(active).toHaveLength(1);
  });

  it('active item label has opacity-100 class', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const activeLabel = document
      .querySelectorAll('[data-slot="bottom-navigation"] button')[0]
      .querySelector('strong') as HTMLElement;
    expect(activeLabel.className).toContain('opacity-100');
  });

  it('inactive item labels have opacity-0 class', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    const inactiveLabel1 = buttons[1].querySelector('strong') as HTMLElement;
    const inactiveLabel2 = buttons[2].querySelector('strong') as HTMLElement;
    expect(inactiveLabel1.className).toContain('opacity-0');
    expect(inactiveLabel2.className).toContain('opacity-0');
  });

  it('active icon container has animate-icon-bounce class', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 2 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    const activeIconDiv = buttons[2].querySelector('div') as HTMLElement;
    expect(activeIconDiv.className).toContain('animate-icon-bounce');
  });

  it('inactive icon containers do not have animate-icon-bounce class', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    const inactiveIconDiv1 = buttons[1].querySelector('div') as HTMLElement;
    const inactiveIconDiv2 = buttons[2].querySelector('div') as HTMLElement;
    expect(inactiveIconDiv1.className).not.toContain('animate-icon-bounce');
    expect(inactiveIconDiv2.className).not.toContain('animate-icon-bounce');
  });

  it('active underline indicator has opacity-100 class', () => {
    const items = makeItems(2);
    renderNav({ items, activeIndex: 0 });
    const activeButton = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    )[0];
    // Use :scope > span to select the direct-child indicator span,
    // not the icon span nested inside the <div>
    const indicator = activeButton.querySelector(
      ':scope > span'
    ) as HTMLElement;
    expect(indicator.className).toContain('opacity-100');
  });

  it('inactive underline indicators have opacity-0 class', () => {
    const items = makeItems(2);
    renderNav({ items, activeIndex: 0 });
    const inactiveButton = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    )[1];
    const indicator = inactiveButton.querySelector(
      ':scope > span'
    ) as HTMLElement;
    expect(indicator.className).toContain('opacity-0');
  });

  it('does not mark any button active when activeIndex is out of bounds', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 99 });
    const active = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button[aria-current="page"]'
    );
    expect(active).toHaveLength(0);
  });
});

/* ─── Navigation callbacks ─────────────────────────────────────────────────── */

describe('BottomNavigation — navigation callbacks', () => {
  it('calls onTap for the clicked item', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    fireEvent.click(buttons[2]);
    expect(items[2].onTap).toHaveBeenCalledOnce();
  });

  it('does not call onTap of other items when one is clicked', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    fireEvent.click(buttons[1]);
    expect(items[0].onTap).not.toHaveBeenCalled();
    expect(items[2].onTap).not.toHaveBeenCalled();
  });

  it('calls onTap exactly once per click', () => {
    const items = makeItems(2);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[0]);
    expect(items[0].onTap).toHaveBeenCalledTimes(2);
  });
});

/* ─── CSS custom properties ────────────────────────────────────────────────── */

describe('BottomNavigation — CSS custom properties', () => {
  it('each button initializes with --lineWidth: 0px', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    ) as NodeListOf<HTMLElement>;
    buttons.forEach((btn) => {
      expect(btn.style.getPropertyValue('--lineWidth')).toBe('0px');
    });
  });
});

/* ─── Resize event listener ────────────────────────────────────────────────── */

describe('BottomNavigation — resize event listener', () => {
  it('registers a resize listener on mount', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    renderNav();
    const resizeCalls = addEventSpy.mock.calls.filter(
      ([event]) => event === 'resize'
    );
    expect(resizeCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('removes the resize listener on unmount', () => {
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderNav();
    unmount();
    const resizeCalls = removeEventSpy.mock.calls.filter(
      ([event]) => event === 'resize'
    );
    expect(resizeCalls.length).toBeGreaterThanOrEqual(1);
  });
});

/* ─── Edge cases ───────────────────────────────────────────────────────────── */

describe('BottomNavigation — edge cases', () => {
  it('renders correctly with a single item', () => {
    const items = makeItems(1);
    renderNav({ items, activeIndex: 0 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    );
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute('aria-current')).toBe('page');
  });

  it('renders correctly with five items', () => {
    renderNav({ items: makeItems(5), activeIndex: 4 });
    const buttons = document.querySelectorAll(
      '[data-slot="bottom-navigation"] button'
    );
    expect(buttons).toHaveLength(5);
    expect(buttons[4].getAttribute('aria-current')).toBe('page');
  });

  it('renders items without a group property', () => {
    const items = [
      { icon: <span>A</span>, label: 'Alpha', onTap: vi.fn() },
      { icon: <span>B</span>, label: 'Beta', onTap: vi.fn() },
    ];
    renderNav({ items, activeIndex: 0 });
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
  });

  it('uses the item label as the key (renders unique buttons)', () => {
    const items = makeItems(3);
    renderNav({ items, activeIndex: 0 });
    const labels = Array.from(
      document.querySelectorAll('[data-slot="bottom-navigation"] button strong')
    ).map((el) => el.textContent);
    expect(new Set(labels).size).toBe(3);
  });
});
