'use client';

import React, { ReactNode } from 'react';
import { logoutAction } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  children: ReactNode;
  className?: string;
}

export default function LogoutButton({ children, className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAction();
      router.refresh(); // Important: refresh server components
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
