import { getAuthStatusAction } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const user = await getAuthStatusAction();

  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return <AdminDashboardClient user={user} />;
}
