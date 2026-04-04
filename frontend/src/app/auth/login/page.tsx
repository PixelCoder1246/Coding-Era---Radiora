'use client';

import React, { useState } from 'react';
import styles from '@/components/AdminAuth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

type Role = 'ADMIN' | 'USER';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setModal(prev => ({ ...prev, isOpen: false }));

    const payload = { email, password };
    console.log(`Submitting ${role} Login Payload:`, payload);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      console.log('Login Response:', data);

      setModal({
        isOpen: true,
        type: 'success',
        message: 'Login successful! Welcome back.',
      });

      setTimeout(() => {
        router.push('/');
        router.refresh(); // Fetch new auth state in layout
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An error occurred during login';
      setModal({
        isOpen: true,
        type: 'error',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Welcome back to the Radiora workspace</p>

          <div className={styles.roleSelector}>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'USER' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('USER')}
            >
              User
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'ADMIN' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('ADMIN')}
            >
              Admin
            </button>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <AuthModal
            isOpen={modal.isOpen}
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
          />

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          Need access?{' '}
          <Link href="/auth/register" className={styles.link}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
