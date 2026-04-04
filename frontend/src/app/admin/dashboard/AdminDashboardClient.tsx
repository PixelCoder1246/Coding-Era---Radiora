'use client';

import React, { useState } from 'react';
import { User } from '@/lib/actions/auth';
import {
  saveHisConfigAction,
  savePacsConfigAction,
  getIntegrationStatusAction,
  activateHisAction,
  activatePacsAction,
  getHisConfigAction,
  getPacsConfigAction,
  listPacsStudiesAction,
  deletePacsStudyAction,
} from '@/lib/actions/integration';
import {
  listDoctorsAction,
  addDoctorAction,
  deleteDoctorAction,
  resetDoctorPasswordAction,
} from '@/lib/actions/doctor';
import { getCasesAction, deleteCaseAction } from '@/lib/actions/cases';
import {
  Plus,
  Stethoscope,
  Database,
  Save,
  User as UserIcon,
  Power,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Activity,
  HardDrive,
  AlertCircle,
  Users,
  Info,
} from 'lucide-react';
import styles from '@/components/AdminDashboard.module.css';
import AuthModal from '@/components/AuthModal';
import DoctorRegistrationModal from '@/components/DoctorRegistrationModal';

interface Doctor {
  id: string;
  name: string;
  email: string;
  maxConcurrentCases: number;
  generatedPassword?: string;
}

interface CaseItem {
  id: string;
  patientName: string;
  modality: string;
  bodyPart?: string;
  status: string;
  aiStatus: string;
  createdAt: string;
  assignedDoctor?: { id: string; name: string; email: string } | null;
}

interface PacsStudy {
  orthancId: string;
  studyInstanceUID?: string;
  accessionNumber?: string;
  patientName?: string;
  modality?: string;
  studyDate?: string;
  seriesCount?: number;
  hasCase: boolean;
  caseId?: string;
  caseStatus?: string;
  caseDoctorName?: string;
  error?: string;
}

