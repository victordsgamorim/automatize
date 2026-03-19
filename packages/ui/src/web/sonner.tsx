'use client';

import { Toaster as Sonner, ToasterProps } from 'sonner';

export interface ThemedToasterProps extends ToasterProps {
  resolvedTheme?: 'light' | 'dark';
}

const Toaster = ({ resolvedTheme = 'light', ...props }: ThemedToasterProps) => {
  return (
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
