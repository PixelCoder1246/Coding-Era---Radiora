import React from 'react';
import Hero from '@/components/Hero';
import { Metadata } from 'next';
import { getAuthStatusAction } from '@/lib/actions/auth';

export const metadata: Metadata = {
  title: 'Radiora — Clinical Imaging Workstation',
  description:
    'Radiora connects your Orthanc PACS, Hospital Information System, and AI inference layer into a unified clinical workstation. Automate case routing, surface AI insights, and streamline radiology workflows.',
};

export default async function Home() {
  const user = await getAuthStatusAction();
  return <Hero user={user} />;
}
