'use client';

import styles from './page.module.css';

export default function InvoicesPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Faturas</h1>
      <div className={styles.placeholder}>
        <p>📄 Gestão de faturas - Em desenvolvimento</p>
        <p className={styles.subtitle}>Aqui você poderá criar, editar e gerenciar suas faturas.</p>
      </div>
    </div>
  );
}
