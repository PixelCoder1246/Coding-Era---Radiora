import { Database, ShieldCheck, Zap, Activity, Search, Cpu } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Orchestration Engine | Radiora Power',
  description:
    'Explore the autonomous PACS orchestration, HIS reconciliation, and AI-first workflows that power the Radiora orchestration engine.',
};

const FEATURE_CARDS = [
  {
    title: 'Autonomous PACS Polling',
    description:
      'The Radiora Engine monitors the Orthanc DICOM server in real-time. New studies are detected via C-FIND, extraction is triggered, and the database is updated without any manual intervention.',
    icon: Search,
    color: '#3b82f6',
  },
  {
    title: 'Deep DICOM Parsing',
    description:
      'We extract more than just headers. Our engine maps Modality, Body Part, Accession Numbers, and Referring Physicians directly into structured clinical records for immediate action.',
    icon: Database,
    color: '#8b5cf6',
  },
  {
    title: 'HIS Reconciliation',
    description:
      'Match incoming DICOM data against Hospital Information System (HIS) orders via the 13.204.42.87 endpoint. Ensures every case corresponds to an actual clinical order.',
    icon: Activity,
    color: '#10b981',
  },
  {
    title: 'Asynchronous AI Triggers',
    description:
      'Leverage Python-based AI inference the moment a study is ingested. Results are processed in the background and injected into the physician workstation as structured findings.',
    icon: Cpu,
    color: '#f59e0b',
  },
  {
    title: 'Intelligent Assignment',
    description:
      'A load-balanced routing engine that automatically assigns cases to the most specialized available doctor, ensuring 100% workflow coverage across the enterprise.',
    icon: Zap,
    color: '#ec4899',
  },
  {
    title: 'Enterprise Multi-Tenancy',
    description:
      'Built for large-scale clinical sites. Fully isolated PACS configurations, doctor registries, and audit logs per organization with RBAC security.',
    icon: ShieldCheck,
    color: '#06b6d4',
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ padding: '8rem 2rem 4rem', minHeight: '100vh', background: 'transparent' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(37,99,235,0.08)',
              border: '2px dashed rgba(37,99,235,0.4)',
              borderRadius: '50px',
              padding: '0.5rem 1.25rem',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1.5rem',
            }}
          >
            System Capabilities
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            The{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Radiora
            </span>{' '}
            Engine
          </h1>
          <p
            style={{
              color: 'var(--secondary-foreground)',
              fontSize: '1.2rem',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            An autonomous orchestration layer that bridges medical imaging hardware with clinical intelligence.
          </p>
        </div>

        {/* Feature Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '6rem',
          }}
        >
          {FEATURE_CARDS.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(10px)',
                  border: '2px dashed var(--border)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: f.color + '15',
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p
                  style={{
                    color: 'var(--secondary-foreground)',
                    fontSize: '0.95rem',
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

        {/* Bottom CTA Section */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.2)',
            border: '2px dashed var(--border)',
            borderRadius: '32px',
            padding: '4rem 2rem',
            textAlign: 'center',
            backdropFilter: 'blur(5px)',
          }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Autonomous Radiology.
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--secondary-foreground)',
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              fontWeight: 500,
            }}
          >
            Connect your PACS today and let Radiora handle the workflow orchestration.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="btn-primary" style={{ padding: '1.1rem 2.5rem' }}>
              Register Admin Node
            </Link>
            <Link href="/company/about" className="btn-outline" style={{ padding: '1.1rem 2.5rem' }}>
              Read the Vision
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
