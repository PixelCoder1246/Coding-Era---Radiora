import ContentSection from "@/components/ContentSection";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Documentation | Radiora Radiology IT Knowledge Base",
  description: "Comprehensive guides and technical documentation for Radiora. Learn how to configure DICOM nodes, HL7 interfaces, and AI deployment.",
};

export default function DocumentationPage() {
  return (
    <ContentSection 
      title="Documentation" 
      subtitle="The complete technical guide to implementing and using Radiora."
    >
      <p>
        Welcome to the Radiora Knowledge Base. Our documentation is designed for clinical IT administrators and PACS managers looking to optimize their radiology workflow.
      </p>
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '2rem' }}>
        <div className="card-curvy">
          <h4>Integration Guide</h4>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Deep dive into HL7 message types and DICOM C-STORE/C-FIND configuration.</p>
        </div>
        <div className="card-curvy">
          <h4>AI Deployment</h4>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>How to connect and validate third-party AI algorithms with the Radiora orchestration layer.</p>
        </div>
      </div>
    </ContentSection>
  );
}
