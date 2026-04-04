'use client';

import React, { useState } from 'react';
import styles from '@/components/AdminAuth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

type Role = 'ADMIN' | 'USER';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    const payload = { name, email, password, role: 'ADMIN' };
    console.log(`Submitting Admin Register Payload:`, payload);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Registration failed. Please try again.');
      }

      setModal({
        isOpen: true,
        type: 'success',
        message: 'Registration successful! Welcome to Radiora.',
      });

      setTimeout(() => {
        router.push('/auth/login');
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An error occurred during registration';
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
          <h1 className={styles.title}>Admin Registration</h1>
          <p className={styles.subtitle}>Create your administrator account for Radiora</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <AuthModal
            isOpen={modal.isOpen}
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
          />

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className={styles.input}
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

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
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?{' '}
          <Link href="/auth/login" className={styles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
