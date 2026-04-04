'use client';

import React, { useState } from 'react';
import { X, User, Mail, Hash, Loader2 } from 'lucide-react';
import styles from './DoctorRegistrationModal.module.css';

interface DoctorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (doctor: { name: string; email: string; maxConcurrentCases: number }) => Promise<void>;
}

export default function DoctorRegistrationModal({ isOpen, onClose, onAdd }: DoctorRegistrationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [maxConcurrentCases, setMaxConcurrentCases] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({ name, email, maxConcurrentCases });
      setName('');
      setEmail('');
      setMaxConcurrentCases(5);
      onClose();
    } catch (error) {
      console.error('Failed to add doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Register New Clinician</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={20} className={styles.inputIcon} />
              <input
                type="text"
                className={styles.input}
                placeholder=""
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={20} className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder=""
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Max Concurrent Cases</label>
            <div className={styles.inputWrapper}>
              <Hash size={20} className={styles.inputIcon} />
              <input
                type="number"
                className={styles.input}
                min="1"
                max="50"
                value={maxConcurrentCases}
                onChange={e => setMaxConcurrentCases(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Register Clinician'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
