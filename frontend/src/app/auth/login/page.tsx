'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Fingerprint, ShieldCheck, Stethoscope, Info } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const DEMO_CREDS = {
  admin: {
    email: '70001933arin@gmail.com',
    password: '123456',
    label: 'Admin Access',
    desc: 'System orchestration',
    icon: ShieldCheck,
    color: 'var(--primary)',
  },
  doctor: {
    email: 'cs2022299@global.org.in',
    password: 'cb5b35adf59f',
    label: 'Doctor Access',
    desc: 'Diagnostic workstation',
    icon: Stethoscope,
    color: '#10b981',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const fillCreds = (role: 'admin' | 'doctor') => {
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setModal(prev => ({ ...prev, isOpen: false }));

    try {
      // We always use the relative /api path to trigger the Next.js rewrite (proxy)
      // This ensures cookies are handled correctly on the same domain.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Invalid credentials. Please attempt again.');

      const data = await response.json();
      const redirectPath = data?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/doctor';

      setModal({ isOpen: true, type: 'success', message: 'Identity verified. Accessing system…' });
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'System authentication unavailable';
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
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.25fr',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        {/* Evaluation Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--foreground)',
                marginBottom: '0.4rem',
                letterSpacing: '-0.02em',
              }}
            >
              Evaluation Ready
            </h2>
            <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.8rem', lineHeight: '1.5', fontWeight: 500 }}>
              Initialize the clinical workspace with pre-configured datasets and physician profiles for immediate
              evaluation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(['admin', 'doctor'] as const).map(role => {
              const Icon = DEMO_CREDS[role].icon;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillCreds(role)}
                  style={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.15rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--foreground)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: role === 'admin' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: role === 'admin' ? 'var(--primary)' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{DEMO_CREDS[role].label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', fontWeight: 500 }}>
                      {DEMO_CREDS[role].desc}
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Info size={18} />
            <p>One-tap credential injection enabled for system evaluation.</p>
          </div>
        </div>

        {/* Login Right Panel */}
        <div
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '28px',
            padding: '3rem',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--foreground)',
                marginBottom: '0.35rem',
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Fingerprint size={24} color="var(--primary)" /> System Login
            </h1>
            <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.85rem', fontWeight: 600 }}>
              Secure Clinical Access Gateway
            </p>
          </div>

          <AuthModal
            isOpen={modal.isOpen}
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
          />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--secondary-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Identity
              </label>
              <input
                type="email"
                placeholder="clinician@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.875rem 1.15rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--secondary-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Access Key
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  padding: '0.875rem 1.15rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: '0.95rem',
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
                borderRadius: '16px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '0.75rem',
              }}
            >
              {loading ? 'Initializing Interface…' : 'Enter Workspace'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)', fontWeight: 600 }}>
              Need authorized access?{' '}
              <Link href="/auth/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
                Register Now
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
