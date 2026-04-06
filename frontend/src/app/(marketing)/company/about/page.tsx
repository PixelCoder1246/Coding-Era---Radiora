import { ShieldCheck, Zap, Activity, Brain, Target, Compass, HardDrive } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Vision | Radiora Power',
  description:
    'Radiora is a clinical orchestration engine designed to reduce physician burnout by eliminating friction between PACS servers and interpretation.',
};

export default function AboutPage() {
  return (
    <div style={{ padding: '8rem 2rem 4rem', minHeight: '100vh', background: 'transparent' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* About Hero */}
        <div style={{ marginBottom: '6rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            <Compass size={16} /> Autonomous Vision
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              marginBottom: '2.5rem',
            }}
          >
            Orchestrating <span style={{ color: 'var(--primary)' }}>Clinical</span> <br />
            Intelligence
          </h1>
          <p
            style={{
              fontSize: '1.4rem',
              color: 'var(--secondary-foreground)',
              lineHeight: 1.5,
              fontWeight: 500,
              maxWidth: '800px',
            }}
          >
            We believe that clinical data should be autonomous — moving effortlessly from PACS to theinterprting
            physician workstation.
          </p>
        </div>

        {/* Narrative Flow */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
            marginBottom: '6rem',
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              border: '2px dashed var(--border)',
              borderRadius: '24px',
              padding: '3rem',
            }}
          >
            <HardDrive size={32} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              PACS-Native
            </h3>
            <p style={{ color: 'var(--secondary-foreground)', lineHeight: 1.7, fontSize: '1rem', fontWeight: 500 }}>
              Radiora isn't built on top of imaging software — it integrates directly with PACS servers via DICOM
              polling, ensuring 1:1 metadata accuracy for every study ingested.
            </p>
          </div>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              border: '2px dashed var(--border)',
              borderRadius: '24px',
              padding: '3rem',
            }}
          >
            <Zap size={32} style={{ color: '#f59e0b', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Autonomous Engine
            </h3>
            <p style={{ color: 'var(--secondary-foreground)', lineHeight: 1.7, fontSize: '1rem', fontWeight: 500 }}>
              By reconciling PACS data with HIS orders automatically, we eliminate the administrative overhead of case
              creation, allowing interpreting physicians to focus purely on diagnostics.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4rem', letterSpacing: '-0.03em' }}>
            System Core
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {[
              { icon: Brain, label: 'DICOM Logic' },
              { icon: Activity, label: 'Asynchronous Workflow' },
              { icon: ShieldCheck, label: 'Secure Isolation' },
              { icon: Target, label: 'Mission Focus' },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '2px dashed var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
