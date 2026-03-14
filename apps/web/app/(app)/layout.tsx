'use client';

import React, { useEffect } from 'react';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { useRouter } from 'next/navigation';
import styles from './app-layout.module.css';
import Navigation from './navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserAuthentication();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
