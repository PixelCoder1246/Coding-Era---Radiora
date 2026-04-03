import ContentSection from "@/components/ContentSection";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Case Studies | Radiology Workflow Proof of Impact",
  description: "Read how clinics and hospitals leverage Radiora to reduce turnaround times and improve diagnostic outcomes in medical imaging.",
};

export default function CaseStudiesPage() {
  return (
    <ContentSection 
      title="Case Studies" 
      subtitle="Real-world impact of Radiora on radiology turnaround times."
    >
      <p>
        Discover how leading radiology departments are using Radiora to reduce turnaround times (TAT) and improve diagnostic accuracy across their clinical networks.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <div className="card-curvy" style={{ marginBottom: '1.5rem' }}>
          <h4>City General Hospital</h4>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Reduced ER stroke triage time by 40% using automated AI Insights orchestration.</p>
        </div>
        <div className="card-curvy">
          <h4>Metro Imaging Center</h4>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Seamlessly connected 5 disparate PACS systems into a unified diagnostic workflow.</p>
        </div>
      </div>
    </ContentSection>
  );
}
