import ContentSection from '@/components/ContentSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Radiora Platform Agreement',
  description: 'Terms governing the use of the Radiora medical imaging platform and SaaS services.',
};

export default function TermsPage() {
  return (
    <ContentSection title="Terms of Service" subtitle="The agreements governing your use of the Radiora platform.">
      <p>
        By using the Radiora platform, you agree to comply with our terms of service. Our goal is to provide a fair,
        secure, and highly reliable environment for medical imaging professionals and healthcare enterprises.
      </p>
      <p style={{ marginTop: '1.5rem' }}>
        For enterprise licensing and custom service level agreements (SLAs), please contact our sales department.
      </p>
    </ContentSection>
  );
}
