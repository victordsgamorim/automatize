'use client';

import React, { useEffect } from 'react';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { useNavigation } from '@automatize/navigation';
import { SidebarProvider } from '@automatize/ui/web';
import styles from './app-layout.module.css';
import Navigation from './navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserAuthentication();
  const { navigate } = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <Navigation />
      <main className={styles.main}>{children}</main>
    </SidebarProvider>
  );
}
