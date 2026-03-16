'use client';

import React from 'react';
import Link from 'next/link';
import type { BreadcrumbProps } from '../types';

/**
 * Web implementation of Breadcrumb.
 *
 * Renders an accessible breadcrumb trail using `<nav>` + `<ol>` with
 * proper `aria-current` on the last (non-linkable) segment.
 *
 * Consumers can compose this with `@automatize/ui/web` Breadcrumb
 * primitives for richer styling, or use it standalone for the logic.
 */
export function Breadcrumb({
  segments,
  separator,
  className,
}: BreadcrumbProps): React.ReactElement {
  const sep = separator ?? (
    <span aria-hidden="true" style={{ margin: '0 0.25rem', opacity: 0.4 }}>
      /
    </span>
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.875rem',
        }}
      >
        {segments.map((segment, idx) => {
          const isLast = idx === segments.length - 1;
          return (
            <li
              key={segment.href ?? segment.label}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              {idx > 0 && sep}
              {isLast || !segment.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{ fontWeight: isLast ? 500 : 400 }}
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {segment.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
