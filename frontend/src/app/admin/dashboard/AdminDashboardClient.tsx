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
} from '@/lib/actions/integration';
import {
  listDoctorsAction,
  addDoctorAction,
  deleteDoctorAction,
  resetDoctorPasswordAction,
} from '@/lib/actions/doctor';
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

  React.useEffect(() => {
    fetchStatus();
    fetchConfigs();
    fetchDoctors();
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

      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={`${styles.card} ${styles.registerBox}`}>
          <div className={styles.plusIconEnlarged} role="button" title="Add New Doctor">
            <Plus size={64} />
          </div>
          <div style={{ maxWidth: '300px' }}>
            <h2 className={styles.cardTitle} style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
              Add Doctors
            </h2>
            <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', opacity: 0.8 }}>
              Quickly register a new doctor or specialist to the Radiora workspace.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            onClick={() => setIsAddDoctorModalOpen(true)}
          >
            Register New Doctor
          </button>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <UserIcon size={24} /> Admin Profile
          </h2>
          <div className={styles.adminProfileBox}>
            <div className={styles.profileItem}>
              <span className={styles.label}>Full Name</span>
              <span className={styles.profileValue}>{adminDetails.name}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Email Address</span>
              <span className={styles.profileValue}>{adminDetails.email}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.label}>Password</span>
              <span className={styles.profileValue}>{adminDetails.password}</span>
            </div>
          </div>
          <button
            className="btn-outline"
            style={{ marginTop: '1.5rem', width: '100%', borderColor: 'var(--border)' }}
            onClick={handleEditProfile}
          >
            Edit Profile Details
          </button>
        </div>
      </div>

      {/* Middle Section: Doctors */}
      <div className={styles.doctorsSection}>
        <h2 className={styles.cardTitle}>
          <Stethoscope size={24} /> Manage Doctors
        </h2>
        <div className={styles.doctorGrid}>
          {doctors.map(doctor => (
            <div key={doctor.id} className={styles.doctorCard}>
              <div className={styles.doctorHeader}>
                <div className={styles.doctorAvatar}>Dr</div>
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
                    <RotateCcw size={18} />
                  </button>
                  <button
                    className={`${styles.doctorActionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                    title="Remove Doctor"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div
                className={styles.allotmentSection}
                style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '25px' }}>
                  <span className={styles.label} style={{ textTransform: 'none' }}>
                    Max Cases Allotment
                  </span>
                  <span className={styles.profileValue} style={{ fontSize: '1.2rem' }}>
                    {doctor.maxConcurrentCases}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: HIS/PACS Configuration */}
      <div className={styles.configSection}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>
            <Database size={24} /> Integration Services
          </h2>
          <button
            className="btn-outline"
            onClick={fetchStatus}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {loading ? 'Checking...' : 'Check Status'}
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
    </div>
  );
}
