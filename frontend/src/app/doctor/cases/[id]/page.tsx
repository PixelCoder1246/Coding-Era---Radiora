import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getAuthStatusAction } from '@/lib/actions/auth';
import { getCaseDetailsAction } from '@/lib/actions/cases';
import CaseDetailClient from './CaseDetailClient';

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

  return <CaseDetailClient caseData={result.data} />;
}
