import Hero from "@/components/Hero";
import { Database, ShieldCheck, Brain } from 'lucide-react';
import styles from './Home.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Medical Imaging Workflow & Orchestration Platform",
  description: "Radiora optimizes radiology workflows by connecting DICOM PACS, HL7 HIS, and AI diagnostic triage into a single unified workspace.",
};

export default function Home() {
  return (
    <>
      <section className={styles.heroWrapper}>
        <Hero />
      </section>
      
      <section id="features" className={styles.featuresSection}>
        <div className={styles.curvyDivider}></div>

        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Built for the modern <span style={{ color: 'var(--primary)' }}>Radiology</span> department
          </h2>

          <div className={styles.featureGrid}>
            <div className={`card-curvy ${styles.featureCard}`}>
              <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
                <Database size={28} />
              </div>
              <h3 className={styles.featureTitle}>PACS Orchestration</h3>
              <p className={styles.featureDescription}>
                Unified control over your PACS ecosystem. Automate study routing and handle complex diagnostic workflows with ease.
              </p>
            </div>

            <div className={`card-curvy ${styles.featureCard}`}>
              <div className={`${styles.iconWrapper} ${styles.iconAccent}`}>
                <ShieldCheck size={28} />
              </div>
              <h3 className={styles.featureTitle}>HIS Integration</h3>
              <p className={styles.featureDescription}>
                Full bidirectional communication with Hospital Information Systems. Synchronize patient data and reporting seamlessly.
              </p>
            </div>

            <div className={`card-curvy ${styles.featureCard}`}>
              <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
                <Brain size={28} />
              </div>
              <h3 className={styles.featureTitle}>AI-Driven Insights</h3>
              <p className={styles.featureDescription}>
                Integrated priority-based study triage and AI-assisted findings directly within your diagnostic viewer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
