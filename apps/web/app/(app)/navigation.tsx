'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@automatize/auth';
import styles from './navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth() as any;
  const { logout, user } = auth;

  const handleLogout = async () => {
    await logout?.();
    router.push('/(auth)/login');
  };

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <h2 className={styles.logoText}>Automatize</h2>
      </div>

      <ul className={styles.menu}>
        <li>
          <Link
            href="/(app)"
            className={`${styles.menuItem} ${
              isActive('/(app)') && !isActive('/(app)/invoices') ? styles.active : ''
            }`}
          >
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/(app)/invoices"
            className={`${styles.menuItem} ${isActive('/(app)/invoices') ? styles.active : ''}`}
          >
            📄 Faturas
          </Link>
        </li>
        <li>
          <Link
            href="/(app)/clients"
            className={`${styles.menuItem} ${isActive('/(app)/clients') ? styles.active : ''}`}
          >
            👥 Clientes
          </Link>
        </li>
        <li>
          <Link
            href="/(app)/products"
            className={`${styles.menuItem} ${isActive('/(app)/products') ? styles.active : ''}`}
          >
            📦 Produtos
          </Link>
        </li>
      </ul>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sair
        </button>
      </div>
    </nav>
  );
}
