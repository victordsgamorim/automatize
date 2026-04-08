'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils';
import type { SidebarNavItem } from '../Sidebar/Sidebar.web';

export interface BottomNavigationProps {
  items: SidebarNavItem[];
  activeIndex: number;
  className?: string;
}

export function BottomNavigation({
  items,
  activeIndex,
  className,
}: BottomNavigationProps): React.JSX.Element {
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItem = itemRefs.current[activeIndex];
      const activeText = textRefs.current[activeIndex];
      if (activeItem && activeText) {
        activeItem.style.setProperty(
          '--lineWidth',
          `${activeText.offsetWidth}px`
        );
      }
    };

    setLineWidth();
    window.addEventListener('resize', setLineWidth);
    return () => window.removeEventListener('resize', setLineWidth);
  }, [activeIndex, items]);

  return (
    <nav
      data-slot="bottom-navigation"
      role="navigation"
      aria-label="Bottom navigation"
      className={cn(
        'flex items-stretch justify-around',
        'bg-sidebar border-t border-sidebar-border',
        'h-16 px-1 shrink-0',
        className
      )}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={item.label}
            type="button"
            onClick={item.onTap}
            ref={(el) => (itemRefs.current[index] = el)}
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5',
              'rounded-md py-2 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'flex items-center justify-center size-5 shrink-0',
                isActive && 'animate-icon-bounce'
              )}
            >
              {item.icon}
            </div>

            {/* Label */}
            <strong
              ref={(el) => (textRefs.current[index] = el)}
              className={cn(
                'text-[10px] font-semibold leading-none transition-opacity duration-200 whitespace-nowrap',
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              {item.label}
            </strong>

            {/* Active underline indicator */}
            <span
              className={cn(
                'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary transition-all duration-300',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
              style={{ width: 'var(--lineWidth, 0px)' }}
            />
          </button>
        );
      })}
    </nav>
  );
}
