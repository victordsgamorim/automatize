'use client';

import { LayoutDashboard, FileText, Users, Package } from 'lucide-react';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { NavigationMenu, useNavigation } from '@automatize/navigation';
import type { NavigationMenuItem } from '@automatize/navigation';

const menuItems: NavigationMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    key: 'invoices',
    label: 'Faturas',
    href: '/invoices',
    icon: <FileText size={18} />,
  },
  {
    key: 'clients',
    label: 'Clientes',
    href: '/clients',
    icon: <Users size={18} />,
  },
  {
    key: 'products',
    label: 'Produtos',
    href: '/products',
    icon: <Package size={18} />,
  },
];

export default function Navigation() {
  const { logout, user } = useUserAuthentication();
  const { navigate } = useNavigation();

  const handleLogout = async () => {
    await logout?.();
    navigate('/login');
  };

  return (
    <nav
      style={{
        width: 260,
        background: 'var(--background, #ffffff)',
        borderRight: '1px solid var(--border, #e5e5e5)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '0 24px',
          marginBottom: 32,
          borderBottom: '1px solid var(--border, #e5e5e5)',
          paddingBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--foreground, #171717)',
            margin: 0,
          }}
        >
          Automatize
        </h2>
      </div>

      {/* Menu — delegated to @automatize/navigation */}
      <div style={{ flex: 1 }}>
        <NavigationMenu items={menuItems} />
      </div>

      {/* Footer — app-specific (auth, user info) */}
      <div
        style={{
          padding: 24,
          borderTop: '1px solid var(--border, #e5e5e5)',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              fontSize: 12,
              color: 'var(--muted-foreground, #737373)',
              margin: 0,
              wordBreak: 'break-all',
            }}
          >
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'var(--destructive-bg, #fee2e2)',
            color: 'var(--destructive, #991b1b)',
            border: '1px solid var(--destructive-border, #fecaca)',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
