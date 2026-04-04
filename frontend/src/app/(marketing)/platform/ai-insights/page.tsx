import ContentSection from '@/components/ContentSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Insights | Radiology Artificial Intelligence Triage',
  description:
    'Augment diagnostic precision with Radiora AI Insights. Intelligent triage for critical pathologies like stroke and chest abnormalities.',
};

export default function AiInsightsPage() {
  return (
    <ContentSection title="AI Insights" subtitle="Augmenting diagnostic precision with intelligent clinical triage.">
      <p>
        Radiora's AI Insights engine triages incoming DICOM studies, automatically highlighting suspicious findings and
        prioritizing cases that require immediate radiologist attention, such as acute strokes or chest abnormalities.
      </p>
      <ul style={{ marginTop: '2rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <li>
          <strong>Critical Pathology Triage:</strong> Immediate identification of life-threatening findings for
          prioritized reading.
        </li>
        <li>
          <strong>Diagnostic Support:</strong> AI-powered overlays and measurements directly in the workflow.
        </li>
        <li>
          <strong>Workflow Efficiency:</strong> Reduce turnaround times (TAT) for urgent cases through intelligent queue
          management.
        </li>
      </ul>
    </ContentSection>
  );
}
