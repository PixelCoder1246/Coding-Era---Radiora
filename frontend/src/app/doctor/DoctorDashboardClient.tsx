'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, Calendar, Layers, ArrowUpRight } from 'lucide-react';
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

export default function DoctorDashboardClient() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCases() {
      const result = await getCasesAction();
      if (result.success) {
        setCases(result.data);
      }
      setLoading(false);
    }
    loadCases();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-slate-700" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Worklist</h1>
          <p className={styles.subtitle}>{cases.length} assigned studies</p>
        </div>

        <div className="flex gap-4 items-center">{/* Minimalism: No search or filters */}</div>
      </header>

      {/* Row-based high-density clinical worklist */}
      <div className={styles.grid}>
        {/* Table Header Mockup */}
        <div
          className={`${styles.card} border-b border-slate-900 opacity-40 font-bold uppercase tracking-widest text-[10px] pointer-events-none hover:bg-transparent`}
        >
          <span>Type</span>
          <span>Patient Name</span>
          <span>Accession</span>
          <span>Assigned Date</span>
          <span>Clinical Status</span>
          <span />
        </div>

        {cases.map(study => (
          <div key={study.id} className={styles.card} onClick={() => router.push(`/doctor/cases/${study.id}`)}>
            <div className={styles.modalityBadge}>{study.modality}</div>

            <div className="flex flex-col">
              <span className={styles.patientName}>{study.patientName}</span>
              <span className={styles.patientId}>{study.patientId}</span>
            </div>

            <span className="font-mono text-xs text-slate-500">{study.accessionNumber}</span>

            <span className="text-slate-500 text-xs">{new Date(study.createdAt).toLocaleDateString()}</span>

            <div className={`${styles.statusIndicator} ${styles[`status-${study.status}`]}`}>
              <div className={styles.pulser} />
              <span>{study.status.replace('_', ' ')}</span>
            </div>

            <div className="flex justify-end pr-2">
              <ArrowUpRight size={14} className="text-slate-700 transition-colors group-hover:text-blue-500" />
            </div>
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="text-center py-32">
          <p className="text-slate-700 text-sm font-medium">All clear. No studies requiring attention.</p>
        </div>
      )}
    </div>
  );
}
