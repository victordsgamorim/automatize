import { ReactNode } from 'react';
import styles from './auth-layout.module.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Automatize</h1>
          <p className={styles.subtitle}>Gestão de Faturas Profissional</p>
        </div>
        {children}
      </div>
    </div>
  );
}
