'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import styles from '@/components/Doctor.module.css';
import { getCasesAction } from '@/lib/actions/cases';

interface Case {
  id: string;
  patientId: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  status: 'PENDING_REVIEW' | 'IN_REVIEW' | 'COMPLETED';
  createdAt: string;
  accessionNumber: string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING_REVIEW: '#f59e0b',
  IN_REVIEW: '#3b82f6',
  COMPLETED: '#10b981',
};

export default function DoctorDashboardClient() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCases() {
      const result = await getCasesAction();
      if (result.success) setCases(result.data);
      setLoading(false);
    }
    loadCases();
  }, []);

  if (loading) {
    return (
      <div
        className={styles.container}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}
      >
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#64748b' }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Worklist</h1>
          <p className={styles.subtitle}>
            {cases.length} assigned {cases.length === 1 ? 'study' : 'studies'}
          </p>
        </div>
      </header>

      {cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>All clear. No studies requiring attention.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Column header */}
          <div
            className={styles.card}
            style={{
              opacity: 0.45,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              pointerEvents: 'none',
              cursor: 'default',
            }}
          >
            <span>Type</span>
            <span>Patient</span>
            <span>Accession</span>
            <span>Date</span>
            <span>Status</span>
            <span />
          </div>

          {cases.map(study => (
            <div key={study.id} className={styles.card} onClick={() => router.push(`/doctor/cases/${study.id}`)}>
              <span className={styles.modalityBadge}>{study.modality}</span>

              <div>
                <div className={styles.patientName}>{study.patientName}</div>
                <div className={styles.patientId}>{study.patientId}</div>
              </div>

              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                {study.accessionNumber}
              </span>

              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {new Date(study.createdAt).toLocaleDateString()}
              </span>

              <div className={styles.statusIndicator}>
                <div className={styles.pulser} style={{ background: STATUS_COLOR[study.status] ?? '#64748b' }} />
                <span style={{ color: STATUS_COLOR[study.status] ?? '#64748b', fontWeight: 600 }}>
                  {study.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                <ArrowUpRight size={14} style={{ color: '#64748b' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
