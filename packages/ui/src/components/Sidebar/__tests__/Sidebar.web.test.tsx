import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarLink,
  SidebarGroup,
  SidebarNav,
  SidebarLayout,
  useSidebar,
} from '../Sidebar.web';

/* ─── matchMedia mock (jsdom does not implement it) ────────────────────────── */

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function renderSidebar(ui?: React.ReactNode) {
  return render(
    <SidebarProvider>
      <Sidebar>{ui ?? <div>Sidebar content</div>}</Sidebar>
      <main>Main content</main>
    </SidebarProvider>
  );
}

/* ─── SidebarProvider ──────────────────────────────────────────────────────── */

describe('SidebarProvider (web)', () => {
  it('renders children', () => {
    render(
      <SidebarProvider>
        <div>child</div>
      </SidebarProvider>
    );
    expect(screen.getByText('child')).toBeDefined();
  });

  it('has data-slot="sidebar-provider"', () => {
    render(
      <SidebarProvider>
        <div>child</div>
      </SidebarProvider>
    );
    expect(
      document.querySelector('[data-slot="sidebar-provider"]')
    ).toBeDefined();
  });

  it('uses fixed viewport height (h-svh) instead of min-h-svh', () => {
    render(
      <SidebarProvider>
        <div>child</div>
      </SidebarProvider>
    );
    const provider = document.querySelector(
      '[data-slot="sidebar-provider"]'
    ) as HTMLElement;
    expect(provider.className).toContain('h-svh');
    expect(provider.className).not.toContain('min-h-svh');
  });

  it('applies overflow-hidden to prevent content from stretching the layout', () => {
    render(
      <SidebarProvider>
        <div>child</div>
      </SidebarProvider>
    );
    const provider = document.querySelector(
      '[data-slot="sidebar-provider"]'
    ) as HTMLElement;
    expect(provider.className).toContain('overflow-hidden');
  });

  it('applies custom className', () => {
    render(
      <SidebarProvider className="my-custom">
        <div>child</div>
      </SidebarProvider>
    );
    const provider = document.querySelector(
      '[data-slot="sidebar-provider"]'
    ) as HTMLElement;
    expect(provider.className).toContain('my-custom');
  });

  it('sets CSS custom properties for sidebar widths', () => {
    render(
      <SidebarProvider>
        <div>child</div>
      </SidebarProvider>
    );
    const provider = document.querySelector(
      '[data-slot="sidebar-provider"]'
    ) as HTMLElement;
    expect(provider.style.getPropertyValue('--sidebar-width')).toBe('16rem');
    expect(provider.style.getPropertyValue('--sidebar-width-collapsed')).toBe(
      '4rem'
    );
  });
});

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */

describe('Sidebar (web)', () => {
  it('renders an aside with data-slot="sidebar"', () => {
    renderSidebar();
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar).toBeDefined();
    expect(sidebar.tagName).toBe('ASIDE');
  });

  it('has aria-label for accessibility', () => {
    renderSidebar();
    expect(screen.getByLabelText('Main navigation')).toBeDefined();
  });

  it('defaults to expanded state (data-state="expanded")', () => {
    renderSidebar();
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
  });

  it('applies custom className', () => {
    render(
      <SidebarProvider>
        <Sidebar className="my-sidebar">
          <div>content</div>
        </Sidebar>
      </SidebarProvider>
    );
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar.className).toContain('my-sidebar');
  });
});

/* ─── SidebarHeader ────────────────────────────────────────────────────────── */

describe('SidebarHeader (web)', () => {
  it('renders with data-slot="sidebar-header"', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    );
    const header = document.querySelector(
      '[data-slot="sidebar-header"]'
    ) as HTMLElement;
    expect(header).toBeDefined();
    expect(header.textContent).toBe('Header');
  });
});

/* ─── SidebarContent ───────────────────────────────────────────────────────── */

describe('SidebarContent (web)', () => {
  it('renders with data-slot="sidebar-content"', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Nav items</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    const content = document.querySelector(
      '[data-slot="sidebar-content"]'
    ) as HTMLElement;
    expect(content).toBeDefined();
    expect(content.textContent).toBe('Nav items');
  });

  it('has overflow-y-auto for independent scrolling', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Nav items</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    const content = document.querySelector(
      '[data-slot="sidebar-content"]'
    ) as HTMLElement;
    expect(content.className).toContain('overflow-y-auto');
  });
});

