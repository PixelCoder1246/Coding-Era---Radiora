import ContentSection from "@/components/ContentSection";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PACS Orchestration | DICOM Workflow Management",
  description: "Advanced PACS orchestration for radiology departments. Radiora automates DICOM routing, study load balancing, and multi-site image management.",
};

export default function PacsOrchestrationPage() {
  return (
    <ContentSection 
      title="PACS Orchestration" 
      subtitle="Unified control over your medical imaging DICOM ecosystem."
    >
      <p>
        Radiora's PACS Orchestration layer simplifies the complexity of multiple imaging silos. 
        Whether you are managing a single site or a distributed hospital network, our platform automates DICOM study routing, ensures image availability, and optimizes your diagnostic throughput.
      </p>
      <ul style={{ marginTop: '2rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <li><strong>Intelligent DICOM Routing:</strong> Dynamic delivery based on AI triage results and sub-specialty availability.</li>
        <li><strong>Study Load Balancing:</strong> Distribute diagnostic workloads evenly across your radiologist pool.</li>
        <li><strong>Vendor Neutrality:</strong> Bidirectional synchronization with any standard DICOM-compliant PACS provider.</li>
      </ul>
    </ContentSection>
  );
}
