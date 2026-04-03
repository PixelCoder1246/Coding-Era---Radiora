import React from 'react';
import styles from './ContentSection.module.css';

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ContentSection({ title, subtitle, children }: ContentSectionProps) {
  return (
    <div className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      
      <div className={styles.content}>
        <div className={styles.card}>
          {children}
        </div>
      </div>
    </div>
  );
}
