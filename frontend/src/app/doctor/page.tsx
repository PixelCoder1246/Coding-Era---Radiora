import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthStatusAction } from '@/lib/actions/auth';
import DoctorDashboardClient from './DoctorDashboardClient';
import Footer from '@/components/Footer';

export default async function DoctorDashboardPage() {
  const user = await getAuthStatusAction();

  if (!user || user.role !== 'DOCTOR') {
    redirect('/auth/login');
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* <Navbar user={user} /> */}
      <div className="flex-1">
        <DoctorDashboardClient />
      </div>
      <Footer />
    </main>
  );
}
