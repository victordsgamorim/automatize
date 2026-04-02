'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@automatize/ui/web';
import type {
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '@automatize/ui/web';

export interface ProfileDropdownProps {
  /** Profile configuration (icon, label, subtitle). */
  profile: SidebarProfileConfig;
  /** Dropdown menu items shown when the profile is clicked. */
  menuItems: SidebarProfileMenuItem[];
}

export function ProfileDropdown({ profile, menuItems }: ProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-slot="profile-dropdown-trigger"
          type="button"
          className="flex-shrink-0 size-8 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={profile.label}
        >
          {profile.icon}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="rounded-lg min-w-56"
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
