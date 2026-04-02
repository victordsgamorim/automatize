import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

/* ─── Mock useSidebar from @automatize/ui/web ──────────────────────────── */

const mockUseSidebar = vi.fn();

vi.mock('@automatize/ui/web', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@automatize/ui/web');
  return {
    ...actual,
    useSidebar: () => mockUseSidebar(),
  };
});

import { SidebarLogo } from '../SidebarLogo.web';

/* ─── Tests ──────────────────────────────────────────────────────────────── */

describe('SidebarLogo (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Expanded state ──────────────────────────────────────────────────────

  describe('expanded state', () => {
    it('renders brand name when sidebar is open (desktop)', () => {
      mockUseSidebar.mockReturnValue({
        open: true,
        isMobile: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<SidebarLogo />);
      expect(screen.getByText('Automatize')).toBeDefined();
    });

    it('renders brand name when mobile (even if sidebar is closed)', () => {
      mockUseSidebar.mockReturnValue({
        open: false,
        isMobile: true,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<SidebarLogo />);
      expect(screen.getByText('Automatize')).toBeDefined();
    });
  });

  // ── Collapsed state ─────────────────────────────────────────────────────

  describe('collapsed state', () => {
    it('hides brand name when sidebar is collapsed and not mobile', () => {
      mockUseSidebar.mockReturnValue({
        open: false,
        isMobile: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<SidebarLogo />);
      expect(screen.queryByText('Automatize')).toBeNull();
    });
  });

  // ── Brand name prop ─────────────────────────────────────────────────────

  describe('brandName prop', () => {
    it('uses default brand name "Automatize"', () => {
      mockUseSidebar.mockReturnValue({
        open: true,
        isMobile: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<SidebarLogo />);
      expect(screen.getByText('Automatize')).toBeDefined();
    });

    it('renders custom brand name', () => {
      mockUseSidebar.mockReturnValue({
        open: true,
        isMobile: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<SidebarLogo brandName="MyApp" />);
      expect(screen.getByText('MyApp')).toBeDefined();
      expect(screen.queryByText('Automatize')).toBeNull();
    });
  });

  // ── Logo icon ───────────────────────────────────────────────────────────

  describe('logo icon', () => {
    it('always renders the logo square regardless of sidebar state', () => {
      mockUseSidebar.mockReturnValue({
        open: false,
        isMobile: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<SidebarLogo />);
      const logo = document.querySelector('.bg-primary');
      expect(logo).toBeTruthy();
    });
  });
});
