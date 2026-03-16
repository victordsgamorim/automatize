'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import type { NavigationLinkProps } from '../types';

/**
 * Web implementation of NavigationLink.
 *
 * Renders a Next.js `<Link>` for internal routes and a plain `<a>` for
 * external URLs. This keeps the navigation logic abstracted while giving
 * the web platform proper prefetching, client-side transitions, and
 * accessible link semantics.
 */
export function NavigationLink({
  href,
  replace = false,
  external = false,
  children,
  accessibilityLabel,
  className,
  style,
  onPress,
}: NavigationLinkProps): React.ReactElement {
  const handleClick = useCallback(
    (_e: React.MouseEvent) => {
      onPress?.();
      // If onPress is provided but the consumer wants to prevent navigation,
      // they can call e.preventDefault() inside onPress.
      if (external) {
        // Let the browser handle external links natively.
        return;
      }
      // For internal links Next.js <Link> handles navigation.
    },
    [onPress, external]
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={accessibilityLabel}
        className={className}
        style={style as React.CSSProperties}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      replace={replace || undefined}
      aria-label={accessibilityLabel}
      className={className}
      style={style as React.CSSProperties}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
