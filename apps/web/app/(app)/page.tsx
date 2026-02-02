'use client';

import { useAuth } from '@automatize/auth';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const auth = useAuth() as any;
  const { user } = auth;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.welcomeCard}>
        <h2>Bem-vindo, {user?.email}! 👋</h2>
        <p>Você está logado com sucesso. Explore as seções no menu lateral.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📄</div>
          <h3>Faturas</h3>
          <p className={styles.cardText}>Gerencie suas faturas e emissões</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <h3>Clientes</h3>
          <p className={styles.cardText}>Organize seus clientes e contatos</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📦</div>
          <h3>Produtos</h3>
          <p className={styles.cardText}>Cadastre seus produtos e serviços</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <h3>Relatórios</h3>
          <p className={styles.cardText}>
            Veja análises e métricas do seu negócio
          </p>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3>ℹ️ Informações do App</h3>
        <p>
          Este é um projeto de gerenciamento de faturas com arquitetura
          offline-first, suportando Web, Mobile (iOS/Android) e Desktop
          (Windows).
        </p>
        <p>
          <strong>Stack:</strong> Next.js (Web), React Native + Expo (Mobile),
          WatermelonDB (Local), Supabase (Backend)
        </p>
      </div>
    </div>
  );
}
