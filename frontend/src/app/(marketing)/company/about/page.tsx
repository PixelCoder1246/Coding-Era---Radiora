import ContentSection from "@/components/ContentSection";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Radiora | The Future of Radiology Workflow",
  description: "Learn about Radiora's mission to eliminate friction in medical imaging. We build intelligent tools for the modern radiology department.",
};

export default function AboutPage() {
  return (
    <ContentSection 
      title="About Radiora" 
      subtitle="Reimagining the intersection of radiology and software technology."
    >
      <p>
        Founded in 2026, Radiora was built with a single mission: to eliminate the friction in radiology workflows. 
        We believe that clinicians should spend their time diagnosing patients, not fighting with legacy imaging software.
      </p>
      <p style={{ marginTop: '1.5rem' }}>
        Our platform is the result of deep collaboration between radiologists, clinical IT specialists, and world-class software engineers.
      </p>
    </ContentSection>
  );
}
