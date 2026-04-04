import { getAuthStatusAction } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import MockupClient from '@/app/admin/mockup/MockupClient';

export default async function MockupPage() {
  const user = await getAuthStatusAction();

  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return <MockupClient user={user} />;
}
