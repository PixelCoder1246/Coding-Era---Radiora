'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/actions/auth';
import {
  ArrowRight,
  Activity,
  Brain,
  Database,
  FileText,
  HardDrive,
  Layers,
  ShieldCheck,
  Stethoscope,
  Users,
  Zap,
  CheckCircle,
} from 'lucide-react';

const FEATURES = [
  {
    icon: HardDrive,
    color: '#3b82f6',
    title: 'Real-Time PACS Polling',
    description:
      'Continuously monitors your Orthanc DICOM server. New studies are detected, deduped, and ingested automatically — no manual uploads required.',
  },
  {
    icon: Database,
    color: '#8b5cf6',
    title: 'HIS Order Reconciliation',
    description:
      'Links every DICOM study to a Hospital Information System order via Accession Number, ensuring clinical context is always present before a case is created.',
  },
  {
    icon: Brain,
    color: '#f59e0b',
    title: 'AI-Powered Triage',
    description:
      'Asynchronous AI inference runs on each study immediately after ingestion. Findings surface directly inside the diagnostic workstation — no tab switching.',
  },
  {
    icon: Users,
    color: '#10b981',
    title: 'Smart Auto-Assignment',
    description:
      'Cases are automatically routed to the most available doctor based on concurrent case load, ensuring fair and efficient workload distribution.',
  },
  {
    icon: Layers,
    color: '#ec4899',
    title: 'Multi-Tenant Architecture',
    description:
      'Each organization operates in a fully isolated silo — separate configs, separate doctors, separate patient data. Enterprise-ready from day one.',
  },
  {
    icon: FileText,
    color: '#06b6d4',
    title: 'Structured Reporting',
    description:
      'Doctors submit structured findings with severity grading. Admins track the full case lifecycle from Unassigned through Completed in real time.',
  },
];

const STEPS = [
  {
    number: '01',
    icon: HardDrive,
    color: '#3b82f6',
    title: 'DICOM Arrives',
    description: 'A scan is uploaded to Orthanc. Radiora detects it on the next poll cycle and extracts metadata.',
  },
  {
    number: '02',
    icon: Zap,
    color: '#f59e0b',
    title: 'System Processes',
    description: 'Matched against a HIS order. A structured case is created, a doctor auto-assigned, and AI triggered.',
  },
  {
    number: '03',
    icon: Stethoscope,
    color: '#10b981',
    title: 'Doctor Reviews',
    description: 'The doctor opens the embedded DICOM viewer, reads AI findings, and submits a clinical report.',
  },
];

const STATS = [
  { value: 'Real-Time', label: 'PACS Polling' },
  { value: 'Auto', label: 'Doctor Assignment' },
  { value: 'AI-First', label: 'Diagnostic Triage' },
  { value: 'Multi-Tenant', label: 'Architecture' },
];

