import React from 'react';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AuthProviderWrapper } from './auth-provider';
import { LocalizationWrapper } from './localization-provider';
import { ThemeWrapper } from './theme-provider';
import { ToastProvider } from '@automatize/ui/web';
import './globals.css';

// Inline anti-flash script — prevents flash of wrong theme before hydration.
// Reads the same localStorage key as createWebStorageAdapter().
const ANTI_FLASH_SCRIPT = `
(function(){
  try {
    var p = localStorage.getItem('theme-preference');
    var isDark = (p === 'dark') ||
      ((p === 'system' || !p) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export const metadata: Metadata = {
  title: 'Automatize - Invoice Management',
  description: 'Professional invoice and client management',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }} />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <ThemeWrapper>
          <LocalizationWrapper>
            <AuthProviderWrapper>
              <ToastProvider>{children}</ToastProvider>
            </AuthProviderWrapper>
          </LocalizationWrapper>
        </ThemeWrapper>
      </body>
    </html>
  );
}
