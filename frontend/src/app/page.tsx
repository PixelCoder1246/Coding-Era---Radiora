import React from 'react';
import Hero from '@/components/Hero';
import { Metadata } from 'next';
import { getAuthStatusAction } from '@/lib/actions/auth';

export const metadata: Metadata = {
  title: 'Radiora | The Platform that Powers Radiology',
  description:
    'Radiora is the orchestration engine that empowers radiologists by eliminating diagnostic friction and reducing clinical burnout through AI-first workflows.',
};

export default async function Home() {
  const user = await getAuthStatusAction();
  return <Hero user={user} />;
}
