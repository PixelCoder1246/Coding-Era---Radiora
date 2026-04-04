import ContentSection from '@/components/ContentSection';
import { Database, ShieldCheck, Brain } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Features | Radiora Medical Imaging',
  description:
    'Explore the powerful features of Radiora, including seamless PACS orchestration, deep HIS integration, and AI-driven diagnostic insights.',
};

export default function FeaturesPage() {
  return (
    <ContentSection title="Platform Features" subtitle="Intelligent tools designed for the modern radiology workflow.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Database size={32} color="var(--primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>PACS Orchestration</h2>
          </div>
          <p>
            Gain unified control over your entire PACS ecosystem. Radiora allows you to automate study routing, manage
            complex diagnostic workflows, and ensure that imaging data is always where it needs to be, when it needs to
            be there.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <ShieldCheck size={32} color="var(--primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>HIS Integration</h2>
          </div>
          <p>
            Experience full bidirectional communication with Hospital Information Systems (HIS) and Electronic Medical
            Records (EMR). Radiora synchronizes patient demographics, orders, and diagnostic reports seamlessly across
            your healthcare enterprise.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Brain size={32} color="var(--primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>AI-Driven Insights</h2>
          </div>
          <p>
            Leverage integrated, priority-based study triage and AI-assisted findings directly within your diagnostic
            viewer. Our platform helps you identify urgent cases faster and provides intelligent support for more
            accurate diagnoses.
          </p>
        </section>
      </div>
    </ContentSection>
  );
}