export default function Hero({ user }: { user: User | null }) {
  const isAuthenticated = !!user;
  const dashboardHref = user?.role === 'ADMIN' ? '/admin/dashboard' : '/doctor';

  return (
    <div style={{ fontFamily: 'var(--font-main)', color: 'var(--foreground)' }}>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          gap: '3rem',
          padding: '0 5rem',
          paddingTop: '5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--background)',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* LEFT — Text content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.18)',
              borderRadius: '50px',
              padding: '0.35rem 0.9rem',
              marginBottom: '1.5rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <Activity size={12} />
            Radiora · v0.3.7
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              marginBottom: '1.25rem',
              color: 'var(--foreground)',
            }}
          >
            The Platform That{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Powers Radiology
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--secondary-foreground)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              fontWeight: 500,
              maxWidth: '480px',
            }}
          >
            Radiora bridges your Orthanc PACS, HIS, and AI in one unified workstation — automatically creating cases,
            assigning doctors, and surfacing diagnostics the moment a scan arrives.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link
              href={isAuthenticated ? dashboardHref : '/auth/login'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--primary)',
                color: '#fff',
                padding: '0.8rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 8px 20px -6px rgba(37,99,235,0.4)',
              }}
            >
              {isAuthenticated ? 'Go to Workstation' : 'Enter Platform'}
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--muted)',
                color: 'var(--foreground)',
                padding: '0.8rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid var(--border)',
              }}
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--foreground)' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--secondary-foreground)', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Real screenshot */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: '0 30px 70px -15px rgba(0,0,0,0.25)',
            alignSelf: 'center',
          }}
        >
          {/* Browser chrome bar */}
          <div
            style={{
              background: 'var(--muted)',
              borderBottom: '1px solid var(--border)',
              padding: '0.6rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: '5px' }}>
              {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                background: 'var(--background)',
                borderRadius: '6px',
                padding: '0.2rem 0.75rem',
                fontSize: '0.68rem',
                color: 'var(--muted-foreground)',
                fontFamily: 'monospace',
                textAlign: 'center',
                border: '1px solid var(--border)',
              }}
            >
              radiora.app/doctor/cases
            </div>
          </div>
          {/* Full screenshot — no cropping */}
          <img
            src="/image.png"
            alt="Radiora Clinical Workstation"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              maxHeight: 'calc(100vh - 14rem)',
              objectFit: 'contain',
              objectPosition: 'top center',
            }}
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: '7rem 2rem',
          background: 'var(--muted)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.75rem',
              }}
            >
              Clinical Workflow
            </p>
            <h2
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              From scan to report in{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                three steps
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', position: 'relative' }}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '2.5rem 2rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Step number watermark */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      right: '1.5rem',
                      fontSize: '4rem',
                      fontWeight: 900,
                      opacity: 0.04,
                      color: step.color,
                      lineHeight: 1,
                      pointerEvents: 'none',
                    }}
                  >
                    {step.number}
                  </div>

                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: step.color + '15',
                      color: step.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <div
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      color: step.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Step {step.number}
                  </div>
                  <h3
                    style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--secondary-foreground)',
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {step.description}
                  </p>

                  {/* Connector arrow (not on last) */}
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '-1.1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: '24px',
                        height: '24px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowRight size={12} style={{ color: 'var(--primary)' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '7rem 2rem', background: 'var(--background)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.75rem',
              }}
            >
              Platform Capabilities
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
            >
              Everything a radiology department needs
            </h2>
            <p
              style={{
                color: 'var(--secondary-foreground)',
                fontSize: '1.05rem',
                maxWidth: '550px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              A complete orchestration stack — not a point solution. Built to replace manual radiology coordination
              entirely.
            </p>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}
          >
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '2rem',
                    transition: 'all 0.25s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = f.color + '60';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 12px 30px -10px ${f.color}25`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: f.color + '15',
                      color: f.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3
                    style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.01em' }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--secondary-foreground)',
                      lineHeight: 1.65,
                      fontWeight: 500,
                    }}
                  >
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLE BREAKDOWN ────────────────────────────────────────────── */}
      <section style={{ padding: '7rem 2rem', background: 'var(--muted)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.75rem',
              }}
            >
              Two Interfaces, One System
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              Built for every role
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Admin */}
            <div
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '2.5rem',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle at 100% 0%, rgba(37,99,235,0.1) 0%, transparent 70%)',
                }}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(37,99,235,0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                System Admin
              </h3>
              <p
                style={{
                  color: 'var(--secondary-foreground)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Full orchestration control. Configure PACS and HIS connections, manage doctors, monitor all cases, and
                configure poll intervals.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                {[
                  'Register & manage doctors',
                  'PACS / HIS configuration',
                  'Real-time case monitor',
                  'DICOM study oversight',
                ].map(item => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                    }}
                  >
                    <CheckCircle size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Doctor */}
            <div
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '2.5rem',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle at 100% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)',
                }}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(16,185,129,0.1)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <Stethoscope size={22} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Diagnostic Doctor
              </h3>
              <p
                style={{
                  color: 'var(--secondary-foreground)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                A focused clinical workstation. View assigned cases, open DICOM images, read AI findings, and submit
                structured reports — all in one place.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                {[
                  'Auto-assigned case queue',
                  'In-browser DICOM viewer',
                  'AI analysis results',
                  'Structured report submission',
                ].map(item => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                    }}
                  >
                    <CheckCircle size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '7rem 2rem',
          background: 'var(--background)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: '50px',
              padding: '0.4rem 1rem',
              marginBottom: '2rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <Zap size={13} />
            Ready to go
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
            }}
          >
            Start your clinical workspace today
          </h2>

          <p
            style={{
              color: 'var(--secondary-foreground)',
              fontSize: '1.05rem',
              lineHeight: 1.65,
              marginBottom: '3rem',
            }}
          >
            Create an admin account, connect your PACS and HIS, and your first case will be auto-created the moment a
            scan arrives.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={isAuthenticated ? dashboardHref : '/auth/register'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--primary)',
                color: '#fff',
                padding: '1.1rem 2.25rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 10px 30px -8px rgba(37,99,235,0.4)',
              }}
            >
              {isAuthenticated ? 'Open Workstation' : 'Create Admin Account'}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--muted)',
                color: 'var(--foreground)',
                padding: '1.1rem 2.25rem',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                border: '1px solid var(--border)',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
