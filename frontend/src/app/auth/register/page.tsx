'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowRight } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

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
        message: 'Administrative account provisioned. Welcome to Radiora.',
      });

      setTimeout(() => {
        router.push('/auth/login');
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'System registration service unavailable';
      setModal({ isOpen: true, type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 75%)',
        backgroundAttachment: 'fixed',
        padding: '8rem 2rem 4rem',
        fontFamily: 'var(--font-main)',
        color: 'var(--foreground)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
        {/* Compact Registration Card Only */}
        <div
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <UserPlus size={20} color="var(--primary)" /> Admin Account
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)', fontWeight: 600 }}>
              Provision your root access credentials
            </p>
          </div>

          <AuthModal
            isOpen={modal.isOpen}
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
          />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: 'var(--secondary-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="Johnathan Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  padding: '0.8rem 1.1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: 'var(--secondary-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                System Email
              </label>
              <input
                type="email"
                placeholder="clinician@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.8rem 1.1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: 'var(--secondary-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Security Key
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  padding: '0.8rem 1.1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Processing…' : 'Finalize Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)', fontWeight: 600 }}>
              Already registered?{' '}
              <Link href="/auth/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
