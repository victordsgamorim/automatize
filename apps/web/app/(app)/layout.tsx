'use client';

import { ReactNode } from 'react';
import { useIsAuthenticated } from '@automatize/auth';
import { useRouter } from 'next/navigation';
import styles from './app-layout.module.css';
import Navigation from './navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/(auth)/login');
    return null;
  }

  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
