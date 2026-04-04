'use client';

import React, { useState } from 'react';
import { User } from '@/lib/actions/auth';
import {
  saveHisConfigAction,
  savePacsConfigAction,
  getIntegrationStatusAction,
  activateHisAction,
  activatePacsAction,
} from '@/lib/actions/integration';
import { Plus, Stethoscope, Database, Save, User as UserIcon, Power, CheckCircle, XCircle } from 'lucide-react';
import styles from '@/components/AdminDashboard.module.css';
import AuthModal from '@/components/AuthModal';

export default function AdminDashboardClient({ user }: { user: User }) {
  // Modal state for feedback
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

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

  // Admin Details State (Profile)
  const [adminDetails] = useState({
    name: user?.name || 'Admin Name',
    email: user?.email || 'Admin Email',
    password: '••••••••',
  });

  // Mock data for Doctors
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. Sarah Connor', specialty: 'Neuroradiology', maxCases: 15 },
    { id: 2, name: 'Dr. James Smith', specialty: 'Musculoskeletal', maxCases: 10 },
    { id: 3, name: 'Dr. Elena Rodriguez', specialty: 'Abdominal Imaging', maxCases: 12 },
  ]);

  React.useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const status = await getIntegrationStatusAction();
    setIntegrationStatus(status);
  };

  const handleUpdateMaxCases = (id: number, newValue: number) => {
    setDoctors(prev => prev.map(doc => (doc.id === id ? { ...doc, maxCases: newValue } : doc)));
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

  const handleSaveAllotment = () => {
    setModal({
      isOpen: true,
      type: 'success',
      message: 'Allotment updated in UI. Persistent backend support for clinician management is coming soon.',
    });
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

      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={`${styles.card} ${styles.registerBox}`}>
          <div className={styles.plusIconEnlarged} role="button" title="Add New Doctor">
            <Plus size={64} />
          </div>
          <div style={{ maxWidth: '300px' }}>
            <h2 className={styles.cardTitle} style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
              Add Clinician
            </h2>
            <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', opacity: 0.8 }}>
              Quickly register a new doctor or specialist to the Radiora workspace.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            onClick={() => (window.location.href = '/auth/register')}
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
          <Stethoscope size={24} /> Manage Clinicians
        </h2>
        <div className={styles.doctorGrid}>
          {doctors.map(doctor => (
            <div key={doctor.id} className={styles.doctorCard}>
              <div className={styles.doctorHeader}>
                <div className={styles.doctorAvatar}>{doctor.name.charAt(4)}</div>
                <div className={styles.doctorInfo}>
                  <span className={styles.doctorName}>{doctor.name}</span>
                  <span className={styles.doctorSpecialty}>{doctor.specialty}</span>
                </div>
              </div>
              <div className={styles.allotmentSection}>
                <span className={styles.label} style={{ textTransform: 'none' }}>
                  Max Cases Allotment
                </span>
                <input
                  type="number"
                  className={styles.input}
                  style={{ width: '80px', textAlign: 'center', padding: '0.5rem' }}
                  value={doctor.maxCases}
                  onChange={e => handleUpdateMaxCases(doctor.id, parseInt(e.target.value) || 0)}
                />
              </div>
              <button
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleSaveAllotment}
              >
                <Save size={16} /> Save Allotment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: HIS/PACS Configuration */}
      <div className={styles.configSection}>
        <h2 className={styles.cardTitle}>
          <Database size={24} /> Integration Services
        </h2>

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
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••••••••••"
                  value={hisConfig.apiKey}
                  onChange={e => setHisConfig({ ...hisConfig, apiKey: e.target.value })}
                />
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
                  <input
                    type="password"
                    className={styles.input}
                    value={pacsConfig.password}
                    onChange={e => setPacsConfig({ ...pacsConfig, password: e.target.value })}
                  />
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
