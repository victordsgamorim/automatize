'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type {
  NavigationMenuProps,
  NavigationMenuItem,
  NavigationMenuGroup,
} from '../types';
import { isGroupedMenu } from '../types';

/**
 * Web implementation of NavigationMenu.
 *
 * Renders a vertical sidebar-style navigation with grouped sections.
 * Active item detection is automatic based on the current pathname.
 *
 * This is a logic component — visual styling should be applied via
 * className or composed with UI primitives from `@automatize/ui/web`.
 */
export function NavigationMenu({
  items,
  onItemSelect,
  className,
}: NavigationMenuProps): React.ReactElement {
  const pathname = usePathname();

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const handleSelect = useCallback(
    (item: NavigationMenuItem) => {
      onItemSelect?.(item);
    },
    [onItemSelect]
  );

  // Normalise flat items into a single anonymous group for uniform rendering.
  const groups: NavigationMenuGroup[] = isGroupedMenu(items)
    ? items
    : [{ items }];

  return (
    <nav className={className} role="navigation" aria-label="Main navigation">
      {groups.map((group, groupIdx) => (
        <div key={group.title ?? `group-${groupIdx}`} role="group">
          {group.title && (
            <span
              aria-hidden="true"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                opacity: 0.6,
                padding: '0.5rem 0.75rem',
                marginTop: groupIdx > 0 ? '0.75rem' : undefined,
              }}
            >
              {group.title}
            </span>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => handleSelect(item)}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: active ? 500 : 400,
                      color: 'inherit',
                      transition: 'background-color 0.15s',
                    }}
                    data-active={active || undefined}
                  >
                    {item.icon && (
                      <span aria-hidden="true" style={{ flexShrink: 0 }}>
                        {item.icon}
                      </span>
                    )}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge != null && (
                      <span
                        aria-label={`${item.badge} notifications`}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          minWidth: '1.25rem',
                          textAlign: 'center',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
