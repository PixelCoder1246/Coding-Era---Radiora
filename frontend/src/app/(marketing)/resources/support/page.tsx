import ContentSection from "@/components/ContentSection";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Support Center | Radiology IT & PACS Support",
  description: "Get expert technical support for Radiora. Our clinical IT specialists are available 24/7 to assist with PACS integration and workflow optimization.",
};

export default function SupportPage() {
  return (
    <ContentSection 
      title="Support Center" 
      subtitle="24/7 clinical IT support to keep your radiology workflow running smoothly."
    >
      <p>
        Need assistance with your Radiora implementation? Our team of clinical IT experts is available 24/7 to help you resolve technical issues, 
        optimize DICOM routing, and ensure HL7 interoperability.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <p><strong>Email:</strong> support@radiora.app</p>
        <p><strong>Phone:</strong> +1 (800) RADIORA</p>
        <p style={{ marginTop: '1rem' }}>Our average response time for critical radiology workflow issues is under 15 minutes.</p>
      </div>
    </ContentSection>
  );
}
