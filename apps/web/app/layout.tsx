import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AuthProviderWrapper } from './auth-provider';
import { LocalizationWrapper } from './localization-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Automatize - Invoice Management',
  description: 'Professional invoice and client management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <LocalizationWrapper>
          <AuthProviderWrapper>{children}</AuthProviderWrapper>
        </LocalizationWrapper>
      </body>
    </html>
  );
}
