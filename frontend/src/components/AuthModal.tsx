'use client';

import React, { useEffect } from 'react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export default function AuthModal({ isOpen, type, message, onClose }: AuthModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // Auto close after 2.5s
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          {type === 'success' ? (
            <>
              <div className={styles.successRing} />
              <div className={styles.successCircle} />
              <div className={styles.tick} />
            </>
          ) : (
            <>
              <div className={styles.errorRing} />
              <div className={styles.errorCircle} />
              <div className={styles.cross} />
            </>
          )}
        </div>
        <h3 className={styles.message}>{message}</h3>
      </div>
    </div>
  );
}
