import React, { createContext, useEffect, useState, useMemo } from 'react';
import { breakpoints } from '@automatize/ui/tokens';

import type { BreakpointName } from '@automatize/ui/tokens';

export interface ResponsiveContextValue {
  /** Viewport >= 640px */
  isSm: boolean;
  /** Viewport >= 768px */
  isMd: boolean;
  /** Viewport >= 1024px */
  isLg: boolean;
  /** Viewport >= 1280px */
  isXl: boolean;
  /** Viewport >= 1536px */
  is2xl: boolean;
  /** Convenience: true when viewport < lg (1024px) */
  isMobile: boolean;
}

export const ResponsiveContext = createContext<ResponsiveContextValue | null>(
  null
);

export interface ResponsiveProviderProps {
  children: React.ReactNode;
}

function getInitialState(): ResponsiveContextValue {
  return {
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2xl: false,
    isMobile: true,
  };
}

function queryFor(bp: BreakpointName): string {
  return `(min-width: ${breakpoints[bp]}px)`;
}

export function ResponsiveProvider({
  children,
}: ResponsiveProviderProps): React.JSX.Element {
  const [state, setState] = useState<ResponsiveContextValue>(getInitialState);

  useEffect(() => {
    const entries = Object.keys(breakpoints) as BreakpointName[];
    const mqls = entries.map((bp) => window.matchMedia(queryFor(bp)));

    const update = () => {
      const next: Record<string, boolean> = {};
      for (let i = 0; i < entries.length; i++) {
        next[entries[i]] = mqls[i].matches;
      }
      setState({
        isSm: next['sm'],
        isMd: next['md'],
        isLg: next['lg'],
        isXl: next['xl'],
        is2xl: next['2xl'],
        isMobile: !next['lg'],
      });
    };

    // Set initial values
    update();

    // Listen for changes
    for (const mql of mqls) {
      mql.addEventListener('change', update);
    }

    return () => {
      for (const mql of mqls) {
        mql.removeEventListener('change', update);
      }
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}