/* ─── SidebarFooter ────────────────────────────────────────────────────────── */

describe('SidebarFooter (web)', () => {
  it('renders with data-slot="sidebar-footer"', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );
    const footer = document.querySelector(
      '[data-slot="sidebar-footer"]'
    ) as HTMLElement;
    expect(footer).toBeDefined();
    expect(footer.textContent).toBe('Footer');
  });
});

/* ─── SidebarTrigger ───────────────────────────────────────────────────────── */

describe('SidebarTrigger (web)', () => {
  it('renders a button with data-slot="sidebar-trigger"', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>
    );
    const trigger = document.querySelector(
      '[data-slot="sidebar-trigger"]'
    ) as HTMLElement;
    expect(trigger).toBeDefined();
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('toggles sidebar state on click', () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>
    );
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar.getAttribute('data-state')).toBe('expanded');

    const trigger = document.querySelector(
      '[data-slot="sidebar-trigger"]'
    ) as HTMLElement;
    fireEvent.click(trigger);
    expect(sidebar.getAttribute('data-state')).toBe('collapsed');

    fireEvent.click(trigger);
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
  });
});

/* ─── SidebarLink ──────────────────────────────────────────────────────────── */

describe('SidebarLink (web)', () => {
  it('renders as a button by default', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarLink icon={<span>icon</span>} label="Home" />
        </Sidebar>
      </SidebarProvider>
    );
    const link = document.querySelector(
      '[data-slot="sidebar-link"]'
    ) as HTMLElement;
    expect(link.tagName).toBe('BUTTON');
  });

  it('renders as an anchor when href is provided', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarLink icon={<span>icon</span>} label="Home" href="/home" />
        </Sidebar>
      </SidebarProvider>
    );
    const link = document.querySelector(
      '[data-slot="sidebar-link"]'
    ) as HTMLElement;
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/home');
  });

  it('calls onClick handler', () => {
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarLink
            icon={<span>icon</span>}
            label="Home"
            onClick={onClick}
          />
        </Sidebar>
      </SidebarProvider>
    );
    fireEvent.click(
      document.querySelector('[data-slot="sidebar-link"]') as HTMLElement
    );
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('marks active item with aria-current="page"', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarLink icon={<span>icon</span>} label="Home" active />
        </Sidebar>
      </SidebarProvider>
    );
    const link = document.querySelector(
      '[data-slot="sidebar-link"]'
    ) as HTMLElement;
    expect(link.getAttribute('aria-current')).toBe('page');
  });
});

/* ─── SidebarGroup ─────────────────────────────────────────────────────────── */

describe('SidebarGroup (web)', () => {
  it('renders with data-slot="sidebar-group"', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarGroup label="Menu">
            <div>item</div>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    );
    const group = document.querySelector(
      '[data-slot="sidebar-group"]'
    ) as HTMLElement;
    expect(group).toBeDefined();
    expect(group.textContent).toContain('Menu');
    expect(group.textContent).toContain('item');
  });
});

/* ─── SidebarNav ───────────────────────────────────────────────────────────── */

describe('SidebarNav (web)', () => {
  const items = [
    { icon: <span>1</span>, label: 'Dashboard', onTap: vi.fn(), group: 'Menu' },
    { icon: <span>2</span>, label: 'Invoices', onTap: vi.fn(), group: 'Menu' },
    { icon: <span>3</span>, label: 'Settings', onTap: vi.fn() },
  ];

  it('renders all items', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarNav items={items} activeIndex={0} />
        </Sidebar>
      </SidebarProvider>
    );
    const nav = document.querySelector(
      '[data-slot="sidebar-nav"]'
    ) as HTMLElement;
    expect(nav).toBeDefined();
    expect(nav.textContent).toContain('Dashboard');
    expect(nav.textContent).toContain('Invoices');
    expect(nav.textContent).toContain('Settings');
  });

  it('marks the active item', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarNav items={items} activeIndex={1} />
        </Sidebar>
      </SidebarProvider>
    );
    const links = document.querySelectorAll('[data-slot="sidebar-link"]');
    expect(links[1].getAttribute('aria-current')).toBe('page');
    expect(links[0].getAttribute('aria-current')).toBeNull();
  });

  it('calls onTap when an item is clicked', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarNav items={items} activeIndex={0} />
        </Sidebar>
      </SidebarProvider>
    );
    const links = document.querySelectorAll('[data-slot="sidebar-link"]');
    fireEvent.click(links[2]);
    expect(items[2].onTap).toHaveBeenCalledOnce();
  });
});

