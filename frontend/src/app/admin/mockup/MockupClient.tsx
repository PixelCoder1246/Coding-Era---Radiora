'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  ClipboardList,
  UploadCloud,
  CheckCircle,
  Loader2,
  FileUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { User } from '@/lib/actions/auth';
import { createPatientAction, createOrderAction, uploadDicomAction } from '@/lib/actions/mockup';
import AuthModal from '@/components/AuthModal';
import styles from '@/components/Mockup.module.css';

export default function MockupClient({ user: _user }: { user: User }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  // Patient Form State (Step 1)
  const [patientForm, setPatientForm] = useState({
    name: '',
    dob: '',
    gender: 'M',
    email: '',
    phone: '',
  });

  // Order Form State (Step 2)
  const [orderForm, setOrderForm] = useState({
    patientId: '',
    modality: 'MRI',
    bodyPart: 'BRAIN',
  });

  // Accession Number (from Step 2 response for Step 3)
  const [accessionNumber, setAccessionNumber] = useState('');
  const [isUploadCompleted, setIsUploadCompleted] = useState(false);

  // DICOM File State (Step 3)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createPatientAction(patientForm);
      if (result.success) {
        const patientId = result.data.patientId;
        setOrderForm(prev => ({ ...prev, patientId }));
        setCurrentStep(2);
        setModal({
          isOpen: true,
          type: 'success',
          message: `Patient registered successfully.\nPatient ID: ${patientId}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create patient',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createOrderAction(orderForm);
      if (result.success) {
        const accNo = result.data.accessionNumber;
        setAccessionNumber(accNo);
        setCurrentStep(3);
        setModal({
          isOpen: true,
          type: 'success',
          message: `Order created successfully.\nAccession Number: ${accNo}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Failed to create order' });
    } finally {
      setLoading(false);
    }
  };

  const handleDicomUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('accessionNumber', accessionNumber);

      const result = await uploadDicomAction(formData);
      if (result.success) {
        setModal({
          isOpen: true,
          type: 'success',
          message: result.data.message || 'DICOM processed and uploaded successfully.',
        });
        setIsUploadCompleted(true);
        // Optionally reset or show a completion screen
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepper = () => (
    <div className={styles.stepper}>
      <div
        className={`${styles.step} ${currentStep >= 1 ? styles.stepActive : ''} ${currentStep > 1 ? styles.stepCompleted : ''}`}
      >
        {currentStep > 1 ? <CheckCircle size={18} /> : <UserPlus size={18} />}
        Patient Details
      </div>
      <div className={`${styles.stepLine} ${currentStep > 1 ? styles.stepLineActive : ''}`} />
      <div
        className={`${styles.step} ${currentStep >= 2 ? styles.stepActive : ''} ${currentStep > 2 ? styles.stepCompleted : ''}`}
      >
        {currentStep > 2 ? <CheckCircle size={18} /> : <ClipboardList size={18} />}
        Order Details
      </div>
      <div className={`${styles.stepLine} ${currentStep > 2 ? styles.stepLineActive : ''}`} />
      <div className={`${styles.step} ${currentStep >= 3 ? styles.stepActive : ''}`}>
        <UploadCloud size={18} />
        DICOM Upload
      </div>
    </div>
  );

  return (
    <div className={styles.mockupContainer}>
      <AuthModal
        isOpen={modal.isOpen}
        type={modal.type}
        message={modal.message}
        onClose={() => {
          if (isUploadCompleted) {
            router.push('/');
          }
          setModal({ ...modal, isOpen: false });
        }}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>System Mockup Laboratory</h1>
        <p className={styles.subtitle}>Execute the full HIS-to-PACS clinical workflow simulation.</p>
      </div>

      {renderStepper()}

      <div className={styles.formContainer}>
        {currentStep === 1 && (
          <div className={styles.card}>
            <div className={styles.stepTitle}>Step 1: Patient Registration</div>
            <p className={styles.stepSubtitle}>Enter basic patient demographics to create a record in HIS.</p>
            <form className={styles.form} onSubmit={handlePatientSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  className={styles.input}
                  placeholder="John Doe"
                  required
                  value={patientForm.name}
                  onChange={e => setPatientForm({ ...patientForm, name: e.target.value })}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Date of Birth</label>
                  <input
                    type="date"
                    className={styles.input}
                    required
                    value={patientForm.dob}
                    onChange={e => setPatientForm({ ...patientForm, dob: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Gender</label>
                  <select
                    className={styles.input}
                    value={patientForm.gender}
                    onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="john@example.com"
                  required
                  value={patientForm.email}
                  onChange={e => setPatientForm({ ...patientForm, email: e.target.value })}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="+1234567890"
                  required
                  value={patientForm.phone}
                  onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                />
              </div>
              <button className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : <ChevronRight size={20} />}
                Register & Continue
              </button>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.card}>
            <div className={styles.stepTitle}>Step 2: Create Imaging Order</div>
            <p className={styles.stepSubtitle}>Define the modality and body part for the study.</p>
            <form className={styles.form} onSubmit={handleOrderSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Patient ID (Autofilled)</label>
                <input className={styles.input} disabled value={orderForm.patientId} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Modality</label>
                  <select
                    className={styles.input}
                    value={orderForm.modality}
                    onChange={e => setOrderForm({ ...orderForm, modality: e.target.value })}
                  >
                    <option value="MRI">MRI</option>
                    <option value="CT">CT</option>
                    <option value="US">Ultrasound</option>
                    <option value="DX">X-Ray</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Body Part</label>
                  <input
                    className={styles.input}
                    placeholder="BRAIN, CHEST, etc."
                    required
                    value={orderForm.bodyPart}
                    onChange={e => setOrderForm({ ...orderForm, bodyPart: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
              <button className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : <ChevronRight size={20} />}
                Create Order & Continue
              </button>
            </form>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.card}>
            <div className={styles.stepTitle}>Step 3: DICOM Archive Upload</div>
            <p className={styles.stepSubtitle}>Finalize the simulation by uploading the study files.</p>
            <form className={styles.form} onSubmit={handleDicomUpload}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Accession Number (Autofilled)</label>
                <input className={styles.input} disabled value={accessionNumber} />
              </div>

              <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              />
              <div className={styles.fileUploadArea} onClick={() => fileInputRef.current?.click()}>
                {selectedFile ? (
                  <>
                    <FileUp size={48} className={styles.fileIcon} />
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{selectedFile.name}</span>
                      <span className={styles.fileHint}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ready</span>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud size={48} className={styles.fileIcon} />
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>Click to select DICOM zip/file</span>
                      <span className={styles.fileHint}>Matches with Accession: {accessionNumber}</span>
                    </div>
                  </>
                )}
              </div>

              <button className={`btn-primary ${styles.submitBtn}`} disabled={loading || !selectedFile} type="submit">
                {loading ? <Loader2 className="spin" size={20} /> : <Sparkles size={20} />}
                Upload to PACS & Finish
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
