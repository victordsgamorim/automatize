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
    router.push('/login');
  };

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <h2 className={styles.logoText}>Automatize</h2>
      </div>

      <ul className={styles.menu}>
        <li>
          <Link
            href="/"
            className={`${styles.menuItem} ${isActive('/') ? styles.active : ''}`}
          >
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/invoices"
            className={`${styles.menuItem} ${isActive('/invoices') ? styles.active : ''}`}
          >
            📄 Faturas
          </Link>
        </li>
        <li>
          <Link
            href="/clients"
            className={`${styles.menuItem} ${isActive('/clients') ? styles.active : ''}`}
          >
            👥 Clientes
          </Link>
        </li>
        <li>
          <Link
            href="/products"
            className={`${styles.menuItem} ${isActive('/products') ? styles.active : ''}`}
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
