'use client';

import styles from '../invoices/page.module.css';

export default function ProductsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Produtos</h1>
      <div className={styles.placeholder}>
        <p>📦 Gestão de produtos - Em desenvolvimento</p>
        <p className={styles.subtitle}>Aqui você poderá cadastrar e gerenciar seus produtos e serviços.</p>
      </div>
    </div>
  );
}
