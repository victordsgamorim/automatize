'use client';

import styles from '../invoices/page.module.css';

export default function ClientsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Clientes</h1>
      <div className={styles.placeholder}>
        <p>👥 Gestão de clientes - Em desenvolvimento</p>
        <p className={styles.subtitle}>
          Aqui você poderá adicionar e gerenciar seus clientes.
        </p>
      </div>
    </div>
  );
}
