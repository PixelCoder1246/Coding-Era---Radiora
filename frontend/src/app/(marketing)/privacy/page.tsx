import ContentSection from '@/components/ContentSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | HIPAA & GDPR Compliance',
  description:
    "Radiora's commitment to patient data privacy. Built to meet the highest standards of HIPAA and GDPR compliance in medical imaging.",
};

export default function PrivacyPage() {
  return (
    <ContentSection title="Privacy Policy" subtitle="How we handle sensitive clinical data with care and integrity.">
      <p>
        Radiora takes patient and clinical data privacy with the utmost seriousness. Our platform is built from the
        ground up to be HIPAA and GDPR compliant, ensuring that your sensitive data remains protected.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Data Integrity</h3>
        <p>We use industry-standard encryption and strict access controls for all DICOM and HL7 data transmissions.</p>
      </div>
    </ContentSection>
  );
}
