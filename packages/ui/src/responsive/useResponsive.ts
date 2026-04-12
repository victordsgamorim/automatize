import { useContext } from 'react';
import { ResponsiveContext } from './ResponsiveProvider';
import type { ResponsiveContextValue } from './ResponsiveProvider';

/**
 * Returns the current responsive breakpoint state.
 * Must be used within a <ResponsiveProvider>.
 */
export function useResponsive(): ResponsiveContextValue {
  const ctx = useContext(ResponsiveContext);
  if (!ctx) {
    throw new Error(
      '[responsive] useResponsive() must be used within <ResponsiveProvider>.'
    );
  }
  return ctx;
}
