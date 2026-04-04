import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getAuthStatusAction } from '@/lib/actions/auth';
import { getCaseDetailsAction } from '@/lib/actions/cases';
import CaseDetailClient from './CaseDetailClient';
import Navbar from '@/components/Navbar';

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthStatusAction();

  if (!user || user.role !== 'DOCTOR') {
    redirect('/auth/login');
  }

  const result = await getCaseDetailsAction(id);

  if (!result.success) {
    notFound();
  }

  return (
    <main className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* <div className="flex-none shadow-lg z-50">
        <Navbar user={user} />
      </div> */}
      <div className="flex-1 min-h-0 relative">
        <CaseDetailClient caseData={result.data} />
      </div>
    </main>
  );
}