/* ─── SidebarLayout ────────────────────────────────────────────────────────── */

describe('SidebarLayout (web)', () => {
  const items = [
    { icon: <span>1</span>, label: 'Dashboard', onTap: vi.fn() },
    { icon: <span>2</span>, label: 'Invoices', onTap: vi.fn() },
  ];

  it('renders header, nav items, and trigger', () => {
    render(
      <SidebarProvider>
        <SidebarLayout
          header={<span>Logo</span>}
          items={items}
          activeIndex={0}
        />
      </SidebarProvider>
    );
    expect(screen.getByText('Logo')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Invoices')).toBeDefined();
    expect(
      document.querySelector('[data-slot="sidebar-trigger"]')
    ).toBeDefined();
  });

  it('renders profile footer when profile is provided', () => {
    render(
      <SidebarProvider>
        <SidebarLayout
          header={<span>Logo</span>}
          items={items}
          activeIndex={0}
          profile={{
            icon: <span>avatar</span>,
            label: 'John Doe',
            subtitle: 'john@example.com',
          }}
        />
      </SidebarProvider>
    );
    expect(
      document.querySelector('[data-slot="sidebar-footer"]')
    ).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
  });
});

/* ─── Responsive breakpoint ────────────────────────────────────────────────── */

describe('Responsive breakpoint (web)', () => {
  it('uses 1024px as the mobile breakpoint (matchMedia query)', () => {
    render(
      <SidebarProvider>
        <div>child</div>
      </SidebarProvider>
    );
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1023px)');
  });

  it('renders desktop aside when matchMedia does not match (>= 1024px)', () => {
    renderSidebar();
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar).toBeDefined();
    expect(sidebar.tagName).toBe('ASIDE');
    // Desktop sidebar must NOT use position: fixed
    expect(sidebar.className).not.toContain('fixed');
  });

  it('renders mobile sidebar when matchMedia matches (< 1024px)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderSidebar();
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar).toBeDefined();
    // Mobile sidebar uses fixed positioning
    expect(sidebar.className).toContain('fixed');
  });

  it('auto-closes sidebar when entering mobile breakpoint', async () => {
    let changeHandler:
      | ((e: MediaQueryListEvent | MediaQueryList) => void)
      | null = null;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(
          (
            _event: string,
            handler: (e: MediaQueryListEvent | MediaQueryList) => void
          ) => {
            changeHandler = handler;
          }
        ),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { act } = await import('@testing-library/react');

    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <div>content</div>
        </Sidebar>
        <main>Main</main>
      </SidebarProvider>
    );

    // Desktop: sidebar is expanded
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar.getAttribute('data-state')).toBe('expanded');

    // Simulate entering mobile breakpoint inside act() to flush state updates
    act(() => {
      if (changeHandler) {
        changeHandler({
          matches: true,
          media: '(max-width: 1023px)',
        } as MediaQueryListEvent);
      }
    });

    // After entering mobile, the Sidebar component switches to MobileSidebar
    // which renders with data-state="collapsed" since open was set to false
    const mobileSidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(mobileSidebar.getAttribute('data-state')).toBe('collapsed');
  });

  it('desktop aside does not use hidden or md:flex CSS classes', () => {
    renderSidebar();
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    // The fix: no redundant Tailwind responsive breakpoint classes
    // JS matchMedia is the single source of truth for show/hide
    const classes = sidebar.className.split(/\s+/);
    expect(classes).not.toContain('hidden');
    expect(classes).not.toContain('md:flex');
  });

  it('mobile sidebar does not use md:hidden CSS class', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderSidebar();
    const sidebar = document.querySelector(
      '[data-slot="sidebar"]'
    ) as HTMLElement;
    expect(sidebar.className).not.toContain('md:hidden');

    // Also check the backdrop
    const backdrop = document.querySelector(
      '[role="presentation"]'
    ) as HTMLElement;
    expect(backdrop.className).not.toContain('md:hidden');
  });
});

/* ─── useSidebar ───────────────────────────────────────────────────────────── */

describe('useSidebar (web)', () => {
  it('throws when used outside SidebarProvider', () => {
    function BadComponent() {
      useSidebar();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      'useSidebar must be used within a <SidebarProvider>'
    );
  });
});
