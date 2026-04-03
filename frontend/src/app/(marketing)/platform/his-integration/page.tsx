import ContentSection from "@/components/ContentSection";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "HIS Integration | HL7 & EMR Interoperability",
  description: "Seamless HIS and EMR integration for radiology. Radiora synchronizes patient data, HL7 orders, and diagnostic reports across your healthcare enterprise.",
};

export default function HisIntegrationPage() {
  return (
    <ContentSection 
      title="HIS Integration" 
      subtitle="Seamless bidirectional communication with Hospital Information Systems & EMRs."
    >
      <p>
        Bridge the gap between radiology and the wider clinical context. 
        Radiora provides deep HL7 integration with HIS and EMR platforms to ensure patient demographics, orders, and reporting are always synchronized across your healthcare enterprise.
      </p>
      <ul style={{ marginTop: '2rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <li><strong>Demographic Reconciliation:</strong> Automated patient identity matching to prevent record fragmentation.</li>
        <li><strong>HL7 Order Management:</strong> Real-time status tracking from order entry to final signed report.</li>
        <li><strong>Integrated Reporting:</strong> Direct population of radiology findings into the electronic medical record.</li>
      </ul>
    </ContentSection>
  );
}
