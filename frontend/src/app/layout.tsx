import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ThemeProvider } from './ThemeProvider';
import Navbar from '@/components/Navbar';
import ClientFooter from '@/components/ClientFooter';

export const metadata: Metadata = {
  title: {
    default: 'Radiora | The Platform that Powers Radiology',
    template: '%s | Radiora',
  },
  description:
    'Radiora is the orchestration platform that powers radiology. Reclaiming focus and reducing burnout for the modern radiologist through AI-first workflows.',
  keywords: [
    'Radiology Orchestration',
    'Physician Burnout Reduction',
    'PACS Workflow',
    'HIS Synchronization',
    'Medical AI Triage',
    'Clinical Workstation',
  ],
  authors: [{ name: 'Radiora Team' }],
  creator: 'Radiora Inc',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://radiora.app',
    title: 'Radiora | Powering Radiology',
    description:
      'Reclaim your clinical focus. Radiora orchestrates PACS, HIS, and AI to eliminate diagnostic friction.',
    siteName: 'Radiora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radiora | Powering Radiology',
    description: 'The orchestration engine that empowers the modern radiologist.',
    creator: '@radiora',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { getAuthStatusAction } from '@/lib/actions/auth';
import BackgroundBubbles from '@/components/BackgroundBubbles';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getAuthStatusAction();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <BackgroundBubbles />
          <Navbar user={user} />
          <main>{children}</main>
          <ClientFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
