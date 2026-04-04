'use server';

import { cookies } from 'next/headers';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR';
  adminId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getAuthStatusAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('radiora_token')?.value;

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

export async function loginAction(credentials: { email: string; password?: string }) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set('radiora_token', data.token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Server Action - Login Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
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
