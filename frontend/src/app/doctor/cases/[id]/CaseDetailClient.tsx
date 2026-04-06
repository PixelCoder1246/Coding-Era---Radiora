'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  BrainCircuit,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from '@/components/Doctor.module.css';
import { updateCaseStatusAction, getCaseDetailsAction } from '@/lib/actions/cases';

interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

interface AiResult {
  id: string;
  findings: string;
  confidence: number;
  annotations: Annotation[];
  analyzedAt: string;
}

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
  status: string;
  aiStatus: string;
  pacsViewerUrl: string | null;
  pacsWebViewerUrl: string | null;
  aiResult?: AiResult | null;
}

export default function CaseDetailClient({ caseData: initialData }: { caseData: CaseDetails }) {
  const [caseData, setCaseData] = useState<CaseDetails>(initialData);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [findings, setFindings] = useState('');
  const [iframeLoading, setIframeLoading] = useState(!!caseData.pacsViewerUrl);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const router = useRouter();

  const aiResult: AiResult | null = caseData.aiResult ?? null;
  const annotations: Annotation[] = Array.isArray(aiResult?.annotations) ? (aiResult!.annotations as Annotation[]) : [];

  // Mark in-review on mount
  useEffect(() => {
    if (caseData.status === 'PENDING_REVIEW') {
      updateCaseStatusAction(caseData.id, 'IN_REVIEW');
    }
  }, [caseData.id, caseData.status]);

  // Refresh AI results from backend
  const refreshAi = useCallback(async () => {
    setIsRefreshingAi(true);
    const result = await getCaseDetailsAction(caseData.id);
    if (result.success) setCaseData(result.data);
    setIsRefreshingAi(false);
  }, [caseData.id]);

  const handleFinish = async () => {
    setIsFinishing(true);
    const result = await updateCaseStatusAction(caseData.id, 'COMPLETED');
    if (result.success) {
      router.push('/doctor');
    } else {
      setIsFinishing(false);
    }
  };

  const aiStatusIcon = () => {
    switch (caseData.aiStatus) {
      case 'COMPLETED':
        return <CheckCircle size={13} style={{ color: '#a78bfa' }} />;
      case 'PROCESSING':
        return <Loader2 size={13} style={{ color: '#f59e0b', animation: 'spin 1s linear infinite' }} />;
      case 'FAILED':
        return <AlertCircle size={13} style={{ color: '#ef4444' }} />;
      default:
        return <Clock size={13} style={{ color: '#64748b' }} />;
    }
  };

  return (
    <div className={styles.studyContainer}>
      {/* Viewer Pane */}
      <div className={styles.viewerPane}>
        {/* Back button */}
        <button
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            zIndex: 50,
            background: 'rgba(15,23,42,0.85)',
            padding: '0.5rem',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
          onClick={() => router.push('/doctor')}
        >
          <ArrowLeft size={16} />
        </button>

        {/* Stone Viewer link */}
        {caseData.pacsWebViewerUrl && (
          <a
            href={caseData.pacsWebViewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '4.5rem',
              zIndex: 50,
              background: 'rgba(15,23,42,0.85)',
              padding: '0.5rem 0.875rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <ExternalLink size={13} />
            STONE VIEWER
          </a>
        )}

        {/* AI status badge — click to toggle annotation overlay */}
        <button
          onClick={() => setShowAnnotations(v => !v)}
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            zIndex: 50,
            background: showAnnotations ? 'rgba(15,23,42,0.9)' : 'rgba(30,10,60,0.9)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${showAnnotations ? 'rgba(167,139,250,0.3)' : 'rgba(167,139,250,0.6)'}`,
            padding: '0.6rem 1rem',
            borderRadius: '9999px',
            color: '#a78bfa',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <BrainCircuit size={14} />
          {aiStatusIcon()}
          <span>
            {caseData.aiStatus === 'COMPLETED'
              ? showAnnotations
                ? '✦ AI Overlays ON'
                : '✧ AI Overlays OFF'
              : caseData.aiStatus === 'PROCESSING'
                ? 'AI Analyzing…'
                : caseData.aiStatus === 'FAILED'
                  ? 'AI Failed'
                  : 'No AI Analysis'}
          </span>
        </button>

        {/* Iframe loader overlay */}
        {iframeLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
              zIndex: 20,
              gap: '1rem',
            }}
          >
            <Loader2 size={36} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em' }}>
              LOADING DIAGNOSTIC VIEW…
            </p>
          </div>
        )}

        {/* DICOM viewer iframe */}
        {caseData.pacsViewerUrl ? (
          <iframe
            key={caseData.pacsViewerUrl}
            src={caseData.pacsViewerUrl}
            className={styles.viewerFrame}
            title="DICOM Viewer"
            allow="cross-origin-isolated"
            onLoad={() => setIframeLoading(false)}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: '#475569',
            }}
          >
            <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No PACS viewer configured.</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Ask your admin to set up the PACS integration.</p>
          </div>
        )}

        {aiResult && annotations.length > 0 && !iframeLoading && showAnnotations && (
          <div
            className={styles.aiOverlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 
              Since the DICOM viewer (iFrame) dynamically scales and centers the image, 
              we wrap the bounding boxes in an absolute-centered container. 
              The scale is set to a standard 512x512 coordinate map.
            */}
            <div style={{ position: 'relative', width: '512px', height: '512px', backgroundColor: 'transparent' }}>
              {annotations.map((ann, i) => (
                <div
                  key={i}
                  className={styles.boundingBox}
                  style={{
                    left: `${ann.x}px`,
                    top: `${ann.y}px`,
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
          </div>
        )}
      </div>

      {/* Side Panel */}
      <aside
        className={styles.sidePanel}
        style={{
          width: sidePanelOpen ? '380px' : '0',
          borderLeft: sidePanelOpen ? undefined : 'none',
        }}
      >
        <div className={styles.panelHeader}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#64748b',
            }}
          >
            Study Details
          </span>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              padding: '0.25rem',
            }}
            onClick={() => setSidePanelOpen(false)}
          >
            <PanelRightClose size={18} />
          </button>
        </div>

        <div className={styles.panelContent}>
          {/* Patient */}
          <div className={styles.sectionTitle}>Patient</div>
          {[
            { label: 'Name', value: caseData.patientName },
            { label: 'ID', value: caseData.patientId },
            { label: 'Email', value: caseData.patientEmail || '—' },
            { label: 'Phone', value: caseData.patientPhone || '—' },
          ].map(({ label, value }) => (
            <div key={label} className={styles.detailItem}>
              <span className={styles.detailLabel}>{label}</span>
              <span className={styles.detailValue}>{value}</span>
            </div>
          ))}

          {/* Study */}
          <div className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>
            Study
          </div>
          {[
            { label: 'Accession', value: caseData.accessionNumber },
            { label: 'Modality', value: `${caseData.modality}${caseData.bodyPart ? ` · ${caseData.bodyPart}` : ''}` },
            { label: 'Date', value: caseData.studyDate ? new Date(caseData.studyDate).toLocaleDateString() : '—' },
          ].map(({ label, value }) => (
            <div key={label} className={styles.detailItem}>
              <span className={styles.detailLabel}>{label}</span>
              <span className={styles.detailValue}>{value}</span>
            </div>
          ))}

          {/* AI Results */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              marginBottom: '1.25rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.075em',
                color: '#a78bfa',
              }}
            >
              AI Insights
            </span>
            <button
              onClick={refreshAi}
              disabled={isRefreshingAi}
              title="Refresh AI results"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#a78bfa',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
                opacity: isRefreshingAi ? 0.5 : 1,
              }}
            >
              <RefreshCw size={14} style={isRefreshingAi ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          </div>

          {aiResult ? (
            <>
              <div className={styles.detailItem} style={{ alignItems: 'flex-start' }}>
                <span className={styles.detailLabel} style={{ marginTop: '0.2rem' }}>
                  Findings
                </span>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--foreground)',
                    lineHeight: 1.6,
                    fontWeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    paddingRight: '0.5rem',
                  }}
                >
                  {aiResult.findings
                    .split('; ')
                    .filter(Boolean)
                    .map((finding, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', wordBreak: 'break-word' }}>
                        <span style={{ color: '#a78bfa' }}>•</span>
                        <span>{finding.trim()}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Confidence</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div
                    style={{
                      flex: 1,
                      height: '4px',
                      background: 'var(--border)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round(aiResult.confidence * 100)}%`,
                        height: '100%',
                        background: '#a78bfa',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>
                    {Math.round(aiResult.confidence * 100)}%
                  </span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Analyzed</span>
                <span className={styles.detailValue}>{new Date(aiResult.analyzedAt).toLocaleString()}</span>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(100,116,139,0.05)',
                borderRadius: '0.5rem',
                border: '1px dashed rgba(100,116,139,0.2)',
                textAlign: 'center',
              }}
            >
              <BrainCircuit
                size={20}
                style={{ margin: '0 auto 0.5rem', opacity: 0.25, display: 'block', color: '#a78bfa' }}
              />
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                {caseData.aiStatus === 'PROCESSING'
                  ? 'AI analysis in progress… click refresh to check.'
                  : caseData.aiStatus === 'FAILED'
                    ? 'AI analysis failed. Try re-uploading the study.'
                    : 'No AI analysis for this study yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Reporting area */}
        <div className={styles.reportingArea}>
          <textarea
            className={styles.findingInput}
            placeholder="Clinical impressions…"
            value={findings}
            onChange={e => setFindings(e.target.value)}
          />
          <button className={styles.actionButton} onClick={handleFinish} disabled={isFinishing}>
            {isFinishing ? (
              <Loader2 style={{ animation: 'spin 1s linear infinite', margin: '0 auto', display: 'block' }} size={18} />
            ) : (
              'Complete Review & Sign'
            )}
          </button>
        </div>
      </aside>

      {/* Sidebar pull-tab to reopen */}
      {!sidePanelOpen && (
        <button
          style={{
            position: 'fixed',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            zIndex: 1010,
            background: 'rgba(15,23,42,0.9)',
            padding: '1.25rem 0.5rem',
            borderRadius: '0.75rem 0 0 0.75rem',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRight: 'none',
            color: '#a78bfa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.4)',
          }}
          onClick={() => setSidePanelOpen(true)}
        >
          <PanelRightOpen size={18} />
        </button>
      )}
    </div>
  );
}
