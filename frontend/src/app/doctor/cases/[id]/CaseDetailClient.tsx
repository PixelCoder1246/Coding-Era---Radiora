'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BrainCircuit, Loader2, PanelRightClose, PanelRightOpen, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from '@/components/Doctor.module.css';
import { updateCaseStatusAction } from '@/lib/actions/cases';

interface CaseDetails {
  id: string;
  patientName: string;
  patientId: string;
  patientEmail: string;
  patientPhone: string;
  modality: string;
  bodyPart: string;
  accessionNumber: string;
  studyDate: string;
  pacsViewerUrl: string | null; // OHIF via OE2
  pacsWebViewerUrl: string | null; // Orthanc Web Viewer (reliable)
  status: string;
}

interface AiResult {
  findings: string;
  confidence: number;
  annotations: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }[];
}

export default function CaseDetailClient({ caseData }: { caseData: CaseDetails }) {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [findings, setFindings] = useState('');
  const [viewerLoaded, setViewerLoaded] = useState(false);
  const router = useRouter();

  // Explorer is primary (confirmed working). Web viewer is secondary option.
  const primaryViewerUrl = caseData.pacsViewerUrl;
  const secondaryViewerUrl = caseData.pacsWebViewerUrl;

  useEffect(() => {
    if (caseData.status === 'PENDING_REVIEW') {
      updateCaseStatusAction(caseData.id, 'IN_REVIEW');
    }
  }, [caseData.id, caseData.status]);

  const simulateAi = () => {
    setLoadingAi(true);
    setAiResult(null);
    setTimeout(() => {
      setAiResult({
        findings: 'Nodule detected in right lower lobe.',
        confidence: 0.89,
        annotations: [{ x: 48, y: 32, width: 70, height: 70, label: 'suspected_lesion', confidence: 0.89 }],
      });
      setLoadingAi(false);
    }, 2800);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    const result = await updateCaseStatusAction(caseData.id, 'COMPLETED');
    if (result.success) {
      router.push('/doctor');
    } else {
      setIsFinishing(false);
    }
  };

  return (
    <div className={styles.studyContainer}>
      {/* Maximized Viewer Pane */}
      <div className={styles.viewerPane}>
        {/* Back */}
        <button
          className="absolute top-6 left-6 z-50 bg-slate-900/80 p-2 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-colors"
          onClick={() => router.push('/doctor')}
        >
          <ArrowLeft size={16} />
        </button>

        {/* Open in Stone Viewer button (secondary) */}
        {secondaryViewerUrl && (
          <a
            href={secondaryViewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-6 left-20 z-50 bg-slate-900/80 px-3 py-2 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ExternalLink size={13} />
            Stone Viewer
          </a>
        )}

        {primaryViewerUrl ? (
          <iframe
            key={primaryViewerUrl}
            src={primaryViewerUrl}
            className={styles.viewerFrame}
            title="DICOM Diagnostic Workspace"
            allow="cross-origin-isolated"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <p className="text-slate-600 text-sm font-medium">No PACS viewer configured.</p>
          </div>
        )}

        {/* AI Bounding Box Overlay */}
        {aiResult && (
          <div className={styles.aiOverlay}>
            {aiResult.annotations.map((ann, i) => (
              <div
                key={i}
                className={styles.boundingBox}
                style={{
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  width: `${ann.width}px`,
                  height: `${ann.height}px`,
                }}
              >
                <div className={styles.aiLabel}>
                  {ann.label.toUpperCase()} {Math.round(ann.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating AI Button */}
        <button className={styles.aiToggle} onClick={simulateAi} disabled={loadingAi}>
          {loadingAi ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
          <span>{loadingAi ? 'Extracting Insights...' : 'Assistant AI'}</span>
        </button>
      </div>

      {/* Side Panel */}
      <aside
        className={styles.sidePanel}
        style={{ width: sidePanelOpen ? '320px' : '0', borderLeft: sidePanelOpen ? '' : 'none' }}
      >
        <div className={styles.panelHeader}>
          <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Study Details</span>
          <button className="text-slate-600 hover:text-white transition-colors" onClick={() => setSidePanelOpen(false)}>
            <PanelRightClose size={18} />
          </button>
        </div>

        <div className={styles.panelContent}>
          <div className="space-y-2">
            <div>
              <div className={styles.sectionTitle}>Patient Information</div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Full Name</span>
                <span className={styles.detailValue}>{caseData.patientName}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Medical ID</span>
                <span className={styles.detailValue}>{caseData.patientId}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Contact Email</span>
                <span className={styles.detailValue}>{caseData.patientEmail}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className={styles.sectionTitle}>Study Findings</div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Accession Number</span>
                <span className={styles.detailValue}>{caseData.accessionNumber}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Modality</span>
                <span className={styles.detailValue}>
                  {caseData.modality} ({caseData.bodyPart})
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Study Date</span>
                <span className={styles.detailValue}>{new Date(caseData.studyDate).toLocaleDateString()}</span>
              </div>
            </div>

            {aiResult && (
              <div className="mt-6 pt-6 border-t border-slate-900">
                <div className={styles.sectionTitle} style={{ color: '#a78bfa' }}>
                  AI Insights
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{aiResult.findings}</p>
                <div className="text-[10px] text-slate-500 mt-2 font-bold">
                  CONFIDENCE: {Math.round(aiResult.confidence * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.reportingArea}>
          <textarea
            className={styles.findingInput}
            placeholder="Type clinical impressions..."
            value={findings}
            onChange={e => setFindings(e.target.value)}
          />
          <button className={styles.actionButton} onClick={handleFinish} disabled={isFinishing}>
            {isFinishing ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Complete Review & Sign'}
          </button>
        </div>
      </aside>

      {!sidePanelOpen && (
        <button
          className="absolute top-6 right-6 z-50 bg-slate-900/80 p-2 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-colors"
          onClick={() => setSidePanelOpen(true)}
        >
          <PanelRightOpen size={16} />
        </button>
      )}
    </div>
  );
}
