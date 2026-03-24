'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ChevronsUpDown, PanelLeft } from 'lucide-react';
import { cn } from '../../utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../DropdownMenu/DropdownMenu.web';

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const SIDEBAR_WIDTH = '16rem'; // 256px (w-64)
const SIDEBAR_WIDTH_COLLAPSED = '4rem'; // 64px (w-16)
const MOBILE_BREAKPOINT = 768;

/* ─── Context ───────────────────────────────────────────────────────────────── */

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a <SidebarProvider>');
  }
  return ctx;
}

/* ─── SidebarProvider ───────────────────────────────────────────────────────── */

export interface SidebarProviderProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  className,
}: SidebarProviderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) setOpen(false);
    };
    onChange(mql);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, isMobile }),
    [open, toggle, isMobile]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-provider"
        className={cn('flex min-h-svh w-full', className)}
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-collapsed': SIDEBAR_WIDTH_COLLAPSED,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/* ─── Sidebar ───────────────────────────────────────────────────────────────── */

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { open, setOpen, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <MobileSidebar
        open={open}
        onClose={() => setOpen(false)}
        className={className}
      >
        {children}
      </MobileSidebar>
    );
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={open ? 'expanded' : 'collapsed'}
      aria-label="Main navigation"
      className={cn(
        'hidden md:flex flex-col flex-shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out overflow-hidden',
        open
          ? 'w-[var(--sidebar-width)]'
          : 'w-[var(--sidebar-width-collapsed)]',
        className
      )}
    >
      {children}
    </aside>
  );
}

/* ─── MobileSidebar (internal) ──────────────────────────────────────────────── */

function MobileSidebar({
  children,
  open,
  onClose,
  className,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Focus first focusable element when opened
  useEffect(() => {
    if (open && sidebarRef.current) {
      const focusable = sidebarRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        ref={sidebarRef}
        data-slot="sidebar"
        data-state={open ? 'expanded' : 'collapsed'}
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-[var(--sidebar-width)] bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out md:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-collapsed': SIDEBAR_WIDTH_COLLAPSED,
          } as React.CSSProperties
        }
      >
        {children}
      </aside>
    </>
  );
}

/* ─── SidebarHeader ─────────────────────────────────────────────────────────── */

export interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn('flex items-center gap-2 px-4 py-4', className)}
    >
      {children}
    </div>
  );
}

/* ─── SidebarContent ────────────────────────────────────────────────────────── */

export interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn('flex-1 overflow-y-auto overflow-x-hidden px-3', className)}
    >
      {children}
    </div>
  );
}

/* ─── SidebarFooter ─────────────────────────────────────────────────────────── */

export interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        'mt-auto bg-black/5 dark:bg-black/20 border-t border-sidebar-border',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─── SidebarTrigger ────────────────────────────────────────────────────────── */

export interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { open, toggle, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <button
        data-slot="sidebar-trigger"
        type="button"
        aria-label="Open navigation"
        onClick={toggle}
        className={cn(
          'inline-flex items-center justify-center size-9 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors md:hidden',
          className
        )}
      >
        <PanelLeft className="size-5" />
      </button>
    );
  }

  return (
    <button
      data-slot="sidebar-trigger"
      type="button"
      aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-expanded={open}
      onClick={toggle}
      className={cn(
        'inline-flex items-center justify-center size-8 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
        className
      )}
    >
      <PanelLeft className="size-5" />
    </button>
  );
}

/* ─── SidebarLink ───────────────────────────────────────────────────────────── */

export interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarLink({
  icon,
  label,
  href,
  active = false,
  onClick,
  className,
}: SidebarLinkProps) {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  const content = (
    <>
      <span className="flex-shrink-0 size-5">{icon}</span>
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap transition-all duration-300',
          isExpanded ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'
        )}
      >
        {label}
      </span>
    </>
  );

  const sharedClassName = cn(
    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    !isExpanded && 'justify-center px-0',
    className
  );

  if (href) {
    return (
      <a
        data-slot="sidebar-link"
        href={href}
        aria-current={active ? 'page' : undefined}
        className={sharedClassName}
        title={!isExpanded ? label : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      data-slot="sidebar-link"
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={sharedClassName}
      title={!isExpanded ? label : undefined}
    >
      {content}
    </button>
  );
}

/* ─── SidebarGroup ──────────────────────────────────────────────────────────── */

export interface SidebarGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function SidebarGroup({
  children,
  label,
  className,
}: SidebarGroupProps) {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  return (
    <div
      data-slot="sidebar-group"
      className={cn('flex flex-col gap-1', className)}
    >
      {label && (
        <span
          className={cn(
            'px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-300',
            isExpanded ? 'opacity-100' : 'opacity-0'
          )}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/* ─── SidebarNavItem (type) ────────────────────────────────────────────────── */

export interface SidebarNavItem {
  icon: React.ReactNode;
  label: string;
  /** Called when this item is tapped/clicked. */
  onTap: () => void;
  /** Optional group label. Items with the same group are rendered together. */
  group?: string;
}

/* ─── SidebarNav (config-driven) ───────────────────────────────────────────── */

export interface SidebarNavProps {
  /** The list of navigation items to render. */
  items: SidebarNavItem[];
  /** Currently selected item index. */
  activeIndex: number;
  className?: string;
}

/**
 * Config-driven sidebar navigation.
 *
 * Renders a list of `SidebarNavItem` objects as `SidebarLink` buttons,
 * grouped by optional `group` labels. Each item carries its own `onTap`
 * callback so the consumer controls what happens per item (e.g. routing).
 */
export function SidebarNav({ items, activeIndex, className }: SidebarNavProps) {
  // Group items while preserving original indices
  const groups = useMemo(() => {
    const result: {
      group: string | undefined;
      entries: { item: SidebarNavItem; index: number }[];
    }[] = [];
    let currentGroup: (typeof result)[number] | undefined;

    items.forEach((item, index) => {
      if (!currentGroup || currentGroup.group !== item.group) {
        currentGroup = { group: item.group, entries: [] };
        result.push(currentGroup);
      }
      currentGroup.entries.push({ item, index });
    });

    return result;
  }, [items]);

  return (
    <div
      data-slot="sidebar-nav"
      className={cn('flex flex-col gap-2', className)}
    >
      {groups.map((group) => (
        <SidebarGroup key={group.group ?? '__default'} label={group.group}>
          {group.entries.map(({ item, index }) => (
            <SidebarLink
              key={index}
              icon={item.icon}
              label={item.label}
              active={index === activeIndex}
              onClick={item.onTap}
            />
          ))}
        </SidebarGroup>
      ))}
    </div>
  );
}

/* ─── SidebarProfileConfig (type) ──────────────────────────────────────────── */

export interface SidebarProfileConfig {
  /** Avatar or icon for the profile row. */
  icon: React.ReactNode;
  /** Display name. */
  label: string;
  /** Optional subtitle (e.g. email or role). */
  subtitle?: string;
}

/* ─── SidebarProfileMenuItem (type) ────────────────────────────────────────── */

export interface SidebarProfileMenuItem {
  icon: React.ReactNode;
  label: string;
  onTap: () => void;
  /** Render as destructive (red) — e.g. logout. */
  variant?: 'default' | 'destructive';
  /** Insert a separator before this item. */
  separator?: boolean;
}

/* ─── SidebarProfileDropdown (internal) ────────────────────────────────────── */

function SidebarProfileDropdown({
  profile,
  menuItems,
}: {
  profile: SidebarProfileConfig;
  menuItems: SidebarProfileMenuItem[];
}) {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-slot="sidebar-profile-trigger"
          type="button"
          className={cn(
            'group flex items-center px-3 py-3 text-sm font-medium transition-colors w-full',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            !isExpanded && 'justify-center px-0'
          )}
        >
          <span className="flex-shrink-0 size-7">{profile.icon}</span>
          <span
            className={cn(
              'overflow-hidden whitespace-nowrap transition-all duration-300 flex flex-col items-start',
              isExpanded ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'
            )}
          >
            <span className="text-sm font-medium leading-tight">
              {profile.label}
            </span>
            {profile.subtitle && (
              <span className="text-xs text-muted-foreground leading-tight truncate max-w-[140px]">
                {profile.subtitle}
              </span>
            )}
          </span>
          {isExpanded && (
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground flex-shrink-0" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={isExpanded ? 'top' : 'right'}
        align={isExpanded ? 'center' : 'end'}
        sideOffset={isExpanded ? 8 : 12}
        className={cn(
          'rounded-lg',
          isExpanded
            ? 'w-[calc(var(--radix-dropdown-menu-trigger-width)-1rem)]'
            : 'min-w-56'
        )}
      >
        {menuItems.map((item, i) => (
          <React.Fragment key={i}>
            {item.separator && (
              <DropdownMenuSeparator className="mx-2 my-1.5" />
            )}
            <DropdownMenuItem onClick={item.onTap} variant={item.variant}>
              <span className="flex-shrink-0 size-4">{item.icon}</span>
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── SidebarLayout (fully config-driven) ──────────────────────────────────── */

export interface SidebarLayoutProps {
  /** Header slot — typically a logo or brand element. */
  header: React.ReactNode;
  /** Navigation items for the middle slot. Each carries its own onTap. */
  items: SidebarNavItem[];
  /** Currently selected item index. */
  activeIndex: number;
  /** Profile config for the bottom slot. Clicking opens a dropdown. */
  profile?: SidebarProfileConfig;
  /** Dropdown menu items shown when the profile is clicked. */
  profileMenuItems?: SidebarProfileMenuItem[];
  className?: string;
}

/**
 * Fully config-driven sidebar layout.
 *
 * Composes `Sidebar`, `SidebarHeader`, `SidebarContent` (with `SidebarNav`),
 * and `SidebarFooter` from a single props object. The profile at the bottom
 * opens a dropdown menu with configurable actions (settings, logout, etc.).
 */
export function SidebarLayout({
  header,
  items,
  activeIndex,
  profile,
  profileMenuItems,
  className,
}: SidebarLayoutProps) {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  return (
    <Sidebar className={className}>
      <SidebarHeader
        className={cn(
          'flex items-center',
          isExpanded ? 'justify-between' : 'justify-center'
        )}
      >
        {isExpanded && header}
        <SidebarTrigger />
      </SidebarHeader>

      <div className="border-b border-sidebar-border" />

      <SidebarContent className="pt-3">
        <SidebarNav items={items} activeIndex={activeIndex} />
      </SidebarContent>

      {profile && (
        <SidebarFooter>
          <SidebarProfileDropdown
            profile={profile}
            menuItems={profileMenuItems ?? []}
          />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
