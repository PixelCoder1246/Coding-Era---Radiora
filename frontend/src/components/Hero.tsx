'use client';

import React from 'react';
import Link from 'next/link';
import { User } from '@/lib/actions/auth';
import styles from './Hero.module.css';

export default function Hero({ user }: { user: User | null }) {
  const isAuthenticated = !!user;

  return (
    <section className={`${styles.hero} curvy-bg curvy-bg-alt`}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          Medical Imaging Workflow <br />
          <span className={styles.highlight}>Redefined</span>
        </h1>

        <p className={styles.subtitle}>
          The intelligent intersection of PACS, HIS, and AI. Empowering clinicians with seamless orchestration and
          faster diagnostic insights.
        </p>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <Link
              href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
              className="btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}
            >
              Get Started
            </Link>
          )}
          <button className="btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Learn More
          </button>
        </div>

        <div className={styles.mockupContainer}>
          <div className={styles.mockupHeader}>
            <div className={`${styles.dot} ${styles.dotRed}`}></div>
            <div className={`${styles.dot} ${styles.dotYellow}`}></div>
            <div className={`${styles.dot} ${styles.dotGreen}`}></div>
            <div className={styles.mockupUrl}>radiora.app/dashboard</div>
          </div>
          <div className={styles.mockupBody}>Interactive Dashboard Mockup</div>

          <div className={styles.decorativeBlob}></div>
        </div>
      </div>
    </section>
  );
}
