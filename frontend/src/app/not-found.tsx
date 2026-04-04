'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/components/AdminAuth.module.css';

export default function NotFound() {
  React.useEffect(() => {
    document.body.classList.add('hide-navbar');
    return () => document.body.classList.remove('hide-navbar');
  }, []);

  return (
    <div className={styles.container} style={{ minHeight: '100vh', textAlign: 'center' }}>
      <div className={styles.authCard} style={{ maxWidth: '500px' }}>
        <h1
          style={{
            fontSize: '6rem',
            margin: 0,
            background: 'linear-gradient(135deg, var(--primary), #9333ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--secondary-foreground)', marginBottom: '2rem' }}>
          It seems you've wandered into an uncharted region of the Radiora workspace.
        </p>
        <Link href="/" className="btn-primary" style={{ padding: '0.75rem 2rem', textDecoration: 'none' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
