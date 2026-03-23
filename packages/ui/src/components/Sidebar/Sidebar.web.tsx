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
import { PanelLeft } from 'lucide-react';
import { cn } from '../../utils';

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
      className={cn('mt-auto px-3 py-4', className)}
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
      {label && isExpanded && (
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