export default function AdminDashboardClient({ user }: { user: User }) {
  // Modal state for feedback
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

  const [integrationStatus, setIntegrationStatus] = React.useState<{
    pacs: { active: boolean; url?: string; activatedAt?: string };
    his: { active: boolean; url?: string; activatedAt?: string };
  }>({
    pacs: { active: false },
    his: { active: false },
  });

  const [loading, setLoading] = useState(false);

  // HIS Configuration State
  const [hisConfig, setHisConfig] = useState({
    url: '',
    apiKey: '',
  });

  // PACS Configuration State
  const [pacsConfig, setPacsConfig] = useState({
    url: '',
    username: '',
    password: '',
    pollIntervalSeconds: 0,
  });

  // Configuration visibility state
  const [showHisApiKey, setShowHisApiKey] = useState(false);
  const [showPacsPassword, setShowPacsPassword] = useState(false);

  // Admin Details State (Profile)
  const [adminDetails] = useState({
    name: user?.name || 'Admin Name',
    email: user?.email || 'Admin Email',
    password: '••••••••',
  });

  // Data for Doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Cases state
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);

  // PACS Studies state
  const [pacsStudies, setPacsStudies] = useState<PacsStudy[]>([]);
  const [pacsStudiesLoading, setPacsStudiesLoading] = useState(false);

  React.useEffect(() => {
    fetchStatus();
    fetchConfigs();
    fetchDoctors();
    fetchCases();
    fetchPacsStudies();
  }, []);

  const fetchConfigs = async () => {
    try {
      const his = await getHisConfigAction();
      if (his) {
        setHisConfig({
          url: his.url || '',
          apiKey: his.apiKey || '',
        });
      }

      const pacs = await getPacsConfigAction();
      if (pacs) {
        setPacsConfig({
          url: pacs.url || '',
          username: pacs.username || '',
          password: pacs.password || '',
          pollIntervalSeconds: pacs.pollIntervalSeconds || 30,
        });
      }
    } catch (err) {
      console.error('Failed to fetch configs:', err);
    }
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const status = await getIntegrationStatusAction();
      setIntegrationStatus(status);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await listDoctorsAction();
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const fetchCases = async () => {
    setCasesLoading(true);
    try {
      const result = await getCasesAction();
      if (result.success) setCases(result.data || []);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setCasesLoading(false);
    }
  };

  const fetchPacsStudies = async () => {
    setPacsStudiesLoading(true);
    try {
      const result = await listPacsStudiesAction();
      if (result.success) setPacsStudies(result.data || []);
    } catch (err) {
      console.error('Failed to fetch PACS studies:', err);
    } finally {
      setPacsStudiesLoading(false);
    }
  };

  const handleSaveHIS = async () => {
    try {
      const result = await saveHisConfigAction(hisConfig, user);

      if (!result.success) {
        throw new Error(result.error);
      }

      setModal({ isOpen: true, type: 'success', message: 'HIS Configuration saved successfully' });
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
    }
  };

  const handleSavePACS = async () => {
    try {
      const result = await savePacsConfigAction(pacsConfig, user);

      if (!result.success) {
        throw new Error(result.error);
      }

      setModal({ isOpen: true, type: 'success', message: 'PACS Configuration saved successfully' });
      fetchStatus();
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
    }
  };

  const handleActivateHIS = async () => {
    setLoading(true);
    try {
      const result = await activateHisAction();
      if (result.error) throw new Error(result.error);
      setModal({ isOpen: true, type: 'success', message: 'HIS Integration Activated successfully' });
      fetchStatus();
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Activation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePACS = async () => {
    setLoading(true);
    try {
      const result = await activatePacsAction();
      if (result.error) throw new Error(result.error);
      setModal({ isOpen: true, type: 'success', message: 'PACS Integration Activated successfully' });
      fetchStatus();
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Activation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (doctorData: { name: string; email: string; maxConcurrentCases: number }) => {
    const result = await addDoctorAction(doctorData);
    if (result.success) {
      const generatedPassword = result.data?.generatedPassword;

      setModal({
        isOpen: true,
        type: 'success',
        message: `${doctorData.name} registered successfully!\nCredentials(Only shown once):\nEmail: ${doctorData.email}\nPassword: ${generatedPassword}`,
      });
      fetchDoctors();
    } else {
      setModal({
        isOpen: true,
        type: 'error',
        message: result.error || 'Failed to register doctor',
      });
    }
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to remove ${doctorName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteDoctorAction(doctorId);
      if (result.success) {
        setModal({ isOpen: true, type: 'success', message: `${doctorName} has been removed from the workspace.` });
        fetchDoctors();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to remove doctor',
      });
    }
  };

  const handleResetPassword = async (doctorId: string, doctorName: string, doctorEmail: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${doctorName}?`)) {
      return;
    }

    try {
      const result = await resetDoctorPasswordAction(doctorId);
      if (result.success) {
        const generatedPassword = result.data?.generatedPassword;
        setModal({
          isOpen: true,
          type: 'success',
          message: `Password reset successfully for ${doctorName}!\n\nNew Credentials (shown only once):\nEmail: ${doctorEmail}\nPassword: ${generatedPassword}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to reset password',
      });
    }
  };

  const handleEditProfile = () => {
    setModal({
      isOpen: true,
      type: 'success',
      message: 'Profile editing is coming soon. Please contact system administrator for manual changes.',
    });
  };

  const handleDeleteCase = async (caseId: string, patientName: string) => {
    if (
      !confirm(
        `Delete case for ${patientName}? This will also remove the scan from Orthanc so polling can re-capture it.`
      )
    )
      return;
    try {
      const result = await deleteCaseAction(caseId);
      if (result.success) {
        setModal({
          isOpen: true,
          type: 'success',
          message: `Case for ${patientName} deleted. Re-upload the scan to re-process.`,
        });
        fetchCases();
        fetchPacsStudies();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Failed to delete case' });
    }
  };

  const handleDeleteStudy = async (orthancId: string, patientName?: string) => {
    if (
      !confirm(
        `Delete study ${patientName ? `for ${patientName}` : orthancId} from Orthanc? This clears it from the DB too so polling can re-capture it.`
      )
    )
      return;
    try {
      const result = await deletePacsStudyAction(orthancId);
      if (result.success) {
        setModal({ isOpen: true, type: 'success', message: 'Study deleted from Orthanc and database.' });
        fetchCases();
        fetchPacsStudies();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Failed to delete study' });
    }
  };

  const caseStatusColor: Record<string, string> = {
    UNASSIGNED: '#f59e0b',
    PENDING_REVIEW: '#3b82f6',
    IN_REVIEW: '#8b5cf6',
    COMPLETED: '#10b981',
  };

  return (
    <div className={styles.dashboard}>
      <AuthModal
        isOpen={modal.isOpen}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Registration Modal */}
      <DoctorRegistrationModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        onAdd={handleAddDoctor}
      />

      {/* Top Section: System Administration */}
      <div className={styles.topSection}>
        <div className={`${styles.card} ${styles.registerBox}`}>
          <div className={styles.registerContent}>
            <h2 className={styles.cardTitle} style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              <Users size={18} /> Doctor Registry
            </h2>
            <p
              style={{
                color: 'var(--secondary-foreground)',
                fontSize: '0.8rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem',
                maxWidth: '400px',
                fontWeight: 500,
              }}
            >
              Register new doctors to access the Radiora clinical workstation. Credentials are auto-generated on
              creation.
            </p>
            <button
              className="btn-primary"
              style={{
                padding: '0.65rem 1.5rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '10px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
              }}
              onClick={() => setIsAddDoctorModalOpen(true)}
            >
              Register Doctor
            </button>
          </div>
          <div className={styles.plusIconEnlarged} onClick={() => setIsAddDoctorModalOpen(true)}>
            <Plus size={28} />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
            <UserIcon size={16} /> Admin Profile
          </h2>
          <div className={styles.adminProfileBox}>
            <div className={styles.profileItem}>
              <span className={styles.label}>Name</span>
              <span className={styles.profileValue}>{adminDetails.name}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.profileValue}>{adminDetails.email}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Role</span>
              <span className={styles.profileValue}>Root Administrator</span>
            </div>
          </div>
          <button
            className="btn-outline"
            style={{ marginTop: '1rem', width: '100%', fontSize: '0.75rem', padding: '0.6rem', borderRadius: '8px' }}
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Middle Section: Doctors */}
      <div className={styles.doctorsSection}>
        <h2 className={styles.cardTitle} style={{ fontSize: '1rem' }}>
          <Stethoscope size={18} /> Registered Doctors
        </h2>
        {doctors.length === 0 ? (
          <div
            className={styles.card}
            style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-foreground)', fontSize: '0.85rem' }}
          >
            No doctors registered yet. Register one above.
          </div>
        ) : (
          <div className={styles.doctorGrid}>
            {doctors.map(doctor => (
              <div key={doctor.id} className={styles.doctorCard}>
                <div className={styles.doctorHeader}>
                  <div className={styles.doctorAvatar}>{doctor.name.charAt(0)}</div>
                  <div className={styles.doctorInfo}>
                    <span className={styles.doctorName}>{doctor.name}</span>
                    <span className={styles.doctorSpecialty}>{doctor.email}</span>
                  </div>
                  <div className={styles.doctorActions}>
                    <button
                      className={styles.doctorActionBtn}
                      onClick={() => handleResetPassword(doctor.id, doctor.name, doctor.email)}
                      title="Reset Password"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      className={`${styles.doctorActionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                      title="Remove Doctor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div
                  className={styles.allotmentSection}
                  style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.label}>Max Cases</span>
                    <span className={styles.profileValue} style={{ fontSize: '1rem' }}>
                      {doctor.maxConcurrentCases}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Orchestration Configuration */}
      <div className={styles.configSection}>
        {/* Evaluation Advisory */}
        <div
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start',
          }}
        >
          <Info size={18} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.4rem' }}>
              Evaluation Guide: Integration Endpoints
            </h3>
            <p
              style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)', lineHeight: '1.5', maxWidth: '800px' }}
            >
              Use the following mock endpoints to demonstrate live clinical data ingestion for the evaluation.
            </p>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Mock HIS
                </span>
                <code
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--foreground)',
                    background: 'var(--secondary)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                  }}
                >
                  https://his.radiora.ai/v1/mock
                </code>
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: '#10b981',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  PACS Node
                </span>
                <code
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--foreground)',
                    background: 'var(--secondary)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                  }}
                >
                  http://localhost:8042 (demo/demo)
                </code>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.cardTitle} style={{ fontSize: '1rem' }}>
            <Database size={18} /> Server Connectivity
          </h2>
          <button
            className="btn-outline"
            onClick={fetchStatus}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              borderRadius: '8px',
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            {loading ? 'Polling…' : 'Sync Status'}
          </button>
        </div>

        <div className={styles.integrationGrid}>
          {/* HIS Integration Card */}
          <div className={styles.integrationCard}>
            <div className={styles.integrationCardHeader}>
              <div className={styles.integrationCardTitle}>
                <Database size={22} color="var(--primary)" />
                HIS Integration
              </div>
              <div
                className={`${styles.statusBadge} ${
                  integrationStatus.his.active ? styles.statusActive : styles.statusInactive
                }`}
              >
                {integrationStatus.his.active ? (
                  <>
                    <CheckCircle size={16} /> Active
                  </>
                ) : (
                  <>
                    <XCircle size={16} /> Inactive
                  </>
                )}
              </div>
            </div>
            <div className={styles.integrationCardBody}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>HIS Server URL</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="https://his.hospital.com/api"
                  value={hisConfig.url}
                  onChange={e => setHisConfig({ ...hisConfig, url: e.target.value })}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>API Key</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showHisApiKey ? 'text' : 'password'}
                    className={`${styles.input} ${styles.passwordInput}`}
                    placeholder="••••••••••••••••"
                    value={hisConfig.apiKey}
                    onChange={e => setHisConfig({ ...hisConfig, apiKey: e.target.value })}
                  />
                  <button type="button" className={styles.eyeButton} onClick={() => setShowHisApiKey(!showHisApiKey)}>
                    {showHisApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className={styles.actionRow}>
                <button className={`btn-primary ${styles.actionBtn}`} onClick={handleSaveHIS}>
                  <Save size={18} /> Save Settings
                </button>
                <button
                  className={`btn-outline ${styles.actionBtn} ${styles.activateBtn}`}
                  onClick={handleActivateHIS}
                  disabled={loading}
                >
                  <Power size={18} /> {loading ? '...' : 'Activate'}
                </button>
              </div>
            </div>
          </div>

          {/* PACS Integration Card */}
          <div className={styles.integrationCard}>
            <div className={styles.integrationCardHeader}>
              <div className={styles.integrationCardTitle}>
                <Stethoscope size={22} color="var(--primary)" />
                PACS Orchestration
              </div>
              <div
                className={`${styles.statusBadge} ${
                  integrationStatus.pacs.active ? styles.statusActive : styles.statusInactive
                }`}
              >
                {integrationStatus.pacs.active ? (
                  <>
                    <CheckCircle size={16} /> Active
                  </>
                ) : (
                  <>
                    <XCircle size={16} /> Inactive
                  </>
                )}
              </div>
            </div>
            <div className={styles.integrationCardBody}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>PACS Server URL</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="http://pacs.imaging.net:8080"
                  value={pacsConfig.url}
                  onChange={e => setPacsConfig({ ...pacsConfig, url: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Username</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={pacsConfig.username}
                    onChange={e => setPacsConfig({ ...pacsConfig, username: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPacsPassword ? 'text' : 'password'}
                      className={`${styles.input} ${styles.passwordInput}`}
                      value={pacsConfig.password}
                      onChange={e => setPacsConfig({ ...pacsConfig, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPacsPassword(!showPacsPassword)}
                    >
                      {showPacsPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Poll Interval (Seconds)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={pacsConfig.pollIntervalSeconds}
                  onChange={e => setPacsConfig({ ...pacsConfig, pollIntervalSeconds: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className={styles.actionRow}>
                <button className={`btn-primary ${styles.actionBtn}`} onClick={handleSavePACS}>
                  <Save size={18} /> Save Settings
                </button>
                <button
                  className={`btn-outline ${styles.actionBtn} ${styles.activateBtn}`}
                  onClick={handleActivatePACS}
                  disabled={loading}
                >
                  <Power size={18} /> {loading ? '...' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Section */}
      <div className={styles.doctorsSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.cardTitle} style={{ fontSize: '1rem' }}>
            <Activity size={18} /> All Cases
          </h2>
          <button
            className="btn-outline"
            onClick={fetchCases}
            disabled={casesLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              borderRadius: '8px',
            }}
          >
            <RefreshCw size={13} className={casesLoading ? 'spin' : ''} />
            {casesLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {cases.length === 0 ? (
          <div
            className={styles.card}
            style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-foreground)' }}
          >
            <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No cases yet. Scans in Orthanc will appear here after polling.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cases.map(c => (
              <div
                key={c.id}
                className={styles.card}
                style={{
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1', minWidth: '120px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{c.patientName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>
                    {c.modality}
                    {c.bodyPart ? ` · ${c.bodyPart}` : ''}
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '120px' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--secondary-foreground)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Doctor
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {c.assignedDoctor?.name || <span style={{ opacity: 0.4 }}>Unassigned</span>}
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '100px' }}>
                  <span
                    style={{
                      background: `${caseStatusColor[c.status]}22`,
                      color: caseStatusColor[c.status],
                      border: `1px solid ${caseStatusColor[c.status]}44`,
                      borderRadius: '50px',
                      padding: '0.3rem 0.9rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <div
                  style={{ flex: '1', minWidth: '100px', fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}
                >
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <button
                  className={`${styles.doctorActionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDeleteCase(c.id, c.patientName)}
                  title="Delete case + remove scan from Orthanc"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PACS Studies Section */}
      <div className={styles.doctorsSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.cardTitle} style={{ fontSize: '1rem' }}>
            <HardDrive size={24} /> PACS Studies (Orthanc)
          </h2>
          <button
            className="btn-outline"
            onClick={fetchPacsStudies}
            disabled={pacsStudiesLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <RefreshCw size={16} className={pacsStudiesLoading ? 'spin' : ''} />
            {pacsStudiesLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {pacsStudies.length === 0 ? (
          <div
            className={styles.card}
            style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-foreground)' }}
          >
            <HardDrive size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>
              {pacsStudiesLoading ? 'Loading studies...' : 'No studies in Orthanc. Upload a DICOM file to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pacsStudies.map(s => (
              <div
                key={s.orthancId}
                className={styles.card}
                style={{
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1', minWidth: '120px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{s.patientName || 'Unknown Patient'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)', fontFamily: 'monospace' }}>
                    {s.orthancId.slice(0, 8)}...
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '80px', fontSize: '0.9rem' }}>
                  {s.modality || '—'} · {s.seriesCount ?? '?'} series
                </div>
                <div style={{ flex: '1', minWidth: '80px', fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>
                  {s.accessionNumber || 'No AccNo'}
                </div>
                <div>
                  {s.hasCase ? (
                    <span
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: '50px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Case Created{s.caseDoctorName ? ` · ${s.caseDoctorName}` : ''}
                    </span>
                  ) : (
                    <span
                      style={{
                        background: 'rgba(245,158,11,0.1)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: '50px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      No Case Yet
                    </span>
                  )}
                </div>
                <button
                  className={`${styles.doctorActionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDeleteStudy(s.orthancId, s.patientName)}
                  title="Delete from Orthanc + clear DB records"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
