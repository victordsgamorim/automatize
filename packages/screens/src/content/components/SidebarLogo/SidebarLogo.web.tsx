'use client';

import { useSidebar } from '@automatize/ui/web';

export interface SidebarLogoProps {
  /** Brand name text displayed when sidebar is expanded. */
  brandName?: string;
  className?: string;
}

export function SidebarLogo({ brandName = 'Automatize' }: SidebarLogoProps) {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="flex-shrink-0 size-8 rounded-lg bg-primary" />
      {isExpanded && (
        <span className="font-semibold text-sm whitespace-nowrap">
          {brandName}
        </span>
      )}
    </div>
  );
}
