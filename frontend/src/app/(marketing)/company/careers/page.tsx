import ContentSection from '@/components/ContentSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Join the Radiora Team',
  description:
    'Explore career opportunities in HealthTech and Radiology IT. Help us build the next generation of medical imaging software.',
};

export default function CareersPage() {
  return (
    <ContentSection
      title="Careers at Radiora"
      subtitle="Join us in redefining the future of medical imaging workflows."
    >
      <p>
        Building the next generation of medical software requires a diverse team of thinkers, doers, and explorers. At
        Radiora, we're looking for individuals who are passionate about the intersection of healthcare and technology.
      </p>
      <p style={{ marginTop: '1.5rem' }}>
        Current openings are posted on our LinkedIn page. Send your CV to careers@radiora.app to be considered for
        future roles in clinical engineering, AI development, and product design.
      </p>
    </ContentSection>
  );
}
