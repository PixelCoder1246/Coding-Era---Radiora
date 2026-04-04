import ContentSection from '@/components/ContentSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Reference | Radiology Integration API',
  description:
    'Technical reference for the Radiora REST API. Programmatically manage PACS nodes, HL7 feeds, and AI triage results.',
};

export default function ApiReferencePage() {
  return (
    <ContentSection
      title="API Reference"
      subtitle="Integrate Radiora into your existing clinical applications and EMRs."
    >
      <p>
        The Radiora REST API allows you to programmatically manage integrations, query study statuses, and retrieve AI
        findings. Our API is built on modern standards (OpenAPI) and supports secure authentication for clinical
        environments.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <pre
          style={{
            background: 'var(--secondary)',
            padding: '1.5rem',
            borderRadius: '1rem',
            overflowX: 'auto',
            fontSize: '0.85rem',
          }}
        >
          <code>
            {`GET /api/v1/studies/triage-status
Host: api.radiora.app
Authorization: Bearer <clinical_jwt_token>`}
          </code>
        </pre>
      </div>
    </ContentSection>
  );
}
