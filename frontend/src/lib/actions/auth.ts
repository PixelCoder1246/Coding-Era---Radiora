'use server';

import { cookies } from 'next/headers';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getAuthStatusAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('radiora_token')?.value;

  console.log(token);

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Server Action - Auth Status Error:', error);
    return null;
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

    cookieStore.delete('radiora_token');
    return { success: true };
  } catch (error) {
    console.error('Server Action - Logout Error:', error);
    return { success: false };
  }
}
